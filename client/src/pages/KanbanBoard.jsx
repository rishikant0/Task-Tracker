import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, MoreHorizontal, Calendar, Clock, 
  MessageSquare, Paperclip, CheckCircle2, Circle
} from 'lucide-react';
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
          grouped['Pending'].push(task);
        }
      });
      
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
      fetchTasks();
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'High': return { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
      case 'Urgent': return { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
      case 'Low': return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
      default: return { color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' };
    }
  };

  const getColumnConfig = (status) => {
    switch(status) {
      case 'Pending': return { color: 'text-amber-500', bg: 'bg-amber-500', icon: <Circle size={16} /> };
      case 'In Progress': return { color: 'text-indigo-500', bg: 'bg-indigo-500', icon: <Clock size={16} /> };
      case 'Completed': return { color: 'text-emerald-500', bg: 'bg-emerald-500', icon: <CheckCircle2 size={16} /> };
      default: return { color: 'text-slate-500', bg: 'bg-slate-500', icon: <Circle size={16} /> };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Project Board</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Drag and drop tasks to organize your workflow.</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium"
        >
          <Plus size={20} /> Create Task
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-1 gap-6 overflow-x-auto pb-6 custom-scrollbar h-full">
          {Object.entries(tasks).map(([columnId, columnTasks]) => {
            const config = getColumnConfig(columnId);
            return (
              <div key={columnId} className="flex flex-col min-w-[340px] w-[340px] h-full">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`${config.color}`}>{config.icon}</span>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{columnId === 'Pending' ? 'Todo' : columnId}</h3>
                    <span className="ml-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs py-0.5 px-2.5 rounded-full font-bold">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 p-3 rounded-3xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-indigo-50/50 dark:bg-indigo-900/20 ring-2 ring-primary/20' : ''
                      }`}
                    >
                      <div className="space-y-4">
                        {columnTasks.map((task, index) => {
                          const priorityConfig = getPriorityConfig(task.priority);
                          return (
                            <Draggable key={task._id} draggableId={task._id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => openModal(task)}
                                  className={`group bg-white dark:bg-slate-800 p-5 rounded-2xl border ${priorityConfig.border} hover:border-primary/50 transition-all cursor-pointer ${
                                    snapshot.isDragging ? 'shadow-2xl scale-105 rotate-2 z-50 ring-2 ring-primary/30' : 'shadow-sm hover:shadow-md'
                                  } ${task.status === 'Completed' ? 'opacity-70' : ''}`}
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex flex-wrap gap-2">
                                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${priorityConfig.bg} ${priorityConfig.color}`}>
                                        {task.priority}
                                      </span>
                                      {task.category && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                          {task.category}
                                        </span>
                                      )}
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800 shadow-sm shrink-0">
                                      U
                                    </div>
                                  </div>
                                  
                                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 leading-tight group-hover:text-primary transition-colors">
                                    {task.title}
                                  </h4>
                                  
                                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                                    {task.description}
                                  </p>
                                  
                                  <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-3">
                                      <div className={`flex items-center gap-1.5 text-xs font-medium ${new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'text-danger' : 'text-slate-500'}`}>
                                        <Calendar size={14} />
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-400">
                                      {task.comments?.length > 0 && (
                                        <div className="flex items-center gap-1 text-xs">
                                          <MessageSquare size={14} />
                                          <span>{task.comments.length}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-1 text-xs">
                                        <Paperclip size={14} />
                                        <span>2</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
