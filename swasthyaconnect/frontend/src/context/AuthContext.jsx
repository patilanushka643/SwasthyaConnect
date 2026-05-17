import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

/**
 * Determine API base URL based on environment
 * - Production: Use VITE_API_URL environment variable
 * - Development: Default to localhost:5000
 */
const getAPIBaseURL = () => {
  const envURL = import.meta.env.VITE_API_URL;
  const isDevelopment = import.meta.env.DEV;

  if (envURL) {
    return envURL.endsWith('/api/v1') ? envURL : `${envURL}/api/v1`;
  }

  return isDevelopment ? 'http://localhost:5000/api/v1' : '/api/v1';
};

const API_BASE_URL = getAPIBaseURL();

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('sc_token') || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sc_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
    });

    instance.interceptors.request.use((config) => {
      const currentToken = localStorage.getItem('sc_token');
      if (currentToken) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      return config;
    });

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          localStorage.removeItem('sc_token');
          localStorage.removeItem('sc_user');
          setToken('');
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('sc_token', token);
    } else {
      localStorage.removeItem('sc_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sc_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sc_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', payload);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('sc_token');
    localStorage.removeItem('sc_user');
  };

  return (
    <AuthContext.Provider
      value={{
        api,
        token,
        user,
        isAuthenticated: Boolean(token && user),
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
