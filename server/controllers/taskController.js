const Task = require('../models/Task');
const mongoose = require('mongoose');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const { status, search, priority, category, sort } = req.query;
    
    let query = { user: req.user.id };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    let sortObj = { createdAt: -1 };
    if (sort === 'dueDate_asc') sortObj = { dueDate: 1 };
    else if (sort === 'dueDate_desc') sortObj = { dueDate: -1 };
    else if (sort === 'priority') sortObj = { priority: -1 };
    else if (sort === 'alphabetical') sortObj = { title: 1 };
    else if (sort === 'oldest') sortObj = { createdAt: 1 };
    
    const tasks = await Task.find(query).sort(sortObj);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      user: req.user.id
    });
    
    const Notification = require('../models/Notification');
    const Activity = require('../models/Activity');
    await Notification.create({ user: req.user.id, message: `Task "${task.title}" created.`, type: 'task_created' });
    await Activity.create({ user: req.user.id, action: 'Task Created', details: `Created task "${task.title}"` });
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    const Notification = require('../models/Notification');
    const Activity = require('../models/Activity');
    
    if (req.body.status && req.body.status === 'Completed') {
       await Notification.create({ user: req.user.id, message: `Task "${task.title}" completed!`, type: 'task_completed' });
       await Activity.create({ user: req.user.id, action: 'Task Completed', details: `Completed task "${task.title}"` });
    } else {
       await Notification.create({ user: req.user.id, message: `Task "${task.title}" updated.`, type: 'task_updated' });
       await Activity.create({ user: req.user.id, action: 'Task Updated', details: `Updated task "${task.title}"` });
    }
    
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    const title = task.title;
    await task.deleteOne();
    
    const Notification = require('../models/Notification');
    const Activity = require('../models/Activity');
    await Notification.create({ user: req.user.id, message: `Task "${title}" deleted.`, type: 'task_deleted' });
    await Activity.create({ user: req.user.id, action: 'Task Deleted', details: `Deleted task "${title}"` });
    
    res.status(200).json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update task order (Kanban)
// @route   PUT /api/tasks/order
// @access  Private
exports.updateTaskOrder = async (req, res) => {
  try {
    const { tasks } = req.body; // array of { _id, status, columnOrder }
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    const bulkOps = tasks.map(t => ({
      updateOne: {
        filter: { _id: t._id, user: req.user.id },
        update: { status: t.status, columnOrder: t.columnOrder }
      }
    }));

    await Task.bulkWrite(bulkOps);
    res.status(200).json({ message: 'Tasks updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get task statistics & analytics
// @route   GET /api/tasks/analytics/dashboard
// @access  Private
exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Task.aggregate([
      { $match: { user: userId } },
      { $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ["$priority", "High"] }, 1, 0] } },
          urgentPriority: { $sum: { $cond: [{ $eq: ["$priority", "Urgent"] }, 1, 0] } },
          overdue: { $sum: { 
            $cond: [
              { $and: [
                { $lt: ["$dueDate", new Date()] }, 
                { $ne: ["$status", "Completed"] }
              ]}, 1, 0
            ] 
          } }
      }}
    ]);

    const weeklyData = await Task.aggregate([
      { $match: { user: userId } },
      { $group: {
          _id: { $dayOfWeek: "$createdAt" },
          count: { $sum: 1 }
      }}
    ]);

    // Format weekly data for Recharts (1: Sunday, ..., 7: Saturday)
    const formattedWeekly = Array.from({length: 7}, (_, i) => {
       const day = weeklyData.find(d => d._id === (i + 1));
       return {
         name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
         tasks: day ? day.count : 0
       };
    });

    const heatmapAgg = await Task.aggregate([
      { $match: { user: userId } },
      { $project: {
          day: { $subtract: [{ $dayOfWeek: "$createdAt" }, 1] }, // 0 (Sun) to 6 (Sat)
          hourRaw: { $hour: "$createdAt" }
      }},
      { $project: {
          day: 1,
          // Map 24h to 12 slots (e.g., 0-1 -> 0 (8a equivalent), we can just do Math.floor(hour / 2))
          // Actually, hours on frontend are ['8a', '10a', '12p', '2p', '4p', '6p', '8p'] which is 7 slots.
          // Let's just group by hour directly, and frontend can map it, or map here.
          hour: 1
      }},
      { $group: {
          _id: { day: "$day", hour: "$hourRaw" },
          count: { $sum: 1 }
      }}
    ]);

    const heatmap = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 12; hour++) {
        // Find if we have tasks in this block (0-24 mapped to 0-11 by dividing by 2)
        const match = heatmapAgg.filter(h => h._id.day === day && Math.floor(h._id.hour / 2) === hour);
        const count = match.reduce((acc, curr) => acc + curr.count, 0);
        // Calculate a value between 0-100 based on relative count, but let's just make it count * 20 for now
        heatmap.push({ day, hour, value: Math.min(100, count * 25) });
      }
    }

    res.status(200).json({
      stats: stats[0] || { total:0, completed:0, inProgress:0, pending:0, highPriority:0, urgentPriority:0, overdue:0 },
      weekly: formattedWeekly,
      heatmap
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
