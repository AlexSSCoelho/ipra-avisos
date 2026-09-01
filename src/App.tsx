import React, { useState, useEffect, useRef } from 'react';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CultoProvider, useCulto } from './context/CultoContext';
import { AvisosProvider } from './context/AvisosContext';
import { Header } from './components/common/Header';
import { LoginScreen } from './components/auth/LoginScreen';
import { AdminPassModal } from './components/auth/AdminPassModal';
import { DiaconoDashboard } from './components/diacono/DiaconoDashboard';
import { PulpitoScreen } from './components/pulpito/PulpitoScreen';
import { HistoricoScreen } from './components/historico/HistoricoScreen';
import { ConfigScreen } from './components/configuracoes/ConfigScreen';

type TabType = 'diacono' | 'pulpito' | 'historico' | 'config';

const AppContent: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { isDirigente } = useCulto();
  const { isPulpitMode } = useAccessibility();
  const [currentTab, setCurrentTab] = useState<TabType>('diacono');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Lista de abas ativas para o perfil atual (para navegação por deslize de dedo / swipe)
  const getTabList = (): TabType[] => {
    if (isAdmin) return ['diacono', 'pulpito', 'historico', 'config'];
    if (isDirigente) return ['pulpito', 'diacono', 'historico'];
    return ['diacono', 'historico'];
  };

  const activeTabs = getTabList();

  // Proteção e roteamento por perfil de acesso
  useEffect(() => {
    if (!currentUser) return;

    if (!isAdmin) {
      if (currentTab === 'config') {
        setCurrentTab(isDirigente ? 'pulpito' : 'diacono');
      } else if (currentTab === 'pulpito' && !isDirigente) {
        setCurrentTab('diacono');
      }
    }
  }, [currentUser, isAdmin, isDirigente, currentTab]);

  // --- CONTROLE DE GESTOS TOUCH (DESLIZAR O DEDO / SWIPE ENTRE ABAS) ---
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    const duration = Date.now() - touchStartTime.current;

    // Verificar se o gesto foi iniciado dentro de um input, textarea ou container de rolagem horizontal
    const target = e.target as HTMLElement | null;
    if (target && target.closest('input, textarea, select, .no-swipe, [data-no-swipe]')) {
      return;
    }

    // Gesto de swipe horizontal válido:
    // - Mínimo 50px de deslocamento horizontal
    // - Movimento predominantemente horizontal (deltaX > deltaY * 1.3)
    // - Duração máxima de 600ms
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3 && duration < 600) {
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

  // Se o usuário não estiver logado, exibe tela de seleção de obreiro / login
  if (!currentUser) {
    return (
      <LoginScreen
        onSuccess={(isDirig) => setCurrentTab(isDirig ? 'pulpito' : 'diacono')}
      />
    );
  }

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`min-h-screen transition-colors duration-200 ${
        isPulpitMode || currentTab === 'pulpito' ? 'bg-black text-white' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Header com Status, Navegação e Acessibilidade */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* Conteúdo Principal com transição suave ao trocar de aba */}
      <main className="pb-12 animate-in fade-in duration-150">
        {currentTab === 'diacono' && <DiaconoDashboard />}
        {currentTab === 'pulpito' && (isDirigente || isAdmin) && <PulpitoScreen />}
        {currentTab === 'historico' && <HistoricoScreen />}
        {currentTab === 'config' && isAdmin && <ConfigScreen />}
      </main>

      {/* Modal de Ações Administrativas / Troca de Dirigente */}
      <AdminPassModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
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
