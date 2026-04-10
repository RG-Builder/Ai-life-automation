import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { ThemeProvider } from './theme';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
