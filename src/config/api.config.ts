export const API_CONFIG = {
  ENDPOINTS: {
    GENERATE_AI: '/api/ai/generate',
  },
  AI: {
    MODELS: {
      PRIMARY: "gemini-2.5-pro",
      FAST: "gemini-2.5-flash",
    },
    FALLBACK_STATIC: "Next Action: Focus on your current priority.\n\nInsight: AI systems are temporarily limited, but your productivity doesn't have to be.",
    PROMPTS: {
      SCHEDULE_GENERATION: (tasksJson: string) => `
      You are an expert productivity assistant. I have the following pending tasks:
      ${tasksJson}
      
      Please generate a realistic daily schedule for today starting from 09:00.
      Return ONLY a JSON array of objects with the following structure:
      [
        {
          "id": "unique_string",
          "title": "Task Title",
          "startTime": "HH:MM",
          "endTime": "HH:MM",
          "duration": "Xh Ym",
          "type": "deep-work" | "meeting" | "admin" | "break",
          "completed": false
        }
      ]
      
      Ensure the schedule makes sense, includes breaks, and prioritizes high-priority tasks.
    `,
      SYSTEM_INSTRUCTION_SCHEDULE: 'You are a scheduling assistant. Return only valid JSON.',
      LIFE_PILOT_SYSTEM_PROMPT: `
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
`,
    },
    TIMEOUTS: {
      DEFAULT: 30000,
    },
    RETRY: {
      MAX_ATTEMPTS: 1,
    },
    RATE_LIMIT: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 10,
      MESSAGE: "Too many AI requests. Please try again later.",
    }
  },
  SCHEDULING: {
    START_TIME_MINUTES: 9 * 60, // 9:00 AM
    DEFAULT_TASK_DURATION: 30,
    BREAK_DURATION: 15,
    END_TIME_MINUTES: 17 * 60, // 5:00 PM
  }
} as const;
