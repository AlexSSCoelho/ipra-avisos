import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Obreiro } from '../types';
import { storageService } from '../services/storageService';

interface AuthContextType {
  currentUser: Obreiro | null;
  obreiros: Obreiro[];
  /** App em modo de primeira configuração (sem nenhum obreiro cadastrado) */
  isBootstrap: boolean;
  /** PIN administrativo foi configurado pelo admin */
  hasPinConfigured: boolean;
  login: (obreiro: Obreiro) => void;
  logout: () => void;
  verifyAdminPin: (pin: string) => boolean;
  /** Fora do bootstrap, apenas admin pode criar obreiros */
  addObreiro: (obreiro: Omit<Obreiro, 'id'>, bypassAdminCheck?: boolean) => { success: boolean; message?: string };
  updateAdminPin: (oldPin: string, newPin: string) => boolean;
  /** Define PIN pela primeira vez no bootstrap (sem PIN anterior exigido) */
  setInitialPin: (pin: string) => boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [obreiros, setObreiros] = useState<Obreiro[]>(() => storageService.getObreiros());
  const [hasPinConfigured, setHasPinConfigured] = useState<boolean>(() => storageService.hasPinConfigured());
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

  // Migração pontual: se o obreiro logado tem cargo 'pastor' ou 'admin' mas
  // isAdmin não está explicitamente marcado, garantir que seja preservado.
  // Apenas para instalações existentes (obreiros já salvos sem isAdmin explícito).
  useEffect(() => {
    if (obreiros.length === 0) return;
    const needsMigration = obreiros.some(
      (o) => !o.isAdmin && (o.cargo === 'pastor' || o.cargo === 'admin')
    );
    if (needsMigration) {
      const migrated = obreiros.map((o) =>
        !o.isAdmin && (o.cargo === 'pastor' || o.cargo === 'admin')
          ? { ...o, isAdmin: true }
          : o
      );
      storageService.saveObreiros(migrated);
    }
  // Executa apenas uma vez após o carregamento inicial
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isBootstrap = obreiros.length === 0;

  const login = (obreiro: Obreiro): void => {
    setCurrentUser(obreiro);
    localStorage.setItem('ipra_current_user_v1', JSON.stringify(obreiro));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ipra_current_user_v1');
  };

  const verifyAdminPin = (pin: string): boolean => {
    const stored = storageService.getAdminPin();
    // Se não há PIN configurado, nunca autoriza
    if (stored === null) return false;
    return pin === stored;
  };

  const updateAdminPin = (oldPin: string, newPin: string): boolean => {
    if (!verifyAdminPin(oldPin)) return false;
    if (!newPin || newPin.trim().length === 0) return false;
    storageService.setAdminPin(newPin);
    return true;
  };

  const setInitialPin = (pin: string): boolean => {
    if (!pin || pin.trim().length === 0) return false;
    if (storageService.hasPinConfigured()) return false; // já existe PIN
    storageService.setAdminPin(pin);
    setHasPinConfigured(true);
    return true;
  };

  const addObreiro = (
    obreiroData: Omit<Obreiro, 'id'>,
    bypassAdminCheck = false
  ): { success: boolean; message?: string } => {
    // Fora do bootstrap, apenas administrador pode cadastrar
    if (!bypassAdminCheck && !isBootstrap) {
      const caller = currentUser;
      if (!caller?.isAdmin) {
        return { success: false, message: 'Apenas administradores podem cadastrar obreiros.' };
      }
    }
    const newObreiro: Obreiro = {
      ...obreiroData,
      id: `obreiro_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    storageService.addObreiro(newObreiro);
    return { success: true };
  };

  // isAdmin baseado APENAS na propriedade explícita — cargo não concede admin
  const isAdmin = currentUser?.isAdmin === true;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        obreiros,
        isBootstrap,
        hasPinConfigured,
        login,
        logout,
        verifyAdminPin,
        addObreiro,
        updateAdminPin,
        setInitialPin,
        isAdmin,
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
