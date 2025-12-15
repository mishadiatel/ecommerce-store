'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { authLogout, getMe } from '@/services/auth';
import { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  setUser: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((data) => {
        if (data.role !== 'admin') {
          router.replace('/adminPanel/login');
          setUser(null);
        } else {
          setUser(data);
        }
      })
      .catch(() => {
        router.replace('/adminPanel/login');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    authLogout().then(data => {
      router.replace('/adminPanel/login');
      setUser(null);
    }).catch(error => {
      router.replace('/adminPanel/login');
      setUser(null);
    })

  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    setUser,
    logout,
  };

  if (loading)
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        Loading...
      </div>
    );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
