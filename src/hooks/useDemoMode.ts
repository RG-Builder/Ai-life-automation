import { useState, useEffect } from 'react';
import { Mission, Habit } from '../types';
import { demoService } from '../services/demoService';

export const useDemoMode = () => {
  const [tasks, setTasks] = useState<Mission[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    setTasks(demoService.getTasks());
    setHabits(demoService.getHabits());

    const handleStorageChange = () => {
      setTasks(demoService.getTasks());
      setHabits(demoService.getHabits());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { tasks, habits, setTasks, setHabits };
};