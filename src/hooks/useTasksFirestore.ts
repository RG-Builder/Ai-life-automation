import { useState, useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { Mission, OperationType } from '../types';
import { taskService } from '../services/taskService';
import { demoService } from '../services/demoService';
import { handleFirestoreError } from '../lib/firestoreUtils';

export const useTasksFirestore = (userId: string | undefined, setError: (err: string | null) => void) => {
  const [tasks, setTasks] = useState<Mission[]>(() => {
    return userId ? [] : demoService.getTasks();
  });

  useEffect(() => {
    if (!userId) {
      const handleDemoUpdate = () => {
        setTasks(demoService.getTasks());
      };
      
      window.addEventListener('demo-tasks-updated', handleDemoUpdate);
      window.addEventListener('storage', handleDemoUpdate);
      
      return () => {
        window.removeEventListener('demo-tasks-updated', handleDemoUpdate);
        window.removeEventListener('storage', handleDemoUpdate);
      };
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
