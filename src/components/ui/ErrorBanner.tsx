import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

export const ErrorBanner: React.FC = () => {
  const { error, setError } = useAppContext();

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-4 right-4 z-[200] flex items-center justify-center pointer-events-none"
        >
          <div className="bg-danger text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-auto max-w-2xl border border-white/20">
            <AlertCircle className="shrink-0" size={24} />
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">System Error</p>
              <p className="font-bold text-sm leading-snug">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
