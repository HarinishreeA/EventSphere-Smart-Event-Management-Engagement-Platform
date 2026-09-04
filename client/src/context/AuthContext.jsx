import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('campus_token');
      if (token) {
        try {
          const { data } = await API.get('/auth/me');
          setUser({ ...data, token });
        } catch (error) {
          console.error('Auth verification failed:', error);
          localStorage.removeItem('campus_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('campus_token', data.token);
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const { data } = await API.post('/auth/register', userData);
    localStorage.setItem('campus_token', data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('campus_token');
    setUser(null);
  };

  const isAdmin = user && user.role === 'admin';
  const isStudent = user && user.role === 'student';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
