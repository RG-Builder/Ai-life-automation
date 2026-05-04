import { Mission, Habit } from '../types';

const DEMO_TASKS_KEY = 'lifepilot_demo_tasks';
const DEMO_HABITS_KEY = 'lifepilot_demo_habits';

export const demoService = {
  getTasks: (): Mission[] => {
    try {
      const stored = localStorage.getItem(DEMO_TASKS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error reading demo tasks:', e);
      return [];
    }
  },

  setTasks: (tasks: Mission[]): void => {
    try {
      localStorage.setItem(DEMO_TASKS_KEY, JSON.stringify(tasks));
      window.dispatchEvent(new Event('demo-tasks-updated'));
    } catch (e) {
      console.error('Error saving demo tasks:', e);
    }
  },

  addTask: (task: Partial<Mission>): Mission => {
    const tasks = demoService.getTasks();
    const newTask: Mission = {
      id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: task.title || 'Untitled Mission',
      impact: task.impact_level && task.impact_level >= 9 ? 'critical' : 
              task.impact_level && task.impact_level >= 7 ? 'high' : 
              task.impact_level && task.impact_level >= 4 ? 'moderate' : 'low',
      urgency: task.urgency_score || 5,
      urgency_score: task.urgency_score || 5,
      importance: task.impact_level || 5,
      priority: task.priority || (task.impact_level && task.impact_level >= 7 ? 'high' : 
                                  task.impact_level && task.impact_level >= 4 ? 'medium' : 'low'),
      estimated_effort: task.estimated_effort || 3,
      impact_level: task.impact_level || 5,
      duration: task.duration || 30,
      deadline: task.deadline || null,
      is_habit: task.is_habit || false,
      streak: task.streak || 0,
      status: 'pending',
      category: task.category || 'general',
      created_at: new Date().toISOString()
    };
    tasks.unshift(newTask);
    demoService.setTasks(tasks);
    return newTask;
  },

  updateTask: (taskId: string, updates: Partial<Mission>): void => {
    const tasks = demoService.getTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      demoService.setTasks(tasks);
    }
  },

  deleteTask: (taskId: string): void => {
    const tasks = demoService.getTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    demoService.setTasks(filtered);
  },

  completeTask: (taskId: string): void => {
    const tasks = demoService.getTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index] = {
        ...tasks[index],
        status: 'completed' as const,
        completed_at: new Date().toISOString()
      };
      demoService.setTasks(tasks);
    }
  },

  undoComplete: (taskId: string): void => {
    const tasks = demoService.getTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index] = {
        ...tasks[index],
        status: 'pending' as const,
        completed_at: null
      };
      demoService.setTasks(tasks);
    }
  },

  getHabits: (): Habit[] => {
    try {
      const stored = localStorage.getItem(DEMO_HABITS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error reading demo habits:', e);
      return [];
    }
  },

  setHabits: (habits: Habit[]): void => {
    try {
      localStorage.setItem(DEMO_HABITS_KEY, JSON.stringify(habits));
      window.dispatchEvent(new Event('demo-habits-updated'));
    } catch (e) {
      console.error('Error saving demo habits:', e);
    }
  },

  addHabit: (habit: Partial<Habit>): Habit => {
    const habits = demoService.getHabits();
    const newHabit: Habit = {
      id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: habit.title || 'New Protocol',
      description: habit.description || '',
      frequency: habit.frequency || 'daily',
      goal_count: habit.goal_count || 1,
      current_count: 0,
      streak: 0,
      category: habit.category || 'health',
      created_at: new Date().toISOString()
    };
    habits.unshift(newHabit);
    demoService.setHabits(habits);
    return newHabit;
  },

  updateHabit: (habitId: string, updates: Partial<Habit>): void => {
    const habits = demoService.getHabits();
    const index = habits.findIndex(h => h.id === habitId);
    if (index !== -1) {
      habits[index] = { ...habits[index], ...updates };
      demoService.setHabits(habits);
    }
  },

  deleteHabit: (habitId: string): void => {
    const habits = demoService.getHabits();
    const filtered = habits.filter(h => h.id !== habitId);
    demoService.setHabits(filtered);
  },

  incrementHabit: (habitId: string): void => {
    const habits = demoService.getHabits();
    const index = habits.findIndex(h => h.id === habitId);
    if (index !== -1) {
      habits[index] = {
        ...habits[index],
        current_count: habits[index].current_count + 1,
        streak: habits[index].streak + 1,
        last_completed_at: new Date().toISOString()
      };
      demoService.setHabits(habits);
    }
  },

  decrementHabit: (habitId: string): void => {
    const habits = demoService.getHabits();
    const index = habits.findIndex(h => h.id === habitId);
    if (index !== -1) {
      habits[index] = {
        ...habits[index],
        current_count: Math.max(0, habits[index].current_count - 1),
        last_completed_at: null
      };
      demoService.setHabits(habits);
    }
  }
};