import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wasPreviouslyLoggedIn, setWasPreviouslyLoggedIn] = useState(false);

  useEffect(() => {
    // Check for existing user data on app load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    const previousLoginState = localStorage.getItem('wasPreviouslyLoggedIn');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setWasPreviouslyLoggedIn(true);
    } else if (previousLoginState === 'true') {
      setWasPreviouslyLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('wasPreviouslyLoggedIn', 'true');
    setUser(userData);
    setWasPreviouslyLoggedIn(true);
    window.dispatchEvent(new Event('loginStateChanged'));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.setItem('wasPreviouslyLoggedIn', 'true'); // Keep track that user was logged in
    setUser(null);
    setWasPreviouslyLoggedIn(true);
    window.dispatchEvent(new Event('loginStateChanged'));
  };

  const clearPreviousLoginState = () => {
    localStorage.removeItem('wasPreviouslyLoggedIn');
    setWasPreviouslyLoggedIn(false);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    wasPreviouslyLoggedIn,
    clearPreviousLoginState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 