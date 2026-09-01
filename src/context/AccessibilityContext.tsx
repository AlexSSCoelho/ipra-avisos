import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  fontScale: number; // 1.0 = Normal (100%), 1.15 = Médio (115%), 1.3 = Grande (130%), 1.5 = Extra Grande (150%), 1.7 = Máximo (170%)
  setFontScale: (scale: number) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  isPulpitMode: boolean;
  setIsPulpitMode: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const FONT_SCALES = [1.0, 1.15, 1.3, 1.45, 1.6, 1.8];

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontScale, setFontScaleState] = useState<number>(() => {
    const saved = localStorage.getItem('ipra_font_scale');
    return saved ? parseFloat(saved) : 1.15; // Inicia ligeiramente ampliado (115%) por padrão para conforto
  });

  const [isPulpitMode, setIsPulpitMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontScale.toString());
    localStorage.setItem('ipra_font_scale', fontScale.toString());
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
        soundEnabled,
        setSoundEnabled,
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
