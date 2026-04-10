import { useState } from 'react';
import axios from 'axios';
import { auth } from '../firebase';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (prompt: string, systemInstruction?: string, taskType: 'simple' | 'complex' = 'simple') => {
    setLoading(true);
    setError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Authentication required");

      const response = await axios.post('/api/ai/generate', {
        prompt,
        systemInstruction,
        taskType
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "AI generation failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error };
};
