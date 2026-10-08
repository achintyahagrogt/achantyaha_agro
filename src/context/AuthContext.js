import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('achintyah_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('achintyah_token') || null;
  });
  const [loading, setLoading] = useState(true);

  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5001/api' 
    : '/api';

  useEffect(() => {
    if (token) {
      // Verify token with backend
      fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (res.ok) return res.json();
          if (res.status === 401 || res.status === 403) {
            logout();
          }
          throw new Error('Session expired');
        })
        .then(data => {
          if (data && data.user) {
            setUser(data.user);
            localStorage.setItem('achintyah_user', JSON.stringify(data.user));
          }
        })
        .catch((err) => {
          console.warn('Auth verification failed or server offline:', err.message);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    const u = (username || '').trim().toLowerCase();
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: (username || '').trim(), password })
      });

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Login failed. Please check credentials.');
        }

        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('achintyah_token', data.token);
        localStorage.setItem('achintyah_user', JSON.stringify(data.user));
        return data.user;
      } else {
        // Server returned non-JSON (HTML 404 or page)
        throw new SyntaxError('Unexpected token HTML response from server');
      }
    } catch (err) {
      // If server is unreachable, returns HTML, or fetch fails -> Try local admin fallback
      if (
        err.name === 'TypeError' ||
        err.name === 'SyntaxError' ||
        err.message.includes('fetch') ||
        err.message.includes('Failed') ||
        err.message.includes('Unexpected') ||
        err.message.includes('JSON')
      ) {
        if (u === 'admin' && (password === 'admin123' || password === 'admin')) {
          const devAdmin = {
            id: 'user-admin',
            username: 'admin',
            name: 'Main Admin',
            role: 'admin',
            permissions: ['create', 'read', 'update', 'delete', 'manage_users']
          };
          const devToken = 'dev-local-admin-token';
          setToken(devToken);
          setUser(devAdmin);
          localStorage.setItem('achintyah_token', devToken);
          localStorage.setItem('achintyah_user', JSON.stringify(devAdmin));
          return devAdmin;
        } else if (u === 'editor1' && password === 'editor123') {
          const devEditor = {
            id: 'user-editor',
            username: 'editor1',
            name: 'Product Editor',
            role: 'editor',
            permissions: ['create', 'read', 'update']
          };
          const devToken = 'dev-local-editor-token';
          setToken(devToken);
          setUser(devEditor);
          localStorage.setItem('achintyah_token', devToken);
          localStorage.setItem('achintyah_user', JSON.stringify(devEditor));
          return devEditor;
        }
        throw new Error('Invalid credentials or backend server offline. Please check username/password.');
      }
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('achintyah_token');
    localStorage.removeItem('achintyah_user');
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasPermission, loading, API_BASE }}>
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
