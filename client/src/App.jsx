import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import ListView from './pages/ListView';
import CalendarView from './pages/CalendarView';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Team from './pages/Team';
import Analytics from './pages/Analytics';
import Chat from './pages/Chat';
import Projects from './pages/Projects';
import Files from './pages/Files';
import AcceptInvite from './pages/AcceptInvite';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/invite/:token" element={<AcceptInvite />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="board" element={<KanbanBoard />} />
          <Route path="list" element={<ListView />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="team" element={<Team />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="messages" element={<Chat />} />
          <Route path="files" element={<Files />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'dark:bg-slate-800 dark:text-white border dark:border-slate-700',
          style: {
            borderRadius: '12px',
          },
        }}
      />
    </Router>
  );
}

export default App;
