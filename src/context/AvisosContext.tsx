import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { AvisoItem, TipoAviso, VisitanteData, OracaoData, ReuniaoData, GeralData } from '../types';
import { storageService } from '../services/storageService';
import { audioFeedback } from '../services/audioService';
import { useAuth } from './AuthContext';
import { useCulto } from './CultoContext';
import { useAccessibility } from './AccessibilityContext';

interface AddAvisoParams {
  tipo: TipoAviso;
  visitante?: VisitanteData;
  oracao?: OracaoData;
  reuniao?: ReuniaoData;
  geral?: GeralData;
}

interface AvisosContextType {
  avisos: AvisoItem[];
  avisosCultoAtual: AvisoItem[];
  avisosPendentes: AvisoItem[];
  avisosAnunciados: AvisoItem[];
  meusAvisosHoje: AvisoItem[];
  adicionarAviso: (params: AddAvisoParams) => void;
  marcarComoAnunciado: (id: string) => void;
  desmarcarComoAnunciado: (id: string) => void;
  excluirAviso: (id: string) => void;
  totalPendentes: number;
  totalAnunciados: number;
  totalVisitantes: number;
  totalOracoes: number;
  totalReunioes: number;
  totalGerais: number;
}

const AvisosContext = createContext<AvisosContextType | undefined>(undefined);

export const AvisosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  const { cultoAtivo, isDirigente } = useCulto();
  const { soundEnabled } = useAccessibility();
  const [avisos, setAvisos] = useState<AvisoItem[]>(() => storageService.getAvisos());
  const prevAvisosLengthRef = useRef<number>(avisos.length);

  useEffect(() => {
    const unsubscribe = storageService.subscribeToAvisos((updatedAvisos) => {
      if (updatedAvisos.length > prevAvisosLengthRef.current) {
        const newest = updatedAvisos[0];
        // Toca notificação do púlpito apenas se for enviado por outro obreiro para o culto ativo
        if (isDirigente && soundEnabled && newest && newest.autorId !== currentUser?.id) {
          audioFeedback.playPulpitNotificationSound();
        }
      }
      prevAvisosLengthRef.current = updatedAvisos.length;
      setAvisos(updatedAvisos);
    });

    return () => unsubscribe();
  }, [isDirigente, soundEnabled, currentUser?.id]);

  const currentCultoId = cultoAtivo?.id ?? null;
  
  // Avisos da sessão ativa do culto em andamento
  const avisosCultoAtual = currentCultoId
    ? avisos.filter((a) => a.cultoId === currentCultoId)
    : [];
  const avisosPendentes = avisosCultoAtual.filter((a) => a.status === 'pendente');
  const avisosAnunciados = avisosCultoAtual.filter((a) => a.status === 'anunciado');

  const meusAvisosHoje = currentUser
    ? avisosCultoAtual.filter((a) => a.autorId === currentUser.id)
    : [];

  const adicionarAviso = (params: AddAvisoParams) => {
    if (!currentUser || !currentCultoId) return;

    const novoAviso: AvisoItem = {
      id: `aviso_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      cultoId: currentCultoId,
      tipo: params.tipo,
      status: 'pendente',
      criadoEm: new Date().toISOString(),
      autorId: currentUser.id,
      autorNome: currentUser.nome,
      autorCargo: currentUser.cargo,
      visitante: params.visitante,
      oracao: params.oracao,
      reuniao: params.reuniao,
      geral: params.geral,
    };

    setAvisos((prev) => [novoAviso, ...prev]);
    storageService.addAviso(novoAviso);

    if (soundEnabled) {
      audioFeedback.playSuccessSound();
    }
  };

  const marcarComoAnunciado = (id: string) => {
    // Apenas o dirigente ou administrador pode marcar como anunciado
    if (!isDirigente && !isAdmin) return;
    setAvisos((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'anunciado', lidoEm: new Date().toISOString() }
          : item
      )
    );
    storageService.updateAvisoStatus(id, 'anunciado');

    if (soundEnabled) {
      audioFeedback.playCheckSound();
    }
  };

  const desmarcarComoAnunciado = (id: string) => {
    // Apenas o dirigente ou administrador pode desmarcar
    if (!isDirigente && !isAdmin) return;
    setAvisos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'pendente', lidoEm: undefined } : item
      )
    );
    storageService.updateAvisoStatus(id, 'pendente');
  };


  const excluirAviso = (id: string) => {
    setAvisos((prev) => prev.filter((item) => item.id !== id));
    storageService.deleteAviso(id);
  };

  const totalPendentes = avisosPendentes.length;
  const totalAnunciados = avisosAnunciados.length;
  const totalVisitantes = avisosCultoAtual.filter((a) => a.tipo === 'visitante').length;
  const totalOracoes = avisosCultoAtual.filter((a) => a.tipo === 'oracao').length;
  const totalReunioes = avisosCultoAtual.filter((a) => a.tipo === 'reuniao').length;
  const totalGerais = avisosCultoAtual.filter((a) => a.tipo === 'geral').length;

  return (
    <AvisosContext.Provider
      value={{
        avisos,
        avisosCultoAtual,
        avisosPendentes,
        avisosAnunciados,
        meusAvisosHoje,
        adicionarAviso,
        marcarComoAnunciado,
        desmarcarComoAnunciado,
        excluirAviso,
        totalPendentes,
        totalAnunciados,
        totalVisitantes,
        totalOracoes,
        totalReunioes,
        totalGerais,
      }}
    >
      {children}
    </AvisosContext.Provider>
  );
};

export const useAvisos = () => {
  const context = useContext(AvisosContext);
  if (!context) {
    throw new Error('useAvisos deve ser usado dentro de um AvisosProvider');
  }
  return context;
};
