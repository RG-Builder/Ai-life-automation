import express, { Response } from "express";
import { AuthenticatedRequest, verifyFirebaseToken } from "../middleware/auth";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

const router = express.Router();

const requireAdmin = (req: AuthenticatedRequest, res: Response): boolean => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  return true;
};

// Admin Stats
router.get("/stats", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const db = getFirestore();
  if (!db) return res.status(500).json({ error: "Database not initialized" });
  const usersSnap = await db.collection('users').get();
  const premiumUsersSnap = await db.collection('users').where('subscription_plan', '==', 'premium').get();
  
  res.json({
    totalUsers: usersSnap.size,
    premiumUsers: premiumUsersSnap.size,
    totalRevenue: 0 // Would need a more complex query or aggregation
  });
});

// Admin-only role/subscription provisioning.
router.post("/users/:uid/access", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!requireAdmin(req, res)) return;

  const { uid } = req.params;
  const { role, subscription_plan } = req.body || {};

  const allowedRoles = new Set(["user", "admin"]);
  const allowedPlans = new Set(["trial", "premium"]);

  if (!allowedRoles.has(role) || !allowedPlans.has(subscription_plan)) {
    return res.status(400).json({
      error: "Invalid payload",
      details: "role must be one of [user, admin] and subscription_plan must be one of [trial, premium]"
    });
  }

  const db = getFirestore();
  const userRef = db.collection("users").doc(uid);
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    return res.status(404).json({ error: "User not found" });
  }

  await userRef.update({
    role,
    subscription_plan,
    updated_by: req.user?.id || "unknown-admin",
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  });

  return res.json({
    success: true,
    uid,
    role,
    subscription_plan
  });
});

export default router;
