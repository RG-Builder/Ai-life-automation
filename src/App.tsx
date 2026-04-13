import React from 'react';
import { ThemeProvider, useTheme } from './theme';
import { AppProvider } from './context/AppContext';
import { MinimalTheme } from './components/MinimalTheme';
import { GamifiedTheme } from './components/GamifiedTheme';
import { EliteTheme } from './components/EliteTheme';
import { Settings } from 'lucide-react';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg hover:bg-black/70 transition-colors"
      >
        <Settings size={20} />
      </button>
      
      {isOpen && (
        <div className="absolute top-12 right-0 bg-white rounded-xl shadow-xl border border-gray-100 p-2 flex flex-col gap-1 min-w-[120px]">
          <button 
            onClick={() => { setTheme('minimal'); setIsOpen(false); }}
            className={`px-4 py-2 text-sm text-left rounded-lg transition-colors ${theme.id === 'minimal' ? 'bg-gray-100 font-bold text-black' : 'hover:bg-gray-50 text-gray-700'}`}
          >
            Minimal
          </button>
          <button 
            onClick={() => { setTheme('gamified'); setIsOpen(false); }}
            className={`px-4 py-2 text-sm text-left rounded-lg transition-colors ${theme.id === 'gamified' ? 'bg-[#F4F9E7] text-[#2C5A0D] font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
          >
            Gamified
          </button>
          <button 
            onClick={() => { setTheme('elite'); setIsOpen(false); }}
            className={`px-4 py-2 text-sm text-left rounded-lg transition-colors ${theme.id === 'elite' ? 'bg-black text-[#00FF41] font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
          >
            Elite
          </button>
        </div>
      )}
    </div>
  );
};

const AppContent = () => {
  const { theme } = useTheme();

  switch (theme.id) {
    case 'minimal':
      return <MinimalTheme />;
    case 'gamified':
      return <GamifiedTheme />;
    case 'elite':
      return <EliteTheme />;
    default:
      return <MinimalTheme />;
  }
};

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <div className="relative w-full max-w-md mx-auto h-[100dvh] overflow-hidden bg-black shadow-2xl sm:rounded-[40px] sm:h-[850px] sm:my-8 sm:border-8 sm:border-gray-900">
          <ThemeSwitcher />
          <AppContent />
        </div>
      </AppProvider>
    </ThemeProvider>
  );
}
