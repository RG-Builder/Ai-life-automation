import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './theme';
import { AppProvider, useAppContext } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { MinimalTheme } from './components/MinimalTheme';
import { GamifiedTheme } from './components/GamifiedTheme';
import { EliteTheme } from './components/EliteTheme';
import { Settings, Undo2 } from 'lucide-react';
import { OnboardingOverlay } from './components/onboarding/OnboardingOverlay';
import { motion, AnimatePresence } from 'framer-motion';

const UndoToast = () => {
  const { undoAction } = useAppContext();
  const { theme } = useTheme();

  if (!undoAction) return null;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
    >
      <div className="bg-surface border border-border shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-text_secondary uppercase tracking-widest font-bold">Action Confirmed</span>
          <span className="text-sm text-text_primary font-medium">{undoAction.message}</span>
        </div>
        <button
          onClick={() => undoAction.undo()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-xl text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all"
        >
          <Undo2 size={14} />
          Undo
        </button>
      </div>
    </motion.div>
  );
};

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg hover:bg-black/70 transition-colors"
      >
        <Settings size={20} />
      </button>
      
      {isOpen && (
        <div className="absolute top-12 right-0 bg-white rounded-xl shadow-xl border border-gray-100 p-2 flex flex-col gap-1 min-w-[120px]">
          <button 
            onClick={() => { setTheme('minimal'); setIsOpen(false); }}
            className={`px-4 py-2 text-sm text-left rounded-lg transition-colors ${theme.id === 'minimal' ? 'bg-gray-100 font-bold text-black' : 'hover:bg-gray-50 text-gray-700'}`}
          >
            Minimal
          </button>
          <button 
            onClick={() => { setTheme('gamified'); setIsOpen(false); }}
            className={`px-4 py-2 text-sm text-left rounded-lg transition-colors ${theme.id === 'gamified' ? 'bg-[#F4F9E7] text-[#2C5A0D] font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
          >
            Gamified
          </button>
          <button 
            onClick={() => { setTheme('elite'); setIsOpen(false); }}
            className={`px-4 py-2 text-sm text-left rounded-lg transition-colors ${theme.id === 'elite' ? 'bg-black text-[#00FF41] font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
          >
            Elite
          </button>
        </div>
      )}
    </div>
  );
};

const AppContent = () => {
  const { theme } = useTheme();
  const { user, updateUserProfile } = useAuth();
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    mission: 'focus',
    wakeTime: '07:00',
    wakePeriod: 'AM',
    bedTime: '11:00',
    bedPeriod: 'PM',
    directive: 'focus'
  });

  const completeOnboarding = async () => {
    if (user) {
      await updateUserProfile({
        onboardingComplete: true,
        wakeTime: onboardingData.wakeTime,
        directive: onboardingData.directive
      });
    }
  };

  const renderTheme = () => {
    switch (theme.id) {
      case 'minimal':
        return <MinimalTheme />;
      case 'gamified':
        return <GamifiedTheme />;
      case 'elite':
        return <EliteTheme />;
      default:
        return <MinimalTheme />;
    }
  };

  return (
    <>
      {renderTheme()}
      <AnimatePresence>
        <UndoToast />
      </AnimatePresence>
      {user && user.onboardingComplete === false && (
        <OnboardingOverlay 
          theme={theme}
          onboardingStep={onboardingStep}
          setOnboardingStep={setOnboardingStep}
          onboardingData={onboardingData}
          setOnboardingData={setOnboardingData}
          completeOnboarding={completeOnboarding}
        />
      )}
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <div className="relative w-full max-w-md mx-auto h-[100dvh] overflow-hidden bg-black shadow-2xl sm:rounded-[40px] sm:h-[850px] sm:my-8 sm:border-8 sm:border-gray-900">
          <ThemeSwitcher />
          <AppContent />
        </div>
      </AppProvider>
    </ThemeProvider>
  );
}
