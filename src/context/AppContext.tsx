import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Mission, ScheduleItem, Habit, MotivationState } from '../types';
import { generateScheduleWithAI } from '../services/geminiService';
import { APP_CONFIG } from '../config/app.config';
import { useAuth } from './AuthContext';
import { toDate } from '../lib/utils';
import { useTasksFirestore } from '../hooks/useTasksFirestore';
import { useHabitsFirestore } from '../hooks/useHabitsFirestore';
import { useAppActions } from '../hooks/useAppActions';

interface AppContextType {
  tasks: Mission[];
  missions: Mission[]; // Alias for tasks
  completedTasks: Mission[];
  overdueTasks: Mission[];
  currentFocusTask: Mission | null;
  lifeScore: number;
  streak: number;
  schedule: ScheduleItem[];
  habits: Habit[];
  isLoading: boolean;
  loading: boolean; // Alias for isLoading
  error: string | null;
  
  userProfile: any;
  motivationState: MotivationState | null;
  dailyScore: number;
  aiInsight: string | null;
  
  // Actions
  addTask: (task: Partial<Mission>) => void;
  completeTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<Mission>) => void;
  setFocusTask: (task: Mission | null) => void;
  updateLifeScore: (score: number) => void;
  updateStreak: (streak: number) => void;
  generateSchedule: () => Promise<void>;
  generateDayPlan: () => Promise<void>;
  handleAction: (actionId: string, data?: any) => Promise<void>;
  generateAiInsights: () => Promise<void>;
  
  // Habit Actions
  addHabit: (habit: Partial<Habit>) => void;
  updateHabit: (habitId: string, updates: Partial<Habit>) => void;
  toggleHabit: (habitId: string) => void;
  deleteHabit: (habitId: string) => void;
  
  setError: (error: string | null) => void;
  undoAction: { message: string; undo: () => void } | null;
  setUndoAction: (action: { message: string; undo: () => void } | null) => void;
  
  habitHistory: Record<string, number>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUserProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { tasks, setTasks } = useTasksFirestore(user?.id.toString(), setError);
  const { habits } = useHabitsFirestore(user?.id.toString(), setError);

  const [currentFocusTask, setCurrentFocusTask] = useState<Mission | null>(() => {
    const saved = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.FOCUS);
    return saved ? JSON.parse(saved) : null;
  });
  const [lifeScore, setLifeScore] = useState<number>(APP_CONFIG.DEFAULT_STATE.LIFE_SCORE);
  const [streak, setStreak] = useState<number>(APP_CONFIG.DEFAULT_STATE.STREAK);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SCHEDULE);
    return saved ? JSON.parse(saved) : [];
  });
  const [habitHistory, setHabitsHistory] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.HABIT_HISTORY);
    return saved ? JSON.parse(saved) : {};
  });

  const [undoAction, setUndoAction] = useState<{ message: string; undo: () => void } | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [motivationState, setMotivationState] = useState<MotivationState | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const {
    handleAddTask,
    handleCompleteTask,
    handleDeleteTask,
    handleUpdateTask,
    handleAddHabit,
    handleUpdateHabit,
    handleToggleHabit,
    handleDeleteHabit
  } = useAppActions(tasks, habits, lifeScore, updateUserProfile, setUndoAction, setError);

  // Sync profile data
  useEffect(() => {
    if (user?.lifeScore !== undefined) setLifeScore(user.lifeScore);
    if (user?.streak !== undefined) setStreak(user.streak);
  }, [user?.lifeScore, user?.streak]);

  // Sync daily score
  const dailyScore = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.status === 'completed' && t.completed_at && toDate(t.completed_at).toISOString().split('T')[0] === today).length * 50;
  }, [tasks]);

  // Auto-update overdue status
  useEffect(() => {
    const now = new Date();
    let changed = false;
    const updatedTasks = tasks.map(t => {
      if (t.status === 'pending' && t.deadline && new Date(t.deadline) < now) {
        changed = true;
        return { ...t, status: 'overdue' as const };
      }
      return t;
    });
    if (changed) setTasks(updatedTasks);
  }, [tasks, setTasks]);

  // Save UI-only state to localStorage
  useEffect(() => { localStorage.setItem(APP_CONFIG.STORAGE_KEYS.FOCUS, JSON.stringify(currentFocusTask)); }, [currentFocusTask]);
  useEffect(() => { localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule)); }, [schedule]);
  useEffect(() => { localStorage.setItem(APP_CONFIG.STORAGE_KEYS.HABIT_HISTORY, JSON.stringify(habitHistory)); }, [habitHistory]);

  const generateSchedule = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newSchedule = await generateScheduleWithAI(tasks, {
        wakeTime: user?.wakeTime,
        directive: user?.directive
      });
      if (newSchedule && newSchedule.length > 0) setSchedule(newSchedule);
      else setError("AI could not generate a valid schedule.");
    } catch (err) {
      setError("Failed to connect to AI service.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateAiInsights = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { generateBehaviorInsight } = await import('../services/motivationService');
      const newInsight = await generateBehaviorInsight(user.id.toString());
      setAiInsight(newInsight || "Consistency detected. Neural pathways are stabilizing.");
    } catch (err) {
      setError("Failed to generate insights.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (actionId: string, data?: any) => {
    const id = data?.taskId || data?.id;
    switch (actionId) {
      case 'START_FOCUS':
        if (data?.task) { setCurrentFocusTask(data.task); setActiveTab('schedule'); }
        break;
      case 'STOP_FOCUS':
        setCurrentFocusTask(null);
        break;
      case 'PILOT_MY_DAY':
      case 'GENERATE_SCHEDULE':
        await generateSchedule();
        setActiveTab('schedule');
        break;
      case 'COMPLETE_TASK': if (id) handleCompleteTask(id); break;
      case 'DELETE_TASK': if (id) handleDeleteTask(id); break;
      case 'ADD_TASK': if (data) await handleAddTask(data); break;
      case 'UPDATE_TASK': if (id && data.data) await handleUpdateTask(id, data.data); break;
      case 'ADD_HABIT': if (data) await handleAddHabit(data); break;
      case 'UPDATE_HABIT': if (id && data.data) await handleUpdateHabit(id, data.data); break;
      case 'TOGGLE_HABIT': if (id) await handleToggleHabit(id); break;
      case 'DELETE_HABIT': if (id) await handleDeleteHabit(id); break;
      case 'GENERATE_INSIGHTS': await generateAiInsights(); setActiveTab('analytics'); break;
      case 'NAVIGATE': if (data?.tab) setActiveTab(data.tab); break;
    }
  };

  return (
    <AppContext.Provider value={{
      tasks, missions: tasks,
      completedTasks: tasks.filter(t => t.status === 'completed'),
      overdueTasks: tasks.filter(t => t.status === 'overdue'),
      currentFocusTask, lifeScore, streak, schedule, habits,
      isLoading, loading: isLoading, error,
      userProfile: null, motivationState, dailyScore, aiInsight,
      addTask: handleAddTask, completeTask: handleCompleteTask,
      deleteTask: handleDeleteTask, updateTask: handleUpdateTask,
      setFocusTask: setCurrentFocusTask,
      updateLifeScore: async (s) => { setLifeScore(s); if (user) await updateUserProfile({ lifeScore: s }); },
      updateStreak: async (s) => { setStreak(s); if (user) await updateUserProfile({ streak: s }); },
      generateSchedule, generateDayPlan: generateSchedule,
      handleAction, generateAiInsights,
      addHabit: handleAddHabit, updateHabit: handleUpdateHabit,
      toggleHabit: handleToggleHabit, deleteHabit: handleDeleteHabit,
      setError, undoAction, setUndoAction, habitHistory, activeTab, setActiveTab
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
