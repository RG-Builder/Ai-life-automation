import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Activity, Flame, Zap } from 'lucide-react';
import { Mission, Habit, Analytics } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../theme';
import { toDate } from '../../lib/utils';

export const SelfAwareness: React.FC = () => {
  const { missions, habits } = useAppContext();
  const { theme } = useTheme();
  const selfAwareness = null; // Could be from context
  const completedMissions = missions.filter(m => m.status === 'completed');
  const totalMissions = missions.length;
  const cognitiveEfficiency = totalMissions > 0 ? Math.round((completedMissions.length / totalMissions) * 100) : 0;
  
  const habitConsistency = habits.length > 0
    ? Math.round(
        (habits.reduce((acc, h) => {
          const goal = Math.max(1, Number(h.goal_count) || 0);
          const progress = (Number(h.current_count) || 0) / goal;
          return acc + Math.min(1, Math.max(0, progress));
        }, 0) / habits.length) * 100
      )
    : 0;
  const weeklyCompletion = Array.from({ length: 7 }, (_, idx) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - idx));
    const target = date.toISOString().split('T')[0];
    const count = completedMissions.filter(m => {
      if (!m.completed_at) return false;
      return toDate(m.completed_at).toISOString().split('T')[0] === target;
    }).length;
    return { label: date.toLocaleDateString([], { weekday: 'short' }), count };
  });
  const weeklyCompletedTotal = weeklyCompletion.reduce((sum, d) => sum + d.count, 0);
  const peakDay = weeklyCompletion.reduce((peak, day) => day.count > peak.count ? day : peak, weeklyCompletion[0]);

  return (
    <motion.div 
      key="analytics"
      variants={theme.motion.variants.container}
      initial="hidden"
      animate="show"
      exit="hidden"
      className="space-y-8 sm:space-y-12 pb-32"
    >
      <motion.div variants={theme.motion.variants.item}>
        <h2 className={`text-2xl md:text-5xl font-black tracking-tighter text-text_primary`}>{theme.wording.awareness}</h2>
        <p className="text-text_secondary text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-2">
          {theme.id === 'elite' ? 'Neural Performance Analytics & Feedback' : 'Understand your patterns and improve.'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <motion.div 
          variants={theme.motion.variants.item}
          whileHover={theme.motion.hover}
          className="stitch-card p-8 space-y-6"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Brain size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-text_primary">Cognitive Efficiency</h3>
              <p className="text-xs font-medium text-text_secondary">Mission completion ratio</p>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-text_primary">{cognitiveEfficiency}%</span>
          </div>
          <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${cognitiveEfficiency}%` }}
              className="h-full bg-primary"
            />
          </div>
        </motion.div>

        <motion.div 
          variants={theme.motion.variants.item}
          whileHover={theme.motion.hover}
          className="stitch-card p-8 space-y-6"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-text_primary">Habit Stability</h3>
              <p className="text-xs font-medium text-text_secondary">Consistency protocol adherence</p>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-text_primary">{habitConsistency}%</span>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Stable</span>
          </div>
          <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${habitConsistency}%` }}
              className="h-full bg-secondary"
            />
          </div>
        </motion.div>
      </div>

      <motion.div variants={theme.motion.variants.item} className="stitch-card p-8">
        <h3 className="text-xl font-black tracking-tight text-text_primary mb-8">Performance Matrix</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-text_secondary">Focus Minutes</div>
            <div className="text-3xl font-black text-text_primary">{completedMissions.reduce((acc, m) => acc + (m.duration || 0), 0)}</div>
          </div>
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-text_secondary">Missions Secured</div>
            <div className="text-3xl font-black text-text_primary">{completedMissions.length}</div>
          </div>
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-text_secondary">Peak Streak</div>
            <div className="text-3xl font-black text-text_primary">{Math.max(...habits.map(h => h.streak), 0)}</div>
          </div>
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-text_secondary">Drive Score</div>
            <div className="text-3xl font-black text-primary">{Math.round(cognitiveEfficiency * 0.7 + habitConsistency * 0.3)}</div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={theme.motion.variants.item} className="stitch-card p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black tracking-tight text-text_primary">7-Day Completion Momentum</h3>
          <span className="text-xs font-black uppercase tracking-widest text-primary">{weeklyCompletedTotal} total</span>
        </div>
        <div className="grid grid-cols-7 gap-3">
          {weeklyCompletion.map((day) => {
            const height = Math.max(8, day.count * 12);
            return (
              <div key={day.label} className="flex flex-col items-center gap-2">
                <div className="w-full h-20 bg-surface rounded-lg flex items-end p-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height }}
                    className="w-full bg-primary rounded-md"
                  />
                </div>
                <div className="text-[10px] font-black text-text_secondary uppercase tracking-widest">{day.label}</div>
                <div className="text-xs font-bold text-text_primary">{day.count}</div>
              </div>
            );
          })}
        </div>
        <p className="text-xs font-medium text-text_secondary">
          Peak day this week: <span className="font-black text-text_primary">{peakDay.label}</span> ({peakDay.count} completed)
        </p>
      </motion.div>
    </motion.div>
  );
};
