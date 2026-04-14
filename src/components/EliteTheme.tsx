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
import { TaskModal } from './TaskModal';
import { HabitModal } from './HabitModal';
import { Mission, Habit } from '../types';
import { THEME_CONFIG } from '../config/theme.config';

// --- ELITE THEME COMPONENTS ---

export const EliteTheme: React.FC = () => {
  const { firebaseUser } = useAuth();
  const { error, setError, activeTab, setActiveTab } = useAppContext();
  const theme = THEME_CONFIG.ELITE;

  return (
    <div 
      className="min-h-screen font-mono selection:bg-[#00FF41]/30 flex flex-col relative overflow-hidden"
      style={{ backgroundColor: theme.COLORS.BACKGROUND, color: theme.COLORS.TEXT_MAIN }}
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
            <div className="border rounded-none p-4 shadow-[0_0_20px_rgba(0,255,65,0.2)] flex items-center gap-3" style={{ backgroundColor: theme.COLORS.BACKGROUND, borderColor: `${theme.COLORS.PRIMARY}80` }}>
              <AlertCircle className="shrink-0" size={20} style={{ color: theme.COLORS.DANGER }} />
              <p className="text-xs flex-1 uppercase tracking-widest" style={{ color: theme.COLORS.TEXT_MAIN }}>{error}</p>
              <button onClick={() => setError(null)} className="hover:text-[#00FF41]" style={{ color: theme.COLORS.TEXT_MUTED }}>
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header 
        className="px-6 pt-12 pb-4 flex justify-between items-start sticky top-0 backdrop-blur-md z-40 border-b"
        style={{ backgroundColor: `${theme.COLORS.BACKGROUND}E6`, borderColor: `${theme.COLORS.PRIMARY}33` }}
      >
        <div>
          <h1 className="font-bold text-lg tracking-widest flex items-center gap-2">
            <Terminal size={18} />
            {firebaseUser?.displayName?.toUpperCase().replace(' ', '_') || 'SYS.ADMIN'}
          </h1>
          <div className="text-[10px] mt-1 flex items-center gap-2" style={{ color: theme.COLORS.TEXT_MUTED }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.COLORS.PRIMARY }}></span>
            UPLINK_SECURE // ID: {firebaseUser?.uid.slice(0, 8) || '894.22.1'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs border px-2 py-1" style={{ borderColor: `${theme.COLORS.PRIMARY}4D`, backgroundColor: `${theme.COLORS.PRIMARY}1A` }}>
            v4.2.0
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 pb-32 relative z-30">
        <AnimatePresence mode="wait">
          {activeTab === 'focus' && <CoreScreen key="focus" />}
          {activeTab === 'habits' && <LogicScreen key="habits" />}
          {activeTab === 'tasks' && <PilotScreen key="tasks" />}
          {activeTab === 'insights' && <SystemScreen key="insights" />}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav 
        className="fixed bottom-0 left-0 right-0 border-t pb-safe pt-4 px-6 z-40"
        style={{ backgroundColor: theme.COLORS.BACKGROUND, borderColor: `${theme.COLORS.PRIMARY}4D` }}
      >
        <div className="flex justify-between items-center mb-6 max-w-sm mx-auto">
          <NavItem id="focus" label={theme.LABELS.NAV.focus} active={activeTab === 'focus'} onClick={() => setActiveTab('focus')} />
          <NavItem id="habits" label={theme.LABELS.NAV.habits} active={activeTab === 'habits'} onClick={() => setActiveTab('habits')} />
          <NavItem id="tasks" label={theme.LABELS.NAV.tasks} active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
          <NavItem id="insights" label={theme.LABELS.NAV.insights} active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} />
        </div>
      </nav>
    </div>
  );
};

const NavItem = ({ id, label, active, onClick }: { id: string, label: string, active: boolean, onClick: () => void }) => {
  const theme = THEME_CONFIG.ELITE;
  return (
    <button 
      onClick={onClick}
      className={cn(
        "text-xs font-bold tracking-widest transition-all duration-200 px-3 py-2 border border-transparent"
      )}
      style={active ? { color: theme.COLORS.PRIMARY, borderColor: `${theme.COLORS.PRIMARY}80`, backgroundColor: `${theme.COLORS.PRIMARY}1A`, boxShadow: `0 0 10px ${theme.COLORS.PRIMARY}33` } : { color: theme.COLORS.TEXT_MUTED }}
    >
      {label}
    </button>
  );
};

// --- SCREENS ---

const CoreScreen = () => {
  const { tasks, currentFocusTask, completeTask, setFocusTask, lifeScore, addTask, deleteTask } = useAppContext();
  const [command, setCommand] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Mission | null>(null);
  
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const handleEditTask = (task: Mission) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleAddTask = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    
    if (command.toLowerCase().startsWith('add ')) {
      const title = command.slice(4);
      addTask({
        title,
        priority: 'medium',
        duration: 30,
        category: 'work'
      });
      setCommand('');
    } else if (command.toLowerCase() === 'clear') {
      setCommand('');
    } else {
      // Unknown command
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="space-y-6 pt-6">
      
      <div className="border border-[#00FF41]/30 p-4 bg-[#00FF41]/5 relative">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00FF41]"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00FF41]"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00FF41]"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00FF41]"></div>
        
        <div className="flex items-center gap-3 mb-4 border-b border-[#00FF41]/20 pb-2">
          <Cpu size={18} className="text-[#00FF41]" />
          <h2 className="text-sm tracking-widest uppercase">THE_ARCHITECT</h2>
        </div>
        
        <div className="space-y-4 text-xs leading-relaxed">
          <div className="flex gap-2">
            <span className="text-[#008F11]">&gt;</span>
            <p>Initializing daily protocol... <span className="text-[#00FF41]">OK</span></p>
          </div>
          <div className="flex gap-2">
            <span className="text-[#008F11]">&gt;</span>
            <p>Analyzing task matrix... <span className="text-[#00FF41]">{pendingTasks.length} PENDING</span></p>
          </div>
          <div className="flex gap-2">
            <span className="text-[#008F11]">&gt;</span>
            <p>
              {currentFocusTask ? (
                <>Primary objective locked: <span className="text-[#00FF41]">{currentFocusTask.title}</span></>
              ) : (
                <>Awaiting primary objective selection.</>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatBox title="SYS_SCORE" value={Number.isNaN(lifeScore) ? '0' : lifeScore.toString()} icon={<Activity size={16} />} />
        <StatBox title="COMPLETION_RATE" value={`${tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%`} icon={<Wifi size={16} />} />
      </div>

      <div className="border border-[#00FF41]/30 p-4 relative">
        <div className="text-[10px] text-[#008F11] mb-4 uppercase tracking-widest flex items-center justify-between">
          <span>Task_Queue</span>
          <div className="flex items-center gap-4">
            <button onClick={handleAddTask} className="hover:text-[#00FF41]">
              <Plus size={12} />
            </button>
            <span>{pendingTasks.length} ITEMS</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {pendingTasks.map(task => (
            <div 
              key={task.id} 
              className={cn(
                "flex items-start gap-3 p-2 border transition-colors cursor-pointer group",
                currentFocusTask?.id === task.id ? "border-[#00FF41] bg-[#00FF41]/10" : "border-[#00FF41]/20 hover:border-[#00FF41]/50"
              )}
              onClick={() => setFocusTask(task)}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  completeTask(task.id);
                }}
                className="mt-0.5 text-[#008F11] hover:text-[#00FF41]"
              >
                <Square size={14} />
              </button>
              <div className="flex-1">
                <div className={cn("text-sm", currentFocusTask?.id === task.id ? "text-[#00FF41]" : "text-[#008F11]")}>
                  {task.title}
                </div>
                {task.priority === 'high' && (
                  <div className="text-[10px] text-red-500 mt-1">PRIORITY: CRITICAL</div>
                )}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleEditTask(task); }}
                  className="text-blue-500/50 hover:text-blue-500"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); if(confirm('Delete objective?')) deleteTask(task.id); }}
                  className="text-red-500/50 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {pendingTasks.length === 0 && (
            <div className="text-center text-[#008F11] text-xs py-4">QUEUE_EMPTY</div>
          )}
        </div>
      </div>

      <div className="border border-[#00FF41]/30 p-4 relative">
        <div className="text-[10px] text-[#008F11] mb-2 uppercase tracking-widest">Terminal Input</div>
        <form onSubmit={handleCommand} className="flex items-center gap-2">
          <span className="text-[#00FF41] animate-pulse">_</span>
          <input 
            type="text" 
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="bg-transparent border-none outline-none text-[#00FF41] w-full text-sm placeholder-[#008F11]"
            placeholder="Enter command (e.g., add task)..."
          />
        </form>
        <div className="mt-4 flex justify-end">
          <button 
            onClick={handleCommand}
            className="text-[10px] bg-[#00FF41]/20 border border-[#00FF41]/50 px-4 py-1.5 hover:bg-[#00FF41]/40 transition-colors uppercase tracking-widest"
          >
            Execute
          </button>
        </div>
      </div>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} taskToEdit={taskToEdit} />
    </motion.div>
  );
};

const StatBox = ({ title, value, icon, alert }: any) => (
  <div className={cn("border p-3 flex flex-col gap-2", alert ? "border-red-500/50 bg-red-500/10 text-red-500" : "border-[#00FF41]/30 bg-[#00FF41]/5")}>
    <div className="flex justify-between items-center">
      {icon}
      <span className={cn("text-[10px] tracking-widest", alert ? "text-red-500" : "text-[#008F11]")}>{title}</span>
    </div>
    <div className="text-lg font-bold tracking-wider">{value}</div>
  </div>
);

const LogicScreen = () => {
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
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="space-y-6 pt-6">
      
      <div className="flex justify-between items-end border-b border-[#00FF41]/30 pb-2">
        <div>
          <h2 className="text-lg tracking-widest uppercase">NEURAL_LINK_STATUS</h2>
          <div className="text-[10px] text-[#008F11] mt-1">SYNC: STABLE // LATENCY: 12ms</div>
        </div>
        <Activity size={24} className="text-[#00FF41]" />
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="text-[10px] text-[#008F11] uppercase tracking-widest">RITUAL_DAEMONS</div>
          <button onClick={handleAddHabit} className="text-[#00FF41] hover:scale-110 transition-transform">
            <Plus size={14} />
          </button>
        </div>
        <div className="space-y-2">
          {habits.map(habit => (
            <div key={habit.id} className="flex items-center justify-between border border-[#00FF41]/20 p-3 bg-black hover:bg-[#00FF41]/10 transition-colors group">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleHabit(habit.id)}
                  className={cn("w-4 h-4 border flex items-center justify-center", habit.last_completed_at?.startsWith(new Date().toISOString().split('T')[0]) ? "bg-[#00FF41] border-[#00FF41] text-black" : "border-[#008F11] text-transparent")}
                >
                  <Check size={10} strokeWidth={4} />
                </button>
                <div className="flex flex-col">
                  <span className="text-xs">{habit.title}</span>
                  <span className="text-[8px] text-[#008F11]">{habit.streak} DAY_STREAK</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditHabit(habit)} className="text-blue-500/50 hover:text-blue-500">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => { if(confirm('Purge ritual?')) deleteHabit(habit.id); }} className="text-red-500/50 hover:text-red-500">
                    <Trash2 size={12} />
                  </button>
                </div>
                <span className="text-[#00FF41] text-[10px]">{Math.round((habit.current_count / habit.goal_count) * 100)}%</span>
              </div>
            </div>
          ))}
          {habits.length === 0 && (
            <div className="text-center text-[#008F11] text-[10px] py-4 border border-dashed border-[#00FF41]/20">
              NO_RITUALS_DETECTED
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="text-[10px] text-[#008F11] uppercase tracking-widest">MISSION_MATRIX_V4</div>
          <Crosshair size={14} className="text-[#00FF41]" />
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {[...Array(16)].map((_, i) => {
            const isActive = i < streak;
            return (
              <div key={i} className={cn(
                "aspect-square border flex items-center justify-center text-[10px]",
                isActive ? "border-[#00FF41] bg-[#00FF41]/20 shadow-[0_0_8px_rgba(0,255,65,0.4)] text-[#00FF41]" : "border-[#00FF41]/20 bg-[#00FF41]/5 text-[#008F11]"
              )}>
                {i.toString(16).toUpperCase().padStart(2, '0')}
              </div>
            );
          })}
        </div>
      </div>

      <HabitModal isOpen={isHabitModalOpen} onClose={() => setIsHabitModalOpen(false)} habitToEdit={habitToEdit} />
    </motion.div>
  );
};

const DriverItem = ({ name, status, mem }: any) => (
  <div className="flex items-center justify-between border border-[#00FF41]/20 p-2 bg-black hover:bg-[#00FF41]/10 transition-colors cursor-pointer">
    <div className="flex items-center gap-3">
      {status === 'RUNNING' ? <Unlock size={14} className="text-[#00FF41]" /> : <Lock size={14} className="text-[#008F11]" />}
      <span className="text-xs">{name}</span>
    </div>
    <div className="flex items-center gap-4 text-[10px]">
      <span className={status === 'RUNNING' ? "text-[#00FF41]" : "text-[#008F11]"}>{status}</span>
      <span className="text-[#008F11] w-12 text-right">{mem}</span>
    </div>
  </div>
);

const PilotScreen = () => {
  const { currentFocusTask, schedule, generateSchedule, isLoading, completeTask } = useAppContext();
  
  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="space-y-6 pt-6">
      
      <div className="text-center border-b border-[#00FF41]/30 pb-4">
        <h2 className="text-xl tracking-widest uppercase mb-1">CORE_DEPLOYMENT</h2>
        <div className="text-[10px] text-[#008F11] animate-pulse">
          {currentFocusTask ? `EXECUTING: ${currentFocusTask.title}` : 'AWAITING_EXECUTION_SEQUENCE'}
        </div>
      </div>

      <div className="space-y-4">
        {schedule.slice(0, 6).map((item, index) => {
          const status = item.status === 'completed' ? 'DONE' : item.status === 'in-progress' ? 'IN_PROGRESS' : 'PENDING';
          const active = item.status === 'in-progress';
          
          return (
            <div key={item.id} className="relative">
              <SequenceStep 
                num={`0${index + 1}`} 
                title={item.title} 
                status={status} 
                active={active} 
              />
              {active && (
                <button 
                  onClick={() => completeTask(item.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-[#00FF41]/20 border border-[#00FF41]/50 px-2 py-1 hover:bg-[#00FF41]/40"
                >
                  COMPLETE
                </button>
              )}
            </div>
          );
        })}
        {schedule.length === 0 && (
          <div className="text-center text-[#008F11] text-xs py-4">NO_SEQUENCE_FOUND</div>
        )}
      </div>

      <div className="border border-[#00FF41]/30 p-4 mt-8">
        <div className="text-[10px] text-[#008F11] mb-4 uppercase tracking-widest flex items-center gap-2">
          <Database size={12} /> SYSTEM_RESOURCES
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span>CPU_ALLOCATION</span>
              <span>88%</span>
            </div>
            <div className="h-1.5 bg-[#00FF41]/20">
              <div className="h-full bg-[#00FF41] w-[88%] shadow-[0_0_5px_#00FF41]"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span>MEM_BUFFER</span>
              <span>45%</span>
            </div>
            <div className="h-1.5 bg-[#00FF41]/20">
              <div className="h-full bg-[#00FF41] w-[45%]"></div>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={generateSchedule}
        disabled={isLoading}
        className="w-full border-2 border-[#00FF41] bg-[#00FF41]/10 text-[#00FF41] py-4 uppercase tracking-widest font-bold hover:bg-[#00FF41] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(0,255,65,0.3)] flex items-center justify-center gap-2 mt-8 disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
        {isLoading ? 'GENERATING...' : 'INITIATE_SEQUENCE'}
      </button>

    </motion.div>
  );
};

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

const SystemScreen = () => {
  const theme = THEME_CONFIG.ELITE;
  const { lifeScore, streak } = useAppContext();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: `${theme.COLORS.PRIMARY}4D` }}>
        <h2 className="text-sm font-bold tracking-widest uppercase">System Diagnostics</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4 flex flex-col items-center justify-center text-center" style={{ borderColor: `${theme.COLORS.PRIMARY}4D`, backgroundColor: `${theme.COLORS.PRIMARY}0A` }}>
          <Activity size={24} style={{ color: theme.COLORS.PRIMARY }} className="mb-2" />
          <div className="text-2xl font-bold">{lifeScore}</div>
          <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: theme.COLORS.TEXT_MUTED }}>System Integrity</div>
        </div>
        <div className="border p-4 flex flex-col items-center justify-center text-center" style={{ borderColor: `${theme.COLORS.PRIMARY}4D`, backgroundColor: `${theme.COLORS.PRIMARY}0A` }}>
          <Zap size={24} style={{ color: theme.COLORS.PRIMARY }} className="mb-2" />
          <div className="text-2xl font-bold">{streak}</div>
          <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: theme.COLORS.TEXT_MUTED }}>Uptime (Days)</div>
        </div>
      </div>

      <div className="border p-4" style={{ borderColor: `${theme.COLORS.PRIMARY}4D` }}>
        <h3 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: theme.COLORS.PRIMARY }}>AI Analysis</h3>
        <p className="text-sm leading-relaxed" style={{ color: theme.COLORS.TEXT_MUTED }}>
          System operating within acceptable parameters. Efficiency is optimal. Continue executing core logic protocols to maintain integrity.
        </p>
      </div>
    </motion.div>
  );
};
