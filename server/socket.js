const socketIO = require('socket.io');

let io;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "*", // allow all in dev
      methods: ["GET", "POST", "PUT", "DELETE"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join user's personal room for direct notifications
    socket.on('setup', (userData) => {
      if (userData && userData._id) {
        socket.join(userData._id);
        console.log(`User ${userData._id} joined personal room`);
        socket.emit('connected');
      }
    });

    // Join team room
    socket.on('join_team', (teamId) => {
      socket.join(teamId);
      console.log(`User joined team room: ${teamId}`);
    });

    // Join project room
    socket.on('join_project', (projectId) => {
      socket.join(projectId);
      console.log(`User joined project room: ${projectId}`);
    });

    // Chat / Messages
    socket.on('new_message', (newMessageRecieved) => {
      var chat = newMessageRecieved.chat;
      // Depending on chat type (team, project, direct), emit to specific room
      if (newMessageRecieved.chatType === 'team') {
        socket.in(newMessageRecieved.team).emit('message_received', newMessageRecieved);
      } else if (newMessageRecieved.chatType === 'project') {
        socket.in(newMessageRecieved.project).emit('message_received', newMessageRecieved);
      } else if (newMessageRecieved.chatType === 'direct') {
        socket.in(newMessageRecieved.receiver).emit('message_received', newMessageRecieved);
      }
    });

    // Typing indicators
    socket.on('typing', (data) => socket.in(data.room).emit('typing', data));
    socket.on('stop_typing', (data) => socket.in(data.room).emit('stop_typing', data));

    // Tasks updates
    socket.on('task_updated', (data) => {
      // emit to project or team room
      if (data.project) socket.in(data.project).emit('task_updated', data);
      else if (data.team) socket.in(data.team).emit('task_updated', data);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIO };
