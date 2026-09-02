import React, { useState } from 'react';
import { 
  Radio, 
  Crown, 
  CheckCircle2, 
  CheckCheck,
  Flag,
  Maximize2,
  Minimize2
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
    resetFontSize,
    modoFocadoPulpito,
    setModoFocadoPulpito
  } = useAccessibility();

  const [activeTab, setActiveTab] = useState<'pendentes' | 'anunciados'>('pendentes');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showIniciarCultoModal, setShowIniciarCultoModal] = useState(false);
  const [showEncerrarConfirm, setShowEncerrarConfirm] = useState(false);

  const listaAtual = activeTab === 'pendentes' ? avisosPendentes : avisosAnunciados;

  return (
    <div className={`w-full max-w-3xl mx-auto overflow-x-hidden ${modoFocadoPulpito ? 'px-2 sm:px-4 py-2 space-y-2.5' : 'px-3 py-3.5 space-y-3'}`}>
      
      {/* ── MODO FOCADO DO PÚLPITO: BARRA COMPACTA E IMERSIVA NO TOPO ── */}
      {modoFocadoPulpito ? (
        <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border border-amber-500/40 rounded-2xl p-2.5 shadow-lg shadow-black/40 flex items-center justify-between gap-2 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
              PÚLPITO
            </span>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-black text-white truncate leading-tight">
                {cultoAtivo?.status === 'em_andamento' ? dirigenteAtualNome : 'Púlpito'}
              </div>
              <div className="text-[10px] text-amber-400 font-medium truncate">
                {cultoAtivo?.status === 'em_andamento' ? cultoAtivo.nomeCulto : 'Nenhum culto em andamento'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Controles rápidos de tamanho de fonte */}
            <div className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={decreaseFontSize}
                className="w-7 h-7 rounded-lg text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center touch-target active:scale-95"
                title="Diminuir Letra"
              >
                A⁻
              </button>
              <button
                type="button"
                onClick={resetFontSize}
                className="px-1.5 h-7 text-amber-400 font-bold text-xs flex items-center justify-center touch-target"
                title="Redefinir Fonte"
              >
                {Math.round(fontScale * 100)}%
              </button>
              <button
                type="button"
                onClick={increaseFontSize}
                className="w-7 h-7 rounded-lg text-slate-300 hover:text-white font-black text-xs flex items-center justify-center touch-target active:scale-95"
                title="Aumentar Letra"
              >
                A⁺
              </button>
            </div>

            {/* Botão evidente de saída do modo focado */}
            <button
              type="button"
              onClick={() => setModoFocadoPulpito(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all touch-target"
              title="Sair do Modo Focado (Esc)"
            >
              <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Sair (Esc)</span>
              <span className="sm:hidden">Sair</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Barra Padrão do Púlpito com Identidade e Controles */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-3.5 text-white shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm shrink-0 shadow-inner">
                <Crown className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-black text-sm sm:text-base leading-tight text-white truncate">
                  {cultoAtivo?.status === 'em_andamento' ? dirigenteAtualNome : 'Púlpito'}
                </div>
                <div className="text-xs text-amber-400/90 font-medium truncate mt-0.5">
                  {cultoAtivo?.status === 'em_andamento' ? cultoAtivo.nomeCulto : 'Nenhum Culto em Andamento'}
                </div>
              </div>
            </div>

            {/* Controles de Tamanho da Letra */}
            <div className="flex items-center gap-1 bg-slate-950/80 rounded-xl p-1 border border-slate-800 shrink-0">
              <button
                type="button"
                onClick={decreaseFontSize}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs active:scale-95 flex items-center justify-center shadow-xs touch-target"
                title="Diminuir Letra"
              >
                A⁻
              </button>
              <button
                type="button"
                onClick={resetFontSize}
                className="px-2 h-8 text-amber-400 font-bold text-xs flex items-center justify-center touch-target"
                title="Tamanho Normal"
              >
                {Math.round(fontScale * 100)}%
              </button>
              <button
                type="button"
                onClick={increaseFontSize}
                className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs active:scale-95 flex items-center justify-center shadow-xs touch-target"
                title="Aumentar Letra"
              >
                A⁺
              </button>
            </div>
          </div>

          {/* Botão para Ativar o Modo Focado (Imersivo) */}
          <button
            type="button"
            onClick={() => setModoFocadoPulpito(true)}
            className="w-full py-2.5 px-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 hover:border-amber-500/50 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-bold flex items-center justify-between transition-all touch-target shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Entrar no Modo Focado do Púlpito</span>
            </div>
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hidden sm:inline">
              Ocultar menus e maximizar tela de leitura →
            </span>
          </button>
        </>
      )}

      {/* Abas Rápidas: [ Para Ler (X) ] vs [ Já Lidos (Y) ] */}
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

      {/* Lista de Cards de Avisos */}
      {listaAtual.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
            {cultoAtivo?.status === 'em_andamento'
              ? (activeTab === 'pendentes' ? 'Tudo lido! Nenhum aviso pendente' : 'Nenhum aviso anunciado nesta sessão')
              : 'Nenhum culto em andamento'}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            {cultoAtivo?.status === 'em_andamento'
              ? (activeTab === 'pendentes'
                  ? 'Assim que os diáconos transmitirem novos avisos durante o culto, eles aparecerão aqui automaticamente.'
                  : 'Os avisos já falados no púlpito ficam salvos aqui.')
              : 'Inicie um culto para receber avisos em tempo real enviados pelos diáconos. Para consultar sessões anteriores, acesse a aba Histórico.'}
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

      {/* Ação de Concluir Culto no Rodapé (apenas quando o culto estiver em andamento) */}
      <div className="pt-2">
        {modoFocadoPulpito && cultoAtivo?.status !== 'em_andamento' && (
          <button
            type="button"
            onClick={() => setModoFocadoPulpito(false)}
            className="w-full py-3 px-4 rounded-2xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all touch-target"
          >
            <Minimize2 className="w-4 h-4 text-amber-400" />
            <span>Sair do Modo Focado</span>
          </button>
        )}

        {cultoAtivo?.status === 'em_andamento' && !showEncerrarConfirm && (
          <div className="flex flex-col sm:flex-row gap-2">
            {modoFocadoPulpito && (
              <button
                type="button"
                onClick={() => setModoFocadoPulpito(false)}
                className="w-full py-3 px-4 rounded-2xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all touch-target"
              >
                <Minimize2 className="w-4 h-4 text-amber-400" />
                <span>Sair do Modo Focado</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowEncerrarConfirm(true)}
              className="w-full py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-300 dark:hover:border-rose-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs touch-target"
            >
              <Flag className="w-4 h-4 text-slate-400 hover:text-rose-500" />
              <span>Concluir Culto de Hoje</span>
            </button>
          </div>
        )}

        {cultoAtivo?.status === 'em_andamento' && showEncerrarConfirm && (
          <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 space-y-3 shadow-xs animate-in fade-in">
            <div className="text-xs sm:text-sm text-rose-900 dark:text-rose-200 font-bold text-center">
              Deseja realmente concluir a transmissão deste culto?
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowEncerrarConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold touch-target"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  finalizarCulto();
                  setShowEncerrarConfirm(false);
                  if (modoFocadoPulpito) setModoFocadoPulpito(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-black shadow-md shadow-rose-600/20 touch-target"
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
