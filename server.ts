import fs from 'fs';
import { logger, LOGGING_STRATEGY } from './src/server/logger';

import express, { Request, Response, NextFunction } from "express";
import aiRoutes from "./src/server/routes/ai";
import authRoutes from "./src/server/routes/auth";
import paymentRoutes from "./src/server/routes/payments";
import adminRoutes from "./src/server/routes/admin";

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

import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

logger.info('Logger initialized', { loggingStrategy: LOGGING_STRATEGY });

// Environment Variable Validation
const requiredEnvVars = [
  'JWT_SECRET',
  'OPENROUTER_API_KEY'
];

if (process.env.NODE_ENV === 'production') {
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missingVars.length > 0) {
    logger.error(`❌ FATAL ERROR: Missing required environment variables in production: ${missingVars.join(', ')}`);
    process.exit(1);
  }
  if (process.env.JWT_SECRET === 'dev_secret_only') {
    logger.error(`❌ FATAL ERROR: Using development JWT_SECRET in production!`);
    process.exit(1);
  }
}

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
            
            // Prioritize firebase-applet-config.json for databaseId, then FIREBASE_DATABASE_ID env var
            let databaseId = "";
            try {
              const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
              if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                databaseId = config.firestoreDatabaseId;
              }
            } catch (err) {
              logger.warn("⚠️ Could not read firebase-applet-config.json for databaseId");
            }
            
            if (!databaseId) {
              databaseId = process.env.FIREBASE_DATABASE_ID || "";
            }
            
            logger.info(`✅ Firebase Admin initialized for project: ${serviceAccount.project_id}`);
            logger.info(`🔑 Service Account Email: ${serviceAccount.client_email}`);
            logger.info(`🗄️ Target Database: ${databaseId || '(default)'}`);
            
            db = getFirestore(adminApp, databaseId || undefined);
            
            // Verify database access
            try {
              await db.collection('_health_check_').limit(1).get();
              logger.info("✅ Firestore database access verified");
            } catch (err: unknown) {
              const error = err as Error;
              const isNotFoundError = error.message.includes('NOT_FOUND');
              const isPermissionError = error.message.includes('PERMISSION_DENIED');
              
              if ((isPermissionError || isNotFoundError) && databaseId) {
                logger.warn(`⚠️ ${isNotFoundError ? 'NOT_FOUND' : 'PERMISSION_DENIED'} on database ${databaseId}. Falling back to (default) database.`);
                db = getFirestore(adminApp);
                try {
                  await db.collection('_health_check_').limit(1).get();
                  logger.info("✅ Firestore fallback to (default) database successful");
                } catch (fallbackErr: unknown) {
                  const fErr = fallbackErr as Error;
                  logger.warn(`⚠️ (default) database also failed: ${fErr.message}. Trying projectId as databaseId.`);
                  db = getFirestore(adminApp, serviceAccount.project_id);
                  try {
                    await db.collection('_health_check_').limit(1).get();
                    logger.info(`✅ Firestore fallback to projectId ${serviceAccount.project_id} successful`);
                  } catch (projectErr: unknown) {
                    const pErr = projectErr as Error;
                    logger.error("❌ All Firestore initialization attempts failed:", pErr.message);
                  }
                }
              } else {
                logger.error("❌ Firestore initial health check failed:", error.message);
              }
            }
          }
        }
      } catch (e: unknown) {
        const error = e as Error;
        logger.error("❌ Firebase Admin initialization failed:", error.message);
        logger.error("Raw string length:", (process.env.FIREBASE_SERVICE_ACCOUNT || "").length);
      }
  } else {
    logger.warn("⚠️ FIREBASE_SERVICE_ACCOUNT not found. Some backend features may be limited.");
  }
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database will be initialized inside startServer

async function startServer() {
  logger.debug("startServer function called...");
  
  const app = express();
  const PORT = 3000;

  // Trust proxy is required when running behind a load balancer (like Cloud Run)
  // to correctly identify client IP for rate limiting.
  app.set('trust proxy', 1);

  // Global Rate Limiting
  const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 requests per minute
    message: { error: "Too many requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // AI Specific Rate Limiting
  const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per window
    message: { error: "Too many AI requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: process.env.NODE_ENV === 'production' 
          ? ["'self'", "https://checkout.razorpay.com", "https://*.googleapis.com", "https://*.googletagmanager.com", "https://www.gstatic.com", "https://*.firebaseapp.com", "https://*.firebaseauth.com", "https://apis.google.com", "https://accounts.google.com"]
          : ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com", "https://*.googleapis.com", "https://*.googletagmanager.com", "https://www.gstatic.com", "https://*.firebaseapp.com", "https://*.firebaseauth.com", "https://apis.google.com", "https://accounts.google.com"],
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
  app.use(express.json({ limit: "256kb" }));
  app.get("/manifest.json", (req, res) => {
    res.sendFile(path.join(__dirname, "manifest.json"));
  });
  app.get("/robots.txt", (req, res) => {
    res.sendFile(path.join(__dirname, "robots.txt"));
  });

  app.use("/api", globalLimiter);

  app.post("/api/log-error", express.json({ limit: "16kb" }), (req, res) => {
    const { error, stack, context, paymentId, email } = req.body ?? {};

    if (typeof error !== 'string' || error.length === 0 || error.length > 2000) {
      return res.status(400).json({ error: 'Invalid error payload' });
    }

    if (stack && (typeof stack !== 'string' || stack.length > 8000)) {
      return res.status(400).json({ error: 'Invalid stack payload' });
    }

    if (context && (typeof context !== 'object' || Array.isArray(context))) {
      return res.status(400).json({ error: 'Invalid context payload' });
    }

    const payload = {
      error,
      ...(stack ? { stack } : {}),
      ...(context ? { context } : {}),
      ...(typeof paymentId === 'string' ? { paymentId } : {}),
      ...(typeof email === 'string' ? { email } : {}),
      userAgent: req.get('user-agent') || 'unknown',
      path: req.path,
    };

    void logger.clientError(payload);
    res.status(202).json({ status: "accepted" });
  });

  // Auth Middleware
  const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Access denied" });

    jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_only', (err: jwt.VerifyErrors | null, user: string | jwt.JwtPayload | undefined) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev_secret_only')) {
        logger.error("CRITICAL SECURITY ERROR: JWT_SECRET is not set in production!");
        return res.status(500).json({ error: "Server configuration error" });
      }
      req.user = user as AuthUser;
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
  const verifyFirebaseToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

      if (db) {
        try {
          const userRef = db.collection('users').doc(decodedToken.uid);
          const userDoc = await userRef.get();
          
          if (!userDoc.exists) {
            await userRef.set({
              ...user,
              created_at: admin.firestore.FieldValue.serverTimestamp()
            });
            logger.info(`New user registered: ${decodedToken.email} (${decodedToken.uid})`);
          } else {
            user = { ...(userDoc.data() as AuthUser), id: decodedToken.uid };
          }
        } catch (dbError: unknown) {
          const error = dbError as Error;
          logger.error("⚠️ Firestore profile fetch failed, using default profile:", error.message);
          // Check if this is the bootstrapped admin
          if (decodedToken.email === "realprouser1234@gmail.com" && decodedToken.email_verified) {
            user.role = 'admin';
            user.subscription_plan = 'premium';
          }
        }
      } else {
        // Fallback for bootstrapped admin when DB is not available
        if (decodedToken.email === "realprouser1234@gmail.com" && decodedToken.email_verified) {
          user.role = 'admin';
          user.subscription_plan = 'premium';
        }
      }
      
      req.user = user;
      next();
    } catch (error: unknown) {
      const err = error as Error;
      logger.error("❌ Auth Middleware Error:", err.message);
      if (err.stack) logger.error(err.stack);
      
      if ((err as any).code === 'auth/id-token-expired') {
        return res.status(401).json({ error: "Token expired", code: "TOKEN_EXPIRED" });
      }
      
      res.status(401).json({ error: "Authentication failed", details: err.message });
    }
  };

  // AI Gateway Logic
  app.use("/api/ai", aiRoutes);

  // Usage logging is handled internally by AI generation endpoint
  // Removed public usage logging endpoint to prevent database pollution exploits


  app.use("/api/auth", authRoutes);

  app.use("/api/payments", paymentRoutes);

  app.use("/api/admin", adminRoutes);

  // Global Error Handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error("Unhandled Error:", err);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: err.message
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      logger.debug("Creating Vite server...");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      logger.debug("Vite server created successfully.");
      app.use(vite.middlewares);
    } catch (e) {
      logger.error("Failed to create Vite server:", e);
    }
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server running on http://0.0.0.0:${PORT}`);
  }).on('error', (err: NodeJS.ErrnoException) => {
    logger.error("Server failed to start (listen error):", err);
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use.`);
    }
  });
}

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { promise: String(promise), reason });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception thrown:', err);
});

startServer().catch(err => {
  logger.error("Critical error in startServer execution:", err);
});
