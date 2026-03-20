import React, { createContext, useEffect, useState, useContext } from 'react';
import { loginAPI, registerAPI, googleAuthAPI, getProfileAPI, guestAuthAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { getAuthHomePath } from '../utils/authRoutes';
import { clearStoredUser, getStoredUser, setStoredUser } from '../utils/authStorage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const normalizeRole = (role) => {
  if (typeof role !== 'string') {
    return 'user';
  }

  return role.trim().toLowerCase().replace(/[`'"]/g, '') || 'user';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const syncAuthState = async () => {
      const storedUser = getStoredUser();

      if (!storedUser?.token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await getProfileAPI();
        const nextUser = {
          ...storedUser,
          ...response.data,
          token: storedUser.token,
        };

        setStoredUser(nextUser);
        setUser(nextUser);
      } catch (error) {
        console.error('Failed to restore auth session:', error.response?.data?.message || error.message);
        clearStoredUser();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    syncAuthState();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getStoredUser());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const completeAuth = (authData) => {
    setStoredUser(authData);
    setUser(authData);
    navigate(getAuthHomePath(authData));
  };

  const login = async (email, password) => {
    try {
      const response = await loginAPI(email, password);
      completeAuth(response.data);
      return true;
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message || error.message);
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const response = await registerAPI(name, email, password, normalizeRole(role));
      completeAuth(response.data);
      return true;
    } catch (error) {
      console.error("Registration failed:", error.response?.data?.message || error.message);
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const googleAuth = async (credential, role = 'user') => {
    try {
      const response = await googleAuthAPI(credential, normalizeRole(role));
      completeAuth(response.data);
      return true;
    } catch (error) {
      console.error("Google authentication failed:", error.response?.data?.message || error.message);
      throw error.response?.data?.message || 'Google authentication failed';
    }
  };

  const loginAsGuest = async () => {
    try {
      const response = await guestAuthAPI();
      completeAuth(response.data);
      return true;
    } catch (error) {
      console.error("Guest authentication failed:", error.response?.data?.message || error.message);
      throw error.response?.data?.message || 'Guest authentication failed';
    }
  };

  const logout = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }

    clearStoredUser();
    setUser(null);
    navigate('/login');
  };

  const isAuthenticated = Boolean(user?.token);
  const isHR = user?.role === 'hr';
  const isGuest = Boolean(user?.isGuest);

  return (
    <AuthContext.Provider
      value={{ user, login, register, googleAuth, loginAsGuest, logout, loading, isAuthenticated, isHR, isGuest }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
