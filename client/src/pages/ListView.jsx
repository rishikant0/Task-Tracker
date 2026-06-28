import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTasks, deleteTask, updateTask } from '../services/api';
import { FiSearch, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import useModalStore from '../store/useModalStore';
import useConfirmStore from '../store/useConfirmStore';
import { useLocation } from 'react-router-dom';
import TaskCard from '../components/TaskCard';

// Skeleton Loader Component
const TaskCardSkeleton = () => (
  <div className="bg-white/40 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-[20px] p-5 h-[260px] flex flex-col animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-16"></div>
    </div>
    <div className="space-y-2 mb-6">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
    </div>
    <div className="flex gap-2 mb-auto">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-24"></div>
    </div>
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-between">
      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
      <div className="flex gap-2">
        <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
    </div>
  </div>
);

const ListView = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || '');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('createdAt_desc');
  
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
        category: categoryFilter,
        sort: sortOrder
      });
      setTasks(res.data);
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
  }, [debouncedSearch, statusFilter, priorityFilter, categoryFilter, sortOrder]);

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
      // Optimistic update
      setTasks(tasks.map(t => t._id === task._id ? { ...t, isFavorite: !t.isFavorite } : t));
      await updateTask(task._id, { isFavorite: !task.isFavorite });
      toast.success(task.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorite status');
      fetchTasks(); // Revert on failure
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white shrink-0">All Tasks</h2>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto flex-1 lg:justify-end">
          <div className="relative flex-1 min-w-[200px] lg:max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by title or description..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 h-10 w-full"
            />
          </div>
          
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field h-10 w-auto text-sm">
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="input-field h-10 w-auto text-sm">
            <option value="">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="input-field h-10 w-auto text-sm">
            <option value="createdAt_desc">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Priority</option>
            <option value="alphabetical">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => <TaskCardSkeleton key={n} />)}
          </div>
        ) : tasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full py-20 px-4 text-center bg-white/40 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700"
          >
            <div className="w-40 h-40 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
              <FiCheckCircle className="text-6xl text-indigo-300 dark:text-indigo-700" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No Tasks Yet</h3>
            <p className="text-slate-500 max-w-md mb-8">You're all caught up! Create a new task to keep track of your work, or adjust your filters if you're looking for something specific.</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal()} 
              className="btn bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 px-8 py-3 rounded-xl font-bold"
            >
              Create your first task
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  searchQuery={debouncedSearch}
                  onEdit={(t) => openModal(t)}
                  onView={(t) => openModal(t)}
                  onDelete={handleDelete}
                  onFavorite={handleFavorite}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ListView;
