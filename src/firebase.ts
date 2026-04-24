import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { initializeFirestore, getDocFromServer, doc } from 'firebase/firestore';
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

console.log("🔥 Firebase initializing...");
const app = initializeApp(firebaseConfig);
console.log("✅ Firebase initialized");


export const firebaseConfigExport = firebaseConfig;
export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence).catch(err => {
  console.error("⚠️ Auth persistence error:", err);
});

// Analytics is disabled to prevent 403 Permission Denied errors from the Installations API
// which often happens in sandboxed environments or when the API is not enabled in the project.
export const analytics = null;

// Initialize Firestore without experimental flags
export const db = initializeFirestore(
  app,
  {
    cacheSizeBytes: 10485760,
  },
  firebaseConfig.databaseId
);

// Test connection to Firestore
async function testConnection() {
  if (firebaseConfig.apiKey === "mock-api-key") {
    console.log("ℹ️ Running in Demo Mode (Mock Firebase Config)");
    return;
  }
  
  try {
    // Attempt to fetch a non-existent doc to test connection
    await getDocFromServer(doc(db, '_connection_test_', 'init'));
    console.log("✅ Firestore connection test successful");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("❌ Firebase configuration error: The client is offline. Please check your Firebase setup.");
    }
    // Other errors (like 403) are handled by security rules or are expected if the doc doesn't exist
  }
}
testConnection();

export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: Array<{
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }>;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('❌ Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default app;
