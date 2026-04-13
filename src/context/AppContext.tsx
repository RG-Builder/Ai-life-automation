import React, { createContext, useContext, useState, useEffect } from 'react';
import { Mission, ScheduleItem, Habit, MotivationState } from '../types';
import { generateScheduleWithAI } from '../services/geminiService';

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
  timelineMatrix: any;
  
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
  
  habitHistory: Record<string, number>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_TASKS: Mission[] = [];

const INITIAL_SCHEDULE: ScheduleItem[] = [];

const INITIAL_HABITS: Habit[] = [];


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Mission[]>(() => {
    const saved = localStorage.getItem('lifepilot_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  
  const [currentFocusTask, setCurrentFocusTask] = useState<Mission | null>(() => {
    const saved = localStorage.getItem('lifepilot_focus');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [lifeScore, setLifeScore] = useState<number>(() => {
    const saved = localStorage.getItem('lifepilot_score');
    return saved ? parseInt(saved, 10) : 84;
  });
  
  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('lifepilot_streak');
    return saved ? parseInt(saved, 10) : 14;
  });
  
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('lifepilot_schedule');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('lifepilot_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });
  const [habitHistory, setHabitsHistory] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('lifepilot_habit_history');
    return saved ? JSON.parse(saved) : {};
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save to localStorage on change
  useEffect(() => { localStorage.setItem('lifepilot_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('lifepilot_focus', JSON.stringify(currentFocusTask)); }, [currentFocusTask]);
  useEffect(() => { localStorage.setItem('lifepilot_score', lifeScore.toString()); }, [lifeScore]);
  useEffect(() => { localStorage.setItem('lifepilot_streak', streak.toString()); }, [streak]);
  useEffect(() => { localStorage.setItem('lifepilot_schedule', JSON.stringify(schedule)); }, [schedule]);
  useEffect(() => { localStorage.setItem('lifepilot_habits', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('lifepilot_habit_history', JSON.stringify(habitHistory)); }, [habitHistory]);

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

  const addTask = (task: Partial<Mission>) => {
    const newTask: Mission = {
      id: Math.random().toString(36).substr(2, 9),
      title: task.title || 'New Task',
      status: 'pending',
      priority: task.priority || 'medium',
      deadline: task.deadline,
      duration: task.duration || 30,
      category: task.category || 'General',
      impact: task.impact || 'moderate',
      urgency: task.urgency || 5,
      importance: task.importance || 5,
      is_habit: task.is_habit || false,
      streak: task.streak || 0,
      created_at: new Date().toISOString(),
      ...task
    };
    setTasks(prev => [...prev, newTask]);
  };

  const completeTask = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'completed', completed_at: new Date().toISOString() } : t
    ));
    setLifeScore(prev => prev + 5); // Arbitrary score increase
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (currentFocusTask?.id === taskId) {
      setCurrentFocusTask(null);
    }
  };

  const updateTask = (taskId: string, updates: Partial<Mission>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const setFocusTask = (task: Mission | null) => {
    setCurrentFocusTask(task);
  };

  const updateLifeScore = (score: number) => setLifeScore(score);
  const updateStreak = (newStreak: number) => setStreak(newStreak);

  const addHabit = (habit: Partial<Habit>) => {
    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      title: habit.title || 'New Habit',
      description: habit.description || '',
      frequency: habit.frequency || 'daily',
      goal_count: habit.goal_count || 1,
      current_count: 0,
      streak: 0,
      category: habit.category || 'General',
      created_at: new Date().toISOString(),
      ...habit
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const updateHabit = (habitId: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === habitId ? { ...h, ...updates } : h));
  };

  const toggleHabit = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const isCompletedToday = h.last_completed_at?.startsWith(today);
        
        setHabitsHistory(prevHistory => ({
          ...prevHistory,
          [today]: (prevHistory[today] || 0) + (isCompletedToday ? -1 : 1)
        }));

        if (isCompletedToday) {
          // Un-complete
          return { ...h, last_completed_at: undefined, current_count: Math.max(0, h.current_count - 1) };
        } else {
          // Complete
          return { 
            ...h, 
            last_completed_at: new Date().toISOString(), 
            current_count: h.current_count + 1,
            streak: h.streak + 1
          };
        }
      }
      return h;
    }));
  };

  const deleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  const generateSchedule = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newSchedule = await generateScheduleWithAI(tasks);
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
      motivationState: null,
      dailyScore: lifeScore,
      timelineMatrix: null,
      addTask,
      completeTask,
      deleteTask,
      updateTask,
      setFocusTask,
      updateLifeScore,
      updateStreak,
      generateSchedule,
      handleAction: async (id, data) => console.log('Action:', id, data),
      generateDayPlan: generateSchedule,
      generateAiInsights: async () => {},
      addHabit,
      updateHabit,
      toggleHabit,
      deleteHabit,
      setError,
      habitHistory
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
