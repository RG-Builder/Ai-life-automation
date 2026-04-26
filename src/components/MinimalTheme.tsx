import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, RefreshCw, ClipboardList, BarChart2, Settings, AlertCircle, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme';

import { MissionMatrix } from './views/MissionMatrix';
import { SelfAwareness } from './views/SelfAwareness';
import { HabitsView } from './views/HabitsView';
import { TimelineMatrix } from './views/TimelineMatrix';
import { Dashboard } from './views/Dashboard';

export const MinimalTheme: React.FC = () => {
  const { error, setError, activeTab, setActiveTab } = useAppContext();
  const { firebaseUser } = useAuth();
  const { theme } = useTheme();

  const tabTitle = theme.wording.navigation[activeTab as keyof typeof theme.wording.navigation] || theme.wording.navigation.home;

  return (
    <div
      className="min-h-screen font-sans flex flex-col"
      style={{ backgroundColor: theme.colors.background, color: theme.colors.text_primary }}
    >
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm"
          >
            <div className="bg-white border border-danger/20 rounded-2xl p-4 shadow-xl flex items-center gap-3">
              <AlertCircle className="shrink-0" size={20} style={{ color: theme.colors.danger }} />
              <p className="text-sm text-gray-700 flex-1">{error}</p>
              <button onClick={() => setError(null)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="px-6 pt-12 pb-4 flex justify-between items-center sticky top-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <img src={firebaseUser?.photoURL || 'https://i.pravatar.cc/150?img=11'} alt="Profile" className="w-8 h-8 rounded-full object-cover shrink-0" />
          <h1 className="font-bold text-lg leading-tight tracking-tight truncate">{tabTitle}</h1>
        </div>
        <div className="flex items-center gap-3">
          {!firebaseUser && (
            <div className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Demo Mode
            </div>
          )}
          <button
            onClick={() => setError('Settings interface loading... System in optimal state.')}
            className="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors"
          >
            <Settings size={22} fill="currentColor" className="text-gray-700" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-32 pt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <Dashboard key="home" />}
          {activeTab === 'tasks' && <MissionMatrix key="tasks" />}
          {activeTab === 'habits' && <HabitsView key="habits" />}
          {activeTab === 'schedule' && <TimelineMatrix key="schedule" />}
          {activeTab === 'analytics' && <SelfAwareness key="analytics" />}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-border/40 pb-safe pt-3 px-6 z-50 bg-background/95 backdrop-blur-md">
        <div className="flex justify-between items-center mb-4 max-w-sm mx-auto overflow-x-auto no-scrollbar gap-1">
          <NavItem icon={<Target size={22} />} label={theme.wording.navigation.home} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavItem icon={<ClipboardList size={22} />} label={theme.wording.navigation.tasks} active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
          <NavItem icon={<RefreshCw size={22} />} label={theme.wording.navigation.habits} active={activeTab === 'habits'} onClick={() => setActiveTab('habits')} />
          <NavItem icon={<Settings size={22} />} label={theme.wording.navigation.schedule} active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} />
          <NavItem icon={<BarChart2 size={22} />} label={theme.wording.navigation.analytics} active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
        </div>
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 gap-1.5 transition-colors duration-200 ${active ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
  >
    {icon}
    <span className="text-[9px] font-bold tracking-wider">{label}</span>
  </button>
);
