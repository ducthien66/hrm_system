import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
  isSuperAdmin: boolean;
  isHR: boolean;
  isAccountant: boolean;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hrm_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hrm_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res: any = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('hrm_user', JSON.stringify(res.data));
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res: any = await api.post('/auth/login', { email, password });
    const { accessToken, user: userData } = res.data;
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem('hrm_token', accessToken);
    localStorage.setItem('hrm_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hrm_token');
    localStorage.removeItem('hrm_user');
  };

  const hasRole = (...roles: string[]) => {
    if (!user) return false;
    if (user.role.code === 'SUPER_ADMIN') return true;
    return roles.includes(user.role.code);
  };

  const isSuperAdmin = user?.role.code === 'SUPER_ADMIN';
  const isHR = user?.role.code === 'HR_MANAGER' || isSuperAdmin;
  const isAccountant = user?.role.code === 'ACCOUNTANT' || isSuperAdmin;
  const isManager = user?.role.code === 'DEPT_MANAGER' || isHR;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        hasRole,
        isSuperAdmin,
        isHR,
        isAccountant,
        isManager,
      }}
    >
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
