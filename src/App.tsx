import React, { useState } from 'react';
import { useTheme } from './theme';
import { useAppContext } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { MinimalTheme } from './components/MinimalTheme';
import { GamifiedTheme } from './components/GamifiedTheme';
import { EliteTheme } from './components/EliteTheme';
import { FocusMode } from './components/focus/FocusMode';
import { Clapperboard, Palette, Settings, Undo2, Zap } from 'lucide-react';
import { OnboardingOverlay } from './components/onboarding/OnboardingOverlay';
import { ErrorBanner } from './components/ui/ErrorBanner';
import { motion, AnimatePresence } from 'framer-motion';
import { use3DMotion } from './hooks/use3DMotion';
import { useUISounds } from './hooks/useUISounds';

const UndoToast = () => {
  const { undoAction } = useAppContext();

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

const ThemeSwitcher = ({
  is3DEnabled,
  onToggle3D,
  onThemeChangeSound,
}: {
  is3DEnabled: boolean;
  onToggle3D: () => void;
  onThemeChangeSound: () => void;
}) => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const themeOptions = [
    { id: 'minimal', label: 'Minimal', icon: <Palette size={14} />, activeClass: 'bg-gray-100 text-black', idleClass: 'hover:bg-gray-50 text-gray-700' },
    { id: 'simple', label: 'Simple', icon: <Palette size={14} />, activeClass: 'bg-[#f2f7ff] text-[#2563eb]', idleClass: 'hover:bg-gray-50 text-gray-700' },
    { id: 'gamified', label: 'Gamified', icon: <Zap size={14} />, activeClass: 'bg-[#F4F9E7] text-[#2C5A0D]', idleClass: 'hover:bg-gray-50 text-gray-700' },
    { id: 'elite', label: 'Elite', icon: <Settings size={14} />, activeClass: 'bg-black text-[#00FF41]', idleClass: 'hover:bg-gray-50 text-gray-700' },
    { id: 'cinematic', label: 'Cinematic 3D', icon: <Clapperboard size={14} />, activeClass: 'bg-[#120f2e] text-[#a78bfa]', idleClass: 'hover:bg-gray-50 text-gray-700' },
    { id: 'aurora', label: 'Aurora Glass', icon: <Palette size={14} />, activeClass: 'bg-[#e0eeff] text-[#1d4ed8]', idleClass: 'hover:bg-gray-50 text-gray-700' },
  ] as const;
  
  React.useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={panelRef} className="fixed top-4 right-4 z-[100]">
      <button 
        onClick={() => {
          onThemeChangeSound();
          setIsOpen(!isOpen);
        }}
        className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg hover:bg-black/70 transition-colors"
        aria-label="Open theme selector"
      >
        <Settings size={20} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="absolute top-12 right-0 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 p-2 flex flex-col gap-1 min-w-[170px]"
          >
            <button
              onClick={onToggle3D}
              className={`px-4 py-2 text-sm text-left rounded-lg transition-colors font-semibold flex items-center gap-2 ${
                is3DEnabled ? 'bg-violet-100 text-violet-700' : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Clapperboard size={14} />
              {is3DEnabled ? 'Disable 3D Motion' : 'Enable 3D Motion'}
            </button>
            {themeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setTheme(option.id);
                  onThemeChangeSound();
                  setIsOpen(false);
                }}
                className={`px-4 py-2 text-sm text-left rounded-lg transition-colors font-semibold flex items-center gap-2 ${
                  theme.id === option.id ? `${option.activeClass} font-bold` : option.idleClass
                }`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
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

  const { currentFocusTask, handleAction } = useAppContext();

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
    if (currentFocusTask) {
      return (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150]"
          >
            <FocusMode 
              task={currentFocusTask} 
              onClose={() => handleAction('STOP_FOCUS')} 
            />
          </motion.div>
        </AnimatePresence>
      );
    }

    switch (theme.id) {
      case 'cinematic':
      case 'elite':
        return <EliteTheme />;
      case 'gamified':
        return <GamifiedTheme />;
      case 'aurora':
      case 'simple':
      case 'minimal':
        return <MinimalTheme />;
      default:
        return <MinimalTheme />;
    }
  };

  return (
    <>
      <ErrorBanner />
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
  const { theme } = useTheme();
  const { play } = useUISounds();
  const [is3DEnabled, setIs3DEnabled] = useState(() => localStorage.getItem('ui-3d-motion') === 'enabled');
  const { shellStyle, requestSensorPermission, hasDeviceSensor } = use3DMotion(is3DEnabled);

  const handle3DToggle = async () => {
    if (!is3DEnabled) {
      const granted = await requestSensorPermission();
      play(granted ? 'success' : 'toggle');
      setIs3DEnabled(true);
      localStorage.setItem('ui-3d-motion', 'enabled');
      return;
    }
    play('toggle');
    setIs3DEnabled(false);
    localStorage.setItem('ui-3d-motion', 'disabled');
  };

  const shellClassName = `relative w-full max-w-md mx-auto h-[100dvh] overflow-hidden shadow-2xl sm:rounded-[40px] sm:h-[850px] sm:my-8 sm:border-8 ${
    theme.id === 'cinematic'
      ? 'bg-[#05060f] sm:border-violet-500/30 cinematic-shell'
      : theme.id === 'aurora'
        ? 'bg-[#dfefff] sm:border-blue-200/70 aurora-shell'
        : theme.isDark
          ? 'bg-black sm:border-gray-900'
          : 'bg-[#f8fafc] sm:border-slate-200'
  }`;

  return (
    <div className={`${shellClassName} ${is3DEnabled ? 'interactive-3d-shell' : ''}`} style={shellStyle}>
      <ThemeSwitcher is3DEnabled={is3DEnabled} onToggle3D={handle3DToggle} onThemeChangeSound={() => play('tap')} />
      {is3DEnabled && !hasDeviceSensor && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[100] text-[10px] uppercase tracking-wider bg-black/60 text-white px-3 py-1 rounded-full">
          3D motion active (touch / pointer controlled)
        </div>
      )}
      <AppContent />
    </div>
  );
}
