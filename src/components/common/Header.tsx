import React, { useState } from 'react';
import { 
  Church, 
  Volume2, 
  VolumeX, 
  LogOut, 
  PenSquare, 
  SlidersHorizontal, 
  Archive, 
  Tv, 
  ChevronDown, 
  Sparkles,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCulto } from '../../context/CultoContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAvisos } from '../../context/AvisosContext';
import { getCargoLabel } from '../../utils/formatters';

export type AppTabType = 'home' | 'diacono' | 'pulpito' | 'historico';

interface HeaderProps {
  currentTab: AppTabType;
  setCurrentTab: (tab: AppTabType) => void;
  onOpenIniciarCultoModal?: () => void;
  onOpenSettingsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenIniciarCultoModal,
  onOpenSettingsModal,
}) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { isDirigente, cultoAtivo } = useCulto();
  const { 
    isPulpitMode, 
    soundEnabled, 
    setSoundEnabled 
  } = useAccessibility();
  const { totalPendentes } = useAvisos();

  const [showUserMenu, setShowUserMenu] = useState(false);

  // 4 Abas padronizadas em ordem lógica e universal
  const visibleTabs: { id: AppTabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'Início', icon: <Radio className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'diacono', label: 'Anotação', icon: <PenSquare className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'pulpito', label: 'Púlpito', icon: <Tv className="w-3.5 h-3.5 shrink-0" />, badge: totalPendentes },
    { id: 'historico', label: 'Histórico', icon: <Archive className="w-3.5 h-3.5 shrink-0" /> },
  ];

  return (
    <header className={`${isPulpitMode ? 'bg-black border-zinc-800 text-white' : 'bg-slate-900 text-white border-slate-800'} border-b sticky top-0 z-40 shadow-sm transition-colors duration-200 w-full max-w-full shrink-0`}>
      
      {/* Barra superior de status */}
      <div className="w-full max-w-2xl mx-auto px-3.5 py-2.5 flex items-center justify-between gap-2">
        
        {/* Identidade IPRA */}
        <button
          type="button"
          onClick={() => setCurrentTab('home')}
          className="flex items-center gap-2.5 min-w-0 text-left active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-850 border border-slate-700/80 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Church className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold text-sm sm:text-base tracking-tight text-white truncate">
                IPRA Auriflama
              </span>
              {isAdmin && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                  Admin
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
              {cultoAtivo ? (
                <>
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <span className="truncate font-semibold text-amber-300">
                    {cultoAtivo.nomeCulto}
                  </span>
                </>
              ) : (
                <span className="truncate text-slate-400 font-medium">
                  Nenhum culto ativo
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Controles do Topo (Configurações e Perfil) */}
        <div className="flex items-center gap-1.5 shrink-0">
          
          {/* Toggle de Som */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${
              soundEnabled 
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white' 
                : 'bg-slate-800/40 border-slate-800/80 text-slate-500 hover:text-slate-400'
            }`}
            title={soundEnabled ? 'Sons ativados' : 'Sons desativados'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Botão de Configurações Gerais */}
          <button
            type="button"
            onClick={onOpenSettingsModal}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-750 active:scale-95 border border-slate-700 text-slate-300 hover:text-amber-400 flex items-center justify-center transition-all shadow-xs"
            title="Ajustes e Sistema"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Perfil do Usuário */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 transition-all border border-slate-700 text-xs sm:text-sm font-semibold text-slate-200 active:scale-95 shadow-xs"
            >
              <span className="truncate max-w-[75px] sm:max-w-[120px]">
                {currentUser?.nome.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown & Backdrop */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs" 
                  onClick={() => setShowUserMenu(false)} 
                />
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 rounded-2xl shadow-2xl border border-slate-750 py-1.5 text-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/70">
                    <div className="font-bold text-sm text-white truncate">{currentUser?.nome}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 flex-wrap">
                      <span>{getCargoLabel(currentUser?.cargo)}</span>
                      {isDirigente && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                          Dirigente
                        </span>
                      )}
                      {isAdmin && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="py-1.5 text-xs sm:text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenSettingsModal();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center gap-2.5 text-slate-300 font-medium transition-colors"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Painel de Ajustes & Sistema</span>
                    </button>

                    {(isAdmin || isDirigente) && onOpenIniciarCultoModal && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenIniciarCultoModal();
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center gap-2.5 text-amber-300 font-semibold transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Iniciar Novo Culto</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-rose-400 hover:bg-rose-950/40 flex items-center gap-2.5 border-t border-slate-800 mt-1 transition-colors font-semibold"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Trocar de Obreiro</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navegação por 4 Abas Fixas e Sincronizadas */}
      <div 
        className="w-full max-w-2xl mx-auto border-t border-slate-800/80 text-center grid bg-slate-950/30"
        style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))` }}
      >
        {visibleTabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentTab(tab.id)}
              className={`py-2.5 px-1 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all duration-150 active:scale-[0.98] truncate touch-target ${
                isActive
                  ? 'border-amber-400 text-amber-300 font-black bg-amber-400/10 shadow-xs'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              {tab.icon}
              <span className="truncate">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500 text-white shrink-0 shadow-xs">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
