import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthToken, removeAuthToken, setAuthToken, getCurrentUser } from '../services/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [loading, setLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = getAuthToken();
      const savedUser = localStorage.getItem('auth_user');

      if (savedToken && savedUser) {
        try {
          // Verify token is still valid by fetching current user
          const currentUser = await getCurrentUser();
          if (currentUser.data?.user) {
            const userData = currentUser.data.user;
            setUser({
              id: userData._id || userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              username: userData.username,
            });
            setToken(savedToken);
          } else {
            // Token invalid, clear auth
            removeAuthToken();
            localStorage.removeItem('auth_user');
            setUser(null);
            setToken(null);
          }
        } catch (error) {
          // Token invalid or expired, clear auth
          console.error('Auth check failed:', error);
          removeAuthToken();
          localStorage.removeItem('auth_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    setAuthToken(newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    removeAuthToken();
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser.data?.user) {
        const userData = currentUser.data.user;
        const updatedUser = {
          id: userData._id || userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          username: userData.username,
        };
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

