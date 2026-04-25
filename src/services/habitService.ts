import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Habit, OperationType } from '../types';
import { handleFirestoreError } from '../lib/firestoreUtils';

export const habitService = {
  getHabitsQuery: (userId: string) => {
    return query(
      collection(db, 'users', userId, 'habits'),
      orderBy('created_at', 'desc')
    );
  },

  addHabit: async (userId: string, habit: Partial<Habit>) => {
    try {
      const newHabit = {
        title: habit.title || 'New Protocol',
        description: habit.description || '',
        frequency: habit.frequency || 'daily',
        goal_count: habit.goal_count || 1,
        current_count: 0,
        streak: 0,
        category: habit.category || 'health',
        created_at: new Date().toISOString()
      };
      return await addDoc(collection(db, 'users', userId, 'habits'), newHabit);
    } catch (error) {
      throw handleFirestoreError(error, OperationType.CREATE, `users/${userId}/habits`);
    }
  },

  updateHabit: async (userId: string, habitId: string, updates: Partial<Habit>) => {
    try {
      const habitDoc = doc(db, 'users', userId, 'habits', habitId);
      await updateDoc(habitDoc, updates);
    } catch (error) {
      throw handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/habits/${habitId}`);
    }
  },

  deleteHabit: async (userId: string, habitId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId, 'habits', habitId));
    } catch (error) {
      throw handleFirestoreError(error, OperationType.DELETE, `users/${userId}/habits/${habitId}`);
    }
  },

  incrementHabit: async (userId: string, habitId: string, currentCount: number, currentStreak: number) => {
    try {
      const habitDoc = doc(db, 'users', userId, 'habits', habitId);
      await updateDoc(habitDoc, {
        last_completed_at: new Date().toISOString(),
        current_count: currentCount + 1,
        streak: currentStreak + 1
      });
    } catch (error) {
      throw handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/habits/${habitId}`);
    }
  },

  decrementHabit: async (userId: string, habitId: string, currentCount: number) => {
    try {
      const habitDoc = doc(db, 'users', userId, 'habits', habitId);
      await updateDoc(habitDoc, {
        last_completed_at: null,
        current_count: Math.max(0, currentCount - 1)
      });
    } catch (error) {
      throw handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/habits/${habitId}`);
    }
  }
};
