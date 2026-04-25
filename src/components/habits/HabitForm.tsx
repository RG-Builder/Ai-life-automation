import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, X } from 'lucide-react';
import { Habit } from '../../types';
import { useTheme } from '../../theme';

interface HabitFormProps {
  editingHabit: Habit | null;
  onSave: (payload: any) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export const HabitForm: React.FC<HabitFormProps> = ({ editingHabit, onSave, onClose, isLoading }) => {
  const { theme } = useTheme();

  const [habitTitle, setHabitTitle] = useState('');
  const [habitFrequency, setHabitFrequency] = useState('daily');
  const [habitGoalCount, setHabitGoalCount] = useState(1);
  const [habitCategory, setHabitCategory] = useState('health');

  useEffect(() => {
    if (editingHabit) {
      setHabitTitle(editingHabit.title);
      setHabitFrequency(editingHabit.frequency);
      setHabitGoalCount(editingHabit.goal_count);
      setHabitCategory(editingHabit.category || 'health');
    } else {
      setHabitTitle('');
      setHabitFrequency('daily');
      setHabitGoalCount(1);
      setHabitCategory('health');
    }
  }, [editingHabit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;

    onSave({
      title: habitTitle,
      frequency: habitFrequency,
      goal_count: habitGoalCount,
      category: habitCategory
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-xl bg-surface border border-border rounded-[32px] overflow-hidden shadow-2xl"
      >
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Zap size={24} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-text_primary">
                {editingHabit ? 'Refine Protocol' : 'New Protocol'}
              </h3>
            </div>
            <button onClick={onClose} className="text-text_secondary hover:text-text_primary">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text_secondary uppercase tracking-widest ml-1">Protocol Name</label>
              <input 
                type="text" 
                value={habitTitle}
                onChange={(e) => setHabitTitle(e.target.value)}
                placeholder="e.g., Morning Meditation"
                className="w-full bg-slate-900/50 border border-border rounded-2xl px-6 py-4 focus:border-primary/50 outline-none font-bold text-text_primary"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text_secondary uppercase tracking-widest ml-1">Frequency</label>
                <select 
                  value={habitFrequency}
                  onChange={(e) => setHabitFrequency(e.target.value)}
                  className="w-full bg-slate-900/50 border border-border rounded-2xl px-6 py-4 focus:border-primary/50 outline-none font-bold text-text_primary appearance-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text_secondary uppercase tracking-widest ml-1">Daily Goal</label>
                <input 
                  type="number" 
                  value={Number.isNaN(habitGoalCount) ? '' : habitGoalCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setHabitGoalCount(Number.isNaN(val) ? 1 : val);
                  }}
                  className="w-full bg-slate-900/50 border border-border rounded-2xl px-6 py-4 focus:border-primary/50 outline-none font-bold text-text_primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text_secondary uppercase tracking-widest ml-1">Category</label>
              <select 
                value={habitCategory}
                onChange={(e) => setHabitCategory(e.target.value)}
                className="w-full bg-slate-900/50 border border-border rounded-2xl px-6 py-4 focus:border-primary/50 outline-none font-bold text-text_primary appearance-none"
              >
                <option value="health">Health</option>
                <option value="work">Work</option>
                <option value="growth">Growth</option>
                <option value="finance">Finance</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            <motion.button 
              whileHover={theme.motion.hover}
              whileTap={theme.motion.tap}
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-primary text-black rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : (editingHabit ? 'Update Protocol' : 'Deploy Protocol')}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
