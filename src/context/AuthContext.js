import React, {
  createContext,
  useState,
  useEffect,
  useContext
} from 'react';

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '../firebase';

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

  // ----------------------------------------------------
  // FIREBASE AUTH STATE
  // ----------------------------------------------------

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('achintyah_user');
          localStorage.removeItem('achintyah_token');
          setLoading(false);
          return;
        }

        // Get Firebase ID token
        const idToken = await firebaseUser.getIdToken();

        setToken(idToken);
        localStorage.setItem('achintyah_token', idToken);

        // Get application profile from Firestore
        const userDoc = await getDoc(
          doc(db, 'users', firebaseUser.uid)
        );

        if (!userDoc.exists()) {
          console.error('Firestore user profile not found');

          await signOut(auth);

          setUser(null);
          setToken(null);

          localStorage.removeItem('achintyah_user');
          localStorage.removeItem('achintyah_token');

          setLoading(false);
          return;
        }

        const userData = userDoc.data();

        const appUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          username: userData.username || firebaseUser.email,
          name: userData.name || '',
          role: userData.role || 'user',
          permissions: Array.isArray(userData.permissions)
            ? userData.permissions
            : []
        };

        setUser(appUser);

        localStorage.setItem(
          'achintyah_user',
          JSON.stringify(appUser)
        );
      } catch (error) {
        console.error('Firebase auth state error:', error);

        setUser(null);
        setToken(null);

        localStorage.removeItem('achintyah_user');
        localStorage.removeItem('achintyah_token');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ----------------------------------------------------
  // LOGIN
  // ----------------------------------------------------

  const login = async (username, password) => {
    const email = (username || '').trim();

    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const firebaseUser = credential.user;

      const idToken = await firebaseUser.getIdToken();

      // Get application profile
      const userDoc = await getDoc(
        doc(db, 'users', firebaseUser.uid)
      );

      if (!userDoc.exists()) {
        await signOut(auth);

        throw new Error(
          'User account exists, but no application profile was found.'
        );
      }

      const userData = userDoc.data();

      const appUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        username: userData.username || firebaseUser.email,
        name: userData.name || '',
        role: userData.role || 'user',
        permissions: Array.isArray(userData.permissions)
          ? userData.permissions
          : []
      };

      setToken(idToken);
      setUser(appUser);

      localStorage.setItem('achintyah_token', idToken);
      localStorage.setItem(
        'achintyah_user',
        JSON.stringify(appUser)
      );

      return appUser;

    } catch (error) {
      console.error('Firebase login error:', error);

      switch (error.code) {
        case 'auth/invalid-credential':
          throw new Error('Invalid email or password.');

        case 'auth/user-not-found':
          throw new Error('No account exists with this email.');

        case 'auth/wrong-password':
          throw new Error('Incorrect password.');

        case 'auth/too-many-requests':
          throw new Error(
            'Too many login attempts. Please try again later.'
          );

        case 'auth/invalid-email':
          throw new Error('Please enter a valid email address.');

        default:
          throw new Error(
            error.message || 'Login failed. Please try again.'
          );
      }
    }
  };

  // ----------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }

    setToken(null);
    setUser(null);

    localStorage.removeItem('achintyah_token');
    localStorage.removeItem('achintyah_user');
  };

  // ----------------------------------------------------
  // RBAC
  // ----------------------------------------------------

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
