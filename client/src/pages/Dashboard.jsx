import React, { useEffect, useState } from 'react';
import { Plus, CheckSquare, Clock, CheckCircle2, LayoutList } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import useAuthStore from '../store/useAuthStore';
import useTaskStore from '../store/useTaskStore';
import useModalStore from '../store/useModalStore';
import { getAnalytics } from '../services/api';
import TaskCard from '../components/TaskCard';
import { format } from 'date-fns';
import { useOutletContext } from 'react-router-dom';

const COLUMNS = [
  { key: 'todo', label: 'To Do', icon: '📦', color: '#3B82F6' },
  { key: 'in-progress', label: 'In Progress', icon: '⚡', color: '#F59E0B' },
  { key: 'done', label: 'Done', icon: '✅', color: '#22C55E' },
];

const PIE_COLORS = { todo: '#3B82F6', 'in-progress': '#F59E0B', done: '#22C55E' };

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="stat-card">
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">{label}</p>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}20` }}
      >
        <Icon size={16} style={{ color }} />
      </div>
    </div>
    <p className="text-3xl font-bold text-text-primary">{value}</p>
  </div>
);

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const { name, value, percent } = payload[0];
    return (
      <div className="card px-3 py-2 text-xs shadow-modal">
        <p className="text-text-primary font-medium">{name}</p>
        <p className="text-text-secondary">{value} tasks · {(percent * 100).toFixed(0)}%</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const { tasks, fetchTasks } = useTaskStore();
  const { openModal } = useModalStore();
  const [stats, setStats] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Get search from Layout context
  const { searchQuery = '' } = useOutletContext?.() || {};

  useEffect(() => {
    fetchTasks();
    getAnalytics()
      .then((res) => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setAnalyticsLoading(false));
  }, []);

  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  // Kanban preview — limit to 3 cards per column
  const todoTasks = tasks.filter((t) => t.status === 'todo').slice(0, 3);
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').slice(0, 3);
  const doneTasks = tasks.filter((t) => t.status === 'done').slice(0, 3);

  const s = stats || { total: 0, todo: 0, inProgress: 0, done: 0 };

  const pieData = [
    { name: 'To Do', value: s.todo, key: 'todo' },
    { name: 'In Progress', value: s.inProgress, key: 'in-progress' },
    { name: 'Done', value: s.done, key: 'done' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome + Add Task */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Here's what's happening with your tasks today. · {today}
          </p>
        </div>
        <button
          id="add-task-btn"
          onClick={() => openModal()}
          className="btn-primary flex-shrink-0"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {/* Stats + Donut chart */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Tasks" value={s.total} icon={LayoutList} color="#7C5CFF" />
          <StatCard label="To Do" value={s.todo} icon={CheckSquare} color="#3B82F6" />
          <StatCard label="In Progress" value={s.inProgress} icon={Clock} color="#F59E0B" />
          <StatCard label="Done" value={s.done} icon={CheckCircle2} color="#22C55E" />
        </div>

        {/* Donut chart */}
        <div className="card p-5 w-full lg:w-64 flex flex-col">
          <p className="text-sm font-semibold text-text-primary mb-4">Task Status</p>
          {analyticsLoading ? (
            <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">Loading...</div>
          ) : pieData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">No tasks yet</div>
          ) : (
            <>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={62}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.key} fill={PIE_COLORS[entry.key]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-2">
                {pieData.map((entry) => {
                  const pct = s.total > 0 ? Math.round((entry.value / s.total) * 100) : 0;
                  return (
                    <div key={entry.key} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: PIE_COLORS[entry.key] }}
                        />
                        <span className="text-text-secondary">{entry.name}</span>
                      </div>
                      <span className="text-text-primary font-medium">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Kanban preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Task Board</h2>
          <a href="/board" className="text-xs text-primary hover:text-primary-hover font-medium transition-colors">
            View full board →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(({ key, label, icon, color }) => {
            const colTasks = tasks.filter((t) => t.status === key).slice(0, 3);
            const total = tasks.filter((t) => t.status === key).length;

            return (
              <div key={key} className="card p-4">
                {/* Column header */}
                <div className="flex items-center gap-2 mb-4">
                  <span>{icon}</span>
                  <span className="text-sm font-semibold text-text-primary">{label}</span>
                  <span
                    className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${color}20`, color }}
                  >
                    {total}
                  </span>
                </div>

                {/* Tasks */}
                <div className="space-y-3">
                  {colTasks.length > 0 ? (
                    colTasks.map((task) => <TaskCard key={task._id} task={task} />)
                  ) : (
                    <p className="text-center text-xs text-text-secondary py-4">No tasks</p>
                  )}
                  {total > 3 && (
                    <p className="text-center text-xs text-text-secondary pt-1">
                      +{total - 3} more — <a href="/board" className="text-primary hover:underline">view all</a>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
