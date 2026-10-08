import React, {
  createContext,
  useState,
  useEffect,
  useContext
} from 'react';

import {
  signInWithEmailAndPassword,
  onIdTokenChanged,
  signOut
} from 'firebase/auth';

import { auth } from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5001/api'
      : '/api';

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(
      auth,
      async (firebaseUser) => {
        if (!firebaseUser) {
          setUser(null);
          setToken(null);
          setLoading(false);

          localStorage.removeItem('achintyah_token');
          localStorage.removeItem('achintyah_user');

          return;
        }

        try {
          const idToken = await firebaseUser.getIdToken();

          const response = await fetch(
            `${API_BASE}/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${idToken}`
              }
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
              'Firebase account is not authorized for the admin panel.'
            );
          }

          setToken(idToken);
          setUser(data.user);

          localStorage.setItem(
            'achintyah_token',
            idToken
          );

          localStorage.setItem(
            'achintyah_user',
            JSON.stringify(data.user)
          );
        } catch (error) {
          console.error(
            'Authentication verification failed:',
            error
          );

          await signOut(auth);

          setToken(null);
          setUser(null);

          localStorage.removeItem('achintyah_token');
          localStorage.removeItem('achintyah_user');
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [API_BASE]);

  const login = async (email, password) => {
    try {
      const credential =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const firebaseUser = credential.user;

      const idToken =
        await firebaseUser.getIdToken(true);

      const response = await fetch(
        `${API_BASE}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        await signOut(auth);

        throw new Error(
          data.message ||
          'This Firebase account is not authorized for the admin panel.'
        );
      }

      setToken(idToken);
      setUser(data.user);

      localStorage.setItem(
        'achintyah_token',
        idToken
      );

      localStorage.setItem(
        'achintyah_user',
        JSON.stringify(data.user)
      );

      return data.user;
    } catch (error) {
      console.error('Firebase login error:', error);

      let message =
        'Login failed. Please check your email and password.';

      switch (error.code) {
        case 'auth/invalid-credential':
          message = 'Invalid email or password.';
          break;

        case 'auth/user-disabled':
          message = 'This account has been disabled.';
          break;

        case 'auth/too-many-requests':
          message =
            'Too many login attempts. Please try again later.';
          break;

        case 'auth/network-request-failed':
          message =
            'Network error. Please check your internet connection.';
          break;

        default:
          if (error.message) {
            message = error.message;
          }
          break;
      }

      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(
        'Firebase logout error:',
        error
      );
    }

    setToken(null);
    setUser(null);

    localStorage.removeItem('achintyah_token');
    localStorage.removeItem('achintyah_user');
  };

  const hasPermission = (permission) => {
    if (!user) return false;

    if (user.role === 'admin') {
      return true;
    }

    return (
      Array.isArray(user.permissions) &&
      user.permissions.includes(permission)
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        hasPermission,
        loading,
        API_BASE
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};