import React from 'react';
import { Radio, PenSquare, Tv, Archive } from 'lucide-react';

export type AppTabType = 'home' | 'diacono' | 'pulpito' | 'historico';

interface BottomNavProps {
  currentTab: AppTabType;
  setCurrentTab: (tab: AppTabType) => void;
  totalPendentes: number;
  isPulpitMode?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  totalPendentes,
  isPulpitMode,
}) => {
  const tabs: { id: AppTabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'Início', icon: <Radio className="w-5 h-5 shrink-0" /> },
    { id: 'diacono', label: 'Anotação', icon: <PenSquare className="w-5 h-5 shrink-0" /> },
    { id: 'pulpito', label: 'Púlpito', icon: <Tv className="w-5 h-5 shrink-0" />, badge: totalPendentes },
    { id: 'historico', label: 'Histórico', icon: <Archive className="w-5 h-5 shrink-0" /> },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 border-t transition-colors duration-200 ${
        isPulpitMode
          ? 'bg-black/95 border-zinc-800 text-white'
          : 'bg-slate-900/95 backdrop-blur-md text-white border-slate-800'
      } pb-[env(safe-area-inset-bottom,0px)] shadow-lg no-swipe`}
      data-no-swipe="true"
      aria-label="Navegação principal"
    >
      <div className="w-full max-w-2xl mx-auto grid grid-cols-4 h-14">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 transition-all duration-150 active:scale-95 touch-target relative ${
                isActive
                  ? 'text-amber-400 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative flex items-center justify-center">
                {tab.icon}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] leading-tight tracking-tight ${isActive ? 'font-bold text-amber-300' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 bg-amber-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
