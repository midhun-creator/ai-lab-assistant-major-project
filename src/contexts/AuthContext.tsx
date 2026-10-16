import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role } from '../lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

// Mock Users for testing
export const MOCK_USERS: Record<Role, User> = {
  student: { id: "u-101", name: "Midhun", email: "midhun@gpc.edu.in", role: "student" },
  teacher: { id: "u-201", name: "Prof. Sarah Jenkins", email: "sarah@gpc.edu.in", role: "teacher" },
  admin: { id: "u-301", name: "Admin Portal", email: "admin@gpc.edu.in", role: "admin" }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for a saved role session
    const savedRole = localStorage.getItem('mock_role') as Role | null;
    if (savedRole && MOCK_USERS[savedRole]) {
      setUser(MOCK_USERS[savedRole]);
    }
    setLoading(false);
  }, []);

  const login = (role: Role) => {
    setUser(MOCK_USERS[role]);
    localStorage.setItem('mock_role', role);
    // Simulate setting JWT
    localStorage.setItem('access_token', `mock_token_${role}`);
    localStorage.setItem('refresh_token', `mock_refresh_${role}`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mock_role');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
