import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiAlertCircle, FiStar, FiEdit2, FiTrash2, FiEye, FiMoreHorizontal } from 'react-icons/fi';

const highlightText = (text, query) => {
  if (!query || !text) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded px-0.5">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

const TaskCard = ({ task, searchQuery, onEdit, onDelete, onFavorite, onView }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'In Progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Cancelled': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High': return { color: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30', icon: <FiAlertCircle className="mr-1" /> };
      case 'Urgent': return { color: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30', icon: <FiAlertCircle className="mr-1" /> };
      case 'Low': return { color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30', icon: <FiClock className="mr-1" /> };
      default: return { color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30', icon: null };
    }
  };

  const getDueDateInfo = (dateStr) => {
    if (!dateStr) return { text: 'No due date', color: 'text-slate-400 dark:text-slate-500', icon: FiCalendar };
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-rose-500 dark:text-rose-400', icon: FiAlertCircle };
    if (diffDays === 0) return { text: 'Due Today', color: 'text-amber-500 dark:text-amber-400', icon: FiClock };
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-emerald-500 dark:text-emerald-400', icon: FiCalendar };
    
    return { text: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), color: 'text-slate-500 dark:text-slate-400', icon: FiCalendar };
  };

  const priorityBadge = getPriorityBadge(task.priority);
  const dueInfo = getDueDateInfo(task.dueDate);
  const DueIcon = dueInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all duration-300 group h-full relative overflow-hidden"
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-1 pr-2 z-10">
          {highlightText(task.title, searchQuery)}
        </h3>
        <span className={`flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full whitespace-nowrap z-10 ${priorityBadge.color}`}>
          {priorityBadge.icon}
          {task.priority}
        </span>
      </div>

      {/* Description */}
      <div className="flex-grow z-10">
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-2">
          {highlightText(task.description, searchQuery)}
        </p>
        {task.description && task.description.length > 100 && (
          <button onClick={() => onView(task)} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            Read More
          </button>
        )}
      </div>

      {/* Badges & Info */}
      <div className="flex flex-wrap items-center gap-2 mt-4 mb-5 z-10">
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status)} transition-colors`}>
          {task.status}
        </span>
        
        <span className={`flex items-center gap-1 text-xs font-medium ${dueInfo.color}`}>
          <DueIcon size={12} />
          {dueInfo.text}
        </span>

        {task.category && (
          <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded-full">
            {task.category}
          </span>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between z-10">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onFavorite(task)}
          className={`p-2 rounded-full transition-colors ${task.isFavorite ? 'text-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-amber-400'}`}
        >
          <FiStar className={task.isFavorite ? 'fill-current' : ''} />
        </motion.button>
        
        <div className="flex gap-1">
          <button onClick={() => onView(task)} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <FiEye size={14} /> <span>View</span>
          </button>
          <button onClick={() => onView(task)} className="sm:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <FiEye size={16} />
          </button>

          <button onClick={() => onEdit(task)} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
            <FiEdit2 size={14} /> <span>Edit</span>
          </button>
          <button onClick={() => onEdit(task)} className="sm:hidden p-2 text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
            <FiEdit2 size={16} />
          </button>

          <button onClick={() => onDelete(task._id)} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
            <FiTrash2 size={14} /> <span>Delete</span>
          </button>
          <button onClick={() => onDelete(task._id)} className="sm:hidden p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(TaskCard);
