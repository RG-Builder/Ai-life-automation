import React, { createContext, useContext, useState, useEffect } from 'react';
import { Mission, ScheduleItem } from '../types';
import { generateScheduleWithAI } from '../services/geminiService';

interface AppContextType {
  tasks: Mission[];
  completedTasks: Mission[];
  overdueTasks: Mission[];
  currentFocusTask: Mission | null;
  lifeScore: number;
  streak: number;
  schedule: ScheduleItem[];
  
  // Actions
  addTask: (task: Partial<Mission>) => void;
  completeTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<Mission>) => void;
  setFocusTask: (task: Mission | null) => void;
  updateLifeScore: (score: number) => void;
  updateStreak: (streak: number) => void;
  generateSchedule: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_TASKS: Mission[] = [
  {
    id: '1',
    title: 'Design System Overhaul',
    status: 'pending',
    priority: 'high',
    deadline: new Date(Date.now() + 86400000).toISOString(),
    duration: 45,
    category: 'Deep Work',
    impact: 'high',
    urgency: 8,
    importance: 9,
    is_habit: false,
    streak: 0,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Review PRs',
    status: 'pending',
    priority: 'medium',
    deadline: new Date(Date.now() + 3600000).toISOString(),
    duration: 60,
    category: 'Engineering',
    impact: 'moderate',
    urgency: 5,
    importance: 6,
    is_habit: false,
    streak: 0,
    created_at: new Date().toISOString()
  }
];

const INITIAL_SCHEDULE: ScheduleItem[] = [
  { id: 's1', title: 'Deep Work: Core Logic', startTime: '09:00', endTime: '11:00', duration: '2h', type: 'deep-work', completed: true },
  { id: 's2', title: 'Team Standup', startTime: '11:30', endTime: '12:00', duration: '30m', type: 'meeting', completed: false },
  { id: 's3', title: 'Admin & Emails', startTime: '13:00', endTime: '14:00', duration: '1h', type: 'admin', completed: false },
  { id: 's4', title: 'Creative Review', startTime: '15:00', endTime: '16:30', duration: '1.5h', type: 'meeting', completed: false },
];

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

  // Save to localStorage on change
  useEffect(() => { localStorage.setItem('lifepilot_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('lifepilot_focus', JSON.stringify(currentFocusTask)); }, [currentFocusTask]);
  useEffect(() => { localStorage.setItem('lifepilot_score', lifeScore.toString()); }, [lifeScore]);
  useEffect(() => { localStorage.setItem('lifepilot_streak', streak.toString()); }, [streak]);
  useEffect(() => { localStorage.setItem('lifepilot_schedule', JSON.stringify(schedule)); }, [schedule]);

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

  const generateSchedule = async () => {
    try {
      const newSchedule = await generateScheduleWithAI(tasks);
      if (newSchedule && newSchedule.length > 0) {
        setSchedule(newSchedule);
      }
    } catch (error) {
      console.error("Failed to generate schedule:", error);
    }
  };

  return (
    <AppContext.Provider value={{
      tasks,
      completedTasks,
      overdueTasks,
      currentFocusTask,
      lifeScore,
      streak,
      schedule,
      addTask,
      completeTask,
      deleteTask,
      updateTask,
      setFocusTask,
      updateLifeScore,
      updateStreak,
      generateSchedule
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
