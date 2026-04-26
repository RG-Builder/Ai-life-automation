import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  RefreshCw, 
  ClipboardList, 
  BarChart2, 
  Settings,
  AlertCircle,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme';

import { MissionMatrix } from './views/MissionMatrix';
import { SelfAwareness } from './views/SelfAwareness';
import { HabitsView } from './views/HabitsView';
import { TimelineMatrix } from './views/TimelineMatrix';
import { Dashboard } from './views/Dashboard';

// --- MINIMAL THEME COMPONENTS ---

export const MinimalTheme: React.FC = () => {
  const { error, setError, activeTab, setActiveTab } = useAppContext();
  const { firebaseUser } = useAuth();
  const { theme } = useTheme();
  const tabTitle = theme.wording.navigation[activeTab as keyof typeof theme.wording.navigation] || theme.wording.navigation.home;
  const viewsByTab = {
    home: <Dashboard key="home" />,
    tasks: <MissionMatrix key="tasks" />,
    habits: <HabitsView key="habits" />,
    schedule: <TimelineMatrix key="schedule" />,
    analytics: <SelfAwareness key="analytics" />
  } as const;
  const navItems = [
    { key: 'home', icon: <Target size={22} />, label: theme.wording.navigation.home },
    { key: 'tasks', icon: <ClipboardList size={22} />, label: theme.wording.navigation.tasks },
    { key: 'habits', icon: <RefreshCw size={22} />, label: theme.wording.navigation.habits },
    { key: 'schedule', icon: <Settings size={22} />, label: theme.wording.navigation.schedule },
    { key: 'analytics', icon: <BarChart2 size={22} />, label: theme.wording.navigation.analytics }
  ] as const;

  return (
    <div 
      className="relative min-h-screen font-sans selection:bg-gray-200 flex flex-col"
      style={{ backgroundColor: theme.colors.background, color: theme.colors.text_primary }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -top-28 -left-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-24 -right-16 h-64 w-64 rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute bottom-16 left-1/3 h-52 w-52 rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Error Toast */}
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

      {/* Header */}
      <header 
        className="px-6 pt-12 pb-4 flex justify-between items-center sticky top-0 backdrop-blur-xl z-50 border-b border-border/40 bg-background/80"
      >
        <div className="flex items-center gap-3">
          <img src={firebaseUser?.photoURL || "https://i.pravatar.cc/150?img=11"} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
          <h1 className="font-bold text-lg leading-tight tracking-tight">{tabTitle}</h1>
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

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 md:px-6 pb-32 pt-4">
        <AnimatePresence mode="wait">{viewsByTab[activeTab as keyof typeof viewsByTab]}</AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav 
        className="fixed bottom-0 left-0 right-0 border-t border-border/40 pb-safe pt-3 px-4 md:px-6 z-50 backdrop-blur-xl bg-background/85"
      >
        <div className="flex justify-between items-center mb-4 max-w-md mx-auto overflow-x-auto no-scrollbar gap-1 rounded-2xl p-2 bg-surface/80 border border-border/50 shadow-xl">
          {navItems.map((item) => (
            <NavItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.key}
              onClick={() => setActiveTab(item.key)}
            />
          ))}
        </div>
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => {
  const { theme } = useTheme();
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-16 gap-1.5 transition-colors duration-200",
        !active && "text-gray-400 hover:text-gray-600"
      )}
      style={active ? { color: theme.colors.primary } : {}}
    >
      {icon}
      <span className="text-[9px] font-bold tracking-wider">{label}</span>
    </button>
  );
};
