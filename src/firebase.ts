import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

// Use environment variables instead of JSON file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ||
         process.env.FIREBASE_API_KEY ||
         "AIzaSyAavRxJ7HZUR8d0QQ0V6qUWmvGiSa-1ueY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
              process.env.FIREBASE_AUTH_DOMAIN ||
              "gen-lang-client-0335857006.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ||
             process.env.FIREBASE_PROJECT_ID ||
             "gen-lang-client-0335857006",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ||
         process.env.FIREBASE_APP_ID ||
         "1:1024422333401:web:8f2bdc06340b24d5fde7c8",
  databaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID ||
              process.env.FIREBASE_DATABASE_ID ||
              "ai-studio-081e94ee-3f0c-4e02-8c9b-0200c6b3c314",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
                 process.env.FIREBASE_STORAGE_BUCKET ||
                 "gen-lang-client-0335857006.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
                     process.env.FIREBASE_MESSAGING_SENDER_ID ||
                     "1024422333401",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ||
                 process.env.FIREBASE_MEASUREMENT_ID ||
                 "G-YYS0PCT8QN",
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
