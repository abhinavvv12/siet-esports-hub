import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isCoordinator: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Public pages and the login screen do not need a session lookup. Calling
    // this protected endpoint for every visitor produces an expected 401 that
    // browsers surface as a console error. Coordinator pages still verify the
    // server-side session before granting access.
    const needsSession = window.location.pathname.startsWith('/coordinator/')
      && window.location.pathname !== '/coordinator/login';

    if (!needsSession) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    api.get('/auth/me')
      .then((r) => setUser(r.data.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const r = await api.post('/auth/login', { email, password });
    setUser(r.data.data.user);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    window.location.href = '/coordinator/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      isCoordinator: user?.role === 'COORDINATOR' || user?.role === 'ADMIN',
      isAdmin: user?.role === 'ADMIN',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
