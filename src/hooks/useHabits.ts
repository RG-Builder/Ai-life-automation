import { useState } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { Habit, OperationType } from '../types';
import { handleFirestoreError } from '../lib/utils';
import confetti from 'canvas-confetti';

export const useHabits = () => {
  const [loading, setLoading] = useState(false);

  const getHabitsRef = () => {
    if (!auth.currentUser) return null;
    return collection(db, 'users', auth.currentUser.uid, 'habits');
  };

  const addHabit = async (habit: Partial<Habit>) => {
    const habitsRef = getHabitsRef();
    if (!habitsRef || !auth.currentUser) return;

    setLoading(true);
    try {
      await addDoc(habitsRef, {
        ...habit,
        user_id: auth.currentUser.uid,
        current_count: 0,
        streak: 0,
        created_at: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'habits');
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = async (id: string, currentCount: number = 0, currentStreak: number = 0) => {
    const habitsRef = getHabitsRef();
    if (!habitsRef) return;

    setLoading(true);
    try {
      const habitDoc = doc(habitsRef, id);
      await updateDoc(habitDoc, {
        current_count: currentCount + 1,
        last_completed_at: serverTimestamp(),
        streak: currentStreak + 1
      });
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `habits/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const updateHabit = async (id: string, data: Partial<Habit>) => {
    const habitsRef = getHabitsRef();
    if (!habitsRef) return;

    setLoading(true);
    try {
      const habitDoc = doc(habitsRef, id);
      await updateDoc(habitDoc, {
        ...data,
        updated_at: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `habits/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteHabit = async (id: string) => {
    const habitsRef = getHabitsRef();
    if (!habitsRef) return;

    setLoading(true);
    try {
      await deleteDoc(doc(habitsRef, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `habits/${id}`);
    } finally {
      setLoading(false);
    }
  };

  return { addHabit, toggleHabit, updateHabit, deleteHabit, loading };
};
