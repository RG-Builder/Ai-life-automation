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
    
    // Allow unauthenticated requests for demo mode
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }) // Only add if token exists
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
      // If it's the fallback static string, use the simple schedule
      if (data.text.includes('Next Action:')) {
        console.warn("AI returned static fallback, using simple schedule");
        return generateSimpleSchedule(tasks.filter(t => t.status === 'pending'));
      }

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
    // Fallback to simple time-based schedule if AI fails
    return generateSimpleSchedule(tasks.filter(t => t.status === 'pending'));
  }
};

// Add fallback scheduler
function generateSimpleSchedule(tasks: Mission[]): ScheduleItem[] {
  const schedule: ScheduleItem[] = [];
  let currentTime = 9 * 60; // Start at 9:00 AM
  
  tasks.forEach((task, index) => {
    const startTime = `${Math.floor(currentTime / 60).toString().padStart(2, '0')}:${(currentTime % 60).toString().padStart(2, '0')}`;
    currentTime += task.duration || 30;
    const endTime = `${Math.floor(currentTime / 60).toString().padStart(2, '0')}:${(currentTime % 60).toString().padStart(2, '0')}`;
    
    schedule.push({
      id: `generated-${index}`,
      title: task.title,
      startTime,
      endTime,
      duration: `${task.duration || 30}m`,
      type: task.priority === 'high' ? 'deep-work' : 'admin',
      completed: false
    });
    
    // Add break after each task
    currentTime += 15;
    if (currentTime < 17 * 60) { // Before 5 PM
      schedule.push({
        id: `break-${index}`,
        title: 'Break',
        startTime: endTime,
        endTime: `${Math.floor(currentTime / 60).toString().padStart(2, '0')}:${(currentTime % 60).toString().padStart(2, '0')}`,
        duration: '15m',
        type: 'break',
        completed: false
      });
      currentTime += 15;
    }
  });
  
  return schedule;
}
