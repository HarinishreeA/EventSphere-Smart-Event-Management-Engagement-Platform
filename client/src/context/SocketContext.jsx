import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [eventUpdates, setEventUpdates] = useState({});

  useEffect(() => {
    // Connect to Socket.io backend
    const newSocket = io(window.location.origin, {
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      // console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('global_event_update', (update) => {
      setEventUpdates((prev) => ({
        ...prev,
        [update.eventId]: update,
      }));
    });

    newSocket.on('attendee_update', (update) => {
      setEventUpdates((prev) => ({
        ...prev,
        [update.eventId]: update,
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, eventUpdates }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
