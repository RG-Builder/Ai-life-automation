import express, { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { rateLimit } from 'express-rate-limit';
import { GoogleGenAI } from "@google/genai";
import { API_CONFIG } from "../../config/api.config";
import { getBackendAiConfig } from "../config/ai.config";

const router = express.Router();

// AI Specific Rate Limiting
const aiLimiter = rateLimit({
  windowMs: API_CONFIG.AI.RATE_LIMIT.WINDOW_MS,
  max: API_CONFIG.AI.RATE_LIMIT.MAX_REQUESTS,
  message: { error: API_CONFIG.AI.RATE_LIMIT.MESSAGE },
  standardHeaders: true,
  legacyHeaders: false,
});

const handle_ai_request = async (user: any, prompt: string, taskType: 'simple' | 'complex' = 'simple', systemInstruction: string = "") => {
  const aiConfig = getBackendAiConfig();
  const ai = new GoogleGenAI({ apiKey: aiConfig.apiKey });
  const fullSystemInstruction = `${API_CONFIG.AI.PROMPTS.LIFE_PILOT_SYSTEM_PROMPT}\n${systemInstruction}`;

  // 1. Model Routing Logic
  const isThinkingTask = taskType === 'complex' || 
                         prompt.toLowerCase().includes('schedule') || 
                         prompt.toLowerCase().includes('plan') || 
                         prompt.toLowerCase().includes('analyze') ||
                         prompt.toLowerCase().includes('prioritize') ||
                         prompt.toLowerCase().includes('optimize') ||
                         prompt.toLowerCase().includes('behavior');
  
  const selectedModel = isThinkingTask ? aiConfig.models.primary : aiConfig.models.fast;

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
      if (retryCount < API_CONFIG.AI.RETRY.MAX_ATTEMPTS) {
        return await callAI(model, retryCount + 1);
      }
      throw error;
    }
  };

  const callAIWithFallback = async () => {
    try {
      console.log(`Routing to ${selectedModel === aiConfig.models.primary ? 'THINKING' : 'FAST'} model for task: ${taskType}`);
      const text = await callAI(selectedModel);
      return { text, model: selectedModel };
    } catch (err: unknown) {
      // FALLBACK SYSTEM (MANDATORY)
      if (selectedModel === aiConfig.models.primary) {
        console.warn(`THINKING model failed, switching to FAST model: ${aiConfig.models.fast}`);
        try {
          const text = await callAI(aiConfig.models.fast);
          return { text, model: aiConfig.models.fast };
        } catch (fastErr: unknown) {
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
