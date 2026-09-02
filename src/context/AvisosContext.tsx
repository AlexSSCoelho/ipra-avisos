import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { AvisoItem, TipoAviso, VisitanteData, OracaoData, ReuniaoData, GeralData, EditAvisoParams } from '../types';
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
  isCultoEmAndamento: boolean;
  adicionarAviso: (params: AddAvisoParams) => { success: boolean; message?: string };
  editarAviso: (id: string, params: EditAvisoParams) => { success: boolean; message?: string };
  marcarComoAnunciado: (id: string) => void;
  desmarcarComoAnunciado: (id: string) => void;
  excluirAviso: (id: string) => { success: boolean; message?: string };
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

  // Apenas considera sessão operacional ativa quando o culto tiver status 'em_andamento'
  const isCultoEmAndamento = Boolean(cultoAtivo && cultoAtivo.status === 'em_andamento');
  const currentCultoId = isCultoEmAndamento && cultoAtivo ? cultoAtivo.id : null;
  
  // Avisos da sessão ativa do culto em andamento (vazio se o culto estiver finalizado ou ausente)
  const avisosCultoAtual = currentCultoId
    ? avisos.filter((a) => a.cultoId === currentCultoId)
    : [];
  const avisosPendentes = avisosCultoAtual.filter((a) => a.status === 'pendente');
  const avisosAnunciados = avisosCultoAtual.filter((a) => a.status === 'anunciado');

  const meusAvisosHoje = currentUser && currentCultoId
    ? avisosCultoAtual.filter((a) => a.autorId === currentUser.id)
    : [];

  const adicionarAviso = (params: AddAvisoParams): { success: boolean; message?: string } => {
    if (!isCultoEmAndamento || !currentCultoId) {
      return {
        success: false,
        message: 'Não é possível transmitir avisos: não há nenhum culto em andamento no momento.',
      };
    }
    if (!currentUser) {
      return { success: false, message: 'Usuário não identificado.' };
    }

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
    return { success: true };
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

  const excluirAviso = (id: string): { success: boolean; message?: string } => {
    // Não permite operações da sessão ativa se o culto já estiver finalizado (salvo admin)
    if (!isCultoEmAndamento && !isAdmin) {
      return { success: false, message: 'Não é possível cancelar avisos de um culto encerrado.' };
    }

    const aviso = avisos.find((a) => a.id === id);
    if (!aviso) return { success: false, message: 'Aviso não encontrado.' };

    // Aviso já anunciado não pode ser excluído por este fluxo
    if (aviso.status === 'anunciado') {
      return { success: false, message: 'Um aviso já anunciado não pode ser cancelado.' };
    }

    // Apenas o autor (aviso pendente próprio) ou dirigente/admin podem excluir
    const isAutor = currentUser?.id === aviso.autorId;
    if (!isAutor && !isDirigente && !isAdmin) {
      return { success: false, message: 'Sem permissão para cancelar este aviso.' };
    }

    setAvisos((prev) => prev.filter((item) => item.id !== id));
    storageService.deleteAviso(id);
    return { success: true };
  };

  const editarAviso = (id: string, params: EditAvisoParams): { success: boolean; message?: string } => {
    // Não permite editar avisos como sessão ativa se o culto estiver finalizado (salvo admin)
    if (!isCultoEmAndamento && !isAdmin) {
      return { success: false, message: 'Não é possível editar avisos de um culto encerrado.' };
    }

    const aviso = avisos.find((a) => a.id === id);
    if (!aviso) return { success: false, message: 'Aviso não encontrado.' };

    // Aviso anunciado não pode ser editado
    if (aviso.status === 'anunciado') {
      return { success: false, message: 'Um aviso já anunciado não pode ser alterado.' };
    }

    // Apenas o autor (aviso próprio), dirigente do culto ativo ou admin podem editar
    const isAutor = currentUser?.id === aviso.autorId;
    if (!isAutor && !isDirigente && !isAdmin) {
      return { success: false, message: 'Sem permissão para editar este aviso.' };
    }

    const updates: Partial<AvisoItem> = {
      visitante: params.visitante !== undefined ? params.visitante : aviso.visitante,
      oracao: params.oracao !== undefined ? params.oracao : aviso.oracao,
      reuniao: params.reuniao !== undefined ? params.reuniao : aviso.reuniao,
      geral: params.geral !== undefined ? params.geral : aviso.geral,
    };

    setAvisos((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
            }
          : item
      )
    );

    const ok = storageService.updateAvisoContent(id, updates);
    if (!ok) {
      return { success: false, message: 'Falha ao salvar a edição no armazenamento.' };
    }

    return { success: true };
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
        isCultoEmAndamento,
        adicionarAviso,
        editarAviso,
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
