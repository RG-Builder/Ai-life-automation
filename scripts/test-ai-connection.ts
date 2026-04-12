import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const testOpenRouter = async () => {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    console.error("❌ OPENROUTER_API_KEY is missing in .env");
    return;
  }

  console.log("Testing OpenRouter connection...");
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-1.5-flash',
        messages: [{ role: 'user', content: 'Say "Connection Successful"' }]
      },
      {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("✅ OpenRouter Response:", response.data.choices[0].message.content);
  } catch (err: any) {
    console.error("❌ OpenRouter Test Failed:", err.response?.data || err.message);
  }
};

testOpenRouter();
