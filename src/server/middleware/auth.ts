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
  if (req.user?.id) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    let user: AuthUser = {
      id: decodedToken.uid,
      email: decodedToken.email || '',
      subscription_plan: 'trial',
      role: 'user',
      trial_used: 0
    };

    try {
      const db = getFirestore();
      const userRef = db.collection('users').doc(decodedToken.uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        await userRef.set({
          ...user,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`New user registered: ${decodedToken.email} (${decodedToken.uid})`);
      } else {
        user = { ...(userDoc.data() as AuthUser), id: decodedToken.uid };
      }
    } catch (dbError: unknown) {
      console.error("⚠️ Firestore profile fetch failed, using default profile:", (dbError as Error).message);
      // Check if this is the bootstrapped admin
      if (decodedToken.email === "realprouser1234@gmail.com" && decodedToken.email_verified) {
        user.role = 'admin';
        user.subscription_plan = 'premium';
      }
    }
    
    req.user = user;
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
