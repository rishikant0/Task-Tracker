const Task = require('../models/Task');

// @desc    Get all tasks for logged-in user
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const { status, priority, search } = req.query;

    let query = { user: req.user.id };

    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    console.error('GET TASKS ERROR:', error);
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
    console.error('GET TASK ERROR:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    console.log('CREATE TASK BODY:', req.body);
    console.log('AUTH USER:', req.user?._id, req.user?.email);

    const { title, description, priority, status, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description || '',
      priority: priority || 'medium',
      status: status || 'todo',
      dueDate: dueDate || null,
      user: req.user.id,
    });

    console.log('TASK CREATED:', task._id);
    res.status(201).json(task);
  } catch (error) {
    console.error('CREATE TASK ERROR:', error);

    // Return Mongoose validation errors with their actual messages
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({
        message: messages,
        errors: error.errors,
      });
    }

    res.status(400).json({
      message: error.message || 'Failed to create task',
      errors: error.errors || null,
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    console.log('UPDATE TASK BODY:', req.body);

    let task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, description, priority, status, dueDate } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (dueDate !== undefined) updateData.dueDate = dueDate || null;

    task = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(task);
  } catch (error) {
    console.error('UPDATE TASK ERROR:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ message: messages, errors: error.errors });
    }

    res.status(400).json({ message: error.message || 'Failed to update task', errors: error.errors || null });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.deleteOne();
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('DELETE TASK ERROR:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get task analytics/stats
// @route   GET /api/tasks/analytics/dashboard
// @access  Private
exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Task.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$status', 'done'] },
                    { $ne: ['$dueDate', null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      stats: stats[0] || {
        total: 0,
        todo: 0,
        inProgress: 0,
        done: 0,
        highPriority: 0,
        overdue: 0,
      },
    });
  } catch (error) {
    console.error('ANALYTICS ERROR:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
