import { useState, useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { Habit, OperationType } from '../types';
import { habitService } from '../services/habitService';
import { handleFirestoreError } from '../lib/firestoreUtils';

export const useHabitsFirestore = (userId: string | undefined, setError: (err: string | null) => void) => {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    if (!userId) {
      setHabits([]);
      return;
    }

    const habitsQuery = habitService.getHabitsQuery(userId);
    const unsubscribe = onSnapshot(habitsQuery, 
      (snapshot) => {
        const habitList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Habit[];
        setHabits(habitList);
      },
      (err) => {
        const info = handleFirestoreError(err, OperationType.LIST, `users/${userId}/habits`);
        setError(`Habits sync failed: ${info.error}`);
      }
    );

    return () => unsubscribe();
  }, [userId, setError]);

  return { habits, setHabits };
};
