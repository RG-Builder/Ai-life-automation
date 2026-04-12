import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

const testAdmin = async () => {
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
  const dbId = process.env.FIREBASE_DATABASE_ID || 'ai-studio-081e94ee-3f0c-4e02-8c9b-0200c6b3c314';
  
  const app = admin.initializeApp({
    credential: admin.credential.cert(sa)
  });
  
  const db = getFirestore(app, dbId);
  
  try {
    console.log(`Testing access to database: ${dbId}`);
    const snap = await db.collection('users').limit(1).get();
    console.log("✅ Success! Found users:", snap.size);
  } catch (err: any) {
    console.error("❌ Failed with error:", err.message);
    if (err.stack) console.error(err.stack);
  }
};

testAdmin();
