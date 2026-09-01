import React, { useState } from 'react';
import { 
  Church, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  LogOut, 
  Crown, 
  PenSquare, 
  SlidersHorizontal,
  Archive,
  Tv,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCulto } from '../../context/CultoContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAvisos } from '../../context/AvisosContext';
import { getCargoLabel } from '../../utils/formatters';

interface HeaderProps {
  currentTab: 'diacono' | 'pulpito' | 'historico' | 'config';
  setCurrentTab: (tab: 'diacono' | 'pulpito' | 'historico' | 'config') => void;
  onOpenAdminModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, onOpenAdminModal }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { isDirigente, cultoAtivo } = useCulto();
  const { 
    isPulpitMode, 
    setIsPulpitMode, 
    soundEnabled, 
    setSoundEnabled 
  } = useAccessibility();
  const { totalPendentes } = useAvisos();

  const [showUserMenu, setShowUserMenu] = useState(false);

  // Determinar abas disponíveis conforme o perfil do usuário
  // 1. Admin Master: Anotação, Púlpito, Histórico, Ajustes
  // 2. Dirigente: Púlpito, Anotação, Histórico
  // 3. Usuário Comum (Diácono): Anotação, Histórico
  const getVisibleTabs = () => {
    if (isAdmin) {
      return [
        { id: 'diacono' as const, label: 'Anotação', icon: <PenSquare className="w-3.5 h-3.5 shrink-0" /> },
        { id: 'pulpito' as const, label: 'Púlpito', icon: <Tv className="w-3.5 h-3.5 shrink-0" />, badge: totalPendentes },
        { id: 'historico' as const, label: 'Histórico', icon: <Archive className="w-3.5 h-3.5 shrink-0" /> },
        { id: 'config' as const, label: 'Ajustes', icon: <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" /> },
      ];
    }

    if (isDirigente) {
      return [
        { id: 'pulpito' as const, label: 'Púlpito', icon: <Tv className="w-3.5 h-3.5 shrink-0" />, badge: totalPendentes },
        { id: 'diacono' as const, label: 'Anotação', icon: <PenSquare className="w-3.5 h-3.5 shrink-0" /> },
        { id: 'historico' as const, label: 'Histórico', icon: <Archive className="w-3.5 h-3.5 shrink-0" /> },
      ];
    }

    // Usuário Comum / Diácono
    return [
      { id: 'diacono' as const, label: 'Anotação de Avisos', icon: <PenSquare className="w-3.5 h-3.5 shrink-0" /> },
      { id: 'historico' as const, label: 'Registros do Culto', icon: <Archive className="w-3.5 h-3.5 shrink-0" /> },
    ];
  };

  const visibleTabs = getVisibleTabs();

  return (
    <header className={`${isPulpitMode ? 'bg-black border-zinc-850 text-white' : 'bg-slate-900 text-white border-slate-800'} border-b sticky top-0 z-40 shadow-xs transition-colors duration-150 w-full max-w-full overflow-hidden`}>
      
      {/* Barra superior de status */}
      <div className="w-full max-w-2xl mx-auto px-3 py-2 flex items-center justify-between gap-2">
        
        {/* Identidade IPRA */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
            <Church className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-white truncate">
                IPRA Auriflama
              </span>
              {isAdmin && (
                <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Master
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
              <span className="truncate">
                {cultoAtivo?.nomeCulto || 'Culto de Hoje'}
              </span>
            </div>
          </div>
        </div>

        {/* Controles do Topo (Compactos para Mobile) */}
        <div className="flex items-center gap-1 shrink-0">
          
          {/* Toggle de Som */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${
              soundEnabled 
                ? 'bg-slate-800 border-slate-700 text-slate-200' 
                : 'bg-slate-800/40 border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? 'Sons ativados' : 'Sons desativados'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Toggle Modo Púlpito (Fundo Preto) */}
          <button
            onClick={() => setIsPulpitMode(!isPulpitMode)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${
              isPulpitMode 
                ? 'bg-amber-950/80 border-amber-500/50 text-amber-300' 
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
            title={isPulpitMode ? 'Modo Escuro Ativo' : 'Ativar Modo Púlpito'}
          >
            {isPulpitMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Perfil do Usuário */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1 pl-2 pr-1.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 text-xs font-semibold text-slate-200"
            >
              <span className="truncate max-w-[70px] sm:max-w-[110px]">
                {currentUser?.nome.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown & Backdrop */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/20" 
                  onClick={() => setShowUserMenu(false)} 
                />
                <div className="absolute right-0 mt-1.5 w-56 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 py-1.5 text-slate-200 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <div className="font-semibold text-xs text-white truncate">{currentUser?.nome}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <span>{getCargoLabel(currentUser?.cargo)}</span>
                      {isDirigente && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Dirigente
                        </span>
                      )}
                      {isAdmin && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          Admin Master
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="py-1 text-xs">
                    {(isAdmin || isDirigente) && onOpenAdminModal && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenAdminModal();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 text-slate-300"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>Passar / Definir Dirigente</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 border-t border-slate-800/80 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Trocar de Obreiro</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navegação por Abas Dinâmica por Perfil */}
      <div 
        className={`w-full max-w-2xl mx-auto border-t border-slate-800 text-center grid`}
        style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))` }}
      >
        {visibleTabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`py-2 px-1 text-center text-[11px] sm:text-xs font-medium flex items-center justify-center gap-1 border-b-2 transition-all truncate ${
                isActive
                  ? 'border-amber-400 text-white font-bold bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span className="truncate">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-500 text-slate-950 shrink-0">
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
