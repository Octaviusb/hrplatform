import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  globalRole?: 'superadmin' | 'user';
  memberships?: Array<{ organizationId: string; roles: string[] }>; 
  activeOrganizationId?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await api.me();
        setUser(res.user);
        api.setOrganizationId(res.user.activeOrganizationId ?? null);
      } catch (e) {
        api.clearToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('AuthContext login llamado');
    try {
      const response = await api.login(email, password);
      console.log('Login response:', response);
      setUser(response.user);
      api.setOrganizationId(response.user.activeOrganizationId ?? null);
    } catch (error) {
      console.error('Error en AuthContext login:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    console.log('AuthContext register llamado');
    try {
      const response = await api.register(name, email, password);
      console.log('Register response:', response);
      setUser(response.user);
    } catch (error) {
      console.error('Error en AuthContext register:', error);
      throw error;
    }
  };

  const logout = () => {
    api.clearToken();
    api.setOrganizationId(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}