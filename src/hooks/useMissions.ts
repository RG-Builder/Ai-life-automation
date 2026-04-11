import { useState } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  setDoc,
  getDoc
} from 'firebase/firestore';
import { Mission, OperationType } from '../types';
import { handleFirestoreError } from '../lib/utils';
import confetti from 'canvas-confetti';

export const useMissions = () => {
  const [loading, setLoading] = useState(false);

  const getTasksRef = () => {
    if (!auth.currentUser) return null;
    return collection(db, 'users', auth.currentUser.uid, 'tasks');
  };

  const addTask = async (mission: Partial<Mission>) => {
    const tasksRef = getTasksRef();
    if (!tasksRef || !auth.currentUser) return;

    setLoading(true);
    try {
      await addDoc(tasksRef, {
        ...mission,
        user_id: auth.currentUser.uid,
        status: 'pending',
        created_at: new Date().toISOString(),
        streak: 0,
        is_habit: mission.is_habit || false
      });
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'tasks');
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (id: string, currentStreak: number = 0) => {
    const tasksRef = getTasksRef();
    if (!tasksRef) return;

    setLoading(true);
    try {
      const taskDoc = doc(tasksRef, id);
      await setDoc(taskDoc, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        streak: currentStreak + 1
      }, { merge: true });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: string, data: Partial<Mission>) => {
    const tasksRef = getTasksRef();
    if (!tasksRef) return;

    setLoading(true);
    try {
      const taskDoc = doc(tasksRef, id);
      await setDoc(taskDoc, {
        ...data,
        updated_at: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    const tasksRef = getTasksRef();
    if (!tasksRef) return;

    setLoading(true);
    try {
      await deleteDoc(doc(tasksRef, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tasks/${id}`);
    } finally {
      setLoading(false);
    }
  };

  return { addTask, completeTask, updateTask, deleteTask, loading };
};
