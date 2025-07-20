import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  registerNumber: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  activeRole: string | null;
  login: (registerNumber: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (oldPassword: string, newPassword: string) => Promise<void>;
  setActiveRole: (role: string) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  activeRole: null,
  login: async () => {},
  logout: () => {},
  resetPassword: async () => {},
  setActiveRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('activeRole');
    if (token) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser(response.data);
          setActiveRole(storedRole || response.data.roles[0] || null);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('activeRole');
        });
    }
  }, []);

  const login = async (registerNumber: string, password: string) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
      registerNumber,
      password,
    });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    const defaultRole = response.data.user.roles[0];
    setActiveRole(defaultRole);
    localStorage.setItem('activeRole', defaultRole);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activeRole');
    setUser(null);
    setActiveRole(null);
  };

  const resetPassword = async (oldPassword: string, newPassword: string) => {
    const token = localStorage.getItem('token');
    await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/reset-password`,
      { oldPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleSetActiveRole = (role: string) => {
    if (user?.roles.includes(role)) {
      setActiveRole(role);
      localStorage.setItem('activeRole', role);
    }
  };

  return (
    <AuthContext.Provider value={{ user, activeRole, login, logout, resetPassword, setActiveRole: handleSetActiveRole }}>
      {children}
    </AuthContext.Provider>
  );
};