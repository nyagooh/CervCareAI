"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './components/firebase';

export type UserRole = 'doctor' | 'patient' | null;

interface UserContextType {
  user: User | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      // Optionally, load role from localStorage or backend
      const savedRole = localStorage.getItem('userRole') as UserRole;
      if (savedRole) setRole(savedRole);
    });
    return () => unsubscribe();
  }, []);

  const handleSetRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole) localStorage.setItem('userRole', newRole);
    else localStorage.removeItem('userRole');
  };

  return (
    <UserContext.Provider value={{ user, role, setRole: handleSetRole, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 