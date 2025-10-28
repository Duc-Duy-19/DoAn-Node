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
    // Check if admin is logged in on mount
    const token = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');
    
    if (token && storedUser) {
      const userData = JSON.parse(storedUser);
      // Check if user is ADMIN or MOD
      if (userData.role?.name === 'ADMIN' || userData.role?.name === 'MOD') {
        setUser(userData);
        initSocket(); // Initialize socket for admin notifications
      } else {
        // Not admin, clear storage
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      
      if (response.data.success) {
        const token = response.data.data;
        localStorage.setItem('adminToken', token);
        
        // Get user info
        const userResponse = await api.get('/auth/me');
        if (userResponse.data.success) {
          const userData = userResponse.data.data;
          
          // Check if user is ADMIN or MOD
          if (userData.role?.name === 'ADMIN' || userData.role?.name === 'MOD') {
            setUser(userData);
            localStorage.setItem('adminUser', JSON.stringify(userData));
            initSocket(); // Initialize socket
            return { success: true };
          } else {
            // Not admin
            localStorage.removeItem('adminToken');
            return { success: false, message: 'Bạn không có quyền truy cập trang quản trị' };
          }
        }
      }
      return { success: false, message: 'Đăng nhập thất bại' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.data || 'Đăng nhập thất bại' 
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setUser(null);
      disconnectSocket();
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role?.name === 'ADMIN',
    isMod: user?.role?.name === 'MOD'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

