export const APP_CONFIG = {
  STORAGE_KEYS: {
    TASKS: 'lifepilot_tasks',
    FOCUS: 'lifepilot_focus',
    SCORE: 'lifepilot_score',
    STREAK: 'lifepilot_streak',
    SCHEDULE: 'lifepilot_schedule',
    HABITS: 'lifepilot_habits',
    HABIT_HISTORY: 'lifepilot_habit_history',
  },
  DEFAULT_STATE: {
    LIFE_SCORE: 84,
    STREAK: 14,
  },
  SCORING: {
    TASK_COMPLETION_BONUS: 5,
  },
  DEFAULTS: {
    TASK_TITLE: 'New Task',
    TASK_DURATION: 30,
    TASK_CATEGORY: 'General',
    TASK_URGENCY: 5,
    TASK_IMPORTANCE: 5,
    HABIT_TITLE: 'New Habit',
    HABIT_CATEGORY: 'General',
  }
} as const;
