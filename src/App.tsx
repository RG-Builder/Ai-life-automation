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
  const { firebaseUser, loading: authLoading } = useAuth();
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

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
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
