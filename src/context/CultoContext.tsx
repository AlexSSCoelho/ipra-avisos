import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CultoAtivo, Obreiro } from '../types';
import { storageService } from '../services/storageService';
import { useAuth } from './AuthContext';

interface CultoContextType {
  cultoAtivo: CultoAtivo | null;
  historicoCultos: CultoAtivo[];
  recarregarHistoricoCultos: () => void;
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
  const [historicoCultos, setHistoricoCultos] = useState<CultoAtivo[]>(() => storageService.getHistoricoCultos());

  const recarregarHistoricoCultos = () => {
    setHistoricoCultos(storageService.getHistoricoCultos());
  };

  useEffect(() => {
    const unsubscribe = storageService.subscribeToCulto((updatedCulto) => {
      setCultoAtivo(updatedCulto);
      setHistoricoCultos(storageService.getHistoricoCultos());
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
    // Sem culto ativo, não há como trocar dirigente
    if (!cultoAtivo || cultoAtivo.status !== 'em_andamento') {
      return { success: false, message: 'Não há culto em andamento para alterar o dirigente.' };
    }

    // Obreiro deve estar ativo
    if (novoDirigente.ativo === false) {
      return { success: false, message: 'Este obreiro não está ativo.' };
    }

    // Se já é o dirigente atual e está apenas se identificando (sem troca real), permite
    const jaDirigente = cultoAtivo.dirigenteId === novoDirigente.id;
    if (jaDirigente) {
      // Apenas identificação — sem alterar estado do culto
      return { success: true };
    }

    // Troca real de dirigente: admin pode fazer livremente;
    // qualquer outro precisa fornecer PIN válido (string não-vazia)
    if (!isAdmin) {
      if (!adminPin || adminPin.trim().length === 0) {
        return { success: false, message: 'É necessário informar a senha administrativa para trocar o dirigente.' };
      }
      if (!verifyAdminPin(adminPin)) {
        return { success: false, message: 'Senha administrativa incorreta.' };
      }
    }

    const ok = storageService.setDirigenteDoCulto(novoDirigente);
    if (!ok) {
      return { success: false, message: 'Não foi possível alterar o dirigente. Verifique se há culto ativo.' };
    }
    return { success: true };
  };

  const finalizarCulto = (): { success: boolean; message?: string } => {
    const cultoAtual = cultoAtivo || storageService.getCultoAtivo();
    if (!cultoAtual || cultoAtual.status !== 'em_andamento') {
      return { success: false, message: 'Não há culto em andamento para ser encerrado.' };
    }

    const isDirigenteDoCulto = Boolean(
      currentUser && currentUser.id === cultoAtual.dirigenteId
    );

    if (!isAdmin && !isDirigenteDoCulto) {
      return { success: false, message: 'Apenas o dirigente do culto ou administrador pode encerrar o culto.' };
    }

    const finalizado: CultoAtivo = {
      ...cultoAtual,
      status: 'finalizado',
    };
    storageService.saveCultoAtivo(finalizado);
    setCultoAtivo(finalizado);
    return { success: true };
  };

  return (
    <CultoContext.Provider
      value={{
        cultoAtivo,
        historicoCultos,
        recarregarHistoricoCultos,
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
