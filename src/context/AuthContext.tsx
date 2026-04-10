import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  googleProvider 
} from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '../types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Sync with our local user state/Firestore profile
        const userDoc = doc(db, 'users', fbUser.uid);
        const snap = await getDoc(userDoc);
        
        if (snap.exists()) {
          const data = snap.data();
          setUser({
            id: fbUser.uid,
            email: fbUser.email || '',
            plan: data.subscription_plan || 'free',
            role: data.role || 'user'
          });
        } else {
          // Create initial profile
          const initialData = {
            firebase_uid: fbUser.uid,
            email: fbUser.email,
            subscription_plan: 'free',
            role: 'user',
            created_at: serverTimestamp(),
            morning_person_score: 0.5,
            peak_energy_start: '09:00',
            peak_energy_end: '11:00',
            focus_duration_avg: 25
          };
          await setDoc(userDoc, initialData);
          setUser({
            id: fbUser.uid,
            email: fbUser.email || '',
            plan: 'free',
            role: 'user'
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('lifepilot_token');
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, loginWithGoogle, logout, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
