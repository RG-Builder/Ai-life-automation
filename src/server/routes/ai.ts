import express, { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { rateLimit } from 'express-rate-limit';
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

// AI Specific Rate Limiting
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: { error: "Too many AI requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const AI_MODELS = {
  PRIMARY: "gemini-2.5-pro", // THINKING MODEL
  FAST: "gemini-2.5-flash",    // FAST MODEL
  FALLBACK_STATIC: "Next Action: Focus on your current priority.\n\nInsight: AI systems are temporarily limited, but your productivity doesn't have to be."
};

const LIFE_PILOT_SYSTEM_PROMPT = `
You are the AI orchestration system for "Life Pilot".
Your job: Choose the correct model, generate useful outputs, and ensure reliability.

CORE OBJECTIVE:
• Respond fast when possible
• Use deep reasoning only when needed
• Always return actionable output
• Never fail the user

OUTPUT FORMAT (STRICT):
Unless the user explicitly requests a JSON format for data processing, always respond in this structure:

Next Action:
<clear, short task>

(Optional) Schedule:
<only if needed>

(Optional) Insight:
<1 short data-based sentence>

RESPONSE STYLE:
• Short, direct, action-focused
• No unnecessary explanation
• No long paragraphs, generic advice, or fluff

IMPORTANT:
• Do NOT mention models or routing
• Do NOT generate placeholder responses
`;

const handle_ai_request = async (user: any, prompt: string, taskType: 'simple' | 'complex' = 'simple', systemInstruction: string = "") => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    throw new Error("AI service configuration error: GEMINI_API_KEY is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const fullSystemInstruction = `${LIFE_PILOT_SYSTEM_PROMPT}\n${systemInstruction}`;

  // 1. Model Routing Logic
  const isThinkingTask = taskType === 'complex' || 
                         prompt.toLowerCase().includes('schedule') || 
                         prompt.toLowerCase().includes('plan') || 
                         prompt.toLowerCase().includes('analyze') ||
                         prompt.toLowerCase().includes('prioritize') ||
                         prompt.toLowerCase().includes('optimize') ||
                         prompt.toLowerCase().includes('behavior');
  
  const selectedModel = isThinkingTask ? AI_MODELS.PRIMARY : AI_MODELS.FAST;

  const callAI = async (model: string, retryCount = 0): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction: fullSystemInstruction,
          temperature: 0.7,
        }
      });

      return response.text || "";
    } catch (err: unknown) {
      const error = err as any;
      console.error(`AI Model ${model} failed (Attempt ${retryCount + 1}):`, error.message);
      
      // Retry once on the same model
      if (retryCount < 1) {
        return await callAI(model, retryCount + 1);
      }
      throw error;
    }
  };

  const callAIWithFallback = async () => {
    try {
      console.log(`Routing to ${selectedModel === AI_MODELS.PRIMARY ? 'THINKING' : 'FAST'} model for task: ${taskType}`);
      const text = await callAI(selectedModel);
      return { text, model: selectedModel };
    } catch (err: unknown) {
      // FALLBACK SYSTEM (MANDATORY)
      if (selectedModel === AI_MODELS.PRIMARY) {
        console.warn(`THINKING model failed, switching to FAST model: ${AI_MODELS.FAST}`);
        try {
          const text = await callAI(AI_MODELS.FAST);
          return { text, model: AI_MODELS.FAST };
        } catch (fastErr: unknown) {
          console.error("FAST model also failed after fallback.");
          return { text: AI_MODELS.FALLBACK_STATIC, model: "static-fallback" };
        }
      }
      return { text: AI_MODELS.FALLBACK_STATIC, model: "static-fallback" };
    }
  };

  try {
    const result = await callAIWithFallback();
    return { text: result.text, cached: false, model: result.model };
  } catch (error: unknown) {
    console.error("AI Orchestration Error:", (error as Error).message);
    return { text: AI_MODELS.FALLBACK_STATIC, model: "error-fallback" };
  }
};

router.post("/generate", aiLimiter, async (req: AuthenticatedRequest, res: Response) => {
  console.log("Received AI request:", req.body);
  let { prompt, systemInstruction, taskType } = req.body;
  
  // For demo mode, if no user, create a mock user
  const user = req.user || { id: 'demo-user', email: 'demo@example.com' };

  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  // Input length limits
  prompt = String(prompt).substring(0, 5000);
  systemInstruction = String(systemInstruction || "You are a helpful assistant.").substring(0, 2000);

  try {
    const result = await handle_ai_request(user, prompt, taskType, systemInstruction);
    res.json(result);
  } catch (error: unknown) {
    console.error("Error in /api/ai/generate route:", error);
    const err = error as Error;
    res.status(err.message.includes("limit") ? 403 : 500).json({ error: err.message });
  }
});

export default router;
