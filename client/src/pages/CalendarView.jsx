import React, { useEffect, useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  isPast,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useTaskStore from '../store/useTaskStore';
import useModalStore from '../store/useModalStore';

const STATUS_COLORS = {
  todo: '#3B82F6',
  'in-progress': '#F59E0B',
  done: '#22C55E',
};

const CalendarView = () => {
  const { tasks, fetchTasks } = useTaskStore();
  const { openModal } = useModalStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // Build weeks array
  const weeks = [];
  let day = calStart;
  while (day <= calEnd) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  const getTasksForDay = (d) =>
    tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), d));

  const selectedTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">Calendar</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="btn-icon">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-semibold text-text-primary min-w-[130px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="btn-icon">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Calendar grid */}
        <div className="card p-4 overflow-x-auto">
          {/* Day labels */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-text-secondary py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((d, di) => {
                const dayTasks = getTasksForDay(d);
                const inMonth = isSameMonth(d, currentMonth);
                const isSelected = selectedDay && isSameDay(d, selectedDay);

                return (
                  <button
                    key={di}
                    onClick={() => setSelectedDay(isSameDay(d, selectedDay) ? null : d)}
                    className={`min-h-[72px] p-1 border border-border-default text-left transition-colors ${
                      isSelected
                        ? 'bg-primary/15 border-primary/40'
                        : 'hover:bg-bg-card-hover'
                    } ${!inMonth ? 'opacity-30' : ''}`}
                  >
                    <div
                      className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday(d)
                          ? 'bg-primary text-white'
                          : 'text-text-secondary'
                      }`}
                    >
                      {format(d, 'd')}
                    </div>
                    <div className="space-y-0.5">
                      {dayTasks.slice(0, 3).map((t) => {
                        const overdue = t.status !== 'done' && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate));
                        return (
                          <div
                            key={t._id}
                            className="text-[10px] leading-tight px-1 py-0.5 rounded truncate font-medium"
                            style={{
                              background: overdue ? '#EF444420' : `${STATUS_COLORS[t.status]}20`,
                              color: overdue ? '#EF4444' : STATUS_COLORS[t.status],
                            }}
                            title={t.title}
                          >
                            {t.title}
                          </div>
                        );
                      })}
                      {dayTasks.length > 3 && (
                        <div className="text-[10px] text-text-secondary px-1">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Day detail panel */}
        <div className="card p-4 h-fit">
          {selectedDay ? (
            <>
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                {format(selectedDay, 'EEEE, MMM d')}
              </h3>
              <p className="text-xs text-text-secondary mb-4">{selectedTasks.length} task(s) due</p>

              {selectedTasks.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-text-secondary mb-3">No tasks on this day</p>
                  <button onClick={() => openModal()} className="btn-primary text-xs px-3 py-1.5">
                    + Add Task
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedTasks.map((t) => (
                    <button
                      key={t._id}
                      onClick={() => openModal(t)}
                      className="w-full text-left p-3 rounded-lg bg-bg-card-hover hover:bg-bg-card border border-border-default transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                          style={{ background: STATUS_COLORS[t.status] }}
                        />
                        <div>
                          <p className="text-xs font-medium text-text-primary">{t.title}</p>
                          <p className="text-[10px] text-text-secondary mt-0.5 capitalize">
                            {t.status.replace('-', ' ')} · {t.priority}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-text-secondary">Click a day to see tasks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
