import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io('http://localhost:3000', {
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('Admin socket connected:', socket.id);
      // Join admin room for receiving notifications
      socket.emit('join_admin_room');
    });

    socket.on('disconnect', () => {
      console.log('Admin socket disconnected');
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

