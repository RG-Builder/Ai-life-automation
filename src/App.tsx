import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  LayoutGrid,
  Activity,
  Timer,
  Settings as SettingsIcon,
  Home,
  Zap,
  Flame,
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { useAppContext } from './context/AppContext';
import { useTheme } from './theme';
import ErrorBoundary from './components/ErrorBoundary';
import FirestoreDiagnostic from './components/FirestoreDiagnostic';

// Component Imports
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { Dashboard } from './components/views/Dashboard';
import { MissionMatrix } from './components/views/MissionMatrix';
import { HabitsView as Habits } from './components/views/HabitsView';
import { TimelineMatrix } from './components/views/TimelineMatrix';
import { SelfAwareness } from './components/views/SelfAwareness';
import { SettingsView } from './components/views/SettingsView';
import { OnboardingOverlay as OnboardingFlow } from './components/onboarding/OnboardingOverlay';
import { AiPanel } from './components/ai/AiPanel';
import { NotificationsPanel } from './components/notifications/NotificationsPanel';
import { FocusMode } from './components/focus/FocusMode';

export default function App() {
  const { theme } = useTheme();
  const { firebaseUser, loading: authLoading, loginWithGoogle } = useAuth();
  const { 
    missions, 
    habits, 
    lifeState, 
    dailyScore, 
    focusTask, 
    handleAction,
    microReward,
    loading: appLoading
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'schedule' | 'habits' | 'analytics' | 'settings'>('home');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('lifepilot_onboarded'));

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex justify-center">
            <div className="size-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="text-black" size={32} />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter">LifePilot <span className="text-primary">AI</span></h2>
            <p className="mt-2 text-sm text-text_secondary uppercase tracking-widest font-bold">Your AI-Powered Life Architect</p>
          </div>
          <button 
            onClick={() => loginWithGoogle()}
            className="w-full py-4 bg-primary text-black rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <FirestoreDiagnostic />
      <ErrorBoundary>
        <Header 
          user={firebaseUser} 
          onAiClick={() => setShowAiPanel(true)}
          onNotificationsClick={() => setShowNotifications(true)}
        />

        <main className="pb-24 pt-20 px-4 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Dashboard />
              </motion.div>
            )}
            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <MissionMatrix />
              </motion.div>
            )}
            {activeTab === 'habits' && (
              <motion.div
                key="habits"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Habits />
              </motion.div>
            )}
            {activeTab === 'schedule' && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <TimelineMatrix />
              </motion.div>
            )}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <SelfAwareness />
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <SettingsView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <AnimatePresence>
          {focusTask && (
            <FocusMode 
              task={focusTask} 
              onClose={() => handleAction('STOP_FOCUS')} 
            />
          )}
          {showAiPanel && (
            <AiPanel onClose={() => setShowAiPanel(false)} />
          )}
          {showNotifications && (
            <NotificationsPanel onClose={() => setShowNotifications(false)} />
          )}
          {showOnboarding && (
            <OnboardingFlow onClose={() => setShowOnboarding(false)} />
          )}
          {microReward && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 50 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg shadow-blue-500/20 flex items-center gap-2 border border-blue-400/30"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span className="font-medium">{microReward}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </ErrorBoundary>
    </div>
  );
}
