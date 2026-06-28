# TaskMaster - Premium SaaS Task Tracker

TaskMaster is a modern, production-ready SaaS task management platform built with the MERN stack. Designed with inspiration from top-tier tools like Linear, ClickUp, and Notion, it provides a beautiful, highly responsive, glassmorphism-based UI/UX.

## Features

- **Authentication System**: Secure JWT-based login and registration using bcrypt password hashing.
- **Advanced Dashboard**: Real-time analytics, animated Recharts (Bar, Pie charts), and productivity statistics.
- **Kanban Board**: Trello-style drag-and-drop board for seamless task state management using `@hello-pangea/dnd`.
- **List View**: Advanced data table with search debouncing, multi-filtering (Status, Priority), and inline actions.
- **Calendar View**: Monthly calendar grid visualizing tasks by due dates.
- **Premium UI/UX**: Dark mode, Framer Motion animations, glassmorphism effects, gradient badges, and custom scrollbars.
- **Task Management**: Create, edit, and delete tasks with comprehensive metadata (Categories, Priorities, Estimates, Tags).
- **Notifications**: Instant feedback with `react-hot-toast`.
- **State Management**: Robust client-side state using Zustand.

## Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- React Router DOM
- Zustand (Global State)
- Framer Motion (Animations)
- Recharts (Analytics Charts)
- @hello-pangea/dnd (Drag and Drop)
- React Hook Form
- date-fns

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Token (JWT)
- Bcrypt.js

## Getting Started

### 1. Setup Backend
1. Navigate to the `server` directory: `cd server`
2. Install dependencies: `npm install`
3. Create `.env` file:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   ```
4. Start server: `npm run dev`

### 2. Setup Frontend
1. Navigate to the `client` directory: `cd client`
2. Install dependencies: `npm install`
3. Start Vite dev server: `npm run dev`

## UI Theme Details
- **Design Philosophy**: Modern SaaS, Minimalist, Glassmorphism.
- **Primary Color**: Indigo (`#6366F1`)
- **Secondary**: Purple (`#8B5CF6`)
- **Status/Priority Mapping**: Contextual gradient badges mapped precisely to task conditions.
"# Task-Tracker" 
