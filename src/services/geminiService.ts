import { Mission, ScheduleItem } from '../types';
import { auth } from '../firebase';
import { API_CONFIG } from '../config/api.config';

export const generateScheduleWithAI = async (tasks: Mission[]): Promise<ScheduleItem[]> => {
  try {
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    
    if (pendingTasks.length === 0) {
      return [];
    }

    const tasksJson = JSON.stringify(pendingTasks.map(t => ({ title: t.title, duration: t.duration, priority: t.priority, category: t.category })));
    const prompt = API_CONFIG.AI.PROMPTS.SCHEDULE_GENERATION(tasksJson);

    const token = await auth.currentUser?.getIdToken();
    
    // Allow unauthenticated requests for demo mode
    const response = await fetch(API_CONFIG.ENDPOINTS.GENERATE_AI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }) // Only add if token exists
      },
      body: JSON.stringify({
        prompt,
        taskType: 'complex',
        systemInstruction: API_CONFIG.AI.PROMPTS.SYSTEM_INSTRUCTION_SCHEDULE
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
  let currentTime = API_CONFIG.SCHEDULING.START_TIME_MINUTES;
  
  tasks.forEach((task, index) => {
    const startTime = `${Math.floor(currentTime / 60).toString().padStart(2, '0')}:${(currentTime % 60).toString().padStart(2, '0')}`;
    currentTime += task.duration || API_CONFIG.SCHEDULING.DEFAULT_TASK_DURATION;
    const endTime = `${Math.floor(currentTime / 60).toString().padStart(2, '0')}:${(currentTime % 60).toString().padStart(2, '0')}`;
    
    schedule.push({
      id: `generated-${index}`,
      title: task.title,
      startTime,
      endTime,
      duration: `${task.duration || API_CONFIG.SCHEDULING.DEFAULT_TASK_DURATION}m`,
      type: task.priority === 'high' ? 'deep-work' : 'admin',
      completed: false
    });
    
    // Add break after each task
    currentTime += API_CONFIG.SCHEDULING.BREAK_DURATION;
    if (currentTime < API_CONFIG.SCHEDULING.END_TIME_MINUTES) {
      schedule.push({
        id: `break-${index}`,
        title: 'Break',
        startTime: endTime,
        endTime: `${Math.floor(currentTime / 60).toString().padStart(2, '0')}:${(currentTime % 60).toString().padStart(2, '0')}`,
        duration: `${API_CONFIG.SCHEDULING.BREAK_DURATION}m`,
        type: 'break',
        completed: false
      });
      currentTime += API_CONFIG.SCHEDULING.BREAK_DURATION;
    }
  });
  
  return schedule;
}
