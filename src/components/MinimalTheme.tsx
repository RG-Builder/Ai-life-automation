import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  RefreshCw, 
  ClipboardList, 
  BarChart2, 
  Settings,
  Mail,
  Dumbbell,
  BrainCircuit,
  Flame,
  Droplet,
  BookOpen,
  Edit2,
  Edit3,
  Plus,
  Send,
  MoreVertical,
  Sparkles,
  CheckCircle2,
  Circle,
  Trash2,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme';
import { TaskModal } from './TaskModal';
import { HabitModal } from './HabitModal';
import { Mission, Habit } from '../types';
import { THEME_CONFIG } from '../config/theme.config';

import { MissionMatrix } from './views/MissionMatrix';
import { SelfAwareness } from './views/SelfAwareness';
import { HabitsView } from './views/HabitsView';
import { TimelineMatrix } from './views/TimelineMatrix';
import { Dashboard } from './views/Dashboard';

// --- MINIMAL THEME COMPONENTS ---

export const MinimalTheme: React.FC = () => {
  const { error, setError, activeTab, setActiveTab } = useAppContext();
  const { theme } = useTheme();

  return (
    <div 
      className="min-h-screen font-sans selection:bg-gray-200 flex flex-col"
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
        className="px-6 pt-12 pb-6 flex justify-between items-center sticky top-0 backdrop-blur-md z-50"
        style={{ backgroundColor: `${theme.colors.background}CC` }} // CC is 80% opacity
      >
        <div className="flex items-center gap-3">
          <img src={useAuth().firebaseUser?.photoURL || "https://i.pravatar.cc/150?img=11"} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
          <h1 className="font-bold text-lg leading-tight tracking-tight">
            {activeTab === 'home' ? theme.wording.navigation.home : 
             activeTab === 'tasks' ? theme.wording.navigation.tasks :
             activeTab === 'habits' ? theme.wording.navigation.habits :
             activeTab === 'schedule' ? theme.wording.navigation.schedule :
             theme.wording.navigation.analytics}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {!useAuth().firebaseUser && (
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
        className="fixed bottom-0 left-0 right-0 border-t border-gray-100 pb-safe pt-3 px-6 z-50"
        style={{ backgroundColor: theme.colors.background }}
      >
        <div className="flex justify-between items-center mb-4 max-w-sm mx-auto overflow-x-auto no-scrollbar gap-1">
          <NavItem id="home" icon={<Target size={22} />} label={theme.wording.navigation.home} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavItem id="tasks" icon={<ClipboardList size={22} />} label={theme.wording.navigation.tasks} active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
          <NavItem id="habits" icon={<RefreshCw size={22} />} label={theme.wording.navigation.habits} active={activeTab === 'habits'} onClick={() => setActiveTab('habits')} />
          <NavItem id="schedule" icon={<Settings size={22} />} label={theme.wording.navigation.schedule} active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} />
          <NavItem id="analytics" icon={<BarChart2 size={22} />} label={theme.wording.navigation.analytics} active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
        </div>
      </nav>
    </div>
  );
};

const NavItem = ({ id, icon, label, active, onClick }: { id: string, icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => {
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

// --- SCREENS ---

const FocusScreen = () => null;

interface TaskItemProps {
  title: string;
  time: string;
  icon: React.ReactNode;
  key?: any;
}

const TaskItem = ({ title, time, icon }: TaskItemProps) => (
  <div className="flex items-center gap-4 p-4 bg-[#F9FAFB] rounded-2xl">
    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#405C4A] shadow-sm shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-gray-900 text-base">{title}</h4>
      <div className="text-xs text-gray-500 mt-0.5">{time}</div>
    </div>
  </div>
);

const HabitsScreen = () => null;

interface RitualItemProps {
  icon: React.ReactNode;
  title: string;
  target: string;
  streak: number;
  progress: number;
  checked: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  key?: any;
}

const RitualItem = ({ icon, title, target, streak, progress, checked, onToggle, onDelete, onEdit }: RitualItemProps) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center gap-6 relative group">
    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
      <button 
        onClick={onEdit}
        className="p-2 text-gray-300 hover:text-blue-500"
      >
        <Edit2 size={16} />
      </button>
      <button 
        onClick={onDelete}
        className="p-2 text-gray-300 hover:text-danger"
      >
        <Trash2 size={16} />
      </button>
    </div>
    <div className="w-14 h-14 bg-[#F9FAFB] rounded-2xl flex items-center justify-center text-[#405C4A] shrink-0">
      {icon}
    </div>
    <div className="flex-1">
      <h4 className="font-bold text-gray-900 text-lg">{title}</h4>
      <div className="text-sm text-gray-500 mb-4">{target}</div>
      <div className="flex items-center gap-4">
        <div className="text-[10px] font-bold tracking-wider text-gray-500 uppercase shrink-0">
          Streak<br/><span className="text-gray-900 text-sm">{streak} ⚡</span>
        </div>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#405C4A] rounded-full" style={{ width: `${Math.min(100, progress)}%` }}></div>
        </div>
      </div>
    </div>
    <button 
      onClick={onToggle}
      className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-colors",
        checked ? "bg-[#E5F3E8] border-[#E5F3E8] text-[#405C4A]" : "bg-white border-gray-100 text-gray-300"
      )}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </button>
  </div>
);

const TasksScreen = () => null;
const InsightsScreen = () => null;
