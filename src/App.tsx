import React, { useState, useRef } from 'react';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CultoProvider } from './context/CultoContext';
import { AvisosProvider, useAvisos } from './context/AvisosContext';
import { Header } from './components/common/Header';
import { BottomNav, type AppTabType } from './components/common/BottomNav';
import { LoginScreen } from './components/auth/LoginScreen';
import { IniciarCultoModal } from './components/culto/IniciarCultoModal';
import { DiaconoDashboard } from './components/diacono/DiaconoDashboard';
import { PulpitoScreen } from './components/pulpito/PulpitoScreen';
import { HistoricoScreen } from './components/historico/HistoricoScreen';
import { HomeScreen } from './components/home/HomeScreen';
import { SettingsModal } from './components/configuracoes/SettingsModal';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { isPulpitMode } = useAccessibility();
  const { totalPendentes } = useAvisos();
  const [currentTab, setCurrentTab] = useState<AppTabType>('home');
  const [isIniciarCultoModalOpen, setIsIniciarCultoModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // 4 Abas fixas, previsíveis e universais
  const activeTabs: AppTabType[] = ['home', 'diacono', 'pulpito', 'historico'];

  // --- CONTROLE DE GESTOS TOUCH (DESLIZAR O DEDO EM QUALQUER LUGAR DA TELA) ---
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement | null;

    // Cancela swipe em qualquer controle interativo ou área marcada como no-swipe
    if (
      target &&
      target.closest(
        'input, textarea, select, button, a, [data-no-swipe="true"], .no-swipe'
      )
    ) {
      touchStartX.current = 0;
      touchStartY.current = 0;
      return;
    }

    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === 0) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    const duration = Date.now() - touchStartTime.current;

    touchStartX.current = 0;
    touchStartY.current = 0;

    // Swipe horizontal seguro: mínimo 60 px, predominância horizontal clara (1.5x), até 600ms
    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && duration < 600) {
      const currentIndex = activeTabs.indexOf(currentTab);
      if (currentIndex === -1) return;

      if (deltaX < 0 && currentIndex < activeTabs.length - 1) {
        // Deslizar para a esquerda -> Próxima Aba
        const nextTab = activeTabs[currentIndex + 1];
        setCurrentTab(nextTab);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(20);
        }
      } else if (deltaX > 0 && currentIndex > 0) {
        // Deslizar para a direita -> Aba Anterior
        const prevTab = activeTabs[currentIndex - 1];
        setCurrentTab(prevTab);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(20);
        }
      }
    }
  };

  const activeTabIndex = Math.max(0, activeTabs.indexOf(currentTab));

  // Se o usuário não estiver logado, exibe tela de seleção de obreiro / login
  if (!currentUser) {
    return (
      <LoginScreen
        onSuccess={(isDirig, obreiro) => {
          if (isDirig) {
            setCurrentTab('pulpito');
          } else if (obreiro?.cargo === 'diacono' || obreiro?.cargo === 'diaconisa') {
            setCurrentTab('diacono');
          } else {
            setCurrentTab('home');
          }
        }}
      />
    );
  }

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`h-full w-full flex flex-col overflow-hidden transition-colors duration-200 ${
        isPulpitMode ? 'bg-black text-white' : 'bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white'
      }`}
    >
      {/* Header Compacto com Status, Identidade e Acessibilidade */}
      <Header
        onNavigateHome={() => setCurrentTab('home')}
        onOpenIniciarCultoModal={() => setIsIniciarCultoModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Conteúdo Principal em Carrossel Deslizante Fluido e Isolado */}
      <main className="flex-1 w-full overflow-hidden flex flex-col relative">
        <div 
          className="flex h-full w-full transition-transform duration-300 ease-out will-change-transform"
          style={{
            transform: `translateX(-${activeTabIndex * 100}%)`,
          }}
        >
          {/* Aba 0: Início / Hub do Culto */}
          <div className="w-full h-full shrink-0 min-w-full overflow-y-auto overscroll-y-contain px-0 pb-20">
            <HomeScreen
              onNavigate={(t) => setCurrentTab(t)}
              onOpenIniciarCulto={() => setIsIniciarCultoModalOpen(true)}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
            />
          </div>

          {/* Aba 1: Anotação de Diácono */}
          <div className="w-full h-full shrink-0 min-w-full overflow-y-auto overscroll-y-contain px-0 pb-20">
            <DiaconoDashboard />
          </div>

          {/* Aba 2: Púlpito */}
          <div className="w-full h-full shrink-0 min-w-full overflow-y-auto overscroll-y-contain px-0 pb-20">
            <PulpitoScreen />
          </div>

          {/* Aba 3: Histórico */}
          <div className="w-full h-full shrink-0 min-w-full overflow-y-auto overscroll-y-contain px-0 pb-20">
            <HistoricoScreen />
          </div>
        </div>
      </main>

      {/* Navegação Inferior Mobile-First */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        totalPendentes={totalPendentes}
        isPulpitMode={isPulpitMode}
      />

      {/* Modal de Configurações e Perfil do Usuário */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Modal de Iniciar Novo Culto */}
      <IniciarCultoModal
        isOpen={isIniciarCultoModalOpen}
        onClose={() => setIsIniciarCultoModalOpen(false)}
        onSuccess={() => setCurrentTab('home')}
      />
    </div>
  );
};

export function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <CultoProvider>
          <AvisosProvider>
            <AppContent />
          </AvisosProvider>
        </CultoProvider>
      </AuthProvider>
    </AccessibilityProvider>
  );
}

export default App;
