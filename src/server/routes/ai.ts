import express, { NextFunction, Response } from "express";
import { AuthenticatedRequest, verifyFirebaseToken } from "../middleware/auth";
import { GoogleGenAI } from "@google/genai";
import { API_CONFIG } from "../../config/api.config";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const router = express.Router();

type Plan = "trial" | "free" | "premium";

const ALLOW_DEMO_MODE = process.env.ALLOW_DEMO_MODE === "true";

const PLAN_LIMITS: Record<Plan, { dailyRequests: number; dailyTokens: number; windowRequests: number }> = {
  trial: {
    dailyRequests: 20,
    dailyTokens: 30000,
    windowRequests: 6,
  },
  free: {
    dailyRequests: 20,
    dailyTokens: 30000,
    windowRequests: 6,
  },
  premium: {
    dailyRequests: 400,
    dailyTokens: 800000,
    windowRequests: 60,
  },
};

const RATE_WINDOW_MS = API_CONFIG.AI.RATE_LIMIT.WINDOW_MS;
const ESTIMATED_OUTPUT_TOKENS = 1200;

const getClientIp = (req: AuthenticatedRequest): string => {
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (typeof xForwardedFor === "string" && xForwardedFor.trim().length > 0) {
    return xForwardedFor.split(",")[0].trim();
  }
  return req.ip || "unknown";
};

const estimateTokens = (value: string): number => Math.max(1, Math.ceil(value.length / 4));

const withExplicitDemoMode = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  if (req.user) return next();
  const hasAuthHeader = Boolean(req.headers["authorization"]);

  if (!hasAuthHeader && ALLOW_DEMO_MODE) {
    req.user = {
      id: "demo-user",
      email: "demo@example.com",
      subscription_plan: "trial",
      role: "user",
      trial_used: 0,
      is_demo_mode: true,
    };
  }

  next();
};

const ensureAiEntitlement = async (
  userId: string,
  subscriptionPlan: string,
  ipAddress: string,
  reservedTokens: number,
): Promise<{ allowed: true } | { allowed: false; status: 402 | 403; error: string; code: string }> => {
  const plan = (subscriptionPlan || "trial").toLowerCase() as Plan;
  if (!PLAN_LIMITS[plan]) {
    return {
      allowed: false,
      status: 403,
      code: "PLAN_FORBIDDEN",
      error: "Your subscription plan is not eligible for AI generation.",
    };
  }

  const limits = PLAN_LIMITS[plan];
  const db = getFirestore();
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  const dayRef = db.collection("ai_usage_daily").doc(`${today}_${userId}`);

  const windowBucket = Math.floor(now / RATE_WINDOW_MS);
  const rateKey = `${userId}_${ipAddress}_${windowBucket}`;
  const rateRef = db.collection("ai_rate_windows").doc(rateKey);

  try {
    await db.runTransaction(async (txn) => {
      const [daySnap, rateSnap] = await Promise.all([txn.get(dayRef), txn.get(rateRef)]);

      const usedRequests = daySnap.exists ? (daySnap.data()?.requests ?? 0) : 0;
      const usedTokens = daySnap.exists ? (daySnap.data()?.tokens ?? 0) : 0;
      const windowRequests = rateSnap.exists ? (rateSnap.data()?.count ?? 0) : 0;

      if (windowRequests + 1 > limits.windowRequests) {
        throw new Error("RATE_LIMIT_EXCEEDED");
      }

      if (usedRequests + 1 > limits.dailyRequests) {
        throw new Error("DAILY_REQUESTS_EXHAUSTED");
      }

      if (usedTokens + reservedTokens > limits.dailyTokens) {
        throw new Error("DAILY_TOKENS_EXHAUSTED");
      }

      txn.set(
        dayRef,
        {
          userId,
          plan,
          date: today,
          requests: usedRequests + 1,
          tokens: usedTokens + reservedTokens,
          lastIp: ipAddress,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      txn.set(
        rateRef,
        {
          userId,
          ipAddress,
          bucket: windowBucket,
          count: windowRequests + 1,
          expiresAt: new Date((windowBucket + 1) * RATE_WINDOW_MS),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    });

    return { allowed: true };
  } catch (error) {
    const code = (error as Error).message;
    if (code === "RATE_LIMIT_EXCEEDED") {
      return {
        allowed: false,
        status: 403,
        code,
        error: "Rate limit exceeded for this user and IP. Please try again later.",
      };
    }

    if (code === "DAILY_REQUESTS_EXHAUSTED" || code === "DAILY_TOKENS_EXHAUSTED") {
      const upgradeHint = plan === "premium" ? "Please wait until your quota resets." : "Upgrade to premium for higher AI limits.";
      return {
        allowed: false,
        status: 402,
        code,
        error: `Daily AI quota exhausted. ${upgradeHint}`,
      };
    }

    console.error("AI entitlement check failed:", (error as Error).message);
    return {
      allowed: false,
      status: 403,
      code: "ENTITLEMENT_CHECK_FAILED",
      error: "Unable to verify AI entitlement.",
    };
  }
};

const handle_ai_request = async (
  _user: any,
  prompt: string,
  taskType: "simple" | "complex" = "simple",
  systemInstruction: string = "",
) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    throw new Error("AI service configuration error: GEMINI_API_KEY is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const fullSystemInstruction = `${API_CONFIG.AI.PROMPTS.LIFE_PILOT_SYSTEM_PROMPT}\n${systemInstruction}`;

  const isThinkingTask =
    taskType === "complex" ||
    prompt.toLowerCase().includes("schedule") ||
    prompt.toLowerCase().includes("plan") ||
    prompt.toLowerCase().includes("analyze") ||
    prompt.toLowerCase().includes("prioritize") ||
    prompt.toLowerCase().includes("optimize") ||
    prompt.toLowerCase().includes("behavior");

  const selectedModel = isThinkingTask ? API_CONFIG.AI.MODELS.PRIMARY : API_CONFIG.AI.MODELS.FAST;

  const callAI = async (model: string, retryCount = 0): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: fullSystemInstruction,
          temperature: 0.7,
        },
      });

      return response.text || "";
    } catch (err: unknown) {
      const error = err as any;
      console.error(`AI Model ${model} failed (Attempt ${retryCount + 1}):`, error.message);
      if (retryCount < API_CONFIG.AI.RETRY.MAX_ATTEMPTS) {
        return await callAI(model, retryCount + 1);
      }
      throw error;
    }
  };

  const callAIWithFallback = async () => {
    try {
      console.log(`Routing to ${selectedModel === API_CONFIG.AI.MODELS.PRIMARY ? "THINKING" : "FAST"} model for task: ${taskType}`);
      const text = await callAI(selectedModel);
      return { text, model: selectedModel };
    } catch (_err: unknown) {
      if (selectedModel === API_CONFIG.AI.MODELS.PRIMARY) {
        console.warn(`THINKING model failed, switching to FAST model: ${API_CONFIG.AI.MODELS.FAST}`);
        try {
          const text = await callAI(API_CONFIG.AI.MODELS.FAST);
          return { text, model: API_CONFIG.AI.MODELS.FAST };
        } catch (_fastErr: unknown) {
          console.error("FAST model also failed after fallback.");
          return { text: API_CONFIG.AI.FALLBACK_STATIC, model: "static-fallback" };
        }
      }
      return { text: API_CONFIG.AI.FALLBACK_STATIC, model: "static-fallback" };
    }
  };

  try {
    const result = await callAIWithFallback();
    return { text: result.text, cached: false, model: result.model };
  } catch (error: unknown) {
    console.error("AI Orchestration Error:", (error as Error).message);
    return { text: API_CONFIG.AI.FALLBACK_STATIC, model: "error-fallback" };
  }
};

router.post("/generate", withExplicitDemoMode, verifyFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
  let { prompt, systemInstruction, taskType } = req.body;

  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  prompt = String(prompt).substring(0, 5000);
  systemInstruction = String(systemInstruction || "You are a helpful assistant.").substring(0, 2000);

  const inputTokens = estimateTokens(prompt) + estimateTokens(systemInstruction);
  const reservedTokens = inputTokens + ESTIMATED_OUTPUT_TOKENS;
  const ipAddress = getClientIp(req);

  const entitlement = await ensureAiEntitlement(
    req.user.id,
    req.user.subscription_plan || "trial",
    ipAddress,
    reservedTokens,
  );

  if (entitlement.allowed === false) {
    return res.status(entitlement.status).json({ error: entitlement.error, code: entitlement.code });
  }

  try {
    const result = await handle_ai_request(req.user, prompt, taskType, systemInstruction);
    return res.json(result);
  } catch (error: unknown) {
    console.error("Error in /api/ai/generate route:", error);
    const err = error as Error;
    return res.status(500).json({ error: err.message || "AI request failed" });
  }
});

export default router;
