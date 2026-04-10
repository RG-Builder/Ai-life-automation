import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Dumbbell, X, Zap } from 'lucide-react';
import { HabitCard } from '../habits/HabitCard';
import { Habit } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../theme';

export const HabitsView: React.FC = () => {
  const { habits, handleAction } = useAppContext();
  const { theme } = useTheme();

  const [showHabitModal, setShowHabitModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [habitTitle, setHabitTitle] = useState('');
  const [habitFrequency, setHabitFrequency] = useState('daily');
  const [habitGoalCount, setHabitGoalCount] = useState(1);
  const [habitCategory, setHabitCategory] = useState('health');

  const resetHabitForm = () => {
    setEditingHabit(null);
    setHabitTitle('');
    setHabitFrequency('daily');
    setHabitGoalCount(1);
    setHabitCategory('health');
  };

  const saveHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;

    const payload = {
      title: habitTitle,
      frequency: habitFrequency,
      goal_count: habitGoalCount,
      category: habitCategory
    };

    if (editingHabit) {
      await handleAction('UPDATE_HABIT', { id: editingHabit.id, ...payload });
    } else {
      await handleAction('ADD_HABIT', payload);
    }
    setShowHabitModal(false);
    resetHabitForm();
  };

  const editHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setHabitTitle(habit.title);
    setHabitFrequency(habit.frequency);
    setHabitGoalCount(habit.goal_count);
    setHabitCategory(habit.category || 'health');
    setShowHabitModal(true);
  };
  return (
    <motion.div 
      key="habits"
      initial={theme.animations.type !== 'minimal' ? { opacity: 0, y: 10 } : { opacity: 1 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8 md:space-y-12 pb-32"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className={`text-3xl sm:text-5xl font-black tracking-tighter text-text_primary`}>Consistency <span className="text-primary">Protocols</span></h2>
          <p className="text-text_secondary text-[10px] font-black uppercase tracking-[0.3em]">
            {theme.id === 'elite' ? 'Neural Habit Forge & Reinforcement' : 'Build routines that actually stick.'}
          </p>
        </div>
        <button 
          onClick={() => { resetHabitForm(); setShowHabitModal(true); }}
          className="size-12 rounded-2xl bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {habits.map(habit => (
          <HabitCard 
            key={habit.id} 
            habit={habit} 
            editHabit={editHabit} 
            handleAction={handleAction} 
          />
        ))}

        {habits.length === 0 && (
          <div className="p-12 md:p-24 text-center border border-dashed border-border rounded-[32px] md:rounded-[48px] bg-surface/50">
            <Dumbbell size={48} className="mx-auto mb-6 opacity-10 text-text_secondary" />
            <p className="font-black uppercase tracking-[0.3em] text-[10px] md:text-sm text-text_secondary">No consistency protocols active</p>
            <button 
              onClick={() => { resetHabitForm(); setShowHabitModal(true); }}
              className="mt-6 px-8 py-4 bg-primary/10 text-primary rounded-xl font-black uppercase tracking-widest text-xs hover:bg-primary/20 transition-all"
            >
              Initialize First Protocol
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showHabitModal && (
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
                  <button onClick={() => setShowHabitModal(false)} className="text-text_secondary hover:text-text_primary">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={saveHabit} className="space-y-6">
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
                        value={habitGoalCount}
                        onChange={(e) => setHabitGoalCount(parseInt(e.target.value) || 1)}
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

                  <button 
                    type="submit"
                    className="w-full py-5 bg-primary text-black rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    {editingHabit ? 'Update Protocol' : 'Deploy Protocol'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
