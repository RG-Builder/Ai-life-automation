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

import { Dashboard } from './views/Dashboard';

// --- GAMIFIED THEME COMPONENTS ---

export const GamifiedTheme: React.FC = () => {
  const { firebaseUser } = useAuth();
  const { error, setError, activeTab, setActiveTab } = useAppContext();
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
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.colors.text_secondary }}>Level 14 Explorer</p>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center relative" style={{ color: theme.colors.primary }}>
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full border border-white" style={{ backgroundColor: theme.colors.accent }}></div>
          <BellIcon />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <Dashboard key="home" />}
          {activeTab === 'tasks' && <MissionsScreen key="tasks" />}
          {activeTab === 'habits' && <StreaksScreen key="habits" />}
          {activeTab === 'schedule' && <ScheduleScreen key="schedule" />}
          {activeTab === 'analytics' && <ChatScreen key="analytics" />}
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

// --- SCREENS ---

const MissionsScreen = () => {
  const { tasks, currentFocusTask, setFocusTask, completeTask, streak, deleteTask, habits } = useAppContext();
  const { firebaseUser } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Mission | null>(null);
  
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedToday = tasks.filter(t => t.status === 'completed');
  const activeHabits = habits.filter(h => h.last_completed_at?.startsWith(new Date().toISOString().split('T')[0]));

  const handleEditTask = (task: Mission) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleAddTask = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div className="flex justify-between items-end pt-2">
        <div>
          <h2 className="text-4xl font-black text-[#2C5A0D] leading-tight">Good Morning,<br/>{firebaseUser?.displayName?.split(' ')[0] || 'Captain'}! 🚀</h2>
          <p className="text-[#5C7A46] font-medium mt-2 text-sm">You have {pendingTasks.length} missions left<br/>for today.</p>
        </div>
        <div className="bg-white rounded-full py-2 px-4 shadow-sm border border-[#2C5A0D]/5 flex items-center gap-2">
          <div className="bg-[#FFEDD5] text-[#FF5A36] p-1.5 rounded-full">
            <Flame size={16} strokeWidth={3} />
          </div>
          <div>
            <div className="text-xl font-black leading-none text-[#2C5A0D]">{streak}</div>
            <div className="text-[8px] font-black text-[#8A9E7B] uppercase tracking-wider">DAY STREAK</div>
          </div>
        </div>
      </div>

      {/* Active Mission Card */}
      <div className="bg-[#2C5A0D] rounded-[32px] p-6 text-white shadow-xl shadow-[#2C5A0D]/20 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
          <Zap size={12} className="text-[#73F02D]" /> ACTIVE MISSION
        </div>
        
        {currentFocusTask ? (
          <>
            <h3 className="text-3xl font-black leading-tight mb-3">{currentFocusTask.title}</h3>
            <p className="text-[#A3C08F] text-sm font-medium mb-6 w-4/5">Focus for {currentFocusTask.duration} minutes to unlock points.</p>
            
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black tracking-widest uppercase text-[#A3C08F]">PROGRESS</span>
                <span className="text-2xl font-black text-[#73F02D]">0%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-[#73F02D] rounded-full w-0"></div>
              </div>
            </div>

            <div className="bg-[#3A7014] rounded-3xl p-4 flex flex-col items-center justify-center border border-white/10">
              <div className="text-2xl font-black text-[#73F02D] mb-1">+{currentFocusTask.priority === 'high' ? 100 : 50} XP</div>
              <div className="text-[9px] font-black tracking-widest uppercase text-[#A3C08F] mb-4">REWARD ON COMPLETION</div>
              <button 
                onClick={() => completeTask(currentFocusTask.id)}
                className="w-full bg-[#73F02D] text-[#2C5A0D] font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_0_#52B81F] active:translate-y-1 active:shadow-none transition-all"
              >
                <CheckCircle2 size={18} /> COMPLETE MISSION
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-3xl font-black leading-tight mb-3">No Active<br/>Mission</h3>
            <p className="text-[#A3C08F] text-sm font-medium mb-6 w-4/5">Select a quest below to begin your journey.</p>
            <div className="bg-[#3A7014] rounded-3xl p-4 flex flex-col items-center justify-center border border-white/10">
              <button 
                onClick={() => pendingTasks.length > 0 && setFocusTask(pendingTasks[0])}
                className="w-full bg-[#73F02D] text-[#2C5A0D] font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_0_#52B81F] active:translate-y-1 active:shadow-none transition-all"
              >
                <Play size={18} fill="currentColor" /> START NEXT QUEST
              </button>
            </div>
          </>
        )}
      </div>

      {/* Priority Quests */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black text-[#2C5A0D]">Priority Quests</h3>
          <LayoutGrid size={20} className="text-[#8A9E7B]" />
        </div>
        
        <div className="space-y-3">
          {pendingTasks.map(task => (
            <div key={task.id} className="group relative">
              <div onClick={() => setFocusTask(task)} className="cursor-pointer">
                <QuestCard 
                  icon={<CheckCircle2 size={20} />} 
                  iconBg="bg-[#FFEDD5]" 
                  iconColor="text-[#D97706]" 
                  title={task.title} 
                  desc={`Category: ${task.category} • ${task.duration}m`} 
                  tag={task.priority?.toUpperCase() || 'NORMAL'} 
                  tagColor={task.priority === 'high' ? "bg-[#FEF3C7] text-[#D97706]" : "bg-[#E2EDCE] text-[#5C7A46]"} 
                />
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleEditTask(task); }}
                  className="p-2 text-blue-400 hover:text-blue-600"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); if(confirm('Delete quest?')) deleteTask(task.id); }}
                  className="p-2 text-red-400 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {pendingTasks.length === 0 && (
            <p className="text-center text-[#5C7A46] py-4 font-bold">All quests completed! 🎉</p>
          )}
          
          <button 
            onClick={handleAddTask}
            className="w-full border-2 border-dashed border-[#A3C08F] rounded-3xl py-5 flex flex-col items-center justify-center text-[#5C7A46] hover:bg-[#A3C08F]/10 transition-colors"
          >
            <Plus size={24} className="mb-1" />
            <span className="text-[10px] font-black tracking-widest uppercase">CREATE NEW QUEST</span>
          </button>
        </div>
      </div>

      {/* Daily Wins */}
      <div className="bg-[#FFD1A9] rounded-[32px] p-6 relative overflow-hidden">
        <Trophy size={120} className="absolute -right-6 -bottom-6 text-[#FFB370] opacity-30" />
        <h3 className="text-xl font-black text-[#92400E] mb-4">Daily Wins</h3>
        <div className="space-y-3 mb-6 relative z-10">
          {completedToday.slice(0, 3).map(task => (
            <WinItem key={task.id} checked text={task.title} />
          ))}
          {activeHabits.slice(0, 2).map(habit => (
            <WinItem key={habit.id} checked text={habit.title} />
          ))}
          {completedToday.length === 0 && activeHabits.length === 0 && (
            <p className="text-[#92400E] font-bold italic text-sm">No wins yet today. Let's get started!</p>
          )}
        </div>
        <div className="bg-white/40 rounded-2xl p-4 text-center relative z-10 backdrop-blur-sm">
          <div className="text-3xl font-black text-[#92400E] leading-none mb-1">
            {completedToday.length + activeHabits.length}
          </div>
          <div className="text-[10px] font-black tracking-widest uppercase text-[#B45309]">MISSIONS COMPLETED</div>
        </div>
      </div>

      {/* Pilot Tip */}
      <div className="bg-[#E7F6D5] rounded-[32px] p-6 flex gap-4 items-start">
        <div className="bg-[#73F02D] p-3 rounded-2xl shadow-sm shrink-0">
          <Zap size={24} className="text-[#2C5A0D]" />
        </div>
        <div>
          <p className="text-[#2C5A0D] font-bold italic text-sm leading-relaxed mb-4">
            "Hey Captain! You're on a {streak} day streak. Let's keep the momentum going and crush those priority quests!"
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => pendingTasks.length > 0 && setFocusTask(pendingTasks[0])}
              className="bg-[#2C5A0D] text-white text-xs font-black px-4 py-2 rounded-xl shadow-[0_3px_0_#1A3608] active:translate-y-[3px] active:shadow-none"
            >
              YES, PILOT!
            </button>
            <button className="text-[#5C7A46] text-xs font-black px-4 py-2 uppercase tracking-wider">MAYBE LATER</button>
          </div>
        </div>
      </div>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} taskToEdit={taskToEdit} />
    </motion.div>
  );
};

const QuestCard = ({ icon, iconBg, iconColor, title, desc, tag, tagColor }: any) => (
  <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#2C5A0D]/5 flex gap-4">
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", iconBg, iconColor)}>
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-black text-[#2C5A0D] text-lg leading-tight">{title}</h4>
        <span className={cn("text-[8px] font-black px-2 py-1 rounded-md tracking-widest", tagColor)}>{tag}</span>
      </div>
      <p className="text-[#5C7A46] text-xs font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);

const WinItem = ({ checked, text }: { checked: boolean, text: string, key?: any }) => (
  <div className="flex items-center gap-3">
    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center border-2", checked ? "bg-[#92400E] border-[#92400E] text-[#FFD1A9]" : "border-[#B45309] text-transparent")}>
      <CheckCircle2 size={14} strokeWidth={3} />
    </div>
    <span className={cn("font-bold", checked ? "text-[#92400E]" : "text-[#B45309]")}>{text}</span>
  </div>
);

const ScheduleScreen = () => {
  const { schedule, generateSchedule, lifeScore, isLoading, completeTask } = useAppContext();
  
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 pt-4">
      
      {/* Header Card */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-[#2C5A0D]/5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-black text-[#2C5A0D] leading-none mb-1">Next<br/>Level</h2>
            <div className="text-[10px] font-black tracking-widest uppercase text-[#5C7A46]">LEVEL 25 ARCHITECT</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-[#D97706] leading-none">{lifeScore}<span className="text-lg text-[#B45309]">/1200</span></div>
            <div className="text-[10px] font-black tracking-widest uppercase text-[#B45309]">XP</div>
          </div>
        </div>
        <div className="h-3 bg-[#F4F9E7] rounded-full overflow-hidden mb-4">
          <div className="h-full bg-[#73F02D] rounded-full transition-all duration-500" style={{ width: `${Math.min((lifeScore / 1200) * 100, 100)}%` }}></div>
        </div>
        <p className="text-[#5C7A46] text-sm font-medium italic">"Keep completing missions to level up!"</p>
      </div>

      <div className="flex items-center justify-between text-[#2C5A0D] font-black text-xl">
        <div className="flex items-center gap-2">
          <Calendar size={24} />
          <h3>Today's Quests</h3>
        </div>
        <button 
          onClick={generateSchedule}
          disabled={isLoading}
          className="w-10 h-10 bg-[#73F02D] text-[#2C5A0D] rounded-full flex items-center justify-center shadow-md active:translate-y-1 transition-transform disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} strokeWidth={3} />}
        </button>
      </div>

      {/* Timeline */}
      <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-1 before:bg-[#E7F6D5] before:rounded-full">
        {schedule.map((item, index) => {
          const isPast = item.status === 'completed';
          const isActive = item.status === 'in-progress';
          
          if (isPast) {
            return (
              <div key={item.id} className="relative">
                <div className="absolute -left-10 top-0 w-8 h-8 bg-[#2C5A0D] rounded-full flex items-center justify-center text-white shadow-sm border-4 border-[#F4F9E7] z-10">
                  <CheckCircle2 size={16} strokeWidth={3} />
                </div>
                <div className="absolute -left-10 top-10 text-[10px] font-black text-[#2C5A0D] w-8 text-center">{item.startTime}</div>
                
                <div className="bg-white/50 rounded-3xl p-5 border border-[#2C5A0D]/5 opacity-60">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-[#A3C08F] text-white text-[10px] font-black px-2 py-1 rounded-md tracking-widest">SUCCESS</span>
                    <span className="font-black text-[#5C7A46]">+150 XP</span>
                  </div>
                  <h3 className="text-xl font-black text-[#5C7A46] line-through decoration-2 mb-1">{item.title}</h3>
                  <p className="text-[#8A9E7B] text-sm font-medium">{item.duration}m duration</p>
                </div>
              </div>
            );
          }
          
          if (isActive) {
            return (
              <div key={item.id} className="relative">
                <div className="absolute -left-10 top-0 w-8 h-8 bg-[#FF5A36] rounded-full flex items-center justify-center text-white shadow-md border-4 border-[#F4F9E7] z-10">
                  <Flame size={16} strokeWidth={3} />
                </div>
                <div className="absolute -left-10 top-10 text-[10px] font-black text-[#FF5A36] w-8 text-center">NOW</div>
                
                <div className="bg-white rounded-3xl p-5 shadow-lg shadow-[#D97706]/10 border-2 border-[#D97706] relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 w-24 h-24 bg-[#FFD1A9] rounded-tl-full -z-10 opacity-50"></div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-[#FFD1A9] text-[#92400E] text-[10px] font-black px-2 py-1 rounded-md tracking-widest">ACTIVE QUEST</span>
                    <span className="font-black text-[#D97706] text-xl">+{item.type === 'deep-work' ? 300 : 150} XP</span>
                  </div>
                  <h3 className="text-2xl font-black text-[#2C5A0D] mb-3 leading-tight w-2/3">{item.title}</h3>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#5C7A46]">{item.duration}m duration</span>
                    </div>
                    <div className="text-[#D97706] font-black flex items-center gap-1">
                      <Clock size={16} strokeWidth={3} /> {item.startTime}
                    </div>
                  </div>
                  <button 
                    onClick={() => completeTask(item.id)}
                    className="w-full bg-[#2C5A0D] text-white font-black py-4 rounded-2xl shadow-[0_4px_0_#1A3608] active:translate-y-1 active:shadow-none transition-all"
                  >
                    COMPLETE MISSION
                  </button>
                </div>
              </div>
            );
          }
          
          return (
            <div key={item.id} className="relative">
              <div className="absolute -left-10 top-0 w-8 h-8 bg-[#E7F6D5] rounded-full flex items-center justify-center text-[#5C7A46] border-4 border-[#F4F9E7] z-10">
                <Lock size={14} strokeWidth={3} />
              </div>
              <div className="absolute -left-10 top-10 text-[10px] font-black text-[#5C7A46] w-8 text-center">{item.startTime}</div>
              
              <div className="border-2 border-dashed border-[#A3C08F] rounded-3xl p-5 bg-white/30">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-[#38BDF8] text-white text-[10px] font-black px-2 py-1 rounded-md tracking-widest">SCHEDULED</span>
                  <span className="font-black text-[#38BDF8]">+{item.type === 'deep-work' ? 200 : 100} XP</span>
                </div>
                <h3 className="text-xl font-black text-[#2C5A0D] mb-1">{item.title}</h3>
                <p className="text-[#5C7A46] text-sm font-medium italic">"{item.duration}m duration"</p>
              </div>
            </div>
          );
        })}
        {schedule.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-[#E7F6D5] rounded-full flex items-center justify-center text-[#5C7A46] mb-4">
              <Calendar size={32} />
            </div>
            <p className="text-[#5C7A46] font-bold">No quests scheduled yet.</p>
            <button 
              onClick={generateSchedule}
              className="mt-4 text-[#2C5A0D] font-black text-sm underline underline-offset-4"
            >
              Generate AI Schedule
            </button>
          </div>
        )}
      </div>
      
      <button 
        onClick={generateSchedule}
        disabled={isLoading}
        className="fixed bottom-28 right-6 w-14 h-14 bg-[#92400E] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#92400E]/30 z-40 active:scale-95 transition-transform disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <Plus size={28} strokeWidth={3} />}
      </button>
    </motion.div>
  );
};

const ChatScreen = () => {
  const { firebaseUser } = useAuth();
  
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-4 flex flex-col h-[calc(100vh-180px)]">
      
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-[#38BDF8] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#38BDF8]/20 mb-4 border-4 border-white overflow-hidden">
          <img src={firebaseUser?.photoURL || "https://i.pravatar.cc/150?img=11"} alt="Pilot" className="w-full h-full object-cover" />
        </div>
        <div className="bg-[#92400E] text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase -mt-8 z-10 border-2 border-[#F4F9E7]">ARCHITECT</div>
        <h2 className="text-3xl font-black text-[#2C5A0D] mt-3">Mission Control 🚀</h2>
        <p className="text-[#5C7A46] font-medium text-sm">Ready to crush your goals today, {firebaseUser?.displayName?.split(' ')[0] || 'Captain'}?</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {/* Bot Message */}
        <div className="flex gap-3 items-end">
          <div className="w-8 h-8 bg-[#0284C7] rounded-full flex items-center justify-center text-white shrink-0 shadow-sm">
            <Zap size={16} />
          </div>
          <div className="bg-[#38BDF8] text-white p-5 rounded-[28px] rounded-bl-sm shadow-sm max-w-[85%]">
            <p className="font-medium leading-relaxed">Hey there! I'm your AI Pilot. I'm here to help you optimize your schedule and stay on track with your missions. What's on your mind?</p>
          </div>
        </div>

        {/* User Message */}
        <div className="flex gap-3 items-end justify-end">
          <div className="bg-[#2C5A0D] text-white p-5 rounded-[28px] rounded-br-sm shadow-sm max-w-[85%]">
            <p className="font-medium leading-relaxed">I'm feeling super energized today! Let's plan a big quest. ⚡</p>
          </div>
          <div className="w-8 h-8 bg-[#5C7A46] rounded-full flex items-center justify-center text-white shrink-0 shadow-sm overflow-hidden">
            <img src={firebaseUser?.photoURL || "https://i.pravatar.cc/150?img=11"} alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-auto pt-4 bg-gradient-to-t from-[#F4F9E7] via-[#F4F9E7] to-transparent">
        <button className="flex-1 bg-[#2C5A0D] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_0_#1A3608] active:translate-y-1 active:shadow-none transition-all">
          <Plus size={18} strokeWidth={3} />
          Plan my quest
        </button>
        <button className="flex-1 bg-[#92400E] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_0_#78350F] active:translate-y-1 active:shadow-none transition-all">
          <Flame size={18} strokeWidth={3} />
          Review streaks
        </button>
      </div>
    </motion.div>
  );
};

const StreaksScreen = () => {
  const { streak, habits, toggleHabit, deleteHabit } = useAppContext();
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  const handleEditHabit = (habit: Habit) => {
    setHabitToEdit(habit);
    setIsHabitModalOpen(true);
  };

  const handleAddHabit = () => {
    setHabitToEdit(null);
    setIsHabitModalOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 pt-4">
      
      {/* Hero Streak */}
      <div className="bg-[#E7F6D5] rounded-[32px] p-8 text-center relative overflow-hidden shadow-sm">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#FF5A36] text-white text-[10px] font-black px-4 py-1.5 rounded-b-xl tracking-widest uppercase shadow-sm">HERO STREAK</div>
        
        <h2 className="text-6xl font-black text-[#2C5A0D] mt-6 mb-2 flex items-baseline justify-center gap-2">
          {streak} <span className="text-4xl text-[#D97706] italic">Days</span>
        </h2>
        <p className="text-[#5C7A46] font-medium mb-8 px-4">You're on fire! Complete today's missions to unlock the <strong className="text-[#2C5A0D]">Golden Pilot</strong> badge.</p>
        
        <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-lg shadow-[#73F02D]/20 border-4 border-[#F4F9E7]">
          <Flame size={48} className="text-[#FF5A36]" strokeWidth={2.5} />
        </div>
      </div>

      {/* Weekly XP */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-[#2C5A0D]/5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-[#2C5A0D]">Weekly XP Gain</h3>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-[#2C5A0D]"></div>
            <div className="w-2 h-2 rounded-full bg-[#E7F6D5]"></div>
          </div>
        </div>
        
        <div className="flex justify-between items-end h-32 pb-6 border-b-2 border-dashed border-[#E7F6D5]">
          {/* Mock Chart Bars */}
          <div className="w-8 bg-[#E7F6D5] rounded-t-xl h-[40%]"></div>
          <div className="w-8 bg-[#E7F6D5] rounded-t-xl h-[60%]"></div>
          <div className="w-8 bg-[#E7F6D5] rounded-t-xl h-[30%]"></div>
          <div className="w-8 bg-[#2C5A0D] rounded-t-xl h-[80%] relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#2C5A0D] rounded-full"></div>
          </div>
          <div className="w-8 bg-transparent h-full"></div>
          <div className="w-8 bg-transparent h-full"></div>
          <div className="w-8 bg-transparent h-full"></div>
        </div>
        <div className="flex justify-between mt-3 px-1 text-[10px] font-black text-[#8A9E7B] uppercase tracking-widest">
          <span>MON</span><span>TUE</span><span>WED</span><span className="text-[#2C5A0D]">THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
        </div>
      </div>

      {/* Habit List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center mb-2 px-2">
          <h3 className="text-xl font-black text-[#2C5A0D]">Rituals</h3>
          <button 
            onClick={handleAddHabit}
            className="text-[#2C5A0D] hover:scale-110 transition-transform"
          >
            <Plus size={20} strokeWidth={3} />
          </button>
        </div>
        {habits.map(habit => (
          <HabitItem 
            key={habit.id}
            icon={habit.category === 'Health' ? <Dumbbell size={20} /> : habit.category === 'Mindset' ? <BookOpen size={20} /> : <Zap size={20} />} 
            title={habit.title} 
            streak={`${habit.streak} Day Streak`} 
            progress={habit.goal_count > 0 ? (habit.current_count / habit.goal_count) * 100 : 0} 
            checked={habit.last_completed_at?.startsWith(new Date().toISOString().split('T')[0]) || false}
            onToggle={() => toggleHabit(habit.id)}
            onDelete={() => { if(confirm('Delete ritual?')) deleteHabit(habit.id); }}
            onEdit={() => handleEditHabit(habit)}
          />
        ))}
        {habits.length === 0 && (
          <div className="text-center py-8 bg-white/30 rounded-3xl border-2 border-dashed border-[#A3C08F]">
            <p className="text-[#5C7A46] font-bold">No rituals added yet.</p>
            <button 
              onClick={handleAddHabit}
              className="mt-2 text-[#2C5A0D] font-black text-sm"
            >
              + Add First Ritual
            </button>
          </div>
        )}
      </div>

      <HabitModal isOpen={isHabitModalOpen} onClose={() => setIsHabitModalOpen(false)} habitToEdit={habitToEdit} />
    </motion.div>
  );
};

const HabitItem = ({ icon, title, streak, progress, checked, onToggle, onDelete, onEdit }: any) => (
  <div className="bg-[#E7F6D5] rounded-3xl p-4 flex items-center gap-4 group relative">
    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#2C5A0D] shrink-0 shadow-sm">
      {icon}
    </div>
    <div className="flex-1">
      <h4 className="font-black text-[#2C5A0D] text-lg leading-tight mb-1">{title}</h4>
      <div className="flex items-center gap-1 text-[#D97706] text-[10px] font-black tracking-widest uppercase mb-2">
        <Flame size={12} strokeWidth={3} /> {streak}
      </div>
      <div className="h-2 bg-white/50 rounded-full overflow-hidden">
        <div className="h-full bg-[#73F02D] transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={onEdit}
          className="p-1.5 text-blue-400 hover:text-blue-600"
        >
          <Edit2 size={16} />
        </button>
        <button 
          onClick={onDelete}
          className="p-1.5 text-red-400 hover:text-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <button 
        onClick={onToggle}
        className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors", checked ? "bg-[#2C5A0D] border-[#2C5A0D] text-white" : "border-[#A3C08F] text-transparent")}
      >
        <CheckCircle2 size={20} strokeWidth={3} />
      </button>
    </div>
  </div>
);

const Achievement = ({ icon, bg, color, label, locked }: any) => (
  <div className="flex flex-col items-center gap-2">
    <div className={cn("w-20 h-20 rounded-full flex items-center justify-center shadow-sm", bg, color, locked && "opacity-50 grayscale")}>
      {icon}
    </div>
    <span className={cn("text-[10px] font-black tracking-widest uppercase text-center", locked ? "text-[#A3C08F]" : "text-[#2C5A0D]")}>{label}</span>
  </div>
);
