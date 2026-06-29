import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          const response = await axios.get('/auth/me');
          setUser(response.data.data);
        } catch (err) {
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data.data;

      // Update storage first
      localStorage.setItem('authToken', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Update state together
      setToken(newToken);
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your credentials and server connection.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (emailOrPayload, firstName, lastName, password, role = 'employee') => {
    setLoading(true);
    setError(null);
    try {
      const payload =
        typeof emailOrPayload === 'object' && emailOrPayload !== null
          ? emailOrPayload
          : {
              email: emailOrPayload,
              firstName,
              lastName,
              password,
              role,
            };

      const response = await axios.post('/auth/register', {
        ...payload,
      });
      const { token: newToken, user: userData } = response.data.data;

      localStorage.setItem('authToken', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setToken(newToken);
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('authToken');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
