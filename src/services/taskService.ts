import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Mission, OperationType } from '../types';
import { handleFirestoreError } from '../lib/firestoreUtils';

export const taskService = {
  getTasksQuery: (userId: string) => {
    return query(
      collection(db, 'users', userId, 'tasks'),
      orderBy('created_at', 'desc')
    );
  },

  addTask: async (userId: string, task: Partial<Mission>) => {
    try {
      const parsedImpactLevel = Number(task.impact_level);
      const impact_level = Number.isFinite(parsedImpactLevel) ? Math.min(10, Math.max(1, parsedImpactLevel)) : 5;
      const parsedUrgency = Number(task.urgency_score);
      const urgency_score = Number.isFinite(parsedUrgency) ? Math.min(10, Math.max(1, parsedUrgency)) : 5;
      const parsedEffort = Number(task.estimated_effort);
      const estimated_effort = Number.isFinite(parsedEffort) ? Math.min(5, Math.max(1, parsedEffort)) : 3;
      const parsedDuration = Number(task.duration);
      const duration = Number.isFinite(parsedDuration) ? Math.max(1, parsedDuration) : 30;
      const title = (task.title || '').trim() || 'Untitled Mission';

      let impact: 'low' | 'moderate' | 'high' | 'critical' = 'moderate';
      if (impact_level >= 9) impact = 'critical';
      else if (impact_level >= 7) impact = 'high';
      else if (impact_level >= 4) impact = 'moderate';
      else impact = 'low';

      const newTask = {
        title,
        status: 'pending',
        priority: task.priority || (impact_level >= 7 ? 'high' : impact_level >= 4 ? 'medium' : 'low'),
        deadline: task.deadline || null,
        duration,
        category: task.category || 'general',
        impact: impact,
        urgency: urgency_score, // Mapping urgency_score to urgency for compatibility
        urgency_score,
        importance: impact_level, // Mapping impact_level to importance
        estimated_effort,
        impact_level: impact_level,
        is_habit: task.is_habit || false,
        streak: task.streak || 0,
        created_at: new Date().toISOString()
      };
      return await addDoc(collection(db, 'users', userId, 'tasks'), newTask);
    } catch (error) {
      throw handleFirestoreError(error, OperationType.CREATE, `users/${userId}/tasks`);
    }
  },

  updateTask: async (userId: string, taskId: string, updates: Partial<Mission>) => {
    try {
      const taskDoc = doc(db, 'users', userId, 'tasks', taskId);
      await updateDoc(taskDoc, updates);
    } catch (error) {
      throw handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/tasks/${taskId}`);
    }
  },

  deleteTask: async (userId: string, taskId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId, 'tasks', taskId));
    } catch (error) {
      throw handleFirestoreError(error, OperationType.DELETE, `users/${userId}/tasks/${taskId}`);
    }
  },

  completeTask: async (userId: string, taskId: string) => {
    try {
      const taskDoc = doc(db, 'users', userId, 'tasks', taskId);
      await updateDoc(taskDoc, {
        status: 'completed',
        completed_at: new Date().toISOString()
      });
    } catch (error) {
      throw handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/tasks/${taskId}`);
    }
  },

  undoComplete: async (userId: string, taskId: string) => {
    try {
      const taskDoc = doc(db, 'users', userId, 'tasks', taskId);
      await updateDoc(taskDoc, {
        status: 'pending',
        completed_at: null
      });
    } catch (error) {
      throw handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/tasks/${taskId}`);
    }
  }
};
