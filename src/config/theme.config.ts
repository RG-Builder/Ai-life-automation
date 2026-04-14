export const THEME_CONFIG = {
  MINIMAL: {
    COLORS: {
      BACKGROUND: '#F9FAFB',
      PRIMARY: '#405C4A',
      PRIMARY_LIGHT: '#E5F3E8',
      PRIMARY_DARK: '#2E4536',
      TEXT_MAIN: 'text-gray-900',
      TEXT_MUTED: 'text-gray-500',
      DANGER: 'text-danger',
      DANGER_BG: 'bg-danger/10',
    },
    LABELS: {
      TABS: {
        focus: 'Focus',
        habits: 'Rituals',
        tasks: 'Architecture',
        insights: 'Insights',
      },
      NAV: {
        focus: 'FOCUS',
        habits: 'HABITS',
        tasks: 'TASKS',
        insights: 'INSIGHTS',
      }
    }
  },
  GAMIFIED: {
    COLORS: {
      BACKGROUND: '#F4F9E7',
      PRIMARY: '#2C5A0D',
      PRIMARY_LIGHT: '#73F02D',
      ACCENT: '#FF5A36',
      TEXT_MAIN: '#2C5A0D',
      TEXT_MUTED: '#5C7A46',
      TEXT_MUTED_LIGHT: '#8A9E7B',
      DANGER: 'text-red-500',
      DANGER_BG: 'bg-red-200',
    },
    LABELS: {
      TABS: {
        focus: 'Command',
        habits: 'Quests',
        tasks: 'Missions',
        insights: 'Stats',
      },
      NAV: {
        focus: 'SCHEDULE',
        habits: 'STREAKS',
        tasks: 'MISSIONS',
        insights: 'CHAT',
      }
    }
  },
  ELITE: {
    COLORS: {
      BACKGROUND: '#000000',
      PRIMARY: '#00FF41',
      PRIMARY_DARK: '#008F11',
      TEXT_MAIN: '#00FF41',
      TEXT_MUTED: '#008F11',
      DANGER: '#00FF41', // Elite uses green for everything
      DANGER_BG: 'rgba(0, 255, 65, 0.2)',
    },
    LABELS: {
      TABS: {
        focus: 'Core',
        habits: 'Logic',
        tasks: 'Pilot',
        insights: 'Metrics',
      },
      NAV: {
        focus: '[CORE]',
        habits: '[LOGIC]',
        tasks: '[PILOT]',
        insights: '[METRICS]',
      }
    }
  }
} as const;
