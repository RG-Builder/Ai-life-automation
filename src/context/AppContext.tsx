import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { Mission, Habit, Analytics, LifeState, HabitStat, MotivationState, OperationType } from '../types';
import { useCollection } from 'react-firebase-hooks/firestore';
import { handleFirestoreError, getDocFromServer } from '../lib/utils';
import confetti from 'canvas-confetti';
import { updateDailyScore, MOTIVATION_MESSAGES } from '../services/motivationService';
import { GoogleGenAI } from '@google/genai';

interface AppContextType {
  missions: Mission[];
  habits: Habit[];
  goals: any[];
  insights: any[];
  lifeState: LifeState;
  setLifeState: React.Dispatch<React.SetStateAction<LifeState>>;
  motivationState: MotivationState | null;
  setMotivationState: React.Dispatch<React.SetStateAction<MotivationState | null>>;
  dailyScore: number;
  setDailyScore: React.Dispatch<React.SetStateAction<number>>;
  focusTask: Mission | null;
  setFocusTask: React.Dispatch<React.SetStateAction<Mission | null>>;
  timelineMatrix: Mission[];
  loading: boolean;
  handleAction: (type: string, payload?: any) => Promise<void>;
  microReward: string | null;
  generateDayPlan: () => Promise<void>;
  generateAiInsights: () => Promise<void>;
  userProfile: any;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firebaseUser } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const tasksRef = firebaseUser ? collection(db, 'users', firebaseUser.uid, 'tasks') : null;
  const habitsRef = firebaseUser ? collection(db, 'users', firebaseUser.uid, 'habits') : null;
  const goalsRef = firebaseUser ? collection(db, 'users', firebaseUser.uid, 'goals') : null;
  const insightsRef = firebaseUser ? collection(db, 'users', firebaseUser.uid, 'ai_insights') : null;

  const [dbTasks, tasksLoading] = useCollection(tasksRef ? query(tasksRef, orderBy('created_at', 'desc')) : null);
  const [dbHabits, habitsLoading] = useCollection(habitsRef ? query(habitsRef, orderBy('created_at', 'desc')) : null);
  const [dbGoals] = useCollection(goalsRef ? query(goalsRef, orderBy('created_at', 'desc')) : null);
  const [dbInsights] = useCollection(insightsRef ? query(insightsRef, orderBy('created_at', 'desc'), limit(10)) : null);

  const [missions, setMissions] = useState<Mission[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [timelineMatrix, setTimelineMatrix] = useState<Mission[]>([]);
  const [focusTask, setFocusTask] = useState<Mission | null>(null);
  const [dailyScore, setDailyScore] = useState(0);
  const [motivationState, setMotivationState] = useState<MotivationState | null>(null);
  const [lifeState, setLifeState] = useState<LifeState>({
    score: 84,
    status: 'Peak',
    insight: 'Biometric Peak is arriving. Deep Work is optimal for the next 90 minutes.',
    focusLevel: 88,
    hydration: 1450
  });

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  const MODEL_NAME = "gemini-3-flash-preview";

  useEffect(() => {
    if (firebaseUser) {
      const userDoc = doc(db, 'users', firebaseUser.uid);
      getDocFromServer(userDoc).then(snap => {
        if (snap.exists()) {
          setUserProfile(snap.data());
        }
      });
    }
  }, [firebaseUser]);

  useEffect(() => {
    if (dbTasks) {
      const tasks = dbTasks.docs.map(doc => ({ ...doc.data(), id: doc.id } as unknown as Mission));
      setMissions(tasks);
      setTimelineMatrix(tasks.filter(m => m.startTime && m.endTime).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')));
    }
    if (dbHabits) setHabits(dbHabits.docs.map(doc => ({ ...doc.data(), id: doc.id } as unknown as Habit)));
    if (dbGoals) setGoals(dbGoals.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    if (dbInsights) setInsights(dbInsights.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  }, [dbTasks, dbHabits, dbGoals, dbInsights]);

  const [microReward, setMicroReward] = useState<string | null>(null);

  const generateDayPlan = async () => {
    if (!firebaseUser || missions.length === 0) return;

    const behavioralContext = {
      userProfile,
      lifeState,
      consistencySystem: habits.map(h => ({ title: h.title, streak: h.streak, current_count: h.current_count, goal_count: h.goal_count })),
      motivationState,
      currentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    };

    const prompt = `As an AI Life Architect, create a high-performance schedule for today.
    Tasks: ${JSON.stringify(missions.map(m => ({ id: m.id, title: m.title, duration: m.duration })))}
    Context: ${JSON.stringify(behavioralContext)}
    Return JSON array: [{ id, startTime, endTime }]. Use 24h format.`;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      let text = response.text || '[]';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) text = jsonMatch[0];
      const plan = JSON.parse(text);
      
      if (tasksRef && Array.isArray(plan)) {
        const updates = plan.map(async (item) => {
          if (item.id && item.startTime && item.endTime) {
            const taskDoc = doc(tasksRef, item.id);
            await setDoc(taskDoc, {
              startTime: String(item.startTime),
              endTime: String(item.endTime),
              updated_at: serverTimestamp()
            }, { merge: true });
          }
        });
        await Promise.all(updates);
      }
    } catch (err) {
      console.error("AI Day Planning failed:", err);
    }
  };

  const generateAiInsights = async () => {
    if (!firebaseUser) return;
    const prompt = `Analyze user performance and provide 3 actionable insights.
    State: ${JSON.stringify({ missions, habits, lifeState, motivationState })}
    Return JSON array: [{ insight_text, type }].`;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const insightsList = JSON.parse(response.text || '[]');
      if (insightsRef && Array.isArray(insightsList)) {
        for (const insight of insightsList) {
          await addDoc(insightsRef, {
            ...insight,
            user_id: firebaseUser.uid,
            is_read: false,
            created_at: serverTimestamp()
          });
        }
      }
    } catch (err) {
      console.error("AI Insights failed:", err);
    }
  };

  const handleAction = async (type: string, payload: any = {}) => {
    if (!firebaseUser) return;

    const sanitize = (obj: any) => {
      if (!obj || typeof obj !== 'object') return {};
      const newObj: any = {};
      const allowed = [
        'id', 'title', 'importance', 'urgency_score', 'estimated_effort', 'impact_level', 
        'duration', 'deadline', 'category', 'status', 'is_habit', 'streak', 
        'completed_at', 'created_at', 'startTime', 'endTime', 'updated_at', 'data',
        'firebase_uid', 'email', 'subscription_plan', 'role', 'trial_used',
        'description', 'frequency', 'goal_count', 'current_count', 'last_completed_at',
        'type', 'target_date', 'start_time', 'end_time', 'duration_minutes', 
        'distractions_count', 'efficiency_score', 'insight_text', 'is_read', 'task'
      ];
      Object.keys(obj).forEach(key => {
        if (allowed.includes(key) && obj[key] !== undefined) {
          newObj[key] = obj[key];
        }
      });
      return newObj;
    };

    const cleanPayload = sanitize(payload);

    try {
      switch (type) {
        case 'ADD_TASK': {
          if (!tasksRef) return;
          await addDoc(tasksRef, {
            ...cleanPayload,
            user_id: firebaseUser.uid,
            status: 'pending',
            created_at: serverTimestamp(),
            streak: 0,
            is_habit: cleanPayload.is_habit || false
          });
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
          break;
        }
        case 'COMPLETE_TASK': {
          if (!tasksRef) return;
          const taskDoc = doc(tasksRef, cleanPayload.id);
          await setDoc(taskDoc, {
            status: 'completed',
            completed_at: serverTimestamp(),
            streak: (cleanPayload.streak || 0) + 1
          }, { merge: true });
          
          const newScore = await updateDailyScore(firebaseUser.uid, missions, 0);
          setDailyScore(newScore);
          
          const msg = MOTIVATION_MESSAGES.REWARDS[Math.floor(Math.random() * MOTIVATION_MESSAGES.REWARDS.length)];
          setMicroReward(msg);
          setTimeout(() => setMicroReward(null), 3000);

          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          break;
        }
        case 'UPDATE_TASK': {
          if (!tasksRef) return;
          const taskDoc = doc(tasksRef, cleanPayload.id);
          await setDoc(taskDoc, {
            ...sanitize(cleanPayload.data || {}),
            updated_at: serverTimestamp()
          }, { merge: true });
          break;
        }
        case 'DELETE_TASK': {
          if (!tasksRef) return;
          await deleteDoc(doc(tasksRef, cleanPayload.id));
          break;
        }
        case 'START_FOCUS': {
          setFocusTask(cleanPayload.task);
          break;
        }
        case 'STOP_FOCUS': {
          setFocusTask(null);
          break;
        }
        case 'TOGGLE_HABIT': {
          if (!habitsRef) return;
          const habitDoc = doc(habitsRef, cleanPayload.id);
          await updateDoc(habitDoc, {
            current_count: (cleanPayload.current_count || 0) + 1,
            last_completed_at: serverTimestamp(),
            streak: (cleanPayload.streak || 0) + 1
          });
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
          break;
        }
        case 'ADD_HABIT': {
          if (!habitsRef) return;
          await addDoc(habitsRef, {
            ...cleanPayload,
            user_id: firebaseUser.uid,
            current_count: 0,
            streak: 0,
            created_at: serverTimestamp()
          });
          break;
        }
        case 'DELETE_HABIT': {
          if (!habitsRef) return;
          await deleteDoc(doc(habitsRef, cleanPayload.id));
          break;
        }
        case 'UPDATE_HABIT': {
          if (!habitsRef) return;
          const habitDoc = doc(habitsRef, cleanPayload.id);
          await updateDoc(habitDoc, {
            ...cleanPayload,
            updated_at: serverTimestamp()
          });
          break;
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, type);
    }
  };

  return (
    <AppContext.Provider value={{ 
      missions, 
      habits, 
      goals, 
      insights, 
      lifeState, 
      setLifeState,
      motivationState,
      setMotivationState,
      dailyScore,
      setDailyScore,
      focusTask,
      setFocusTask,
      timelineMatrix,
      loading: tasksLoading || habitsLoading,
      handleAction,
      microReward,
      generateDayPlan,
      generateAiInsights,
      userProfile
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
