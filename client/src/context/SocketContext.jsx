import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [eventUpdates, setEventUpdates] = useState({});

  
useEffect(() => {
  // Connect to the deployed Render backend
  const newSocket = io(
    import.meta.env.VITE_API_URL.replace(/\/api\/?$/, ''),
    {
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    }
  );

  // Keep the rest of your existing useEffect code here


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
