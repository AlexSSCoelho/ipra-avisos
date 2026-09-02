import React, { useState } from 'react';
import { 
  Radio, 
  PenSquare, 
  Tv, 
  Archive, 
  Crown, 
  Clock, 
  Play, 
  Flag, 
  Download,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCulto } from '../../context/CultoContext';
import { useAvisos } from '../../context/AvisosContext';
import { getCargoLabel } from '../../utils/formatters';

interface HomeScreenProps {
  onNavigate: (tab: 'home' | 'diacono' | 'pulpito' | 'historico') => void;
  onOpenIniciarCulto: () => void;
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onOpenIniciarCulto,
  onOpenSettings,
}) => {
  const { currentUser, isAdmin } = useAuth();
  const { cultoAtivo, isDirigente, dirigenteAtualNome, finalizarCulto } = useCulto();
  const { totalPendentes, totalVisitantes, totalOracoes, totalReunioes, totalGerais } = useAvisos();
  const [showEncerrarConfirm, setShowEncerrarConfirm] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto px-3 py-3.5 space-y-4">
      
      {/* Saudação e Perfil do Obreiro */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-lg flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            {currentUser?.nome.charAt(0) || 'O'}
          </div>
          <div className="min-w-0">
            <div className="text-xs text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5 truncate">
              <span>{getCargoLabel(currentUser?.cargo || 'diacono')}</span>
              {isAdmin && (
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-900 dark:bg-slate-800 text-amber-300 font-bold border border-slate-700">
                  ADMIN
                </span>
              )}
            </div>
            <h2 className="font-black text-base sm:text-lg text-slate-900 dark:text-white leading-tight truncate">
              {currentUser?.nome}
            </h2>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              IPRA • Igreja Presbiteriana Renovada
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
          title="Configurações e Perfil"
        >
          <SlidersHorizontal className="w-5 h-5 text-amber-500" />
        </button>
      </div>

      {/* CARD PRINCIPAL OPERACIONAL: STATUS DO CULTO */}
      {cultoAtivo ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 text-white shadow-lg space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black uppercase tracking-wider animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Culto em Andamento</span>
            </div>

            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Iniciado às {cultoAtivo.horarioInicio}</span>
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {cultoAtivo.nomeCulto}
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-400 font-bold mt-1">
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Dirigente: {dirigenteAtualNome}</span>
              {isDirigente && (
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-400 text-slate-950 font-black">
                  VOCÊ
                </span>
              )}
            </div>
          </div>

          {/* 4 Métricas Rápidas em Tempo Real */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
            <div className="bg-slate-950/70 border border-slate-800 p-2 rounded-xl text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Visitantes</div>
              <div className="text-xl font-black text-white mt-0.5">{totalVisitantes}</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-2 rounded-xl text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Orações</div>
              <div className="text-xl font-black text-amber-300 mt-0.5">{totalOracoes}</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-2 rounded-xl text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Reuniões</div>
              <div className="text-xl font-black text-teal-300 mt-0.5">{totalReunioes}</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-2 rounded-xl text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Gerais</div>
              <div className="text-xl font-black text-blue-300 mt-0.5">{totalGerais}</div>
            </div>
          </div>

          {/* Botões Operacionais Primários */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onNavigate('diacono')}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all touch-target"
            >
              <PenSquare className="w-4 h-4" />
              <span>Anotar Novo Aviso</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('pulpito')}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-750 active:scale-[0.98] text-white border border-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition-all touch-target relative"
            >
              <Tv className="w-4 h-4 text-amber-400" />
              <span>Abrir Púlpito do Altar</span>
              {totalPendentes > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white shadow-xs">
                  {totalPendentes}
                </span>
              )}
            </button>
          </div>

          {/* Encerrar Culto — apenas dirigente ou administrador */}
          {(isAdmin || isDirigente) && (
            !showEncerrarConfirm ? (
              <button
                type="button"
                onClick={() => setShowEncerrarConfirm(true)}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-rose-400 font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Concluir sessão deste culto</span>
              </button>
            ) : (
              <div className="bg-rose-950/60 border border-rose-800 rounded-2xl p-3.5 space-y-2.5 animate-in fade-in">
                <div className="text-xs text-rose-200 font-bold text-center">
                  Deseja realmente encerrar a transmissão deste culto?
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEncerrarConfirm(false)}
                    className="flex-1 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      finalizarCulto();
                      setShowEncerrarConfirm(false);
                    }}
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md shadow-rose-600/20"
                  >
                    Confirmar Encerramento
                  </button>
                </div>
              </div>
            )
          )}

        </div>
      ) : (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 text-white shadow-lg text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Radio className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Nenhum Culto Ativo
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              Inicie um novo culto para que os diáconos possam transmitir visitantes e pedidos de oração em tempo real para o púlpito.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenIniciarCulto}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-slate-950 font-black text-base flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/20 transition-all touch-target"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>Iniciar Novo Culto Agora</span>
          </button>
        </div>
      )}

      {/* Grid de Atalhos Operacionais */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('diacono')}
          className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 text-left shadow-xs hover:border-amber-400/60 active:scale-[0.98] transition-all space-y-2 touch-target"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shadow-xs">
            <PenSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
              Anotação de Avisos
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Visitantes, orações e comunicados
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('pulpito')}
          className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 text-left shadow-xs hover:border-amber-400/60 active:scale-[0.98] transition-all space-y-2 touch-target relative"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-300 flex items-center justify-center shadow-xs">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
              Púlpito do Altar
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {totalPendentes > 0 ? `${totalPendentes} para ler agora` : 'Teleprompter limpo'}
            </div>
          </div>
          {totalPendentes > 0 && (
            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-xs">
              {totalPendentes}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onNavigate('historico')}
          className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 text-left shadow-xs hover:border-amber-400/60 active:scale-[0.98] transition-all space-y-2 touch-target"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-300 flex items-center justify-center shadow-xs">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
              Histórico & WhatsApp
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Relatórios e cópia direta
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 text-left shadow-xs hover:border-amber-400/60 active:scale-[0.98] transition-all space-y-2 touch-target"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-xs">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
              Ajustes & Sistema
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Obreiros, senha e APK
            </div>
          </div>
        </button>
      </div>

      {/* Banner de Download do APK */}
      <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Download className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200 truncate">
              Instalar Aplicativo Oficial (APK)
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 truncate">
              Para Android • Tela cheia e notificações
            </div>
          </div>
        </div>

        <a
          href="/ipra-avisos.apk"
          download="ipra-avisos.apk"
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shrink-0 shadow-xs transition-all"
        >
          Baixar APK
        </a>
      </div>
    </div>
  );
};
