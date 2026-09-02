import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CultoAtivo, Obreiro } from '../types';
import { storageService } from '../services/storageService';
import { useAuth } from './AuthContext';

interface CultoContextType {
  cultoAtivo: CultoAtivo | null;
  isDirigente: boolean;
  dirigenteAtualNome: string;
  dirigenteAtualCargo: string;
  iniciarNovoCulto: (nomeCulto: string, dirigente: Obreiro, horario?: string) => { success: boolean; message?: string };
  definirDirigente: (obreiro: Obreiro, adminPin?: string) => { success: boolean; message?: string };
  finalizarCulto: () => { success: boolean; message?: string };
}

const CultoContext = createContext<CultoContextType | undefined>(undefined);

export const CultoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, verifyAdminPin, isAdmin } = useAuth();
  const [cultoAtivo, setCultoAtivo] = useState<CultoAtivo | null>(() => storageService.getCultoAtivo());

  useEffect(() => {
    const unsubscribe = storageService.subscribeToCulto((updatedCulto) => {
      setCultoAtivo(updatedCulto);
    });

    return () => unsubscribe();
  }, []);

  const isDirigente = Boolean(
    currentUser && cultoAtivo && currentUser.id === cultoAtivo.dirigenteId && cultoAtivo.status === 'em_andamento'
  );

  const dirigenteAtualNome = cultoAtivo?.dirigenteNome || 'Nenhum dirigente definido';
  const dirigenteAtualCargo = cultoAtivo?.dirigenteCargo || '';

  const iniciarNovoCulto = (
    nomeCulto: string,
    dirigente: Obreiro,
    horario?: string
  ): { success: boolean; message?: string } => {
    if (!isAdmin) {
      return { success: false, message: 'Apenas administradores podem iniciar um culto.' };
    }

    const horarioFinal =
      horario && horario.trim()
        ? horario.trim()
        : new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const novoCulto: CultoAtivo = {
      id: `culto_${Date.now()}`,
      data: new Date().toISOString().split('T')[0],
      nomeCulto: nomeCulto || 'Culto de Celebração',
      horarioInicio: horarioFinal,
      dirigenteId: dirigente.id,
      dirigenteNome: dirigente.nome,
      dirigenteCargo: dirigente.cargo,
      status: 'em_andamento',
    };
    storageService.saveCultoAtivo(novoCulto);
    setCultoAtivo(novoCulto);
    return { success: true };
  };

  const definirDirigente = (
    novoDirigente: Obreiro,
    adminPin?: string
  ): { success: boolean; message?: string } => {
    if (adminPin !== undefined && !verifyAdminPin(adminPin)) {
      return { success: false, message: 'Senha de administrador incorreta.' };
    }

    storageService.setDirigenteDoCulto(novoDirigente);
    return { success: true };
  };

  const finalizarCulto = (): { success: boolean; message?: string } => {
    if (!isAdmin && !isDirigente) {
      return { success: false, message: 'Apenas o dirigente ou administrador pode encerrar o culto.' };
    }
    if (cultoAtivo) {
      const finalizado: CultoAtivo = {
        ...cultoAtivo,
        status: 'finalizado',
      };
      storageService.saveCultoAtivo(finalizado);
      setCultoAtivo(finalizado);
    }
    return { success: true };
  };

  return (
    <CultoContext.Provider
      value={{
        cultoAtivo,
        isDirigente,
        dirigenteAtualNome,
        dirigenteAtualCargo,
        iniciarNovoCulto,
        definirDirigente,
        finalizarCulto,
      }}
    >
      {children}
    </CultoContext.Provider>
  );
};

export const useCulto = () => {
  const context = useContext(CultoContext);
  if (!context) {
    throw new Error('useCulto deve ser usado dentro de um CultoProvider');
  }
  return context;
};
