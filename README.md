# 🚀 TaskMaster - Premium SaaS Task Tracker

TaskMaster is a modern Task Tracker web application built with the MERN Stack **(MongoDB, Express.js, React.js, Node.js)**. It provides secure authentication, task management, analytics, and a responsive user interface inspired by modern SaaS applications.

🌐 Live Demo
web site:- https://task-tracker-alpha-sand.vercel.app/

## ✨ Features

* 🔐 JWT Authentication (Login & Registration)
* ✅ Create, Read, Update & Delete (CRUD) Tasks
* 📊 Dashboard with Analytics
* 📋 Kanban Board
* 📅 Calendar View
* 🔎 Search & Filter Tasks
* 🏷️ Task Categories, Priorities & Status
* 📱 Fully Responsive Design
* 🌙 Dark Mode
* 🎨 Glassmorphism UI
* 🔔 Toast Notifications
* ⚡ Dynamic Updates Without Page Refresh

## 🛠️ Tech Stack

### Frontend

* React.js (Vite)
* Tailwind CSS
* React Router DOM
* Zustand
* Framer Motion
* Recharts
* React Hook Form
* @hello-pangea/dnd
* date-fns

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt.js
* express-validator

## 📂 Installation

### Backend

```bash
cd server
npm install
npm run dev
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## 📁 Project Structure

```text
Task-Tracker
├── client
│   ├── src
│   ├── components
│   ├── pages
│   └── services
│
├── server
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middlewares
│   └── config
```


