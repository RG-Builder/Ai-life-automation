import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

export interface AuthUser {
  id: string;
  email: string;
  subscription_plan: string;
  role: string;
  trial_used: number;
  [key: string]: any;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// Auth Middleware (JWT)
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_only', (err: jwt.VerifyErrors | null, user: string | jwt.JwtPayload | undefined) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev_secret_only')) {
      console.error("CRITICAL SECURITY ERROR: JWT_SECRET is not set in production!");
      return res.status(500).json({ error: "Server configuration error" });
    }
    req.user = user as AuthUser;
    next();
  });
};

// Firebase Auth Middleware
export const verifyFirebaseToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    const db = getFirestore();
    const userRef = db.collection('users').doc(decodedToken.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      const now = admin.firestore.FieldValue.serverTimestamp();
      const newUser: AuthUser = {
        id: decodedToken.uid,
        email: decodedToken.email || '',
        subscription_plan: 'trial',
        role: 'user',
        trial_used: 0
      };

      await userRef.set({
        ...newUser,
        created_at: now,
        updated_at: now,
        updated_by: 'system:auto-provision'
      });
      console.log(`New user registered: ${decodedToken.email} (${decodedToken.uid})`);
      req.user = newUser;
      return next();
    }

    const firestoreUser = userDoc.data() as Partial<AuthUser> | undefined;
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email || firestoreUser?.email || '',
      subscription_plan: firestoreUser?.subscription_plan || 'trial',
      role: firestoreUser?.role || 'user',
      trial_used: firestoreUser?.trial_used || 0,
      ...(firestoreUser || {})
    };
    next();
  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ Auth Middleware Error:", err.message);
    if (err.stack) console.error(err.stack);
    
    if ((err as any).code === 'auth/id-token-expired') {
      return res.status(401).json({ error: "Token expired", code: "TOKEN_EXPIRED" });
    }
    
    res.status(401).json({ error: "Authentication failed", details: err.message });
  }
};
