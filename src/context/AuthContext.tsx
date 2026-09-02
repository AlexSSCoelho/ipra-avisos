import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Obreiro, CargoObreiro } from '../types';
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
  addObreiro: (obreiro: Omit<Obreiro, 'id'>) => { success: boolean; message?: string };
  /** Operação dedicada e atômica para primeira configuração do sistema */
  bootstrapInitialAdmin: (
    adminData: { nome: string; cargo: CargoObreiro; genero: 'homem' | 'mulher' },
    pin: string
  ) => { success: boolean; message?: string };
  /** Permite configurar o primeiro PIN em instalações existentes com admin mas sem PIN */
  configureMigrationPin: (pin: string) => { success: boolean; message?: string };
  updateAdminPin: (oldPin: string, newPin: string) => boolean;
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
      setCurrentUser((prevUser) => {
        if (!prevUser) return null;
        const matching = updatedList.find((o) => o.id === prevUser.id);
        if (
          matching &&
          (matching.isAdmin !== prevUser.isAdmin ||
            matching.nome !== prevUser.nome ||
            matching.cargo !== prevUser.cargo ||
            matching.ativo !== prevUser.ativo)
        ) {
          localStorage.setItem('ipra_current_user_v1', JSON.stringify(matching));
          return matching;
        }
        return prevUser;
      });
    });
    return () => unsubscribe();
  }, []);

  // Migração pontual: se o obreiro tem cargo 'pastor' ou 'admin' mas
  // isAdmin está ausente (undefined), garantir que seja preservado como admin.
  // Registros com isAdmin: false explícito NÃO são alterados.
  useEffect(() => {
    if (obreiros.length === 0) return;
    let currentList = obreiros;
    const needsMigration = obreiros.some(
      (o) => o.isAdmin === undefined && (o.cargo === 'pastor' || o.cargo === 'admin')
    );
    if (needsMigration) {
      const migrated = obreiros.map((o) =>
        o.isAdmin === undefined && (o.cargo === 'pastor' || o.cargo === 'admin')
          ? { ...o, isAdmin: true }
          : o
      );
      storageService.saveObreiros(migrated);
      setObreiros(migrated);
      currentList = migrated;
    }

    // Sincronizar currentUser com o registro persistido/migrado correspondente
    if (currentUser) {
      const persistedUser = currentList.find((o) => o.id === currentUser.id);
      if (
        persistedUser &&
        (persistedUser.isAdmin !== currentUser.isAdmin ||
          persistedUser.nome !== currentUser.nome ||
          persistedUser.cargo !== currentUser.cargo ||
          persistedUser.ativo !== currentUser.ativo)
      ) {
        setCurrentUser(persistedUser);
        localStorage.setItem('ipra_current_user_v1', JSON.stringify(persistedUser));
      }
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
    if (!newPin || !/^\d{4,}$/.test(newPin.trim())) return false;
    storageService.setAdminPin(newPin.trim());
    return true;
  };

  const bootstrapInitialAdmin = (
    adminData: { nome: string; cargo: CargoObreiro; genero: 'homem' | 'mulher' },
    pin: string
  ): { success: boolean; message?: string } => {
    // Só é permitido se estiver em bootstrap (zero obreiros e sem PIN)
    const existingObreiros = storageService.getObreiros();
    if (existingObreiros.length > 0 || storageService.hasPinConfigured()) {
      return {
        success: false,
        message: 'O bootstrap inicial só pode ser executado em uma instalação nova.',
      };
    }
    if (!adminData.nome || adminData.nome.trim().length === 0) {
      return { success: false, message: 'O nome do administrador é obrigatório.' };
    }
    if (!pin || !/^\d{4,}$/.test(pin.trim())) {
      return {
        success: false,
        message: 'O PIN administrativo deve conter apenas números e pelo menos 4 dígitos.',
      };
    }

    const initialAdmin: Obreiro = {
      id: `obreiro_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      nome: adminData.nome.trim(),
      cargo: adminData.cargo,
      genero: adminData.genero,
      isAdmin: true,
      ativo: true,
    };

    storageService.setAdminPin(pin.trim());
    storageService.saveObreiros([initialAdmin]);
    setObreiros([initialAdmin]);
    setHasPinConfigured(true);
    login(initialAdmin);
    return { success: true };
  };

  const configureMigrationPin = (
    pin: string
  ): { success: boolean; message?: string } => {
    // Só permitido se não houver PIN configurado e o usuário atual for administrador
    if (storageService.hasPinConfigured()) {
      return {
        success: false,
        message: 'O PIN administrativo já está configurado. Para alterá-lo, use a alteração com o PIN atual.',
      };
    }
    if (!currentUser?.isAdmin) {
      return {
        success: false,
        message: 'Apenas administradores podem configurar o primeiro PIN administrativo.',
      };
    }
    if (!pin || !/^\d{4,}$/.test(pin.trim())) {
      return {
        success: false,
        message: 'O PIN administrativo deve conter apenas números e pelo menos 4 dígitos.',
      };
    }

    storageService.setAdminPin(pin.trim());
    setHasPinConfigured(true);
    return { success: true };
  };

  const addObreiro = (
    obreiroData: Omit<Obreiro, 'id'>
  ): { success: boolean; message?: string } => {
    // Fora do bootstrap, apenas administrador pode cadastrar
    if (!currentUser?.isAdmin) {
      return { success: false, message: 'Apenas administradores podem cadastrar obreiros.' };
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
        bootstrapInitialAdmin,
        configureMigrationPin,
        updateAdminPin,
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

