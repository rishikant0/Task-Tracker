import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import useTaskStore from '../store/useTaskStore';
import useModalStore from '../store/useModalStore';
import useDeleteStore from '../store/useDeleteStore';
import TaskCard from '../components/TaskCard';
import { useOutletContext } from 'react-router-dom';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const MyTasks = () => {
  const { tasks, fetchTasks, loading } = useTaskStore();
  const { openModal } = useModalStore();
  const { searchQuery = '' } = useOutletContext?.() || {};

  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  // Merge local search + layout search
  const searchTerm = localSearch || searchQuery;

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !t.title.toLowerCase().includes(term) &&
          !(t.description || '').toLowerCase().includes(term)
        )
          return false;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, searchTerm]);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">My Tasks</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {filtered.length} of {tasks.length} tasks
          </p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex-shrink-0">
          <Plus size={15} /> Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="field w-full pl-8"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-primary text-white'
                  : 'bg-bg-card-hover text-text-secondary hover:text-text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Priority filter */}
        <div className="flex items-center gap-1 flex-wrap">
          {PRIORITY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setPriorityFilter(f.value)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                priorityFilter === f.value
                  ? 'bg-primary text-white'
                  : 'bg-bg-card-hover text-text-secondary hover:text-text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="text-center py-16 text-text-secondary text-sm">Loading tasks...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-text-secondary text-sm mb-3">
            {tasks.length === 0 ? 'No tasks yet. Create your first task!' : 'No tasks match your filters.'}
          </p>
          {tasks.length === 0 && (
            <button onClick={() => openModal()} className="btn-primary">
              <Plus size={15} /> Add Task
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasks;
