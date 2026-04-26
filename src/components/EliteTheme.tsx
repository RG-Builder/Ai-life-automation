import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Cpu, 
  Activity, 
  ShieldAlert, 
  Wifi, 
  Database,
  Lock,
  Unlock,
  Zap,
  Crosshair,
  Radio,
  CheckSquare,
  Square,
  X,
  AlertCircle,
  Loader2,
  Trash2,
  Plus,
  Edit2,
  Check
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

// --- ELITE THEME COMPONENTS ---

export const EliteTheme: React.FC = () => {
  const { firebaseUser } = useAuth();
  const { error, setError, activeTab, setActiveTab } = useAppContext();
  const { theme } = useTheme();

  return (
    <div 
      className="min-h-screen font-mono selection:bg-[#00FF41]/30 flex flex-col relative overflow-hidden"
      style={{ backgroundColor: theme.colors.background, color: theme.colors.text_primary }}
    >
      {/* Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 opacity-20"></div>
      
      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm"
          >
            <div className="border rounded-none p-4 shadow-[0_0_20px_rgba(0,255,65,0.2)] flex items-center gap-3" style={{ backgroundColor: theme.colors.background, borderColor: `${theme.colors.primary}80` }}>
              <AlertCircle className="shrink-0" size={20} style={{ color: theme.colors.danger }} />
              <p className="text-xs flex-1 uppercase tracking-widest" style={{ color: theme.colors.text_primary }}>{error}</p>
              <button onClick={() => setError(null)} className="hover:text-[#00FF41]" style={{ color: theme.colors.text_secondary }}>
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header 
        className="px-4 sm:px-6 pt-[max(env(safe-area-inset-top),2.75rem)] pb-4 flex justify-between items-start sticky top-0 backdrop-blur-md z-40 border-b gap-3"
        style={{ backgroundColor: `${theme.colors.background}E6`, borderColor: `${theme.colors.primary}33` }}
      >
        <div>
          <h1 className="font-bold text-lg tracking-widest flex items-center gap-2">
            <Terminal size={18} />
            {firebaseUser?.displayName?.toUpperCase().replace(' ', '_') || 'SYS.ADMIN'}
          </h1>
          <div className="text-[10px] mt-1 flex items-center gap-2" style={{ color: theme.colors.text_secondary }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.colors.primary }}></span>
            UPLINK_SECURE // ID: {firebaseUser?.uid.slice(0, 8) || '894.22.1'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs border px-2 py-1" style={{ borderColor: `${theme.colors.primary}4D`, backgroundColor: `${theme.colors.primary}1A` }}>
            v4.2.0
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 pb-36 sm:pb-32 relative z-30">
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
        className="fixed bottom-0 left-0 right-0 border-t pt-3 sm:pt-4 px-3 sm:px-6 z-40"
        style={{ backgroundColor: theme.colors.background, borderColor: `${theme.colors.primary}4D`, paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
      >
        <div className="flex justify-between items-center mb-2 sm:mb-6 max-w-sm mx-auto gap-1.5 sm:gap-2">
          <NavItem id="home" label={theme.wording.navigation.home} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavItem id="tasks" label={theme.wording.navigation.tasks} active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
          <NavItem id="habits" label={theme.wording.navigation.habits} active={activeTab === 'habits'} onClick={() => setActiveTab('habits')} />
          <NavItem id="schedule" label={theme.wording.navigation.schedule} active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} />
          <NavItem id="analytics" label={theme.wording.navigation.analytics} active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
        </div>
      </nav>
    </div>
  );
};

const NavItem = ({ id, label, active, onClick }: { id: string, label: string, active: boolean, onClick: () => void }) => {
  const { theme } = useTheme();
  return (
    <button 
      onClick={onClick}
      className={cn(
        "text-[10px] sm:text-xs font-bold tracking-widest transition-all duration-200 px-2 sm:px-3 py-2 border border-transparent flex-1 min-w-0 truncate"
      )}
      style={active ? { color: theme.colors.primary, borderColor: `${theme.colors.primary}80`, backgroundColor: `${theme.colors.primary}1A`, boxShadow: `0 0 10px ${theme.colors.primary}33` } : { color: theme.colors.text_secondary }}
    >
      {label}
    </button>
  );
};

// --- SCREENS ---

// --- HELPER COMPONENTS ---

const StatBox = ({ title, value, icon, alert }: any) => (
  <div className={cn("border p-3 flex flex-col gap-2", alert ? "border-red-500/50 bg-red-500/10 text-red-500" : "border-[#00FF41]/30 bg-[#00FF41]/5")}>
    <div className="flex justify-between items-center">
      {icon}
      <span className={cn("text-[10px] tracking-widest", alert ? "text-red-500" : "text-[#008F11]")}>{title}</span>
    </div>
    <div className="text-lg font-bold tracking-wider">{value}</div>
  </div>
);

// --- SEQUENCE STEP ---

const SequenceStep = ({ num, title, status, active }: any) => (
  <div className={cn(
    "flex items-center gap-4 p-3 border",
    active ? "border-[#00FF41] bg-[#00FF41]/10" : "border-[#00FF41]/20"
  )}>
    <div className={cn(
      "text-xs font-bold w-6 h-6 flex items-center justify-center border",
      active ? "border-[#00FF41] text-[#00FF41]" : "border-[#008F11] text-[#008F11]"
    )}>
      {num}
    </div>
    <div className="flex-1">
      <div className={cn("text-sm", active ? "text-[#00FF41]" : "text-[#008F11]")}>{title}</div>
    </div>
    <div className={cn(
      "text-[10px] tracking-widest",
      status === 'DONE' ? "text-[#008F11]" : active ? "text-[#00FF41] animate-pulse" : "text-[#008F11]/50"
    )}>
      [{status}]
    </div>
  </div>
);
