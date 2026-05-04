import { Mission, Habit } from '../types';
import { taskService } from '../services/taskService';
import { habitService } from '../services/habitService';
import { demoService } from '../services/demoService';
import { useAuth } from '../context/AuthContext';
import { toDate } from '../lib/utils';
import { APP_CONFIG } from '../config/app.config';

export const useAppActions = (
  tasks: Mission[], 
  habits: Habit[], 
  lifeScore: number, 
  updateUserProfile: (profile: any) => Promise<void>,
  setUndoAction: (action: { message: string; undo: () => void } | null) => void,
  setError: (err: string | null) => void
) => {
  const { user } = useAuth();

  const handleAddTask = async (task: Partial<Mission>) => {
    if (!user) {
      demoService.addTask(task);
      return;
    }
    try {
      await taskService.addTask(user.id.toString(), task);
    } catch (error: any) {
      setError(`Failed to add task: ${error.error || error.message}`);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (!user) {
      demoService.completeTask(taskId);
      const newScore = lifeScore + APP_CONFIG.SCORING.TASK_COMPLETION_BONUS;
      setUndoAction({
        message: `"${task.title}" completed!`,
        undo: () => {
          demoService.undoComplete(taskId);
          setUndoAction(null);
        }
      });
      setTimeout(() => setUndoAction(null), 5000);
      return;
    }

    try {
      await taskService.completeTask(user.id.toString(), taskId);
      const newScore = lifeScore + APP_CONFIG.SCORING.TASK_COMPLETION_BONUS;
      await updateUserProfile({ lifeScore: newScore });

      setUndoAction({
        message: `"${task.title}" completed!`,
        undo: async () => {
          await taskService.undoComplete(user.id.toString(), taskId);
          await updateUserProfile({ lifeScore });
          setUndoAction(null);
        }
      });
      setTimeout(() => setUndoAction(null), 5000);
    } catch (error) {
      setError("Failed to update task status.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) {
      demoService.deleteTask(taskId);
      return;
    }
    try {
      await taskService.deleteTask(user.id.toString(), taskId);
    } catch (error) {
      setError("Failed to delete task.");
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Mission>) => {
    if (!user) {
      demoService.updateTask(taskId, updates);
      return;
    }
    try {
      await taskService.updateTask(user.id.toString(), taskId, updates);
    } catch (error) {
      setError("Failed to update task.");
    }
  };

  const handleAddHabit = async (habit: Partial<Habit>) => {
    if (!user) {
      demoService.addHabit(habit);
      return;
    }
    try {
      await habitService.addHabit(user.id.toString(), habit);
    } catch (error: any) {
      setError(`Failed to add habit: ${error.error || error.message}`);
    }
  };

  const handleUpdateHabit = async (habitId: string, updates: Partial<Habit>) => {
    if (!user) {
      demoService.updateHabit(habitId, updates);
      return;
    }
    try {
      await habitService.updateHabit(user.id.toString(), habitId, updates);
    } catch (error) {
      setError("Failed to update habit.");
    }
  };

  const handleToggleHabit = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = habit.last_completed_at ? toDate(habit.last_completed_at).toISOString().split('T')[0] === today : false;

    if (!user) {
      if (isCompletedToday) {
        demoService.decrementHabit(habitId);
      } else {
        demoService.incrementHabit(habitId);
      }
      return;
    }

    try {
      if (isCompletedToday) {
        await habitService.decrementHabit(user.id.toString(), habitId, habit.current_count);
      } else {
        await habitService.incrementHabit(user.id.toString(), habitId, habit.current_count, habit.streak);
      }
    } catch (error) {
      setError("Failed to toggle habit.");
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!user) {
      demoService.deleteHabit(habitId);
      return;
    }
    try {
      await habitService.deleteHabit(user.id.toString(), habitId);
    } catch (error) {
      setError("Failed to delete habit.");
    }
  };

  return {
    handleAddTask,
    handleCompleteTask,
    handleDeleteTask,
    handleUpdateTask,
    handleAddHabit,
    handleUpdateHabit,
    handleToggleHabit,
    handleDeleteHabit
  };
};
