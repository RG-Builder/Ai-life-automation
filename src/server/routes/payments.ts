import express, { Response } from "express";
import { AuthenticatedRequest, verifyFirebaseToken } from "../middleware/auth";
import Razorpay from "razorpay";
import crypto from "crypto";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { BILLING_PLANS } from "../config/billing.config";

const router = express.Router();

// Razorpay Integration
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
});

router.post("/create-order", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
  const { planId } = req.body;
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const userId = req.user.id;

  if (!planId || typeof planId !== "string") {
    return res.status(400).json({ error: "Missing required planId" });
  }

  const selectedPlan = BILLING_PLANS[planId];
  if (!selectedPlan) {
    return res.status(400).json({ error: "Invalid planId" });
  }

  try {
    const db = getFirestore();
    if (!db) throw new Error("Database not initialized");

    const expectedAmountSubunits = Math.round(selectedPlan.amount * 100);
    const options = {
      amount: expectedAmountSubunits,
      currency: selectedPlan.currency,
      receipt: `receipt_order_${userId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await db.collection("users").doc(userId).collection("payments").doc(order.id).set({
      plan_id: planId,
      expected_amount_subunits: expectedAmountSubunits,
      expected_currency: selectedPlan.currency,
      billing_period: selectedPlan.billingPeriod,
      razorpay_order_id: order.id,
      status: "created",
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
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

  const db = getFirestore();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  const paymentRef = db.collection("users").doc(userId).collection("payments").doc(razorpay_order_id);
  const userRef = db.collection("users").doc(userId);

  const paymentSnap = await paymentRef.get();
  if (!paymentSnap.exists) {
    return res.status(400).json({ error: "Payment order not found" });
  }

  const paymentRecord = paymentSnap.data();
  if (!paymentRecord) {
    return res.status(400).json({ error: "Payment record is invalid" });
  }

  if (paymentRecord.status === "captured") {
    return res.json({ success: true, message: "Payment already verified" });
  }

  const markFailed = async (reason: string) => {
    await paymentRef.update({
      status: "failed",
      failure_reason: reason,
      razorpay_payment_id,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    return res.status(400).json({ error: reason });
  };

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generatedSignature = hmac.digest("hex");

  if (generatedSignature !== razorpay_signature) {
    return markFailed("Payment verification failed");
  }

  const [razorpayPayment, razorpayOrder] = await Promise.all([
    razorpay.payments.fetch(razorpay_payment_id),
    razorpay.orders.fetch(razorpay_order_id),
  ]);

  if (!razorpayPayment || !razorpayOrder) {
    return markFailed("Unable to fetch payment details");
  }

  if (razorpayPayment.status !== "captured") {
    return markFailed("Payment is not captured");
  }

  if (razorpayPayment.order_id !== razorpay_order_id || razorpayOrder.id !== razorpay_order_id) {
    return markFailed("Order mismatch during verification");
  }

  if (
    razorpayPayment.amount !== paymentRecord.expected_amount_subunits ||
    razorpayPayment.currency !== paymentRecord.expected_currency
  ) {
    return markFailed("Amount or currency mismatch");
  }

  const transactionResult = await db.runTransaction(async (tx) => {
    const latestPaymentSnap = await tx.get(paymentRef);
    const latestPayment = latestPaymentSnap.data();

    if (!latestPaymentSnap.exists || !latestPayment) {
      throw new Error("Payment order not found");
    }

    if (latestPayment.status === "captured") {
      return "already_processed";
    }

    tx.update(paymentRef, {
      status: "captured",
      razorpay_payment_id,
      verified_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    tx.update(userRef, {
      subscription_plan: "premium",
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return "processed";
  });

  if (transactionResult === "already_processed") {
    return res.json({ success: true, message: "Payment already verified" });
  }

  return res.json({ success: true, message: "Subscription upgraded successfully" });
});

router.post("/cancel-subscription", verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const userId = req.user.id;
  const db = getFirestore();
  if (!db) return res.status(500).json({ error: "Database not initialized" });
  await db.collection("users").doc(userId).update({ subscription_plan: "trial" });
  res.json({ success: true, message: "Subscription cancelled" });
});

export default router;
