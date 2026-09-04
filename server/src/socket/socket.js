let ioInstance = null;

const initSocket = (server) => {
  const { Server } = require('socket.io');
  ioInstance = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  ioInstance.on('connection', (socket) => {
    // console.log(`Socket connected: ${socket.id}`);

    socket.on('join_event', (eventId) => {
      socket.join(`event_${eventId}`);
    });

    socket.on('leave_event', (eventId) => {
      socket.leave(`event_${eventId}`);
    });

    socket.on('disconnect', () => {
      // console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

const getIO = () => {
  return ioInstance;
};

const notifyAttendeeUpdate = (eventId, payload) => {
  if (ioInstance) {
    // Broadcast to room for specific event and globally
    ioInstance.to(`event_${eventId}`).emit('attendee_update', payload);
    ioInstance.emit('global_event_update', payload);
  }
};

module.exports = { initSocket, getIO, notifyAttendeeUpdate };
