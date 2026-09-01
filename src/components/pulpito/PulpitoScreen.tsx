import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Crown, 
  CheckCircle2, 
  Clock, 
  CheckCheck,
  Flag,
  User,
  Heart,
  CalendarDays,
  Megaphone,
  SlidersHorizontal
} from 'lucide-react';
import { useCulto } from '../../context/CultoContext';
import { useAvisos } from '../../context/AvisosContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { AvisoCardPulpito } from './AvisoCardPulpito';
import { AdminPassModal } from '../auth/AdminPassModal';
import type { TipoAviso } from '../../types';

export const PulpitoScreen: React.FC = () => {
  const { 
    cultoAtivo, 
    isDirigente, 
    dirigenteAtualNome, 
    finalizarCulto
  } = useCulto();
  const { 
    avisosPendentes, 
    avisosAnunciados, 
    marcarComoAnunciado, 
    desmarcarComoAnunciado,
    totalPendentes,
    totalAnunciados
  } = useAvisos();
  const { 
    fontScale, 
    increaseFontSize, 
    decreaseFontSize, 
    resetFontSize,
    isPulpitMode, 
    setIsPulpitMode 
  } = useAccessibility();

  const [activeTab, setActiveTab] = useState<'pendentes' | 'anunciados'>('pendentes');
  const [filterTipo, setFilterTipo] = useState<TipoAviso | 'todos'>('todos');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showEncerrarConfirm, setShowEncerrarConfirm] = useState(false);

  useEffect(() => {
    setIsPulpitMode(true);
  }, [setIsPulpitMode]);

  const listaAtual = activeTab === 'pendentes' ? avisosPendentes : avisosAnunciados;
  const listaFiltrada = filterTipo === 'todos' 
    ? listaAtual 
    : listaAtual.filter((a) => a.tipo === filterTipo);

  return (
    <div className="w-full max-w-2xl mx-auto px-3 py-3 space-y-3 min-h-screen bg-black text-slate-100 overflow-x-hidden">
      
      {/* Banner Superior do Dirigente */}
      <div className="bg-[#0f1117] border border-zinc-800 rounded-2xl p-3.5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Crown className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>Dirigente do Culto</span>
              {isDirigente && (
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-400 text-slate-950 font-bold">
                  VOCÊ
                </span>
              )}
            </div>
            <div className="text-sm sm:text-base font-bold text-white leading-tight truncate">
              {dirigenteAtualNome}
            </div>
            <div className="text-[10px] text-zinc-400 truncate">
              {cultoAtivo?.nomeCulto} • {cultoAtivo?.horarioInicio}
            </div>
          </div>
        </div>

        {/* Botão de Trocar Dirigente */}
        <button
          type="button"
          onClick={() => setShowAdminModal(true)}
          className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 active:scale-95 border border-zinc-750 text-xs font-semibold text-zinc-300 flex items-center justify-center gap-1.5 transition-all shrink-0"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
          <span>Alterar</span>
        </button>
      </div>

      {/* Barra de Ajuste de Fonte para Púlpito */}
      <div className="bg-[#0f1117] border border-zinc-800 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
        <span className="text-xs text-zinc-300 font-medium truncate">
          Tamanho do Texto:
        </span>

        <div className="flex items-center gap-1 bg-black/60 rounded-lg p-0.5 border border-zinc-800 shrink-0">
          <button
            onClick={decreaseFontSize}
            className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs active:scale-95 flex items-center justify-center"
            title="Diminuir"
          >
            A⁻
          </button>
          <button
            onClick={resetFontSize}
            className="px-2 h-7 text-amber-300 font-semibold text-xs flex items-center justify-center"
            title="Padrão"
          >
            {Math.round(fontScale * 100)}%
          </button>
          <button
            onClick={increaseFontSize}
            className="w-7 h-7 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs active:scale-95 flex items-center justify-center shadow-xs"
            title="Aumentar"
          >
            A⁺
          </button>
        </div>
      </div>

      {/* Abas: [ A Anunciar ] vs [ Já Anunciados ] */}
      <div className="grid grid-cols-2 gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-850">
        <button
          type="button"
          onClick={() => setActiveTab('pendentes')}
          className={`py-2 px-2 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all truncate ${
            activeTab === 'pendentes'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Radio className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">A Anunciar</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
            activeTab === 'pendentes' ? 'bg-slate-950 text-amber-300' : 'bg-zinc-800 text-zinc-300'
          }`}>
            {totalPendentes}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('anunciados')}
          className={`py-2 px-2 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all truncate ${
            activeTab === 'anunciados'
              ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">Já Anunciados</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-zinc-900 text-zinc-300 shrink-0">
            {totalAnunciados}
          </span>
        </button>
      </div>

      {/* Filtros por Categoria */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs w-full max-w-full">
        {[
          { id: 'todos', label: 'Todos', count: listaAtual.length },
          { id: 'visitante', label: 'Visitantes', count: listaAtual.filter(a => a.tipo === 'visitante').length, icon: <User className="w-3 h-3" /> },
          { id: 'oracao', label: 'Orações', count: listaAtual.filter(a => a.tipo === 'oracao').length, icon: <Heart className="w-3 h-3" /> },
          { id: 'reuniao', label: 'Reuniões', count: listaAtual.filter(a => a.tipo === 'reuniao').length, icon: <CalendarDays className="w-3 h-3" /> },
          { id: 'geral', label: 'Avisos', count: listaAtual.filter(a => a.tipo === 'geral').length, icon: <Megaphone className="w-3 h-3" /> },
        ].map((f) => {
          const isSelected = filterTipo === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilterTipo(f.id as any)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0 border transition-all ${
                isSelected
                  ? 'bg-slate-200 text-slate-950 border-white font-semibold'
                  : 'bg-[#0f1117] text-zinc-400 border-zinc-800 hover:bg-zinc-850 hover:text-zinc-200'
              }`}
            >
              {f.icon}
              <span>{f.label}</span>
              {f.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                  isSelected ? 'bg-slate-950 text-white' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  {f.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Lista de Cartões */}
      {listaFiltrada.length === 0 ? (
        <div className="bg-[#0f1117] border border-zinc-800 rounded-2xl p-6 text-center space-y-2">
          <div className="w-9 h-9 rounded-xl bg-zinc-850 mx-auto flex items-center justify-center text-zinc-500">
            {activeTab === 'pendentes' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <Clock className="w-4 h-4 text-zinc-600" />
            )}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-zinc-200">
            {activeTab === 'pendentes'
              ? 'Nenhum registro pendente no momento'
              : 'Nenhum aviso anunciado nesta sessão'}
          </div>
          <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
            {activeTab === 'pendentes'
              ? 'Assim que os diáconos transmitirem novos registros, eles aparecerão instantaneamente aqui com alta visibilidade.'
              : 'Os avisos anunciados são arquivados nesta aba durante todo o culto.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 w-full max-w-full">
          {listaFiltrada.map((aviso) => (
            <AvisoCardPulpito
              key={aviso.id}
              aviso={aviso}
              onMarcarLido={marcarComoAnunciado}
              onDesmarcarLido={desmarcarComoAnunciado}
              isPulpitMode={isPulpitMode}
            />
          ))}
        </div>
      )}

      {/* Rodapé do Púlpito: Encerrar Culto */}
      <div className="pt-3 pb-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-[10px] text-zinc-500">
          IPRA Auriflama • Painel Oficial do Púlpito
        </div>

        {!showEncerrarConfirm ? (
          <button
            type="button"
            onClick={() => setShowEncerrarConfirm(true)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white flex items-center justify-center gap-1.5"
          >
            <Flag className="w-3.5 h-3.5 text-rose-500" />
            <span>Concluir Culto de Hoje</span>
          </button>
        ) : (
          <div className="w-full sm:w-auto bg-zinc-900 border border-rose-900/60 p-2.5 rounded-xl flex items-center justify-between gap-2.5">
            <span className="text-xs text-rose-300 font-semibold">
              Concluir este culto?
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setShowEncerrarConfirm(false)}
                className="px-2 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  finalizarCulto();
                  setShowEncerrarConfirm(false);
                }}
                className="px-2 py-1 rounded-lg bg-rose-700 hover:bg-rose-600 text-xs font-bold text-white shadow-xs"
              >
                Sim, Concluir
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Gestão de Dirigente */}
      <AdminPassModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        actionType="trocar_dirigente"
      />
    </div>
  );
};
