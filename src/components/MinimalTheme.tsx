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
  Edit3,
  Plus,
  Send,
  MoreVertical,
  Sparkles,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';

// --- MINIMAL THEME COMPONENTS ---

export const MinimalTheme: React.FC = () => {
  const [activeTab, setActiveTab] = useState('focus');

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans selection:bg-gray-200 flex flex-col">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-center sticky top-0 bg-[#F9FAFB]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-8 h-8 rounded-full object-cover" />
          <h1 className="font-bold text-lg leading-tight tracking-tight">
            {activeTab === 'focus' ? 'Focus' : 'LifePilot AI'}
          </h1>
        </div>
        <button className="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors">
          <Settings size={22} fill="currentColor" className="text-gray-700" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'focus' && <FocusScreen key="focus" />}
          {activeTab === 'habits' && <HabitsScreen key="habits" />}
          {activeTab === 'tasks' && <TasksScreen key="tasks" />}
          {activeTab === 'insights' && <InsightsScreen key="insights" />}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#F9FAFB] border-t border-gray-100 pb-safe pt-3 px-6 z-50">
        <div className="flex justify-between items-center mb-4 max-w-sm mx-auto">
          <NavItem id="focus" icon={<Target size={22} />} label="FOCUS" active={activeTab === 'focus'} onClick={() => setActiveTab('focus')} />
          <NavItem id="habits" icon={<RefreshCw size={22} />} label="HABITS" active={activeTab === 'habits'} onClick={() => setActiveTab('habits')} />
          <NavItem id="tasks" icon={<ClipboardList size={22} />} label="TASKS" active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
          <NavItem id="insights" icon={<BarChart2 size={22} />} label="INSIGHTS" active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} />
        </div>
      </nav>
    </div>
  );
};

const NavItem = ({ id, icon, label, active, onClick }: { id: string, icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center w-16 gap-1.5 transition-colors duration-200",
      active ? "text-[#405C4A]" : "text-gray-400 hover:text-gray-600"
    )}
  >
    {icon}
    <span className="text-[9px] font-bold tracking-wider">{label}</span>
  </button>
);

// --- SCREENS ---

const FocusScreen = () => {
  const { tasks, completedTasks, currentFocusTask, setFocusTask, schedule } = useAppContext();
  
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const nextTasks = schedule.filter(s => !s.completed).slice(0, 3);
  
  const focusTimeHours = 4.2;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10 pt-4">
      
      {/* Top Stats */}
      <div className="flex items-start justify-between">
        <div className="flex gap-8">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-gray-500 mb-1 uppercase">Tasks<br/>Completed</div>
            <div className="text-3xl font-bold text-[#405C4A]">{completedTasks.length}<span className="text-lg text-gray-400 font-normal"> / {tasks.length}</span></div>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider text-gray-500 mb-1 uppercase">Focus<br/>Time</div>
            <div className="text-3xl font-bold text-[#405C4A]">{focusTimeHours}<span className="text-lg text-gray-400 font-normal"> hrs</span></div>
          </div>
        </div>
        <div className="bg-[#E5F3E8] text-[#2E4536] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
          AI<br/>Optimized
        </div>
      </div>

      {/* Current Mission */}
      <div>
        <h2 className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-4">Current Mission</h2>
        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="bg-[#E5F3E8] text-[#2E4536] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider inline-block mb-6">
            Priority Alpha
          </div>
          <h3 className="text-4xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
            {currentFocusTask ? currentFocusTask.title : 'Deep work: Refine Q4 Strategic Architecture'}
          </h3>
          <p className="text-gray-500 text-lg leading-relaxed mb-8">
            The Pilot suggests focusing on the core narrative before diving into technical specifications. You have 90 minutes of peak cognitive window remaining.
          </p>
          
          <div className="flex gap-4">
            <button className="bg-[#405C4A] text-white px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-[#2E4536] transition-colors">
              Begin Deep Session
            </button>
            <button className="bg-white border border-gray-200 text-gray-700 px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
              Delegate
            </button>
          </div>
        </div>
      </div>

      {/* Next Up */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Next Up</h2>
          <button className="text-xs font-semibold text-gray-600">View Calendar</button>
        </div>
        
        <div className="space-y-3">
          {nextTasks.map((task, i) => (
            <TaskItem 
              key={task.id} 
              title={task.title} 
              time={`${task.startTime} — ${task.endTime}`} 
              icon={i === 0 ? <Mail size={18} /> : i === 1 ? <Dumbbell size={18} /> : <BrainCircuit size={18} />} 
            />
          ))}
          {nextTasks.length === 0 && (
            <div className="border border-dashed border-gray-200 rounded-2xl p-6 text-center">
              <p className="text-sm text-gray-400 italic">No further commitments scheduled</p>
            </div>
          )}
        </div>
      </div>

      {/* Morning Routine */}
      <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-[32px] p-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-5">
          <Sparkles size={200} />
        </div>
        <h2 className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-2 relative z-10">Morning Routine</h2>
        <h3 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">Clarity achieved.</h3>
        <p className="text-gray-600 text-sm leading-relaxed relative z-10">
          Your biometric data shows 15% better focus today after your extended mindfulness session.
        </p>
      </div>

      {/* Pilot Insights */}
      <div className="bg-[#E5F3E8] rounded-[32px] p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Pilot Insights</h3>
        <p className="text-[#405C4A] text-base leading-relaxed mb-6">
          You are currently in a "Deep Work" streak of {useAppContext().streak} days. Based on your current output, we can safely reschedule Friday's sprint to give you an afternoon of creative decompression.
        </p>
        <button className="text-[#2E4536] font-bold text-sm flex items-center gap-2 hover:opacity-80 transition-opacity">
          Explore Schedule Optimization <span className="text-lg">→</span>
        </button>
      </div>

    </motion.div>
  );
};

const TaskItem = ({ title, time, icon }: any) => (
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

const RoutineItem = ({ checked, title, duration }: any) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      {checked ? (
        <CheckCircle2 size={20} className="text-gray-900" />
      ) : (
        <Circle size={20} className="text-gray-300" />
      )}
      <span className={cn("text-sm font-medium", checked ? "text-gray-900 line-through decoration-gray-300" : "text-gray-600")}>{title}</span>
    </div>
    <span className="text-xs text-gray-400">{duration}</span>
  </div>
);

const HabitsScreen = () => {
  const { streak } = useAppContext();
  
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 pt-4">
      
      <div>
        <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">Steady Progress.</h2>
        <p className="text-gray-500 text-lg leading-relaxed">
          Consistency is the bridge between goals and accomplishment. Here is your sanctuary for ritual and growth.
        </p>
      </div>

      {/* Weekly Momentum */}
      <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="bg-[#E5F3E8] text-[#2E4536] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider inline-block mb-4">
          Weekly Momentum
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-8">92% Completion</h3>
        
        <div className="flex justify-between items-end h-32 gap-2">
          <div className="flex-1 bg-[#E5F3E8] rounded-t-xl h-[40%]"></div>
          <div className="flex-1 bg-[#E5F3E8] rounded-t-xl h-[60%]"></div>
          <div className="flex-1 bg-[#E5F3E8] rounded-t-xl h-[50%]"></div>
          <div className="flex-1 bg-[#E5F3E8] rounded-t-xl h-[70%]"></div>
          <div className="flex-1 bg-[#405C4A] rounded-t-xl h-[90%]"></div>
          <div className="flex-1 bg-gray-100 rounded-t-xl h-[10%]"></div>
          <div className="flex-1 bg-gray-100 rounded-t-xl h-[10%]"></div>
        </div>
      </div>

      {/* Day Streak */}
      <div className="bg-[#405C4A] rounded-[32px] p-8 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="relative z-10 flex flex-col items-center">
          <Flame size={32} className="mb-2" />
          <div className="text-6xl font-bold mb-2">{streak}</div>
          <div className="text-[10px] font-bold tracking-widest uppercase mb-6 opacity-80">Day Streak</div>
          <p className="text-sm italic opacity-90">
            "The secret of your future is hidden in your daily routine."
          </p>
        </div>
      </div>

      {/* Active Rituals */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Active Rituals</h3>
          <button className="text-xs font-semibold text-gray-600 flex items-center gap-1">
            <Plus size={14} /> New Habit
          </button>
        </div>
        
        <div className="space-y-4">
          <RitualItem 
            icon={<Droplet size={20} />} 
            title="Hydration Ritual" 
            target="Target: 3.0L daily" 
            streak={24} 
            progress={60} 
            checked={false} 
          />
          <RitualItem 
            icon={<BrainCircuit size={20} />} 
            title="Morning Stillness" 
            target="10 min meditation" 
            streak={8} 
            progress={100} 
            checked={true} 
          />
          <RitualItem 
            icon={<BookOpen size={20} />} 
            title="Deep Reading" 
            target="20 pages daily" 
            streak={0} 
            progress={0} 
            checked={false} 
          />
        </div>
      </div>

      {/* Daily Reflection */}
      <div className="bg-[#F9FAFB] rounded-[32px] p-8 relative">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Daily Reflection</h3>
        <p className="text-gray-500 text-sm italic mb-6">
          "How did today's actions align with your vision of who you want to become?"
        </p>
        <textarea 
          className="w-full bg-white border border-gray-100 rounded-2xl p-6 text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#405C4A]/20 transition-all shadow-sm"
          rows={4}
          placeholder="Capture your thoughts..."
        ></textarea>
        <div className="flex gap-4 mt-6">
          <button className="bg-[#405C4A] text-white px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-[#2E4536] transition-colors">
            Complete Day
          </button>
          <button className="bg-white border border-gray-200 text-gray-700 px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
            Save Draft
          </button>
        </div>
        
        <button className="absolute -bottom-6 -right-2 w-14 h-14 bg-[#405C4A] text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
          <Edit3 size={24} />
        </button>
      </div>

    </motion.div>
  );
};

const RitualItem = ({ icon, title, target, streak, progress, checked }: any) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center gap-6">
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
          <div className="h-full bg-[#405C4A] rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
    <button className={cn(
      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-colors",
      checked ? "bg-[#E5F3E8] border-[#E5F3E8] text-[#405C4A]" : "bg-white border-gray-100 text-gray-300"
    )}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </button>
  </div>
);

const TasksScreen = () => {
  const { schedule, generateSchedule } = useAppContext();
  
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 pt-4 relative min-h-[calc(100vh-180px)]">
      
      <div>
        <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2">{dateString}</div>
        <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">Your Optimal Architecture</h2>
        <div className="bg-[#E5F3E8] text-[#2E4536] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider inline-block">
          AI Optimized Schedule
        </div>
      </div>

      <div className="relative before:absolute before:left-[4.5rem] before:top-2 before:bottom-2 before:w-px before:bg-gray-200 space-y-8">
        
        {schedule.map((item, index) => (
          <TimelineItem 
            key={item.id}
            time={item.startTime} 
            title={item.title} 
            meta={`${item.type} • ${item.duration}`}
            badge={item.type === 'deep-work' ? 'Deep Work' : undefined}
            description={item.type === 'deep-work' ? "High-cognitive demand block. Mobile notifications silenced." : undefined}
            avatars={item.type === 'meeting'}
            active={index === 1} // Just highlighting the second one for demo
          />
        ))}

        {schedule.length === 0 && (
          <div className="pl-24 text-gray-500 italic">No schedule generated yet.</div>
        )}

      </div>

      <button 
        onClick={generateSchedule}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#405C4A] text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-50"
      >
        <Plus size={24} />
      </button>

    </motion.div>
  );
};

const TimelineItem = ({ time, title, meta, badge, description, avatars, active }: any) => (
  <div className="relative flex gap-6">
    <div className="w-12 text-right pt-1 shrink-0">
      <div className="text-xs font-bold text-gray-500">{time.split(' ')[0]}</div>
      <div className="text-[9px] font-bold text-gray-400">{time.split(' ')[1]}</div>
    </div>
    
    <div className="relative pt-1 flex-1">
      <div className={cn(
        "absolute -left-[1.6rem] top-2 w-3 h-3 rounded-full border-2 border-[#F9FAFB]", 
        active ? "bg-[#405C4A] ring-4 ring-[#E5F3E8]" : "bg-gray-300"
      )}></div>
      
      <div className={cn("rounded-[24px] p-6", active ? "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]" : "")}>
        {badge && (
          <div className="bg-[#E5F3E8] text-[#2E4536] text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider inline-block mb-3">
            {badge}
          </div>
        )}
        <h4 className={cn("font-bold text-lg mb-1", active ? "text-gray-900" : "text-gray-700")}>{title}</h4>
        
        {meta && <div className="text-sm text-gray-500">{meta}</div>}
        
        {description && (
          <p className="text-sm text-gray-500 leading-relaxed mt-2">{description}</p>
        )}
        
        {avatars && (
          <div className="flex items-center mt-4">
            <div className="flex -space-x-2">
              <img src="https://i.pravatar.cc/150?img=32" className="w-8 h-8 rounded-full border-2 border-white" alt="Avatar" />
              <img src="https://i.pravatar.cc/150?img=12" className="w-8 h-8 rounded-full border-2 border-white" alt="Avatar" />
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                +2
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

const InsightsScreen = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-4 flex flex-col min-h-[calc(100vh-180px)]">
    
    <div className="mb-8">
      <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">Good evening, Marcus</h2>
      <p className="text-gray-500 text-lg leading-relaxed">
        Your AI Architect is ready to structure your intent.
      </p>
    </div>

    <div className="flex-1 space-y-8 pb-32">
      {/* AI Message 1 */}
      <div className="flex gap-4">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-[#405C4A]">
          <Sparkles size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">AI Architect</span>
            <span className="text-xs text-gray-400">18:42</span>
          </div>
          <div className="bg-white p-5 rounded-2xl rounded-tl-none text-[15px] text-gray-700 leading-relaxed shadow-sm">
            Welcome back to your Sanctuary. I've analyzed your cognitive load from today's sessions. You seem to have high momentum in the "Strategy" quadrant but your "Rest" metric is dipping. How shall we balance your evening?
          </div>
        </div>
      </div>

      {/* User Message */}
      <div className="flex gap-4 flex-row-reverse">
        <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-10 h-10 rounded-full object-cover shrink-0 shadow-sm" />
        <div className="flex-1 flex flex-col items-end">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs text-gray-400">18:43</span>
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">You</span>
          </div>
          <div className="bg-[#405C4A] text-white p-5 rounded-2xl rounded-tr-none text-[15px] leading-relaxed shadow-sm max-w-[90%]">
            I want to wrap up the quarterly review by 8 PM so I can actually disconnect. Can you help me prioritize the remaining three sections?
          </div>
        </div>
      </div>

      {/* AI Message 2 with Insight Card */}
      <div className="flex gap-4">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-[#405C4A]">
          <Sparkles size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">AI Architect</span>
            <span className="text-xs text-gray-400">18:45</span>
          </div>
          
          <div className="bg-[#F9FAFB] border border-gray-100 p-6 rounded-3xl mb-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#E5F3E8] text-[#2E4536] text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                AI Insight
              </div>
              <span className="font-bold text-gray-900">Optimization Path</span>
            </div>
            <p className="text-[15px] text-gray-700 leading-relaxed mb-6">
              Based on your peak performance hours, I suggest focusing on the Financial Projections first while your analytical focus is high. We can automate the Team Acknowledgments section.
            </p>
            <div className="mb-2 flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>Progress Target</span>
              <span className="text-[#405C4A]">67% Complete</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#405C4A] rounded-full" style={{ width: '67%' }}></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl rounded-tl-none text-[15px] text-gray-700 leading-relaxed shadow-sm">
            I've drafted a streamlined outline for the Financials. Shall we review it together, or would you like me to sync your focus mode with your workspace environment?
          </div>
        </div>
      </div>
    </div>

    {/* Input Area */}
    <div className="fixed bottom-[72px] left-0 right-0 bg-gradient-to-t from-[#F9FAFB] via-[#F9FAFB] to-transparent pt-10 pb-4 px-6 z-40">
      <div className="max-w-sm mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm hover:bg-gray-50 transition-colors">
            Optimise my evening
          </button>
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm hover:bg-gray-50 transition-colors">
            Review today's goals
          </button>
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm hover:bg-gray-50 transition-colors">
            Enter deep focus
          </button>
        </div>
        
        <div className="relative flex items-center">
          <button className="absolute left-4 w-8 h-8 bg-[#E5F3E8] text-[#405C4A] rounded-full flex items-center justify-center hover:scale-105 transition-transform z-10">
            <Plus size={18} />
          </button>
          <input 
            type="text" 
            placeholder="Design your intent..." 
            className="w-full bg-white border border-gray-200 rounded-full py-4 pl-16 pr-14 text-base focus:outline-none focus:ring-2 focus:ring-[#405C4A]/20 transition-all shadow-sm"
          />
          <button className="absolute right-4 w-8 h-8 bg-[#405C4A] text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform z-10">
            <Send size={14} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>

  </motion.div>
);
