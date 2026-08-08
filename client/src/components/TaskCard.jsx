import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertCircle, Star, Edit2, Trash2, Eye, MoreHorizontal, CheckCircle2, Copy } from 'lucide-react';
import ContextMenu from './ContextMenu';

const highlightText = (text, query) => {
  if (!query || !text) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary-light rounded px-0.5">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

const TaskCard = ({ task, searchQuery, onEdit, onDelete, onFavorite, onView }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Completed': return { bg: 'bg-emerald-50 dark:bg-emerald-500/10', color: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' };
      case 'In Progress': return { bg: 'bg-indigo-50 dark:bg-indigo-500/10', color: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' };
      case 'Pending': return { bg: 'bg-amber-50 dark:bg-amber-500/10', color: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' };
      case 'Cancelled': return { bg: 'bg-slate-50 dark:bg-slate-800', color: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' };
      default: return { bg: 'bg-slate-50 dark:bg-slate-800', color: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' };
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'High': return { color: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20', icon: <AlertCircle size={12} className="mr-1" /> };
      case 'Urgent': return { color: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/20', icon: <AlertCircle size={12} className="mr-1" /> };
      case 'Low': return { color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20', icon: <Clock size={12} className="mr-1" /> };
      default: return { color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/20', icon: null };
    }
  };

  const getDueDateInfo = (dateStr) => {
    if (!dateStr) return { text: 'No date', color: 'text-slate-400', icon: Calendar };
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-rose-500 dark:text-rose-400', icon: AlertCircle };
    if (diffDays === 0) return { text: 'Today', color: 'text-amber-500 dark:text-amber-400', icon: Clock };
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-emerald-500 dark:text-emerald-400', icon: Calendar };
    
    return { text: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: 'text-slate-500 dark:text-slate-400', icon: Calendar };
  };

  const statusConfig = getStatusConfig(task.status);
  const priorityConfig = getPriorityConfig(task.priority);
  const dueInfo = getDueDateInfo(task.dueDate);
  const DueIcon = dueInfo.icon;

  const contextMenuItems = [
    { label: 'View Details', icon: Eye, action: () => onView(task) },
    { label: 'Edit Task', icon: Edit2, action: () => onEdit(task) },
    { label: 'Duplicate', icon: Copy, action: () => {} /* Implement duplicate */ },
    { divider: true },
    { label: 'Delete', icon: Trash2, action: () => onDelete(task._id), danger: true },
  ];

  return (
    <ContextMenu items={contextMenuItems} className="h-full">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -4 }}
        className={`glass-card p-5 rounded-2xl border ${task.status === 'Completed' ? 'border-emerald-200/50 dark:border-emerald-800/30 bg-emerald-50/30 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700/50'} hover:border-primary/50 transition-all group flex flex-col h-full cursor-pointer`}
        onClick={() => onView(task)}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${priorityConfig.color}`}>
              {priorityConfig.icon}
              {task.priority}
            </span>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onFavorite(task); }}
            className={`p-1.5 rounded-lg transition-colors ${task.isFavorite ? 'text-warning bg-warning/10' : 'text-slate-400 hover:text-warning hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Star size={16} className={task.isFavorite ? 'fill-warning' : ''} />
          </button>
        </div>

        {/* Title & Description */}
        <div className="mb-4 flex-1">
          <h3 className={`font-bold text-lg mb-1.5 line-clamp-2 transition-colors ${task.status === 'Completed' ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white group-hover:text-primary'}`}>
            {highlightText(task.title, searchQuery)}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
            {highlightText(task.description, searchQuery)}
          </p>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mt-auto mb-4">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
            {task.status === 'Completed' && <CheckCircle2 size={12} className="mr-1" />}
            {task.status === 'Pending' ? 'Todo' : task.status}
          </span>
          
          {task.category && (
            <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700">
              {task.category}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className={`flex items-center gap-1.5 text-xs font-medium ${dueInfo.color}`}>
            <DueIcon size={14} />
            {dueInfo.text}
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onView(task); }} 
              className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
              title="View details"
            >
              <Eye size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(task); }} 
              className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
              title="Edit task"
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(task._id); }} 
              className="p-1.5 text-slate-500 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
              title="Delete task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </ContextMenu>
  );
};

export default React.memo(TaskCard);
