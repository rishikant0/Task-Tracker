import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTasks, deleteTask, updateTask } from '../services/api';
import { 
  Search, Filter, Plus, MoreHorizontal, CheckCircle2, Circle, Clock, 
  Calendar, Star, Trash2, Edit2, ChevronLeft, ChevronRight, Eye 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useModalStore from '../store/useModalStore';
import useConfirmStore from '../store/useConfirmStore';
import { useLocation } from 'react-router-dom';

const getPriorityConfig = (priority) => {
  switch (priority) {
    case 'High': return { color: 'text-orange-500', bg: 'bg-orange-500/10' };
    case 'Urgent': return { color: 'text-rose-500', bg: 'bg-rose-500/10' };
    case 'Low': return { color: 'text-blue-500', bg: 'bg-blue-500/10' };
    default: return { color: 'text-indigo-500', bg: 'bg-indigo-500/10' };
  }
};

const getStatusConfig = (status) => {
  switch(status) {
    case 'Pending': return { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: <Circle size={14} /> };
    case 'In Progress': return { color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: <Clock size={14} /> };
    case 'Completed': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: <CheckCircle2 size={14} /> };
    default: return { color: 'text-slate-500', bg: 'bg-slate-500/10', icon: <Circle size={14} /> };
  }
};

const ListView = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || '');
  const [sortOrder, setSortOrder] = useState('createdAt_desc');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { openModal } = useModalStore();
  const { openConfirm } = useConfirmStore();
  
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await getTasks({
        search: debouncedSearch,
        status: statusFilter,
        priority: priorityFilter,
        sort: sortOrder
      });
      setTasks(res.data);
      setCurrentPage(1);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    window.addEventListener('taskSaved', fetchTasks);
    return () => window.removeEventListener('taskSaved', fetchTasks);
  }, [debouncedSearch, statusFilter, priorityFilter, sortOrder]);

  const handleDelete = (id) => {
    openConfirm(
      'Delete Task?', 
      'This action cannot be undone. Are you sure you want to proceed?',
      async () => {
        try {
          await deleteTask(id);
          toast.success('Task deleted');
          fetchTasks();
        } catch (error) {
          toast.error('Failed to delete task');
        }
      }
    );
  };

  const handleFavorite = async (task) => {
    try {
      setTasks(tasks.map(t => t._id === task._id ? { ...t, isFavorite: !t.isFavorite } : t));
      await updateTask(task._id, { isFavorite: !task.isFavorite });
    } catch (error) {
      toast.error('Failed to update favorite status');
      fetchTasks();
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(tasks.length / itemsPerPage);
  const paginatedTasks = tasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header & Filters */}
      <div className="glass-card p-5 rounded-2xl flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Task Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View, filter, and manage your tasks effectively.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search tasks (Ctrl+K)" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>
          
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50">
            <option value="">All Status</option>
            <option value="Pending">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50">
            <option value="">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          <button 
            onClick={() => openModal()} 
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-glow transition-shadow"
          >
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 glass-card rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/20 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-4 px-6">Task Name</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Priority</th>
                <th className="py-4 px-6">Due Date</th>
                <th className="py-4 px-6">Assigned</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800 animate-pulse">
                    <td className="py-4 px-6"><div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div><div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div></td>
                    <td className="py-4 px-6"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div></td>
                    <td className="py-4 px-6"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-16"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></td>
                    <td className="py-4 px-6"><div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700"></div></td>
                    <td className="py-4 px-6"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-12 ml-auto"></div></td>
                  </tr>
                ))
              ) : paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                        <CheckCircle2 size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No Tasks Found</h3>
                      <p className="text-sm text-slate-500">Try adjusting your filters or create a new task.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((task) => {
                  const priority = getPriorityConfig(task.priority);
                  const status = getStatusConfig(task.status);
                  
                  return (
                    <tr key={task._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer" onClick={() => openModal(task)}>
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <button onClick={(e) => { e.stopPropagation(); handleFavorite(task); }} className={`mt-0.5 ${task.isFavorite ? 'text-warning' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}>
                            <Star size={16} className={task.isFavorite ? 'fill-warning' : ''} />
                          </button>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-primary transition-colors line-clamp-1">{task.title}</p>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-1">{task.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          {status.icon} {task.status === 'Pending' ? 'Todo' : task.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${priority.bg} ${priority.color}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className={`flex items-center gap-2 text-sm ${new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'text-danger font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                          <Calendar size={14} />
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-white text-xs font-bold">
                            U
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); openModal(task); }} className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(task._id); }} className="p-1.5 text-slate-500 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && tasks.length > 0 && (
          <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, tasks.length)}</span> of <span className="font-medium text-slate-900 dark:text-white">{tasks.length}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      currentPage === i + 1 
                        ? 'bg-primary text-white' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;
