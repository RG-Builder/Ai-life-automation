import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Dumbbell, Search } from 'lucide-react';
import { HabitCard } from '../habits/HabitCard';
import { HabitForm } from '../habits/HabitForm';
import { Habit } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../theme';

export const HabitsView: React.FC = () => {
  const { habits, handleAction, isLoading } = useAppContext();
  const { theme } = useTheme();

  const [showHabitModal, setShowHabitModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState<'all' | 'daily' | 'weekly'>('all');

  const filteredHabits = habits
    .filter(habit => (frequencyFilter === 'all' ? true : habit.frequency === frequencyFilter))
    .filter(habit =>
      searchQuery.trim()
        ? habit.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          habit.description.toLowerCase().includes(searchQuery.trim().toLowerCase())
        : true
    );

  const completedHabitsCount = habits.filter(habit => habit.current_count >= habit.goal_count).length;

  const handleSave = async (payload: any) => {
    if (editingHabit) {
      await handleAction('UPDATE_HABIT', { id: editingHabit.id, data: payload });
    } else {
      await handleAction('ADD_HABIT', payload);
    }
    setShowHabitModal(false);
    setEditingHabit(null);
  };

  const editHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowHabitModal(true);
  };

  return (
    <motion.div 
      key="habits"
      variants={theme.motion.variants.container}
      initial="hidden"
      animate="show"
      exit="hidden"
      className="space-y-8 md:space-y-12 pb-32"
    >
      <motion.div variants={theme.motion.variants.item} className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className={`text-3xl sm:text-5xl font-black tracking-tighter text-text_primary`}>Consistency <span className="text-primary">Protocols</span></h2>
          <p className="text-text_secondary text-[10px] font-black uppercase tracking-[0.3em]">
            {theme.id === 'elite' ? 'Neural Habit Forge & Reinforcement' : 'Build routines that actually stick.'}
          </p>
        </div>
        <motion.button 
          whileHover={theme.motion.hover}
          whileTap={theme.motion.tap}
          onClick={() => { setEditingHabit(null); setShowHabitModal(true); }}
          className="size-12 rounded-2xl bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 transition-all"
        >
          <Plus size={24} />
        </motion.button>
      </motion.div>

      <motion.div variants={theme.motion.variants.item} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text_secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habits..."
              className="w-full bg-surface border border-border rounded-xl px-10 py-3 text-sm text-text_primary outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="flex p-1.5 rounded-xl border overflow-x-auto no-scrollbar bg-surface border-border">
            {(['all', 'daily', 'weekly'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setFrequencyFilter(filter)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${frequencyFilter === filter ? 'bg-primary text-black' : 'text-text_secondary hover:text-text_primary'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-surface border border-border text-text_secondary">
            Total: <span className="text-text_primary">{habits.length}</span>
          </span>
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-surface border border-border text-text_secondary">
            Goal Hit: <span className="text-primary">{completedHabitsCount}</span>
          </span>
        </div>
      </motion.div>

      <motion.div variants={theme.motion.variants.container} className="grid grid-cols-1 gap-6">
        {filteredHabits.map(habit => (
          <motion.div key={habit.id} variants={theme.motion.variants.item}>
            <HabitCard 
              habit={habit} 
              editHabit={editHabit} 
              handleAction={handleAction} 
            />
          </motion.div>
        ))}

        {habits.length === 0 && (
          <motion.div 
            variants={theme.motion.variants.item}
            className="p-12 md:p-24 text-center border border-dashed border-border rounded-[32px] md:rounded-[48px] bg-surface/50"
          >
            <Dumbbell size={48} className="mx-auto mb-6 opacity-10 text-text_secondary" />
            <p className="font-black uppercase tracking-[0.3em] text-[10px] md:text-sm text-text_secondary">No consistency protocols active</p>
            <motion.button 
              whileHover={theme.motion.hover}
              whileTap={theme.motion.tap}
              onClick={() => { setEditingHabit(null); setShowHabitModal(true); }}
              className="mt-6 px-8 py-4 bg-primary/10 text-primary rounded-xl font-black uppercase tracking-widest text-xs hover:bg-primary/20 transition-all"
            >
              Initialize First Protocol
            </motion.button>
          </motion.div>
        )}
        {habits.length > 0 && filteredHabits.length === 0 && (
          <motion.div 
            variants={theme.motion.variants.item}
            className="p-8 text-center border border-dashed border-border rounded-2xl bg-surface/50 text-text_secondary font-bold"
          >
            No habits match your current search/filter.
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {showHabitModal && (
          <HabitForm 
            editingHabit={editingHabit}
            onSave={handleSave}
            onClose={() => setShowHabitModal(false)}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
