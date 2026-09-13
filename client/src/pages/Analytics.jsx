import React, { useEffect, useState } from 'react';
import {
  LayoutList,
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getAnalytics } from '../services/api';

const PIE_COLORS = { todo: '#3B82F6', 'in-progress': '#F59E0B', done: '#22C55E' };

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="stat-card">
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">{label}</p>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: `${color}20` }}
      >
        <Icon size={16} style={{ color }} />
      </div>
    </div>
    <p className="text-3xl font-bold text-text-primary">{value}</p>
    {sub && <p className="text-xs text-text-secondary">{sub}</p>}
  </div>
);

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

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then((res) => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = stats || { total: 0, todo: 0, inProgress: 0, done: 0, highPriority: 0, overdue: 0 };

  const pieData = [
    { name: 'To Do', value: s.todo, key: 'todo' },
    { name: 'In Progress', value: s.inProgress, key: 'in-progress' },
    { name: 'Done', value: s.done, key: 'done' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Analytics</h1>
        <p className="text-sm text-text-secondary mt-0.5">Overview of your task management</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-text-secondary text-sm">Loading analytics...</div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard label="Total" value={s.total} icon={LayoutList} color="#7C5CFF" />
            <StatCard label="To Do" value={s.todo} icon={CheckSquare} color="#3B82F6" />
            <StatCard label="In Progress" value={s.inProgress} icon={Clock} color="#F59E0B" />
            <StatCard label="Done" value={s.done} icon={CheckCircle2} color="#22C55E"
              sub={s.total > 0 ? `${Math.round((s.done / s.total) * 100)}% complete` : ''} />
            <StatCard label="High Priority" value={s.highPriority} icon={Flame} color="#EF4444" />
            <StatCard label="Overdue" value={s.overdue} icon={AlertTriangle} color="#EF4444" />
          </div>

          {/* Chart + breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut chart */}
            <div className="card p-6">
              <h2 className="section-title mb-4">Task Status Distribution</h2>
              {pieData.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-text-secondary text-sm">
                  No tasks to display
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-48 h-48 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={74}
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
                  <div className="flex-1 space-y-3">
                    {pieData.map((entry) => {
                      const pct = s.total > 0 ? Math.round((entry.value / s.total) * 100) : 0;
                      return (
                        <div key={entry.key} className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ background: PIE_COLORS[entry.key] }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-text-secondary">{entry.name}</span>
                              <span className="text-sm font-semibold text-text-primary">{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-bg-card-hover rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${pct}%`,
                                  background: PIE_COLORS[entry.key],
                                }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-medium text-text-primary w-6 text-right">
                            {entry.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Summary table */}
            <div className="card p-6">
              <h2 className="section-title mb-4">Summary</h2>
              <div className="space-y-3">
                {[
                  { label: 'Total Tasks', value: s.total, color: '#7C5CFF' },
                  { label: 'To Do', value: s.todo, color: '#3B82F6' },
                  { label: 'In Progress', value: s.inProgress, color: '#F59E0B' },
                  { label: 'Completed', value: s.done, color: '#22C55E' },
                  { label: 'High Priority', value: s.highPriority, color: '#EF4444' },
                  { label: 'Overdue', value: s.overdue, color: '#EF4444' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-border-default last:border-0">
                    <span className="text-sm text-text-secondary">{label}</span>
                    <span className="text-sm font-bold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
