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
import { TaskModal } from './TaskModal';
import { HabitModal } from './HabitModal';
import { Mission, Habit } from '../types';

// --- MINIMAL THEME COMPONENTS ---

export const MinimalTheme: React.FC = () => {
  const [activeTab, setActiveTab] = useState('focus');
  const { error, setError } = useAppContext();

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans selection:bg-gray-200 flex flex-col">
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
              <AlertCircle className="text-danger shrink-0" size={20} />
              <p className="text-sm text-gray-700 flex-1">{error}</p>
              <button onClick={() => setError(null)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-center sticky top-0 bg-[#F9FAFB]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <img src={useAuth().firebaseUser?.photoURL || "https://i.pravatar.cc/150?img=11"} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
          <h1 className="font-bold text-lg leading-tight tracking-tight">
            {activeTab === 'focus' ? 'Focus' : 
             activeTab === 'habits' ? 'Rituals' :
             activeTab === 'tasks' ? 'Architecture' : 'Insights'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {!useAuth().firebaseUser && (
            <div className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Demo Mode
            </div>
          )}
          <button className="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors">
            <Settings size={22} fill="currentColor" className="text-gray-700" />
          </button>
        </div>
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
  const { tasks, completedTasks, currentFocusTask, setFocusTask, schedule, completeTask } = useAppContext();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Mission | null>(null);
  
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const nextTasks = schedule.filter(s => !s.completed).slice(0, 3);

  const handleAddTask = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };
  
  // Calculate real focus time from completed tasks today
  const today = new Date().toISOString().split('T')[0];
  const focusTimeMinutes = completedTasks
    .filter(t => t.completed_at?.startsWith(today))
    .reduce((acc, t) => acc + (t.duration || 0), 0);
  const focusTimeHours = (focusTimeMinutes / 60).toFixed(1);

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
          {currentFocusTask ? (
            <>
              <div className={cn(
                "text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider inline-block mb-6",
                currentFocusTask.priority === 'high' ? "bg-danger/10 text-danger" : "bg-[#E5F3E8] text-[#2E4536]"
              )}>
                Priority {currentFocusTask.priority === 'high' ? 'Alpha' : currentFocusTask.priority === 'medium' ? 'Beta' : 'Gamma'}
              </div>
              <h3 className="text-4xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
                {currentFocusTask.title}
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                {currentFocusTask.category} • {currentFocusTask.duration} minutes estimated.
                The Pilot suggests maintaining focus on this core objective.
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => completeTask(currentFocusTask.id)}
                  className="bg-[#405C4A] text-white px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-[#2E4536] transition-colors"
                >
                  Complete Mission
                </button>
                <button 
                  onClick={() => setFocusTask(null)}
                  className="bg-white border border-gray-200 text-gray-700 px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Pause
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 italic mb-6">No active mission selected</p>
              <button 
                onClick={() => setIsTaskModalOpen(true)}
                className="bg-[#405C4A] text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all"
              >
                Initialize New Mission
              </button>
            </div>
          )}
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
              icon={task.type === 'deep-work' ? <BrainCircuit size={18} /> : task.type === 'meeting' ? <Mail size={18} /> : <Dumbbell size={18} />} 
            />
          ))}
          {nextTasks.length === 0 && (
            <div className="border border-dashed border-gray-200 rounded-2xl p-6 text-center">
              <p className="text-sm text-gray-400 italic">No further commitments scheduled</p>
            </div>
          )}
        </div>
      </div>

      {/* Pilot Insights */}
      <div className="bg-[#E5F3E8] rounded-[32px] p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Pilot Insights</h3>
        <p className="text-[#405C4A] text-base leading-relaxed mb-6">
          You are currently on a {useAppContext().streak} day streak. 
          {completedTasks.length > 0 ? 
            " Your momentum is high. Keep pushing towards your weekly objectives." : 
            " Start your first mission to build momentum for the day."}
        </p>
        <button className="text-[#2E4536] font-bold text-sm flex items-center gap-2 hover:opacity-80 transition-opacity">
          Explore Schedule Optimization <span className="text-lg">→</span>
        </button>
      </div>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
    </motion.div>
  );
};

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

const HabitsScreen = () => {
  const { streak, habits, toggleHabit, deleteHabit, habitHistory } = useAppContext();
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  
  const completionRate = habits.length > 0 
    ? Math.round((habits.filter(h => h.last_completed_at?.startsWith(new Date().toISOString().split('T')[0])).length / habits.length) * 100)
    : 0;

  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const completionData = last7Days.map(day => {
    const totalHabits = habits.length;
    const completed = habitHistory[day] || 0;
    // For today, calculate based on current habits state to be perfectly accurate
    if (day === new Date().toISOString().split('T')[0]) {
      const completedToday = habits.filter(h => h.last_completed_at?.startsWith(day)).length;
      return totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    }
    return totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0;
  });

  const handleEditHabit = (habit: Habit) => {
    setHabitToEdit(habit);
    setIsHabitModalOpen(true);
  };

  const handleAddHabit = () => {
    setHabitToEdit(null);
    setIsHabitModalOpen(true);
  };

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
          Today's Momentum
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-8">{completionRate}% Completion</h3>
        
        <div className="flex justify-between items-end h-32 gap-2">
          {completionData.map((h, i) => (
            <div 
              key={i} 
              className={cn(
                "flex-1 rounded-t-xl transition-all duration-500",
                i === 6 ? "bg-[#405C4A]" : "bg-[#E5F3E8]",
              )} 
              style={{ height: `${Math.max(5, h)}%` }}
            ></div>
          ))}
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
          <button 
            onClick={handleAddHabit}
            className="text-xs font-semibold text-gray-600 flex items-center gap-1"
          >
            <Plus size={14} /> New Habit
          </button>
        </div>
        
        <div className="space-y-4">
          {habits.map(habit => (
            <RitualItem 
              key={habit.id}
              icon={habit.category === 'Health' ? <Droplet size={20} /> : habit.category === 'Mindset' ? <BrainCircuit size={20} /> : <BookOpen size={20} />} 
              title={habit.title} 
              target={habit.description} 
              streak={habit.streak} 
              progress={habit.goal_count > 0 ? (habit.current_count / habit.goal_count) * 100 : 0} 
              checked={habit.last_completed_at?.startsWith(new Date().toISOString().split('T')[0]) || false} 
              onToggle={() => toggleHabit(habit.id)}
              onDelete={() => {
                if (confirm('Delete this ritual?')) deleteHabit(habit.id);
              }}
              onEdit={() => handleEditHabit(habit)}
            />
          ))}
          {habits.length === 0 && (
            <div className="text-center py-12 bg-white rounded-[32px] border border-dashed border-gray-200">
              <p className="text-gray-400 italic mb-4">No rituals established yet</p>
              <button 
                onClick={handleAddHabit}
                className="text-[#405C4A] font-bold text-sm"
              >
                + Add Your First Ritual
              </button>
            </div>
          )}
        </div>
      </div>

      <HabitModal isOpen={isHabitModalOpen} onClose={() => setIsHabitModalOpen(false)} habitToEdit={habitToEdit} />
    </motion.div>
  );
};

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

const TasksScreen = () => {
  const { schedule, generateSchedule, isLoading, tasks, setFocusTask, deleteTask, completeTask } = useAppContext();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Mission | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return t.status === 'pending' || t.status === 'overdue';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  const handleEditTask = (task: Mission) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleAddTask = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 pt-4 relative min-h-[calc(100vh-180px)]">
      
      <div className="flex justify-between items-start">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2">{dateString}</div>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">Architecture</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={cn("text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider", filter === 'all' ? "bg-[#405C4A] text-white" : "bg-gray-100 text-gray-500")}
            >All</button>
            <button 
              onClick={() => setFilter('pending')}
              className={cn("text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider", filter === 'pending' ? "bg-[#405C4A] text-white" : "bg-gray-100 text-gray-500")}
            >Pending</button>
            <button 
              onClick={() => setFilter('completed')}
              className={cn("text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider", filter === 'completed' ? "bg-[#405C4A] text-white" : "bg-gray-100 text-gray-500")}
            >Completed</button>
          </div>
        </div>
        <button 
          onClick={generateSchedule}
          disabled={isLoading}
          className="bg-[#E5F3E8] text-[#2E4536] p-3 rounded-2xl hover:bg-[#d5e8da] transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
        </button>
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white rounded-3xl p-6 shadow-sm flex items-center gap-4 group">
            <button 
              onClick={() => completeTask(task.id)}
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                task.status === 'completed' ? "bg-[#405C4A] border-[#405C4A] text-white" : "border-gray-200 text-transparent"
              )}
            >
              <CheckCircle2 size={14} />
            </button>
            <div className="flex-1 cursor-pointer" onClick={() => setFocusTask(task)}>
              <h4 className={cn("font-bold text-gray-900", task.status === 'completed' && "line-through text-gray-400")}>{task.title}</h4>
              <div className="text-xs text-gray-500">{task.category} • {task.duration}m</div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={() => handleEditTask(task)}
                className="p-2 text-gray-300 hover:text-blue-500"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => { if(confirm('Delete mission?')) deleteTask(task.id); }}
                className="p-2 text-gray-300 hover:text-danger"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-[32px] border border-dashed border-gray-200">
            <p className="text-gray-400 italic mb-4">No missions found in this sector</p>
            <button 
              onClick={handleAddTask}
              className="text-[#405C4A] font-bold text-sm"
            >
              + Initialize First Mission
            </button>
          </div>
        )}
      </div>

      <button 
        onClick={handleAddTask}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#405C4A] text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-50"
      >
        <Plus size={24} />
      </button>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} taskToEdit={taskToEdit} />
    </motion.div>
  );
};

const InsightsScreen = () => {
  const { user, firebaseUser } = useAuth();
  const { tasks, habits, completedTasks } = useAppContext();
  
  const userName = firebaseUser?.displayName?.split(' ')[0] || "Pilot";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-4 flex flex-col min-h-[calc(100vh-180px)]">
      
      <div className="mb-8">
        <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">Good evening, {userName}</h2>
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
              <span className="text-xs text-gray-400">Now</span>
            </div>
            <div className="bg-white p-5 rounded-2xl rounded-tl-none text-[15px] text-gray-700 leading-relaxed shadow-sm">
              I've analyzed your progress. You've completed {completedTasks.length} missions today. 
              {habits.length > 0 ? ` Your ritual consistency is at ${Math.round((habits.filter(h => h.streak > 0).length / habits.length) * 100)}%.` : ""}
              How shall we structure your next focus block?
            </div>
          </div>
        </div>

        {/* User Message */}
        <div className="flex gap-4 flex-row-reverse">
          <img src={firebaseUser?.photoURL || "https://i.pravatar.cc/150?img=11"} alt="Profile" className="w-10 h-10 rounded-full object-cover shrink-0 shadow-sm" />
          <div className="flex-1 flex flex-col items-end">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-xs text-gray-400">Just now</span>
              <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">You</span>
            </div>
            <div className="bg-[#405C4A] text-white p-5 rounded-2xl rounded-tr-none text-[15px] leading-relaxed shadow-sm max-w-[90%]">
              I want to optimize my evening for deep recovery. What do you suggest?
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
};
