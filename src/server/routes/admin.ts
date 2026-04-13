import express, { Response } from "express";
import { AuthenticatedRequest, verifyFirebaseToken } from "../middleware/auth";
import { getFirestore } from "firebase-admin/firestore";

const router = express.Router();

// Admin Stats
router.get("/stats", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: "Forbidden" });
  }

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

export default router;
