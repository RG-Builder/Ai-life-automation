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
  Square
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';

// --- ELITE THEME COMPONENTS ---

export const EliteTheme: React.FC = () => {
  const [activeTab, setActiveTab] = useState('core');

  return (
    <div className="min-h-screen bg-black text-[#00FF41] font-mono selection:bg-[#00FF41]/30 flex flex-col relative overflow-hidden">
      {/* Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 opacity-20"></div>
      
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex justify-between items-start sticky top-0 bg-black/90 backdrop-blur-md z-40 border-b border-[#00FF41]/20">
        <div>
          <h1 className="font-bold text-lg tracking-widest flex items-center gap-2">
            <Terminal size={18} />
            SYS.ADMIN
          </h1>
          <div className="text-[10px] text-[#008F11] mt-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00FF41] rounded-full animate-pulse"></span>
            UPLINK_SECURE // ID: 894.22.1
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs border border-[#00FF41]/30 px-2 py-1 bg-[#00FF41]/10">
            v4.2.0
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 pb-32 relative z-30">
        <AnimatePresence mode="wait">
          {activeTab === 'core' && <CoreScreen key="core" />}
          {activeTab === 'logic' && <LogicScreen key="logic" />}
          {activeTab === 'pilot' && <PilotScreen key="pilot" />}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-[#00FF41]/30 pb-safe pt-4 px-6 z-40">
        <div className="flex justify-between items-center mb-6 max-w-sm mx-auto">
          <NavItem id="core" label="[CORE]" active={activeTab === 'core'} onClick={() => setActiveTab('core')} />
          <NavItem id="logic" label="[LOGIC]" active={activeTab === 'logic'} onClick={() => setActiveTab('logic')} />
          <NavItem id="pilot" label="[PILOT]" active={activeTab === 'pilot'} onClick={() => setActiveTab('pilot')} />
        </div>
      </nav>
    </div>
  );
};

const NavItem = ({ id, label, active, onClick }: { id: string, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "text-xs font-bold tracking-widest transition-all duration-200 px-3 py-2 border border-transparent",
      active ? "text-[#00FF41] border-[#00FF41]/50 bg-[#00FF41]/10 shadow-[0_0_10px_rgba(0,255,65,0.2)]" : "text-[#008F11] hover:text-[#00FF41] hover:border-[#00FF41]/20"
    )}
  >
    {label}
  </button>
);

// --- SCREENS ---

const CoreScreen = () => {
  const { tasks, currentFocusTask, completeTask, setFocusTask, lifeScore } = useAppContext();
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

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
        <StatBox title="SYS_SCORE" value={lifeScore.toString()} icon={<Activity size={16} />} />
        <StatBox title="COMPLETION_RATE" value={`${tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%`} icon={<Wifi size={16} />} />
      </div>

      <div className="border border-[#00FF41]/30 p-4 relative">
        <div className="text-[10px] text-[#008F11] mb-4 uppercase tracking-widest flex items-center justify-between">
          <span>Task_Queue</span>
          <span>{pendingTasks.length} ITEMS</span>
        </div>
        
        <div className="space-y-3">
          {pendingTasks.map(task => (
            <div 
              key={task.id} 
              className={cn(
                "flex items-start gap-3 p-2 border transition-colors cursor-pointer",
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
            </div>
          ))}
          {pendingTasks.length === 0 && (
            <div className="text-center text-[#008F11] text-xs py-4">QUEUE_EMPTY</div>
          )}
        </div>
      </div>

      <div className="border border-[#00FF41]/30 p-4 relative">
        <div className="text-[10px] text-[#008F11] mb-2 uppercase tracking-widest">Terminal Input</div>
        <div className="flex items-center gap-2">
          <span className="text-[#00FF41] animate-pulse">_</span>
          <input 
            type="text" 
            className="bg-transparent border-none outline-none text-[#00FF41] w-full text-sm placeholder-[#008F11]"
            placeholder="Enter command (e.g., add task)..."
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button className="text-[10px] bg-[#00FF41]/20 border border-[#00FF41]/50 px-4 py-1.5 hover:bg-[#00FF41]/40 transition-colors uppercase tracking-widest">
            Execute
          </button>
        </div>
      </div>

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
  const { streak, schedule } = useAppContext();
  
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
        <div className="text-[10px] text-[#008F11] mb-3 uppercase tracking-widest">ACTIVE_DRIVERS</div>
        <div className="space-y-2">
          <DriverItem name="Focus_Engine_v2" status="RUNNING" mem="14.2MB" />
          <DriverItem name="Habit_Tracker_Daemon" status="RUNNING" mem="8.1MB" />
          <DriverItem name="Distraction_Blocker" status="STANDBY" mem="2.4MB" />
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

      <div className="border border-[#00FF41]/30 p-4 bg-[#00FF41]/5">
        <div className="flex justify-between items-center mb-4">
          <div className="text-[10px] text-[#008F11] uppercase tracking-widest flex items-center gap-2">
            <Radio size={12} /> SIGNAL_STREAMS
          </div>
          <div className="text-[10px] border border-[#00FF41]/50 px-2 py-0.5 bg-[#00FF41]/20">LIVE</div>
        </div>
        
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-[#008F11]">Alpha_Wave:</span>
            <span>42.8 Hz</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#008F11]">Theta_State:</span>
            <span>14.1 Hz</span>
          </div>
          <div className="w-full h-1 bg-[#00FF41]/20 mt-2">
            <div className="h-full bg-[#00FF41] w-[65%]"></div>
          </div>
        </div>
      </div>

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
  const { currentFocusTask, schedule } = useAppContext();
  
  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="space-y-6 pt-6">
      
      <div className="text-center border-b border-[#00FF41]/30 pb-4">
        <h2 className="text-xl tracking-widest uppercase mb-1">CORE_DEPLOYMENT</h2>
        <div className="text-[10px] text-[#008F11] animate-pulse">
          {currentFocusTask ? `EXECUTING: ${currentFocusTask.title}` : 'AWAITING_EXECUTION_SEQUENCE'}
        </div>
      </div>

      <div className="space-y-4">
        {schedule.slice(0, 4).map((item, index) => {
          let status = 'PENDING';
          let active = false;
          if (index === 0) status = 'DONE';
          if (index === 1) {
            status = 'IN_PROGRESS';
            active = true;
          }
          
          return (
            <SequenceStep 
              key={item.id}
              num={`0${index + 1}`} 
              title={item.title} 
              status={status} 
              active={active} 
            />
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

      <button className="w-full border-2 border-[#00FF41] bg-[#00FF41]/10 text-[#00FF41] py-4 uppercase tracking-widest font-bold hover:bg-[#00FF41] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(0,255,65,0.3)] flex items-center justify-center gap-2 mt-8">
        <Zap size={18} />
        INITIATE_SEQUENCE
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
