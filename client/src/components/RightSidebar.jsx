import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, CheckCircle, Users, Coffee, CloudRain, Sun, Cloud, Moon, Play, Pause, RotateCcw } from 'lucide-react';

const RightSidebar = () => {
  const [weather, setWeather] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    // Fetch Weather
    const fetchWeather = async () => {
      try {
        // Simple IP geolocation to Open-Meteo
        const geoRes = await fetch('https://ipapi.co/json/');
        const geoData = await geoRes.json();
        
        if (geoData.latitude && geoData.longitude) {
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${geoData.latitude}&longitude=${geoData.longitude}&current=temperature_2m,weather_code,is_day`);
          const weatherData = await weatherRes.json();
          
          if (weatherData.current) {
            setWeather(weatherData.current);
          }
        }
      } catch (err) {
        console.error("Failed to fetch weather", err);
      }
    };
    fetchWeather();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      // alert or notification could go here
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getWeatherIcon = (code, isDay) => {
    if (code === undefined) return <CloudRain size={24} className="mb-1 text-accent" />;
    if (code <= 1) return isDay ? <Sun size={24} className="mb-1 text-amber-500" /> : <Moon size={24} className="mb-1 text-indigo-300" />;
    if (code <= 3) return <Cloud size={24} className="mb-1 text-slate-400" />;
    return <CloudRain size={24} className="mb-1 text-blue-400" />;
  };

  const getWeatherCondition = (code) => {
    if (code === undefined) return 'Loading...';
    if (code <= 1) return 'Clear';
    if (code <= 3) return 'Cloudy';
    if (code <= 67) return 'Rainy';
    if (code <= 79) return 'Snowy';
    return 'Stormy';
  };

  return (
    <aside className="hidden xl:flex flex-col w-72 h-[calc(100vh-5rem)] border-l border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm p-5 overflow-y-auto custom-scrollbar sticky top-20">
      
      {/* Pomodoro & Weather Widget */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 bg-gradient-to-br from-primary to-secondary p-4 rounded-2xl text-white shadow-glow flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10 flex flex-col items-center">
            {isTimerRunning ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}>
                <Coffee size={24} className="mb-1" />
              </motion.div>
            ) : (
              <Coffee size={24} className="mb-1" />
            )}
            
            <span className="text-xl font-bold font-mono">{formatTime(timeLeft)}</span>
            
            <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-1/2 -translate-y-1/2 bg-slate-900/40 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
              <button onClick={toggleTimer} className="p-1 hover:bg-white/20 rounded-md transition-colors">
                {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button onClick={resetTimer} className="p-1 hover:bg-white/20 rounded-md transition-colors">
                <RotateCcw size={14} />
              </button>
            </div>
            <span className="text-xs text-white/80 mt-1 transition-opacity group-hover:opacity-0">{isTimerRunning ? 'Focusing...' : 'Focus'}</span>
          </div>
        </div>

        <div className="flex-1 glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-slate-700 dark:text-slate-200">
          {weather ? (
            <>
              {getWeatherIcon(weather.weather_code, weather.is_day)}
              <span className="text-xl font-bold">{Math.round(weather.temperature_2m)}°C</span>
              <span className="text-xs text-slate-500">{getWeatherCondition(weather.weather_code)}</span>
            </>
          ) : (
            <>
              <Cloud size={24} className="mb-1 text-slate-300 animate-pulse" />
              <span className="text-xl font-bold text-transparent bg-slate-200 animate-pulse rounded w-10 h-6 mb-1"></span>
              <span className="text-xs text-transparent bg-slate-200 animate-pulse rounded w-12 h-3"></span>
            </>
          )}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-primary" /> Today's Schedule
        </h3>
        <div className="space-y-3">
          {[
            { title: 'Daily Standup', time: '10:00 AM', type: 'meeting' },
            { title: 'Design Review', time: '01:30 PM', type: 'work' },
            { title: 'Client Sync', time: '04:00 PM', type: 'meeting' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02 }}
              className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700/30 shadow-sm flex items-start gap-3"
            >
              <div className={`w-2 h-2 mt-1.5 rounded-full ${item.type === 'meeting' ? 'bg-accent' : 'bg-primary'}`} />
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.title}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Clock size={12} /> {item.time}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <CheckCircle size={16} className="text-warning" /> Deadlines
        </h3>
        <div className="space-y-3">
          {[
            { title: 'Q3 Report', time: 'Tomorrow' },
            { title: 'Homepage Revamp', time: 'In 2 days' }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.title}</span>
              <span className="text-xs px-2 py-1 bg-warning/10 text-warning rounded-md">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Team Online */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Users size={16} className="text-success" /> Team Online
        </h3>
        <div className="flex gap-2">
          {[
            { a: 'R', b: 'from-blue-500 to-indigo-500' },
            { a: 'S', b: 'from-emerald-500 to-teal-500' },
            { a: 'A', b: 'from-orange-500 to-red-500' },
            { a: 'M', b: 'from-purple-500 to-fuchsia-500' }
          ].map((u, i) => (
            <div key={i} className={`relative w-8 h-8 rounded-full bg-gradient-to-br ${u.b} ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:-translate-y-1 transition-transform`}>
              {u.a}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-white dark:border-slate-900" />
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
};

export default RightSidebar;
