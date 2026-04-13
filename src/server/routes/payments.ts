import express, { Response } from "express";
import { AuthenticatedRequest, verifyFirebaseToken } from "../middleware/auth";
import Razorpay from "razorpay";
import crypto from "crypto";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

const router = express.Router();

// Razorpay Integration
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

router.post("/create-order", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
  const { amount, currency = "INR" } = req.body;
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const userId = req.user.id;

  try {
    const db = getFirestore();
    if (!db) throw new Error("Database not initialized");
    const options = {
      amount: amount * 100,
      currency,
      receipt: `receipt_order_${userId}_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    
    await db.collection('users').doc(userId).collection('payments').doc(order.id).set({
      amount,
      currency,
      status: 'created',
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Order creation failed" });
  }
});

router.post("/verify", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const userId = req.user.id;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing payment verification details" });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest("hex");

  if (generated_signature === razorpay_signature) {
    const db = getFirestore();
    if (!db) return res.status(500).json({ error: "Database not initialized" });
    const batch = db.batch();
    const paymentRef = db.collection('users').doc(userId).collection('payments').doc(razorpay_order_id);
    const userRef = db.collection('users').doc(userId);

    batch.update(paymentRef, { 
      razorpay_payment_id, 
      status: 'captured',
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    batch.update(userRef, { 
      subscription_plan: 'premium',
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    await batch.commit();
    res.json({ success: true, message: "Subscription upgraded successfully" });
  } else {
    res.status(400).json({ error: "Payment verification failed" });
  }
});

router.post("/cancel-subscription", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const userId = req.user.id;
  const db = getFirestore();
  if (!db) return res.status(500).json({ error: "Database not initialized" });
  await db.collection('users').doc(userId).update({ subscription_plan: 'trial' });
  res.json({ success: true, message: "Subscription cancelled" });
});

export default router;
