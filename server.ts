console.log("Starting server.ts...");
import fs from 'fs';

const logStream = fs.createWriteStream('server.log', { flags: 'a' });
const originalLog = console.log;
const originalError = console.error;
console.log = function(...args) {
  logStream.write(new Date().toISOString() + ' LOG: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') + '\n');
  originalLog.apply(console, args);
};
console.error = function(...args) {
  logStream.write(new Date().toISOString() + ' ERR: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') + '\n');
  originalError.apply(console, args);
};

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import crypto from "crypto";
import admin from "firebase-admin";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { rateLimit } from 'express-rate-limit';
import axios from "axios";
import validator from "validator";

import { GoogleGenAI, Type } from "@google/genai";
import { OpenRouter } from "@openrouter/sdk";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // Initialize Firebase Admin
  let firebaseAdminInitialized = false;
  let db: admin.firestore.Firestore | null = null;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        let saString = (process.env.FIREBASE_SERVICE_ACCOUNT || "").trim();
        
        // Handle cases where the secret might be double-quoted or escaped
        if (saString.startsWith('"') && saString.endsWith('"')) {
          saString = saString.substring(1, saString.length - 1);
        }
        
        // Unescape common characters if they are escaped
        saString = saString.replace(/\\n/g, '\n').replace(/\\"/g, '"');

        if (saString) {
          saString = saString.trim();
          if (!saString.startsWith('{')) {
            saString = '{' + saString;
          }
          if (!saString.endsWith('}')) {
            saString = saString + '}';
          }
          
          // Fix unescaped newlines in private_key
          saString = saString.replace(/\n/g, '\\n');

          const serviceAccount = JSON.parse(saString);
          if (serviceAccount && serviceAccount.project_id && serviceAccount.private_key) {
            const adminApp = admin.initializeApp({
              credential: admin.credential.cert(serviceAccount)
            });
            firebaseAdminInitialized = true;
            
            // Use FIREBASE_DATABASE_ID if provided, otherwise default to '(default)'
            const databaseId = process.env.FIREBASE_DATABASE_ID || undefined;
            console.log(`✅ Firebase Admin initialized for project: ${serviceAccount.project_id}, Database: ${databaseId || '(default)'}`);
            
            db = getFirestore(adminApp, databaseId);
          }
        }
      } catch (e: any) {
        console.error("❌ Firebase Admin initialization failed:", e.message);
        console.error("Raw string length:", (process.env.FIREBASE_SERVICE_ACCOUNT || "").length);
      }
  } else {
    console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT not found. Some backend features may be limited.");
  }
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database will be initialized inside startServer

async function startServer() {
  console.log("startServer function called...");
  
  const app = express();
  const PORT = 3000;

  // Trust proxy is required when running behind a load balancer (like Cloud Run)
  // to correctly identify client IP for rate limiting.
  app.set('trust proxy', 1);

  // Global Rate Limiting
  const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per minute
    message: { error: "Too many requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // AI Specific Rate Limiting
  const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per window
    message: { error: "Too many AI requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com", "https://*.googleapis.com", "https://*.googletagmanager.com", "https://www.gstatic.com", "https://*.firebaseapp.com", "https://*.firebaseauth.com", "https://apis.google.com", "https://accounts.google.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://picsum.photos", "https://lh3.googleusercontent.com", "https://*.google-analytics.com", "https://*.google.com"],
        connectSrc: [
          "'self'", 
          "https://*.run.app",
          "https://api.razorpay.com", 
          "https://lumberjack.razorpay.com",
          "https://*.googleapis.com",
          "https://*.firebaseio.com",
          "https://*.firebaseapp.com",
          "https://*.firebaseauth.com",
          "https://*.firebasestorage.app",
          "https://*.google-analytics.com",
          "https://*.googletagmanager.com",
          "https://*.google.com",
          "https://*.gstatic.com",
          "https://apis.google.com",
          "https://accounts.google.com"
        ],
        frameSrc: ["'self'", "https://api.razorpay.com", "https://*.firebaseapp.com", "https://*.firebaseauth.com", "https://*.google.com", "https://accounts.google.com"],
        frameAncestors: ["'self'", "https://*.google.com", "https://*.run.app", "http://localhost:*", "https://*.firebaseapp.com", "https://*.firebaseauth.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    frameguard: false,
  }));
  app.use(cors());
  app.use(compression());
  app.use(express.json());
  app.get("/manifest.json", (req, res) => {
    res.sendFile(path.join(__dirname, "manifest.json"));
  });
  app.get("/robots.txt", (req, res) => {
    res.sendFile(path.join(__dirname, "robots.txt"));
  });

  app.use("/api", globalLimiter);

  app.post("/api/log-error", express.json(), (req, res) => {
    console.error("🚨 CLIENT ERROR LOGGED:");
    console.error(req.body.error);
    if (req.body.stack) console.error(req.body.stack);
    
    const fs = require('fs');
    fs.appendFileSync('client-errors.log', new Date().toISOString() + ' - ' + req.body.error + '\n');
    
    res.json({ status: "ok" });
  });

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Access denied" });

    jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_only', (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev_secret_only')) {
        console.error("CRITICAL SECURITY ERROR: JWT_SECRET is not set in production!");
        return res.status(500).json({ error: "Server configuration error" });
      }
      req.user = user;
      next();
    });
  };

  // Nodemailer Setup
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const sendVerificationEmail = async (email: string, token: string) => {
    const verificationUrl = `${process.env.APP_URL}/api/auth/verify?token=${token}`;
    const supportEmail = "lifepilotai.app@gmail.com";
    const mailOptions = {
      from: `"LifePilot AI" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Verify your LifePilot AI account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #f9fafb; border-radius: 16px; }
            .content { background-color: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; margin-bottom: 32px; }
            .logo { font-size: 28px; font-weight: 800; color: #4f46e5; letter-spacing: -0.025em; }
            .title { color: #111827; font-size: 24px; font-weight: 700; margin-bottom: 16px; text-align: center; }
            .text { color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
            .button-container { text-align: center; margin: 32px 0; }
            .button { background-color: #4f46e5; color: #ffffff !important; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; display: inline-block; transition: background-color 0.2s; }
            .footer { text-align: center; margin-top: 32px; color: #9ca3af; font-size: 14px; }
            .support { color: #6b7280; font-size: 13px; margin-top: 16px; }
            .link { color: #4f46e5; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">LifePilot AI</div>
            </div>
            <div class="content">
              <h1 class="title">Verify your email</h1>
              <p class="text">Welcome to LifePilot AI! We're thrilled to have you on board. To start optimizing your productivity and mastering your schedule, please verify your email address by clicking the button below.</p>
              <div class="button-container">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p class="text" style="font-size: 14px; color: #6b7280;">If the button above doesn't work, you can also copy and paste this link into your browser:</p>
              <p class="text" style="font-size: 13px; color: #4f46e5; word-break: break-all;">${verificationUrl}</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 LifePilot AI. All rights reserved.</p>
              <p class="support">Need help? Contact us at <a href="mailto:${supportEmail}" class="link">${supportEmail}</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
    await transporter.sendMail(mailOptions);
  };

  // Firebase Auth Middleware
  const verifyFirebaseToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      if (!firebaseAdminInitialized) {
        // Fallback: Decode the token without verifying signature if Admin SDK is not available
        const decoded = jwt.decode(token) as any;
        const uid = decoded?.uid || decoded?.user_id || decoded?.sub;
        if (decoded && uid) {
           req.user = { 
             id: uid, 
             email: decoded.email, 
             role: 'user', 
             subscription_plan: 'trial' 
           };
           return next();
        }
        return authenticateToken(req, res, next);
      }

      const decodedToken = await admin.auth().verifyIdToken(token);
      if (!db) {
        console.error("❌ Firestore database not initialized. Cannot fetch user profile.");
        return res.status(500).json({ error: "Database not initialized" });
      }
      const userRef = db.collection('users').doc(decodedToken.uid);
      const userDoc = await userRef.get();
      
      let user;
      if (!userDoc.exists) {
        user = { 
          id: decodedToken.uid, 
          email: decodedToken.email, 
          subscription_plan: 'trial',
          role: 'user',
          trial_used: 0,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        };
        await userRef.set(user);
        console.log(`New user registered: ${decodedToken.email} (${decodedToken.uid})`);
      } else {
        user = userDoc.data();
        user.id = decodedToken.uid;
      }
      
      req.user = user;
      next();
    } catch (error: any) {
      console.error("Auth Error:", error.message);
      
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ error: "Token expired", code: "TOKEN_EXPIRED" });
      }
      
      res.status(401).json({ error: "Invalid authentication" });
    }
  };

  // AI Gateway Logic
  const AI_MODELS = {
    PRIMARY: "gemini-3.1-pro-preview",
    FAST: "gemini-3-flash-preview"
  };

  const LIFE_PILOT_SYSTEM_PROMPT = `
You are the AI orchestration layer for "Life Pilot".
Your goal: Deliver fast, intelligent, and reliable responses.

RESPONSE STANDARD:
1. Next Action (Required)
2. Schedule (Optional, if relevant)
3. Insight (Optional, if relevant)

Keep responses: Short, actionable, and clear.
Use user data (tasks, deadlines, history) when provided.
If data is missing, make reasonable assumptions and still provide useful output.
Do NOT mention which model you are using.
`;

  const handle_ai_request = async (user: any, prompt: string, taskType: 'simple' | 'complex' = 'simple', systemInstruction: string = "") => {
    const userId = user.id;
    const plan = user.subscription_plan;

    const fullSystemInstruction = `${LIFE_PILOT_SYSTEM_PROMPT}\n${systemInstruction}`;

    // 3. Model Routing Logic
    // If task involves planning, constraints, or optimization, use THINKING MODEL
    const isThinkingTask = taskType === 'complex' || 
                           prompt.toLowerCase().includes('plan') || 
                           prompt.toLowerCase().includes('schedule') || 
                           prompt.toLowerCase().includes('optimize') ||
                           prompt.toLowerCase().includes('constraint') ||
                           prompt.toLowerCase().includes('prioritize');
    
    const selectedModel = isThinkingTask ? AI_MODELS.PRIMARY : AI_MODELS.FAST;

    const callAI = async (model: string, retryCount = 0): Promise<any> => {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("AI service configuration error: GEMINI_API_KEY is missing. Please add it in the Secrets panel.");
      }
      
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            systemInstruction: fullSystemInstruction,
          }
        });

        return {
          text: response.text || "",
          usage: null,
          model: model,
          reasoningTokens: 0
        };
      } catch (err: any) {
        console.error(`AI Model ${model} failed (Attempt ${retryCount + 1}):`, err.message);
        
        // Retry once on the same model if it's a transient error
        if (retryCount < 1) {
          return await callAI(model, retryCount + 1);
        }
        throw err;
      }
    };

    const callAIWithFallback = async () => {
      try {
        console.log(`Calling AI Model: ${selectedModel} for user ${userId} (Task: ${taskType})`);
        return await callAI(selectedModel);
      } catch (err: any) {
        // Fallback chain: PRIMARY -> FAST
        if (selectedModel === AI_MODELS.PRIMARY) {
          console.warn(`Falling back to FAST model: ${AI_MODELS.FAST} due to error: ${err.message}`);
          try {
            return await callAI(AI_MODELS.FAST);
          } catch (fastErr: any) {
            console.error("FAST model also failed. Returning simplified response.");
            return {
              text: "Next Action: Take a deep breath and focus on your most important task.\n\nInsight: I'm currently operating in offline mode, but I'm still here to help you stay on track.",
              usage: null,
              model: "static-fallback",
              reasoningTokens: 0
            };
          }
        } else {
          console.error("AI model failed. Returning simplified response.");
          return {
            text: "Next Action: Focus on your current priority.\n\nInsight: AI systems are temporarily limited, but your productivity doesn't have to be.",
            usage: null,
            model: "static-fallback",
            reasoningTokens: 0
          };
        }
      }
    };

    try {
      // 1. Check Caching
      const promptHash = crypto.createHash('sha256').update(prompt + systemInstruction).digest('hex');
      let cachedDoc: any = null;
      let usageRef: any = null;
      let cacheRef: any = null;
      const today = new Date().toISOString().split('T')[0];

      if (db) {
        cacheRef = db.collection('ai_cache').doc(promptHash);
        cachedDoc = await cacheRef.get();
        if (cachedDoc.exists) {
          console.log(`AI Cache Hit for user ${userId}`);
          return { text: cachedDoc.data()?.response, cached: true };
        }

        // 2. Cost Control & Limits
        usageRef = db.collection('users').doc(userId).collection('usage_logs');
        const dailyRequests = await usageRef.where('date', '==', today).get();
        
        // Free users: max 3 total. Premium: 50/day.
        const limits = plan === 'premium' 
          ? { requests: 50, tokens: 200000 } 
          : { requests: 3, tokens: 10000 };

        if (dailyRequests.size >= limits.requests) {
          throw new Error(`Limit reached (${limits.requests} requests/day). Please try again tomorrow or upgrade.`);
        }
      } else {
        console.warn("⚠️ AI Cache disabled: Firestore not initialized.");
      }

      const result = await callAIWithFallback();

      const aiText = result.text;
      const tokensUsed = result.usage?.total_tokens || Math.ceil((prompt.length + aiText.length) / 4);

      if (db && usageRef && cacheRef) {
        // 4. Log Usage & Cache
        await usageRef.add({
          tokens_used: tokensUsed,
          date: today,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
        await cacheRef.set({
          response: aiText,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      return { text: aiText, cached: false, model: result.model, reasoningTokens: result.reasoningTokens };
    } catch (error: any) {
      // Handle different error structures (Axios vs SDK)
      const errorData = error.response?.data || error.data || error;
      const status = error.response?.status || error.status || error.statusCode;
      
      console.log("DEBUG ERROR:", { status, errorDataMessage: errorData?.error?.message, errorMessage: error.message });
      
      const errorLog = `AI Request Handler Error: ${JSON.stringify(errorData, null, 2) || error.message}\n`;
      fs.appendFileSync('ai-errors.log', errorLog);
      console.error(errorLog);
      
      let userMessage = "AI service temporarily unavailable. Please try again later.";
      
      if (status === 401) {
        if (errorData?.error?.message === 'User not found.') {
          userMessage = "OpenRouter API Key error: 'User not found'. Your OpenRouter API key is invalid or the account was deleted. Please update it in the Secrets panel.";
        } else {
          userMessage = "Invalid AI API configuration. Please check your API keys.";
        }
      } else if (status === 403) {
        userMessage = "AI service access forbidden. This may be due to environment restrictions or missing headers.";
      } else if (status === 402) {
        userMessage = "AI service quota exceeded. Please try again later.";
      } else if (errorData?.error?.message) {
        userMessage = `AI Error: ${errorData.error.message}`;
      } else if (error.message) {
        userMessage = `AI Error: ${error.message}`;
      }
      
      throw new Error(userMessage);
    }
  };

  app.post("/api/ai/generate", verifyFirebaseToken, aiLimiter, async (req: any, res: any) => {
    console.log("Received AI request:", req.body);
    let { prompt, systemInstruction, taskType } = req.body;
    const user = req.user;

    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    // Input length limits
    prompt = String(prompt).substring(0, 5000);
    systemInstruction = String(systemInstruction || "You are a helpful assistant.").substring(0, 2000);

    try {
      const result = await handle_ai_request(user, prompt, taskType, systemInstruction);
      res.json(result);
    } catch (error: any) {
      console.error("Error in /api/ai/generate route:", error);
      res.status(error.message.includes("limit") ? 403 : 500).json({ error: error.message });
    }
  });

  // Usage logging is handled internally by AI generation endpoint
  // Removed public usage logging endpoint to prevent database pollution exploits


  app.get("/api/auth/me", verifyFirebaseToken, (req: any, res) => {
    res.json(req.user);
  });

  // Razorpay Integration
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
  });

  app.post("/api/payments/create-order", verifyFirebaseToken, async (req: any, res) => {
    const { amount, currency = "INR" } = req.body;
    const userId = req.user.id;

    try {
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

  app.post("/api/payments/verify", verifyFirebaseToken, async (req: any, res: any) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
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

  app.post("/api/payments/cancel-subscription", verifyFirebaseToken, async (req: any, res) => {
    const userId = req.user.id;
    if (!db) return res.status(500).json({ error: "Database not initialized" });
    await db.collection('users').doc(userId).update({ subscription_plan: 'trial' });
    res.json({ success: true, message: "Subscription cancelled" });
  });

  // Admin Stats
  app.get("/api/admin/stats", verifyFirebaseToken, async (req: any, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!db) return res.status(500).json({ error: "Database not initialized" });
    const usersSnap = await db.collection('users').get();
    const premiumUsersSnap = await db.collection('users').where('subscription_plan', '==', 'premium').get();
    
    res.json({
      totalUsers: usersSnap.size,
      premiumUsers: premiumUsersSnap.size,
      totalRevenue: 0 // Would need a more complex query or aggregation
    });
  });

  // Global Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: err.message
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      console.log("Creating Vite server...");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      console.log("Vite server created successfully.");
      app.use(vite.middlewares);
    } catch (e) {
      console.error("Failed to create Vite server:", e);
    }
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  }).on('error', (err: any) => {
    console.error("Server failed to start (listen error):", err);
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use.`);
    }
  });
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

startServer().catch(err => {
  console.error("Critical error in startServer execution:", err);
});
