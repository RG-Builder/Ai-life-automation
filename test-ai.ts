import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const testOpenRouter = async () => {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    console.error("❌ OPENROUTER_API_KEY is missing");
    return;
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'hi' }]
      },
      {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("✅ OpenRouter Response Status:", response.status);
  } catch (err: any) {
    console.error("❌ OpenRouter Test Failed:", err.response?.status, err.response?.data || err.message);
  }
};

testOpenRouter();
