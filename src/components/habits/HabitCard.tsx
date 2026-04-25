import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Activity, Flame, Target, Edit3, Check, Trash2 } from 'lucide-react';
import { Habit } from '../../types';

import { useTheme } from '../../theme';

interface HabitCardProps {
  habit: Habit;
  editHabit: (habit: Habit) => void;
  handleAction: (type: string, payload?: any) => Promise<void>;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, editHabit, handleAction }) => {
  const { theme } = useTheme();

  return (
    <motion.div 
      whileHover={theme.motion.hover}
      whileTap={theme.motion.tap}
      className="stitch-card p-6 border-border group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-text_secondary">
        <Dumbbell size={80} />
      </div>
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-text_primary">{habit.title}</h3>
            <p className="text-xs font-medium text-text_secondary mt-1">{habit.description}</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text_secondary">
                <Flame size={14} className="text-danger" />
                Streak: {habit.streak}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text_secondary">
                <Target size={14} className="text-primary" />
                Goal: {habit.current_count}/{habit.goal_count} {habit.frequency}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => editHabit(habit)}
            className="size-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text_secondary hover:text-primary transition-all"
            title="Edit Protocol"
          >
            <Edit3 size={18} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAction('TOGGLE_HABIT', { id: habit.id, current_count: habit.current_count, streak: habit.streak })}
            className={`size-10 rounded-xl flex items-center justify-center transition-all ${habit.current_count >= habit.goal_count ? 'bg-success/20 text-success' : 'bg-primary text-black hover:scale-110 shadow-lg shadow-primary/20'}`}
          >
            <Check size={20} strokeWidth={3} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAction('DELETE_HABIT', { id: habit.id })}
            className="size-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text_secondary hover:text-danger transition-all"
          >
            <Trash2 size={18} />
          </motion.button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 h-1.5 w-full bg-surface rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (habit.current_count / habit.goal_count) * 100)}%` }}
          className={`h-full ${habit.current_count >= habit.goal_count ? 'bg-success' : 'bg-primary'}`}
        />
      </div>
    </motion.div>
  );
};
