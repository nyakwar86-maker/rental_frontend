


// context/AuthContext.js - JUST THE SOCKET SECTION UPDATED
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import socketService from '../services/socket.service';
import { toast } from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [socketConnected, setSocketConnected] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        setToken(token);
        setUser(JSON.parse(userData));
        
        // Connect socket after loading user
        try {
          socketService.connect(token);
        } catch (error) {
          console.error('Failed to connect socket:', error);
        }
      }
      
      setLoading(false);
    };
    
    initAuth();
  }, []);

  // Listen to socket connection events - UPDATED SECTION
  useEffect(() => {
    if (!token) return;
    
    const handleSocketConnected = () => {
      setSocketConnected(true);
      console.log('✅ Socket connected in AuthContext');
    };
    
    const handleSocketDisconnected = () => {
      setSocketConnected(false);
      console.log('❌ Socket disconnected in AuthContext');
    };
    
    // Reconnect socket if token changes
    if (token && !socketService.isConnected()) {
      socketService.connect(token);
    }
    
    socketService.on('connect', handleSocketConnected);
    socketService.on('disconnect', handleSocketDisconnected);
    
    return () => {
      socketService.off('connect', handleSocketConnected);
      socketService.off('disconnect', handleSocketDisconnected);
    };
  }, [token]);

  // Login function - UPDATED with better socket handling
  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login with:', { email });
      const response = await api.post('/auth/login', { email, password });
      console.log('✅ Login response:', response.data.user);
      
      const data = response.data;
      
      // Store token and user data
      localStorage.setItem('token', data.tokens.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('lastLogin', new Date().toISOString());
      
      setToken(data.tokens.accessToken);
      setUser(data.user);
      
      // Connect socket after successful login
      setTimeout(() => {
        socketService.connect(data.tokens.accessToken);
      }, 100);
      
      toast.success('Login successful!');
      
      return { success: true, user: data.user };
      
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.error || 'Login failed';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Logout function - UPDATED
  const logout = () => {
    console.log('👋 Logging out user:', user?.email);
    
    // Disconnect socket first
    socketService.disconnect();
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastLogin');
    
    // Reset state
    setToken(null);
    setUser(null);
    setSocketConnected(false);
    
    toast.success('Logged out successfully');
    
    // Redirect to login page
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  };

  // Register function - UPDATED
  const register = async (userData) => {
    try {
      console.log('📝 Registering user:', { ...userData, password: '***' });
      const response = await api.post('/auth/register', userData);
      console.log('✅ Register response:', response.data);
      
      
      const token = response.data.tokens.accessToken;
      const user = response.data.user;
      
      //Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('lastLogin', new Date().toISOString());
      
      setToken(token);
      setUser(user);
      
      
      // Connect socket after successful registration
      setTimeout(() => {
        socketService.connect(token);
        // window.location.href = '/login';
      }, 100);
      
      toast.success('Registration successful!');
      return { success: true, user: user };
      
    } catch (error) {
      console.error('❌ Register error:', error.response?.data || error.message);
      // const errorMsg = error.response?.data?.error || 'Registration failed';
       const errorMsg = error.response?.data?.error;
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Get current user from backend - UPDATED
  const getCurrentUser = async () => {
    try {
      console.log('🔍 Fetching current user from backend...');
      const response = await api.get('/auth/me');
      const userData = response.data.data.user;
      
      // Update local storage and state
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('✅ Current user loaded:', userData.email);
      return userData;
    } catch (error) {
      console.error('❌ Get current user error:', error);
      
      // If unauthorized, clear storage
      if (error.response?.status === 401) {
        console.log('🔄 Token expired, logging out...');
        logout();
      }
      
      return null;
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      console.log('🔄 Updating profile...');
      const response = await api.put('/users/profile', profileData);
      const updatedUser = { ...user, ...response.data.user };
      
      // Update local storage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      console.log('✅ Profile updated:', updatedUser.email);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Update profile error:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
      return { success: false };
    }
  };

  // Change password function
  const changePassword = async (passwordData) => {
    try {
      console.log('🔐 Changing password...');
      await api.put('/users/change-password', passwordData);
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Change password error:', error);
      toast.error(error.response?.data?.error || 'Failed to change password');
      return { success: false };
    }
  };

  // Refresh token function - NEW
  const refreshToken = async () => {
    try {
      console.log('🔄 Refreshing token...');
      // This would call your refresh token endpoint if you have one
      // For now, we'll just re-authenticate
      const userData = await getCurrentUser();
      return userData;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      return null;
    }
  };

  // Check authentication status - NEW
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      return false;
    }
    
    // Optional: Check token expiry if you have JWT expiry
    try {
      const user = JSON.parse(userData);
      return !!user;
    } catch {
      return false;
    }
  };

  // Get user token - NEW (useful for socket service)
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Update user avatar - NEW
  const updateAvatar = async (avatarUrl) => {
    try {
      const updatedUser = { ...user, avatar_url: avatarUrl };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Also update on backend
      await updateProfile({ avatar_url: avatarUrl });
      
      return true;
    } catch (error) {
      console.error('❌ Update avatar error:', error);
      return false;
    }
  };

  const value = {
    // State
    user,
    token,
    loading,
    socketConnected,
    
    // Actions
    login,
    register,
    logout,
    getCurrentUser,
    updateProfile,
    changePassword,
    refreshToken,
    checkAuth,
    getToken,
    updateAvatar,
    
    // Status checks
    isAuthenticated: !!user && !!token,
    isLandlord: user?.role === 'landlord',
    isTenant: user?.role === 'tenant',
    isAdmin: user?.role === 'admin',
    isVerified: user?.is_verified,
    isActive: user?.is_active,
    
    // User info shortcuts
    userId: user?.id,
    userEmail: user?.email,
    userName: user?.full_name || user?.email,
    userRole: user?.role,
    userAvatar: user?.avatar_url,
    
    // Socket info
    isSocketConnected: socketConnected,
    reconnectSocket: () => {
      if (token) {
        socketService.connect(token);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};