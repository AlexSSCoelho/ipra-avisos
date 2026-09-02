import React, { useState } from 'react';
import { 
  Radio, 
  Crown, 
  CheckCircle2, 
  CheckCheck,
  Flag
} from 'lucide-react';
import { useCulto } from '../../context/CultoContext';
import { useAvisos } from '../../context/AvisosContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { AvisoCardPulpito } from './AvisoCardPulpito';
import { AdminPassModal } from '../auth/AdminPassModal';
import { IniciarCultoModal } from '../culto/IniciarCultoModal';

export const PulpitoScreen: React.FC = () => {
  const { 
    cultoAtivo, 
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
    resetFontSize
  } = useAccessibility();

  const [activeTab, setActiveTab] = useState<'pendentes' | 'anunciados'>('pendentes');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showIniciarCultoModal, setShowIniciarCultoModal] = useState(false);
  const [showEncerrarConfirm, setShowEncerrarConfirm] = useState(false);

  const listaAtual = activeTab === 'pendentes' ? avisosPendentes : avisosAnunciados;

  return (
    <div className="w-full max-w-2xl mx-auto px-3 py-3.5 space-y-3 overflow-x-hidden">
      
      {/* Barra Superior Minimalista do Púlpito */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-3.5 text-white shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm shrink-0 shadow-inner">
            <Crown className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-black text-sm sm:text-base leading-tight text-white truncate">
              {dirigenteAtualNome}
            </div>
            <div className="text-xs text-amber-400/90 font-medium truncate mt-0.5">
              {cultoAtivo?.nomeCulto || 'Culto Ativo'}
            </div>
          </div>
        </div>

        {/* Controles de Tamanho da Letra (Direto no Topo) */}
        <div className="flex items-center gap-1 bg-slate-950/80 rounded-xl p-1 border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={decreaseFontSize}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs active:scale-95 flex items-center justify-center shadow-xs"
            title="Diminuir Letra"
          >
            A⁻
          </button>
          <button
            type="button"
            onClick={resetFontSize}
            className="px-2 h-8 text-amber-400 font-bold text-xs flex items-center justify-center"
            title="Tamanho Normal"
          >
            {Math.round(fontScale * 100)}%
          </button>
          <button
            type="button"
            onClick={increaseFontSize}
            className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs active:scale-95 flex items-center justify-center shadow-xs"
            title="Aumentar Letra"
          >
            A⁺
          </button>
        </div>
      </div>

      {/* Abas Simples: [ Para Ler (X) ] vs [ Já Lidos (Y) ] */}
      <div className="grid grid-cols-2 gap-2 bg-slate-200/90 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-300/70 dark:border-slate-800 shadow-inner no-swipe" data-no-swipe="true">
        <button
          type="button"
          onClick={() => setActiveTab('pendentes')}
          className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all truncate touch-target ${
            activeTab === 'pendentes'
              ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-sm ring-1 ring-amber-500/40'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40'
          }`}
        >
          <Radio className="w-4 h-4 shrink-0 text-amber-500" />
          <span className="truncate">Para Ler no Púlpito</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 shadow-xs ${
            activeTab === 'pendentes' ? 'bg-amber-500 text-slate-950' : 'bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}>
            {totalPendentes}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('anunciados')}
          className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all truncate touch-target ${
            activeTab === 'anunciados'
              ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500/40'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40'
          }`}
        >
          <CheckCheck className="w-4 h-4 shrink-0 text-emerald-500" />
          <span className="truncate">Já Lidos</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 shadow-xs ${
            activeTab === 'anunciados' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}>
            {totalAnunciados}
          </span>
        </button>
      </div>

      {/* Lista de Cards de Avisos com Zero Poluição Visual */}
      {listaAtual.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
            {activeTab === 'pendentes'
              ? 'Tudo lido! Nenhum aviso pendente'
              : 'Nenhum aviso anunciado nesta sessão'}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            {activeTab === 'pendentes'
              ? 'Assim que os diáconos transmitirem novos avisos durante o culto, eles aparecerão aqui automaticamente.'
              : 'Os avisos já falados no púlpito ficam salvos aqui.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {listaAtual.map((aviso) => (
            <AvisoCardPulpito
              key={aviso.id}
              aviso={aviso}
              onMarcarLido={marcarComoAnunciado}
              onDesmarcarLido={desmarcarComoAnunciado}
            />
          ))}
        </div>
      )}

      {/* Ação de Concluir Culto no Rodapé */}
      <div className="pt-2">
        {!showEncerrarConfirm ? (
          <button
            type="button"
            onClick={() => setShowEncerrarConfirm(true)}
            className="w-full py-3.5 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-300 dark:hover:border-rose-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Flag className="w-4 h-4 text-slate-400 hover:text-rose-500" />
            <span>Concluir Culto de Hoje</span>
          </button>
        ) : (
          <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 space-y-3 shadow-xs animate-in fade-in">
            <div className="text-xs sm:text-sm text-rose-900 dark:text-rose-200 font-bold text-center">
              Deseja realmente concluir a transmissão deste culto?
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowEncerrarConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  finalizarCulto();
                  setShowEncerrarConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-black shadow-md shadow-rose-600/20"
              >
                Sim, Concluir Culto
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      {showAdminModal && (
        <AdminPassModal 
          isOpen={showAdminModal} 
          onClose={() => setShowAdminModal(false)} 
          actionType="trocar_dirigente"
        />
      )}

      {showIniciarCultoModal && (
        <IniciarCultoModal 
          isOpen={showIniciarCultoModal} 
          onClose={() => setShowIniciarCultoModal(false)} 
        />
      )}
    </div>
  );
};
