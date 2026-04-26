import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme';
import { 
  LayoutGrid, 
  Calendar, 
  MessageSquare, 
  Flame,
  CheckCircle2,
  Clock,
  Mail,
  Dumbbell,
  Plus,
  Play,
  Lock,
  Award,
  Zap,
  BookOpen,
  Trophy,
  Star,
  X,
  Loader2,
  AlertCircle,
  Trash2,
  Edit2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { TaskModal } from './TaskModal';
import { HabitModal } from './HabitModal';
import { Mission, Habit } from '../types';
import { THEME_CONFIG } from '../config/theme.config';

import { MissionMatrix } from './views/MissionMatrix';
import { SelfAwareness } from './views/SelfAwareness';
import { HabitsView } from './views/HabitsView';
import { TimelineMatrix } from './views/TimelineMatrix';
import { Dashboard } from './views/Dashboard';

// --- GAMIFIED THEME COMPONENTS ---

export const GamifiedTheme: React.FC = () => {
  const { firebaseUser } = useAuth();
  const { error, setError, activeTab, setActiveTab, tasks, streak } = useAppContext();
  const { theme } = useTheme();

  return (
    <div 
      className="min-h-screen font-sans selection:bg-[#73F02D]/30 flex flex-col"
      style={{ backgroundColor: theme.colors.background, color: theme.colors.text_primary }}
    >
      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm"
          >
            <div className="bg-white border border-red-200 rounded-2xl p-4 shadow-xl flex items-center gap-3">
              <AlertCircle className="text-red-500 shrink-0" size={20} />
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
        className="px-6 pt-12 pb-4 flex justify-between items-center sticky top-0 backdrop-blur-md z-50"
        style={{ backgroundColor: `${theme.colors.background}CC` }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={firebaseUser?.photoURL || "https://i.pravatar.cc/150?img=11"} alt="Profile" className="w-10 h-10 rounded-full border-2 object-cover" style={{ borderColor: theme.colors.primary }} />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2" style={{ backgroundColor: theme.colors.accent, borderColor: theme.colors.background }}></div>
          </div>
          <div>
            <h1 className="font-black text-lg leading-none">LifePilot AI</h1>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.colors.text_secondary }}>Level {Math.floor((tasks.filter(t => t.status === 'completed').length + streak) / 5) + 1} Explorer</p>
          </div>
        </div>
        <button 
          onClick={() => setError('Neural notifications synced. No new alerts at this time.')}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center relative" 
          style={{ color: theme.colors.primary }}
        >
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full border border-white" style={{ backgroundColor: theme.colors.accent }}></div>
          <BellIcon />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <Dashboard key="home" />}
          {activeTab === 'tasks' && <MissionMatrix key="tasks" />}
          {activeTab === 'habits' && <HabitsView key="habits" />}
          {activeTab === 'schedule' && <TimelineMatrix key="schedule" />}
          {activeTab === 'analytics' && <SelfAwareness key="analytics" />}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav 
        className="fixed bottom-0 left-0 right-0 pb-safe pt-2 px-6 z-50"
        style={{ backgroundColor: theme.colors.background }}
      >
        <div className="flex justify-between items-center bg-white rounded-full px-2 py-2 shadow-lg mb-6 overflow-x-auto no-scrollbar gap-1" style={{ boxShadow: `0 10px 15px -3px ${theme.colors.primary}0D`, borderColor: `${theme.colors.primary}0D` }}>
          <NavItem id="home" icon={<LayoutGrid size={20} />} label={theme.wording.navigation.home} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavItem id="tasks" icon={<Award size={20} />} label={theme.wording.navigation.tasks} active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
          <NavItem id="habits" icon={<Flame size={20} />} label={theme.wording.navigation.habits} active={activeTab === 'habits'} onClick={() => setActiveTab('habits')} />
          <NavItem id="schedule" icon={<Calendar size={20} />} label={theme.wording.navigation.schedule} active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} />
          <NavItem id="analytics" icon={<MessageSquare size={20} />} label={theme.wording.navigation.analytics} active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
        </div>
      </nav>
    </div>
  );
};

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const NavItem = ({ id, icon, label, active, onClick }: { id: string, icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => {
  const { theme } = useTheme();
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-16 h-14 rounded-full transition-all duration-300"
      )}
      style={active ? { backgroundColor: theme.colors.primary, color: 'white' } : { color: theme.colors.text_secondary }}
    >
      <div className={cn("mb-1 transition-transform duration-300", active && "scale-110")}>{icon}</div>
      <span className="text-[9px] font-black tracking-wider">{label}</span>
    </button>
  );
};

// --- ACHIEVEMENT ---

const Achievement = ({ icon, bg, color, label, locked }: any) => (
  <div className="flex flex-col items-center gap-2">
    <div className={cn("w-20 h-20 rounded-full flex items-center justify-center shadow-sm", bg, color, locked && "opacity-50 grayscale")}>
      {icon}
    </div>
    <span className={cn("text-[10px] font-black tracking-widest uppercase text-center", locked ? "text-[#A3C08F]" : "text-[#2C5A0D]")}>{label}</span>
  </div>
);
