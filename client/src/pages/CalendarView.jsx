import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { getTasks } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await getTasks();
        setTasks(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTasks();
  }, []);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30';
      case 'Urgent': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30';
      case 'Low': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30';
      default: return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30';
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <CalendarIcon className="text-primary" size={28} />
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-300">
            <ChevronLeft size={20} />
          </button>
          <button onClick={goToToday} className="px-4 py-1.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-700 dark:text-slate-200">
            Today
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-300">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = 'EEE';
    const days = [];
    let startDate = startOfWeek(currentMonth);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center font-bold text-xs text-slate-400 uppercase tracking-wider py-3 border-b border-slate-200 dark:border-slate-700/50" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="grid grid-cols-7 bg-slate-50/50 dark:bg-slate-800/20 rounded-t-2xl">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = 'd';
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        
        const dayTasks = tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), cloneDay));
        const isCurrentDay = isToday(day);
        const isSelectedDay = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            className={`min-h-[140px] p-2 border-r border-b border-slate-100 dark:border-slate-800 transition-all cursor-pointer group ${
              !isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-900/50 opacity-60' : 'bg-white dark:bg-slate-800'
            } ${isSelectedDay ? 'ring-2 ring-primary/50 bg-primary/5 dark:bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
            key={day}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${
                isCurrentDay 
                  ? 'bg-primary text-white shadow-md shadow-primary/30' 
                  : isSelectedDay
                  ? 'bg-primary/20 text-primary'
                  : 'text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
              }`}>
                {formattedDate}
              </span>
              {dayTasks.length > 0 && (
                <div className="w-2 h-2 rounded-full bg-primary mt-3 mr-1"></div>
              )}
            </div>
            
            <div className="space-y-1.5 overflow-y-auto custom-scrollbar max-h-[85px]">
              {dayTasks.map(task => (
                <div 
                  key={task._id} 
                  className={`text-[11px] truncate px-2 py-1 rounded-md border font-medium transition-colors cursor-pointer hover:brightness-95 ${
                    task.status === 'Completed' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 opacity-60 line-through'
                      : getPriorityConfig(task.priority)
                  }`}
                  title={task.title}
                >
                  {task.title}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return (
      <div className="glass-card rounded-b-2xl overflow-hidden border border-t-0 border-slate-200 dark:border-slate-700/50">
        {rows}
      </div>
    );
  };

  const selectedDayTasks = tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), selectedDate));
  const upcomingDeadlines = tasks.filter(t => t.dueDate && new Date(t.dueDate) > new Date() && t.status !== 'Completed').sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5);

  return (
    <div className="h-full flex flex-col xl:flex-row gap-6 max-w-[1600px] mx-auto">
      <div className="flex-1 flex flex-col min-w-0">
        {renderHeader()}
        <div className="flex-1 glass-card rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50">
          {renderDays()}
          {renderCells()}
        </div>
      </div>

      <div className="w-full xl:w-80 flex flex-col gap-6">
        {/* Selected Date Details */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Clock className="text-primary" size={20} />
            {isToday(selectedDate) ? "Today's Schedule" : format(selectedDate, 'MMM do, yyyy')}
          </h3>
          
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {selectedDayTasks.length > 0 ? selectedDayTasks.map(task => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  key={task._id} 
                  className={`p-3 rounded-xl border-l-4 bg-white/50 dark:bg-slate-800/50 ${
                    task.status === 'Completed' ? 'border-emerald-500 opacity-60' : 'border-primary'
                  }`}
                >
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1">{task.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <AlertCircle size={12} /> {task.priority} Priority
                  </p>
                </motion.div>
              )) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-slate-500"
                >
                  <p className="text-sm">No tasks scheduled for this day.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50 flex-1">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <AlertCircle className="text-warning" size={20} />
            Upcoming Deadlines
          </h3>
          
          <div className="space-y-4">
            {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(task => (
              <div key={task._id} className="group flex items-start gap-3 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 group-hover:border-primary transition-colors text-slate-700 dark:text-slate-300">
                  <span className="text-xs font-bold leading-none">{format(new Date(task.dueDate), 'd')}</span>
                  <span className="text-[10px] uppercase">{format(new Date(task.dueDate), 'MMM')}</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors line-clamp-1">{task.title}</p>
                  <p className="text-xs text-slate-500">{task.estimatedTime > 0 ? `${task.estimatedTime}m est.` : 'Pending'}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500 text-center py-4">No upcoming deadlines.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
