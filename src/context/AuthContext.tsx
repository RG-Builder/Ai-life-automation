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
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const updateUserProfile = async (data: Partial<User>) => {
    if (!firebaseUser) return;
    try {
      const userDoc = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDoc, data, { merge: true });
      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          // Sync with our local user state/Firestore profile
          const userDoc = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDoc);
          
          if (snap.exists()) {
            const data = snap.data();
            setUser({
              id: fbUser.uid,
              email: fbUser.email || '',
              plan: data.subscription_plan || 'free',
              role: data.role || 'user',
              onboardingComplete: data.onboardingComplete || false,
              wakeTime: data.wakeTime || '07:00',
              directive: data.directive || 'Balance & Growth',
              lifeScore: data.lifeScore || 0,
              streak: data.streak || 0
            });
            console.log("✅ User profile loaded from Firestore");
          } else {
            // Create initial profile
            console.log("🆕 Creating new user profile in Firestore...");
            const initialData = {
              email: fbUser.email,
              subscription_plan: 'free',
              role: 'user',
              created_at: new Date().toISOString(),
              onboardingComplete: false,
              wakeTime: '07:00',
              directive: 'Balance & Growth',
              lifeScore: 0,
              streak: 0
            };
            await setDoc(userDoc, initialData);
            setUser({
              id: fbUser.uid,
              email: fbUser.email || '',
              plan: 'free',
              role: 'user',
              onboardingComplete: false,
              wakeTime: '07:00',
              directive: 'Balance & Growth',
              lifeScore: 0,
              streak: 0
            });
            console.log("✅ New user profile created successfully");
          }
        } catch (error: any) {
          console.error("❌ Error syncing user profile:", error);
          // Don't block the app if profile sync fails, but log it
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
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === 'auth/user-cancelled' || error.code === 'auth/popup-closed-by-user') {
        // User cancelled the login, no need to throw an error
        return;
      }
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
    <AuthContext.Provider value={{ firebaseUser, user, loading, loginWithGoogle, logout, isAuthReady, updateUserProfile }}>
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
