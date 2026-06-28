import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { FiPlus, FiMoreHorizontal, FiCalendar, FiClock } from 'react-icons/fi';
import { getTasks, updateTaskOrder } from '../services/api';
import { toast } from 'react-hot-toast';
import useModalStore from '../store/useModalStore';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState({
    'Pending': [],
    'In Progress': [],
    'Completed': []
  });
  const [loading, setLoading] = useState(true);
  const { openModal } = useModalStore();

  useEffect(() => {
    fetchTasks();
    window.addEventListener('taskSaved', fetchTasks);
    return () => window.removeEventListener('taskSaved', fetchTasks);
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await getTasks();
      const grouped = {
        'Pending': [],
        'In Progress': [],
        'Completed': []
      };
      
      res.data.forEach(task => {
        if (grouped[task.status]) {
          grouped[task.status].push(task);
        } else {
          grouped['Pending'].push(task); // Fallback
        }
      });
      
      // Sort by columnOrder
      Object.keys(grouped).forEach(key => {
        grouped[key].sort((a, b) => (a.columnOrder || 0) - (b.columnOrder || 0));
      });
      
      setTasks(grouped);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceColumn = [...tasks[source.droppableId]];
    const destColumn = source.droppableId === destination.droppableId 
      ? sourceColumn 
      : [...tasks[destination.droppableId]];

    const [removed] = sourceColumn.splice(source.index, 1);
    removed.status = destination.droppableId;
    destColumn.splice(destination.index, 0, removed);

    const newTasks = {
      ...tasks,
      [source.droppableId]: sourceColumn,
    };
    if (source.droppableId !== destination.droppableId) {
      newTasks[destination.droppableId] = destColumn;
    }

    setTasks(newTasks);

    // Prepare API update payload
    const updates = destColumn.map((task, index) => ({
      _id: task._id,
      status: task.status,
      columnOrder: index
    }));

    if (source.droppableId !== destination.droppableId) {
       updates.push(...sourceColumn.map((task, index) => ({
         _id: task._id,
         status: task.status,
         columnOrder: index
       })));
    }

    try {
      await updateTaskOrder({ tasks: updates });
    } catch (error) {
      toast.error('Failed to update task position');
      fetchTasks(); // Revert on failure
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'badge-high';
      case 'Urgent': return 'badge-urgent';
      case 'Low': return 'badge-low';
      default: return 'badge-medium';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Board</h2>
        <button onClick={() => openModal()} className="btn btn-primary">
          <FiPlus className="mr-2" /> New Task
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-1 gap-6 overflow-x-auto pb-4 h-full">
          {Object.entries(tasks).map(([columnId, columnTasks]) => (
            <div key={columnId} className="flex flex-col min-w-[320px] w-[320px] glass-panel rounded-2xl h-full max-h-[calc(100vh-140px)]">
              <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">{columnId}</h3>
                  <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs py-0.5 px-2 rounded-full font-medium">
                    {columnTasks.length}
                  </span>
                </div>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <FiMoreHorizontal />
                </button>
              </div>

              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => openModal(task)}
                            className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all cursor-pointer ${
                              snapshot.isDragging ? 'shadow-lg scale-105 rotate-2 z-50' : ''
                            } ${
                              task.status === 'Completed' ? 'opacity-70' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            </div>
                            <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-1 line-clamp-2">
                              {task.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                              {task.description}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-700/50 mt-auto">
                              <div className="flex items-center gap-1">
                                <FiCalendar />
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}
                              </div>
                              {task.estimatedTime > 0 && (
                                <div className="flex items-center gap-1">
                                  <FiClock /> {task.estimatedTime}m
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
