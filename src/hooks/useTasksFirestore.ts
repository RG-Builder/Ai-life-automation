import { useState, useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { Mission, OperationType } from '../types';
import { taskService } from '../services/taskService';
import { handleFirestoreError } from '../lib/firestoreUtils';

export const useTasksFirestore = (userId: string | undefined, setError: (err: string | null) => void) => {
  const [tasks, setTasks] = useState<Mission[]>([]);

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      return;
    }

    const tasksQuery = taskService.getTasksQuery(userId);
    const unsubscribe = onSnapshot(tasksQuery, 
      (snapshot) => {
        const taskList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Mission[];
        setTasks(taskList);
      },
      (err) => {
        const info = handleFirestoreError(err, OperationType.LIST, `users/${userId}/tasks`);
        setError(`Tasks sync failed: ${info.error}`);
      }
    );

    return () => unsubscribe();
  }, [userId, setError]);

  return { tasks, setTasks };
};
