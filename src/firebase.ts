import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, getDocFromServer, doc } from 'firebase/firestore';
import defaultFirebaseConfig from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
  databaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || defaultFirebaseConfig.firestoreDatabaseId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || defaultFirebaseConfig.measurementId,
};

console.log("🔥 Firebase initializing with project:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Use getFirestore with the specific database instance ID provided in the config
export const db = getFirestore(app, firebaseConfig.databaseId);

// Set persistence to local
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.error("⚠️ Auth persistence error:", err);
});

// Analytics is disabled for sandbox compatibility
export const analytics = null;

// Test connection to Firestore only when signed in to avoid expected PERMISSION_DENIED
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      await getDocFromServer(doc(db, '_connection_test_', 'init'));
      console.log("✅ Firestore connection test successful for user:", user.uid);
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        console.warn("ℹ️ Firestore connection test: Permission denied (expected if rules are strict)");
      } else {
        console.error("❌ Firestore connection test failed:", error.message);
      }
    }
  }
});

export const googleProvider = new GoogleAuthProvider();

export default app;
