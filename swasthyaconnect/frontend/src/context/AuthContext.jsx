import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const OTP_LENGTH = 6;
const OTP_COUNTDOWN_SECONDS = 180;

const getAPIBaseURL = () => {
  const envURL = import.meta.env.VITE_API_URL;

  if (envURL) {
    return envURL.endsWith('/api/v1') ? envURL : `${envURL}/api/v1`;
  }

  return '/api/v1';
};

const getStoredJSON = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (_error) {
    localStorage.removeItem(key);
    return null;
  }
};

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const normalizeRole = (value) => {
  const role = String(value || '').trim().toLowerCase();

  if (role === 'staff') {
    return 'doctor';
  }

  if (role === 'doctor' || role === 'patient' || role === 'admin') {
    return role;
  }

  return 'patient';
};

const isValidEmail = (value) => /.+@.+\..+/.test(String(value || '').trim());

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('sc_token') || '');
  const [user, setUser] = useState(() => getStoredJSON('sc_user'));
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmailState] = useState('');
  const [otpCode, setOtpCodeState] = useState('');
  const [otpRole, setOtpRole] = useState('patient');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: getAPIBaseURL(),
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

  useEffect(() => {
    if (step !== 2 || otpCountdown <= 0) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setOtpCountdown((currentValue) => {
        if (currentValue <= 1) {
          window.clearInterval(intervalId);
          return 0;
        }

        return currentValue - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [step, otpCountdown]);

  useEffect(() => {
    if (step !== 2 || otpCountdown > 0) {
      return;
    }

    setOtpMessage('Verification code expired. Tap Enter again to restart.');
  }, [step, otpCountdown]);

  const resetOtpFlow = () => {
    setStep(1);
    setEmailState('');
    setOtpCodeState('');
    setOtpRole('patient');
    setOtpCountdown(0);
    setOtpMessage('');
    setOtpError('');
  };

  const setEmail = (value) => {
    setEmailState(normalizeEmail(value));
  };

  const setOtpCode = (value) => {
    setOtpCodeState(String(value || '').replace(/\D/g, '').slice(0, OTP_LENGTH));
  };

  const login = async (emailValue, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: emailValue, password });
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

  const requestOtp = async ({ email: rawEmail, role } = {}) => {
    const normalizedEmail = normalizeEmail(rawEmail || email);
    const normalizedRole = normalizeRole(role || otpRole);

    if (!isValidEmail(normalizedEmail)) {
      throw new Error('Enter a valid email address.');
    }

    if (loading) {
      return null;
    }

    setLoading(true);
    setOtpError('');
    setOtpMessage('');

    try {
      const { data } = await api.post('/auth/send-otp', {
        email: normalizedEmail,
        role: normalizedRole,
      });

      setEmailState(normalizedEmail);
      setOtpRole(normalizedRole);
      setOtpCodeState('');
      setStep(2);
      setOtpCountdown(OTP_COUNTDOWN_SECONDS);
      setOtpMessage(data?.message || `Verification code sent to ${normalizedEmail}.`);

      return data;
    } catch (error) {
      setOtpError(error?.response?.data?.message || error?.message || 'Unable to send the verification code.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async ({ otpCode: rawOtpCode, email: rawEmail, role } = {}) => {
    const normalizedOtpCode = String(rawOtpCode ?? otpCode ?? '').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const normalizedEmail = normalizeEmail(rawEmail || email);
    const normalizedRole = normalizeRole(role || otpRole);

    if (!isValidEmail(normalizedEmail)) {
      throw new Error('Enter a valid email address.');
    }

    if (normalizedOtpCode.length !== OTP_LENGTH) {
      throw new Error('Enter the 6-digit verification code.');
    }

    if (loading) {
      return null;
    }

    setLoading(true);
    setOtpError('');

    try {
      const { data } = await api.post('/auth/verify-otp', {
        email: normalizedEmail,
        otp: normalizedOtpCode,
        role: normalizedRole,
      });

      setToken(data.token);
      setUser(data.user);
      resetOtpFlow();
      return data;
    } catch (error) {
      setOtpError(error?.response?.data?.message || error?.message || 'Unable to verify the OTP.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('sc_token');
    localStorage.removeItem('sc_user');
    resetOtpFlow();
  };

  const setSession = ({ token: nextToken, user: nextUser }) => {
    setToken(nextToken || '');
    setUser(nextUser || null);
  };

  const value = {
    api,
    token,
    user,
    isAuthenticated: Boolean(token && user?.role),
    loading,
    step,
    email,
    otpCode,
    otpRole,
    otpCountdown,
    otpError,
    otpMessage,
    setEmail,
    setOtpCode,
    requestOtp,
    verifyOtp,
    resetOtpFlow,
    login,
    signup,
    logout,
    setSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
