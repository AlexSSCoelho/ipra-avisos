import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Obreiro } from '../types';
import { storageService } from '../services/storageService';

interface AuthContextType {
  currentUser: Obreiro | null;
  obreiros: Obreiro[];
  login: (obreiro: Obreiro, pin?: string) => boolean;
  logout: () => void;
  verifyAdminPin: (pin: string) => boolean;
  addObreiro: (obreiro: Omit<Obreiro, 'id'>) => void;
  updateAdminPin: (oldPin: string, newPin: string) => boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [obreiros, setObreiros] = useState<Obreiro[]>(() => storageService.getObreiros());
  const [currentUser, setCurrentUser] = useState<Obreiro | null>(() => {
    const saved = localStorage.getItem('ipra_current_user_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    const unsubscribe = storageService.subscribeToObreiros((updatedList) => {
      setObreiros(updatedList);
    });
    return () => unsubscribe();
  }, []);

  const login = (obreiro: Obreiro, pin?: string): boolean => {
    if (pin !== undefined) {
      const correctPin = storageService.getAdminPin();
      if (pin !== correctPin) {
        return false;
      }
    }
    setCurrentUser(obreiro);
    localStorage.setItem('ipra_current_user_v1', JSON.stringify(obreiro));
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ipra_current_user_v1');
  };

  const verifyAdminPin = (pin: string): boolean => {
    const correctPin = storageService.getAdminPin();
    return pin === correctPin;
  };

  const updateAdminPin = (oldPin: string, newPin: string): boolean => {
    if (verifyAdminPin(oldPin)) {
      storageService.setAdminPin(newPin);
      return true;
    }
    return false;
  };

  const addObreiro = (obreiroData: Omit<Obreiro, 'id'>) => {
    const newObreiro: Obreiro = {
      ...obreiroData,
      id: `obreiro_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    storageService.addObreiro(newObreiro);
  };

  const isAdmin = currentUser?.isAdmin || currentUser?.cargo === 'pastor' || currentUser?.cargo === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        obreiros,
        login,
        logout,
        verifyAdminPin,
        addObreiro,
        updateAdminPin,
        isAdmin: !!isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
