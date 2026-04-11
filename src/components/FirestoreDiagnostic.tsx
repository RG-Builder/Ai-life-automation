import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';

const FirestoreDiagnostic: React.FC = () => {
  const { firebaseUser, isAuthReady } = useAuth();
  const [diagnosticLog, setDiagnosticLog] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthReady) return;

    const runDiagnostic = async () => {
      const logs: string[] = [];
      const log = (msg: string) => {
        console.log(msg);
        logs.push(msg);
        setDiagnosticLog([...logs]);
      };

      log("🔍 FIRESTORE DIAGNOSTIC STARTED");

      if (!firebaseUser) {
        log("❌ User not authenticated");
        return;
      }

      log(`✅ User authenticated: ${firebaseUser.uid}`);

      try {
        // 1. Check user document
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          log("✅ User document exists");
        } else {
          log("⚠️ User document missing");
        }

        // 2. Check tasks collection
        const tasksRef = collection(db, 'users', firebaseUser.uid, 'tasks');
        const tasksSnap = await getDocs(tasksRef);
        log(`✅ Tasks readable: ${tasksSnap.size} tasks found`);

        // 3. Test write operation
        const testTaskRef = await addDoc(tasksRef, {
          title: "Diagnostic Test Task",
          created_at: new Date().toISOString(),
          status: 'pending',
          is_diagnostic: true
        });
        log("✅ Test task created successfully");

        // 4. Cleanup test task
        await deleteDoc(testTaskRef);
        log("✅ Test task cleaned up");

      } catch (error: any) {
        log(`❌ Diagnostic failed: ${error.message}`);
        console.error(error);
        
        // Send error to server for logging
        try {
          await fetch('/api/log-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error.message, stack: error.stack })
          });
        } catch (e) {}
      }
    };

    runDiagnostic();
  }, [firebaseUser, isAuthReady]);

  if (diagnosticLog.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-md max-h-64 overflow-y-auto">
      <h3 className="font-bold mb-2 text-blue-400">Diagnostic Logs:</h3>
      {diagnosticLog.map((msg, i) => (
        <div key={i} className={msg.includes('❌') ? 'text-red-400' : msg.includes('✅') ? 'text-green-400' : 'text-gray-300'}>
          {msg}
        </div>
      ))}
    </div>
  );
};

export default FirestoreDiagnostic;
