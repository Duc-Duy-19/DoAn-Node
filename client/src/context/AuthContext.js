import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      // Initialize socket connection
      const userData = JSON.parse(storedUser);
      initSocket(userData._id);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      
      if (response.data.success) {
        const token = response.data.data;
        localStorage.setItem('token', token);
        
        // Get user info
        const userResponse = await api.get('/auth/me');
        if (userResponse.data.success) {
          const userData = userResponse.data.data;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Initialize socket connection
          initSocket(userData._id);
          
          return { success: true };
        }
      }
      return { success: false, message: 'Login failed' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.data || 'Login failed' 
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { 
        username, 
        email, 
        password 
      });
      
      if (response.data.success) {
        return { success: true, message: 'Đăng ký thành công! Vui lòng đăng nhập.' };
      }
      return { success: false, message: 'Đăng ký thất bại' };
    } catch (error) {
      // Handle error properly - ensure message is always a string
      let errorMessage = 'Đăng ký thất bại';
      
      if (error.response?.data?.data) {
        const data = error.response.data.data;
        errorMessage = typeof data === 'string' ? data : JSON.stringify(data);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      disconnectSocket();
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

