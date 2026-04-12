import { Mission, ScheduleItem } from '../types';
import { auth } from '../firebase';

export const generateScheduleWithAI = async (tasks: Mission[]): Promise<ScheduleItem[]> => {
  try {
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    
    if (pendingTasks.length === 0) {
      return [];
    }

    const prompt = `
      You are an expert productivity assistant. I have the following pending tasks:
      ${JSON.stringify(pendingTasks.map(t => ({ title: t.title, duration: t.duration, priority: t.priority, category: t.category })))}
      
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
    `;

    const token = await auth.currentUser?.getIdToken();
    
    if (!token) {
      console.warn("User not authenticated, falling back to mock schedule");
      return [];
    }

    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        prompt,
        taskType: 'complex',
        systemInstruction: 'You are a scheduling assistant. Return only valid JSON.'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate schedule');
    }

    const data = await response.json();
    
    if (data.text) {
      // Try to extract JSON if the model wrapped it in markdown
      let jsonText = data.text;
      if (jsonText.includes('\`\`\`json')) {
        jsonText = jsonText.split('\`\`\`json')[1].split('\`\`\`')[0].trim();
      } else if (jsonText.includes('\`\`\`')) {
        jsonText = jsonText.split('\`\`\`')[1].split('\`\`\`')[0].trim();
      }
      
      const schedule = JSON.parse(jsonText);
      return schedule;
    }
    
    return [];
  } catch (error) {
    console.error("Error generating schedule with AI:", error);
    return [];
  }
};
