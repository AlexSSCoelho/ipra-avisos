import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../services/storageService';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface AccessibilityContextType {
  fontScale: number; // 1.0 = Normal (100%), 1.15 = Médio (115%), 1.3 = Grande (130%), 1.5 = Extra Grande (150%), 1.7 = Máximo (170%)
  setFontScale: (scale: number) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  isPulpitMode: boolean;
  setIsPulpitMode: (val: boolean) => void;
  modoFocadoPulpito: boolean;
  setModoFocadoPulpito: (val: boolean) => void;
  toggleModoFocadoPulpito: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  isInstalled: boolean;
  canInstall: boolean;
  promptInstall: () => Promise<boolean>;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const FONT_SCALES = [1.0, 1.15, 1.3, 1.45, 1.6, 1.8];

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontScale, setFontScaleState] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FONT_SCALE);
    return saved ? parseFloat(saved) : 1.15; // Inicia ligeiramente ampliado (115%) por padrão para conforto
  });

  const [isPulpitMode, setIsPulpitMode] = useState<boolean>(false);
  const [modoFocadoPulpito, setModoFocadoPulpito] = useState<boolean>(false);

  const toggleModoFocadoPulpito = useCallback(() => {
    setModoFocadoPulpito((prev) => !prev);
  }, []);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(display-mode: standalone)').matches;
    }
    return false;
  });

  // Capturar evento global beforeinstallprompt no carregamento inicial da aplicação
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const matchMediaHandler = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', matchMediaHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      mediaQuery.removeEventListener('change', matchMediaHandler);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
      setDeferredPrompt(null);
      return false;
    }
    return false;
  }, [deferredPrompt]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontScale.toString());
    localStorage.setItem(STORAGE_KEYS.FONT_SCALE, fontScale.toString());
  }, [fontScale]);

  useEffect(() => {
    if (isPulpitMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isPulpitMode]);

  const increaseFontSize = () => {
    const currentIndex = FONT_SCALES.findIndex((s) => s >= fontScale);
    if (currentIndex < FONT_SCALES.length - 1) {
      setFontScaleState(FONT_SCALES[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const currentIndex = FONT_SCALES.findIndex((s) => s >= fontScale);
    if (currentIndex > 0) {
      setFontScaleState(FONT_SCALES[currentIndex - 1]);
    }
  };

  const resetFontSize = () => {
    setFontScaleState(1.15);
  };

  const setFontScale = (scale: number) => {
    setFontScaleState(scale);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontScale,
        setFontScale,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        isPulpitMode,
        setIsPulpitMode,
        modoFocadoPulpito,
        setModoFocadoPulpito,
        toggleModoFocadoPulpito,
        soundEnabled,
        setSoundEnabled,
        isInstalled,
        canInstall: !!deferredPrompt,
        promptInstall,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility deve ser usado dentro de um AccessibilityProvider');
  }
  return context;
};
