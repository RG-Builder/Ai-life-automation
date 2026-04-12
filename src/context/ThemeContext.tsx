import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'pilot' | 'architect';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('pilot');

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'pilot' ? 'architect' : 'pilot'));
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('theme-pilot', 'theme-architect');
    root.classList.add(`theme-${theme}`);
    
    // Update body background for smooth transitions
    if (theme === 'architect') {
      document.body.style.backgroundColor = '#0A0A0A';
    } else {
      document.body.style.backgroundColor = '#F8FAF9';
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
