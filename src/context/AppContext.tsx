import React, { createContext, useContext, useState, useEffect } from 'react';
import { Mission, ScheduleItem, Habit, MotivationState } from '../types';
import { generateScheduleWithAI } from '../services/geminiService';
import { APP_CONFIG } from '../config/app.config';
import { useAuth } from './AuthContext';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

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
  
  // Legacy/Additional fields for other components
  userProfile: any;
  motivationState: MotivationState | null;
  dailyScore: number;
  timelineMatrix: any; // Legacy name for aiInsight
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
  
  // Legacy/Additional actions
  handleAction: (actionId: string, data?: any) => Promise<void>;
  generateDayPlan: () => Promise<void>;
  generateAiInsights: () => Promise<void>;
  
  // Habit Actions
  addHabit: (habit: Partial<Habit>) => void;
  updateHabit: (habitId: string, updates: Partial<Habit>) => void;
  toggleHabit: (habitId: string) => void;
  deleteHabit: (habitId: string) => void;
  
  // UI Actions
  setError: (error: string | null) => void;
  
  undoAction: { message: string; undo: () => void } | null;
  setUndoAction: (action: { message: string; undo: () => void } | null) => void;
  
  habitHistory: Record<string, number>;
  
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUserProfile } = useAuth();
  const [tasks, setTasks] = useState<Mission[]>([]);
  const [currentFocusTask, setCurrentFocusTask] = useState<Mission | null>(null);
  const [lifeScore, setLifeScore] = useState<number>(APP_CONFIG.DEFAULT_STATE.LIFE_SCORE);
  const [streak, setStreak] = useState<number>(APP_CONFIG.DEFAULT_STATE.STREAK);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitHistory, setHabitsHistory] = useState<Record<string, number>>({});

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [undoAction, setUndoAction] = useState<{ message: string; undo: () => void } | null>(null);
  const [activeTab, setActiveTab] = useState<string>('focus');
  const [motivationState, setMotivationState] = useState<MotivationState | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  // Sync with Firestore when user is logged in
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setHabits([]);
      setLifeScore(APP_CONFIG.DEFAULT_STATE.LIFE_SCORE);
      setStreak(APP_CONFIG.DEFAULT_STATE.STREAK);
      setMotivationState(null);
      return;
    }

    // Sync lifeScore and streak from user profile
    if (user.lifeScore !== undefined) setLifeScore(user.lifeScore);
    if (user.streak !== undefined) setStreak(user.streak);

    // Sync motivation state
    const loadMotivation = async () => {
      try {
        const { getMotivationState } = await import('../services/motivationService');
        const state = await getMotivationState(user.id.toString());
        setMotivationState(state);
      } catch (e) { console.error(e); }
    };
    loadMotivation();

    // Listen for Tasks
    const tasksQuery = query(
      collection(db, 'users', user.id.toString(), 'tasks'),
      orderBy('created_at', 'desc')
    );
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Mission[];
      setTasks(taskList);
    });

    // Listen for Habits
    const habitsQuery = query(
      collection(db, 'users', user.id.toString(), 'habits'),
      orderBy('created_at', 'desc')
    );
    const unsubscribeHabits = onSnapshot(habitsQuery, (snapshot) => {
      const habitList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Habit[];
      setHabits(habitList);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeHabits();
    };
  }, [user]);

  // Save UI-only state to localStorage
  useEffect(() => { localStorage.setItem(APP_CONFIG.STORAGE_KEYS.FOCUS, JSON.stringify(currentFocusTask)); }, [currentFocusTask]);
  useEffect(() => { localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule)); }, [schedule]);
  useEffect(() => { localStorage.setItem(APP_CONFIG.STORAGE_KEYS.HABIT_HISTORY, JSON.stringify(habitHistory)); }, [habitHistory]);

  // Derived state
  const completedTasks = tasks.filter(t => t.status === 'completed');
  
  // Check for overdue tasks based on deadline
  const now = new Date();
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'completed') return false;
    if (!t.deadline) return false;
    return new Date(t.deadline) < now;
  });

  // Auto-update overdue status
  useEffect(() => {
    let changed = false;
    const updatedTasks = tasks.map(t => {
      if (t.status === 'pending' && t.deadline && new Date(t.deadline) < now) {
        changed = true;
        return { ...t, status: 'overdue' as const };
      }
      return t;
    });
    if (changed) setTasks(updatedTasks);
  }, [tasks]);

  const addTask = async (task: Partial<Mission>) => {
    if (!user) return;
    const newTask = {
      title: task.title || APP_CONFIG.DEFAULTS.TASK_TITLE,
      status: 'pending',
      priority: task.priority || 'medium',
      deadline: task.deadline || null,
      duration: task.duration || APP_CONFIG.DEFAULTS.TASK_DURATION,
      category: task.category || APP_CONFIG.DEFAULTS.TASK_CATEGORY,
      impact: task.impact || 'moderate',
      urgency: task.urgency || APP_CONFIG.DEFAULTS.TASK_URGENCY,
      importance: task.importance || APP_CONFIG.DEFAULTS.TASK_IMPORTANCE,
      is_habit: task.is_habit || false,
      streak: task.streak || 0,
      created_at: new Date().toISOString()
    };
    
    try {
      await addDoc(collection(db, 'users', user.id.toString(), 'tasks'), newTask);
    } catch (error) {
      console.error("Error adding task:", error);
      setError("Failed to add task to database.");
    }
  };

  const completeTask = async (taskId: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    const scheduleItem = schedule.find(s => s.id === taskId);
    const targetTask = task || tasks.find(t => t.title === scheduleItem?.title);

    if (!targetTask) {
      if (scheduleItem) {
        setSchedule(prev => prev.map(s => s.id === taskId ? { ...s, status: 'completed' as const, completed: true } : s));
      }
      return;
    }

    try {
      const taskDoc = doc(db, 'users', user.id.toString(), 'tasks', targetTask.id);
      await updateDoc(taskDoc, {
        status: 'completed',
        completed_at: new Date().toISOString()
      });

      // Update score in profile
      const newScore = lifeScore + APP_CONFIG.SCORING.TASK_COMPLETION_BONUS;
      await updateUserProfile({ lifeScore: newScore });

      setUndoAction({
        message: `"${targetTask.title}" completed!`,
        undo: async () => {
          await updateDoc(taskDoc, { status: 'pending', completed_at: null });
          await updateUserProfile({ lifeScore: lifeScore });
          setUndoAction(null);
        }
      });

      setTimeout(() => setUndoAction(null), 5000);
    } catch (error) {
      console.error("Error completing task:", error);
      setError("Failed to update task status.");
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.id.toString(), 'tasks', taskId));
      if (currentFocusTask?.id === taskId) setCurrentFocusTask(null);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Mission>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.id.toString(), 'tasks', taskId), updates);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const setFocusTask = (task: Mission | null) => {
    setCurrentFocusTask(task);
  };

  const updateLifeScore = (score: number) => setLifeScore(score);
  const updateStreak = (newStreak: number) => setStreak(newStreak);

  const addHabit = async (habit: Partial<Habit>) => {
    if (!user) return;
    const newHabit = {
      title: habit.title || APP_CONFIG.DEFAULTS.HABIT_TITLE,
      description: habit.description || '',
      frequency: habit.frequency || 'daily',
      goal_count: habit.goal_count || 1,
      current_count: 0,
      streak: 0,
      category: habit.category || APP_CONFIG.DEFAULTS.HABIT_CATEGORY,
      created_at: new Date().toISOString()
    };
    try {
      await addDoc(collection(db, 'users', user.id.toString(), 'habits'), newHabit);
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  };

  const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.id.toString(), 'habits', habitId), updates);
    } catch (error) {
      console.error("Error updating habit:", error);
    }
  };

  const toggleHabit = async (habitId: string) => {
    if (!user) return;
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = habit.last_completed_at?.startsWith(today);

    try {
      const habitDoc = doc(db, 'users', user.id.toString(), 'habits', habitId);
      if (isCompletedToday) {
        await updateDoc(habitDoc, {
          last_completed_at: null,
          current_count: Math.max(0, habit.current_count - 1)
        });
      } else {
        await updateDoc(habitDoc, {
          last_completed_at: new Date().toISOString(),
          current_count: habit.current_count + 1,
          streak: habit.streak + 1
        });
      }
    } catch (error) {
      console.error("Error toggling habit:", error);
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.id.toString(), 'habits', habitId));
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

   const generateSchedule = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newSchedule = await generateScheduleWithAI(tasks, {
        wakeTime: user?.wakeTime,
        directive: user?.directive
      });
      if (newSchedule && newSchedule.length > 0) {
        setSchedule(newSchedule);
      } else {
        setError("AI could not generate a valid schedule. Please try again.");
      }
    } catch (err) {
      console.error("Failed to generate schedule:", err);
      setError("Failed to connect to AI service. Please check your connection.");
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
      console.error(err);
      setError("Failed to generate insights.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (actionId: string, data?: any) => {
    console.log('Action:', actionId, data);
    const id = data?.taskId || data?.id;
    
    switch (actionId) {
      case 'START_FOCUS':
        if (data?.task) {
          setFocusTask(data.task);
          setActiveTab('schedule');
        }
        break;
      case 'PILOT_MY_DAY':
      case 'GENERATE_SCHEDULE':
        await generateSchedule();
        setActiveTab('schedule');
        break;
      case 'COMPLETE_TASK':
        if (id) completeTask(id);
        break;
      case 'DELETE_TASK':
        if (id) deleteTask(id);
        break;
      case 'GENERATE_INSIGHTS':
        await generateAiInsights();
        setActiveTab('analytics');
        break;
      case 'NAVIGATE':
        if (data?.tab) setActiveTab(data.tab);
        break;
      default:
        break;
    }
  };

  return (
    <AppContext.Provider value={{
      tasks,
      missions: tasks,
      completedTasks,
      overdueTasks,
      currentFocusTask,
      lifeScore,
      streak,
      schedule,
      habits,
      isLoading,
      loading: isLoading,
      error,
      userProfile: null,
      motivationState,
      dailyScore: lifeScore,
      timelineMatrix: aiInsight,
      aiInsight,
      addTask,
      completeTask,
      deleteTask,
      updateTask,
      setFocusTask,
      updateLifeScore,
      updateStreak,
      generateSchedule,
      handleAction,
      generateDayPlan: generateSchedule,
      generateAiInsights,
      addHabit,
      updateHabit,
      toggleHabit,
      deleteHabit,
      setError,
      undoAction,
      setUndoAction,
      habitHistory,
      activeTab,
      setActiveTab
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
