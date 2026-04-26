import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const testGeminiDirect = async () => {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_FAST_MODEL || process.env.GEMINI_PRIMARY_MODEL || 'gemini-2.0-flash';

  if (!key) {
    console.error('❌ GEMINI_API_KEY is missing in .env');
    return;
  }

  console.log(`Testing Gemini Direct connection with model: ${model}`);

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model,
      contents: 'Say "Connection Successful"',
    });
    console.log('✅ Gemini Response:', response.text);
  } catch (err: any) {
    console.error('❌ Gemini Test Failed:', err?.message || err);
  }
};

testGeminiDirect();
