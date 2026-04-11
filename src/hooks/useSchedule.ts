import { useState } from 'react';
import { useAI } from './useAI';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Mission } from '../types';

export const useSchedule = () => {
  const [loading, setLoading] = useState(false);
  const { generate } = useAI();

  const generateSchedule = async (missions: Mission[], context: any) => {
    if (missions.length === 0) return;

    setLoading(true);
    try {
      const prompt = `As an AI Life Architect, analyze these tasks and create a high-performance, personalized schedule for today.
      
      Tasks to Schedule: ${JSON.stringify(missions.map(m => ({ id: m.id, title: m.title, duration: m.duration, impact: m.impact, category: m.category })))}
      
      User Behavioral Context: ${JSON.stringify(context)}
      
      Guidelines for Personalization:
      1. Consider the user's current energy and focus levels. Schedule high-impact tasks during peak states.
      2. Respect existing streaks and habits. If the user is in 'Recovery Mode', prioritize smaller, achievable wins.
      3. Start the schedule from the current time or shortly after.
      4. Ensure a balanced flow between different categories (Work, Health, Personal).
      5. Return a JSON array of objects with { id, startTime, endTime }. 
      6. Keep the IDs exactly as provided. Use 24-hour format (HH:mm). 
      7. Ensure tasks do not overlap and are scheduled for today.`;

      const result = await generate(prompt, "You are a high-performance life architect.", "complex");
      
      let text = result.text || '[]';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) text = jsonMatch[0];
      
      const plan = JSON.parse(text);
      
      if (auth.currentUser && Array.isArray(plan)) {
        const tasksRef = doc(db, 'users', auth.currentUser.uid);
        const updates = plan.map(async (item: any) => {
          if (item.id && item.startTime && item.endTime) {
            const taskDoc = doc(db, 'users', auth.currentUser!.uid, 'tasks', item.id);
            const docSnap = await getDoc(taskDoc);
            if (docSnap.exists()) {
              await updateDoc(taskDoc, {
                startTime: String(item.startTime),
                endTime: String(item.endTime),
                updated_at: new Date().toISOString()
              });
            }
          }
        });
        await Promise.all(updates);
      }
    } catch (err) {
      console.error("Schedule generation failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generateSchedule, loading };
};
