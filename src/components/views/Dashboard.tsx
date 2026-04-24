import React, { useState } from 'react';
import { Bell, Brain, Sparkles, LayoutGrid, Activity } from 'lucide-react';
import { LifeStateEngine } from '../dashboard/LifeStateEngine';
import { NextActionCard } from '../dashboard/NextActionCard';
import { MissionCard } from '../missions/MissionCard';
import { Mission, MotivationState, Analytics, User } from '../../types/index';
import { isToday } from '../../lib/utils';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme';
import { MOTIVATION_MESSAGES } from '../../services/motivationService';

import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const { 
    missions, 
    motivationState, 
    dailyScore, 
    handleAction,
    generateDayPlan,
    generateAiInsights,
    setActiveTab,
    isLoading,
    aiInsight,
    streak
  } = useAppContext();
  const { user } = useAuth();
  const { theme } = useTheme();

  const nextAction = missions.find(m => m.status === 'pending') || null;
  const motivationQuote = motivationState?.escalation_level ? 
    MOTIVATION_MESSAGES.ESCALATION.find(e => e.level === motivationState.escalation_level)?.text || MOTIVATION_MESSAGES.REWARDS[0]
    : MOTIVATION_MESSAGES.REWARDS[Math.floor(Math.random() * MOTIVATION_MESSAGES.REWARDS.length)];
  const selfAwareness = { focusTimeMinutes: missions.filter(m => m.status === 'completed').reduce((acc, m) => acc + (m.duration || 0), 0) };
  const [showNotifications, setShowNotifications] = useState(false);

  const todayMissions = missions.filter(m => 
    isToday(m.created_at) || 
    (m.deadline && isToday(m.deadline)) || 
    (m.completed_at && isToday(m.completed_at))
  );
  const completedToday = todayMissions.filter(m => m.status === 'completed' && m.completed_at && isToday(m.completed_at)).length;
  const totalToday = todayMissions.length;

  const getConsistencyPulse = () => {
    // Generate pulse data based on last 12 days of completed missions
    const pulseData = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const isDateToday = isToday(date.toISOString());
      
      const completedOnDate = missions.filter(m => 
        m.status === 'completed' && 
        m.completed_at && 
        (isDateToday ? isToday(m.completed_at) : m.completed_at.startsWith(date.toISOString().split('T')[0]))
      ).length;
      
      // Calculate a percentage based on an arbitrary goal of 3 tasks a day for the visual pulse
      const pulseScore = Math.min(100, Math.max(10, (completedOnDate / 3) * 100));
      pulseData.push(pulseScore);
    }
    return pulseData;
  };

  return (
    <motion.div 
      variants={theme.motion.variants.container}
      initial="hidden"
      animate="show"
      className="space-y-6 md:space-y-8 pb-32"
    >
      {/* Header */}
      <motion.div variants={theme.motion.variants.item} className="flex items-center justify-between px-0">
        <div>
          <h1 className={`text-2xl md:text-3xl font-black tracking-tighter text-text_primary`}>
            {theme.wording.dashboard.split(' ')[0]} <span className="text-primary">{theme.wording.dashboard.split(' ')[1] || ''}</span>
          </h1>
          <p className="text-[10px] md:text-xs font-bold text-text_secondary uppercase tracking-[0.2em] mt-1">
            {theme.wording.neuralSync}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className={`text-xs font-black uppercase tracking-widest text-text_primary`}>Level {Math.floor((missions.filter(m => m.status === 'completed').length + streak) / 5) + 1}</div>
            <div className="w-24 h-1.5 bg-border rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${((missions.filter(m => m.status === 'completed').length + streak) % 5) * 20}%` }} />
            </div>
          </div>
          <motion.div 
            whileHover={theme.motion.hover}
            whileTap={theme.motion.tap}
            className={`size-10 md:size-12 rounded-xl md:rounded-2xl flex items-center justify-center text-text_secondary bg-surface border border-border cursor-pointer hover:text-primary transition-all`} 
            onClick={() => setShowNotifications(true)}
          >
            <Bell size={20} />
          </motion.div>
        </div>
      </motion.div>

      {/* Life State Engine */}
      <motion.div variants={theme.motion.variants.item}>
        <LifeStateEngine 
          missions={missions}
          dailyScore={dailyScore}
          motivationState={motivationState}
          motivationQuote={motivationQuote}
          theme={theme}
        />
      </motion.div>

      {/* Strategic Intelligence */}
      <motion.div variants={theme.motion.variants.item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NextActionCard 
            task={nextAction} 
            onStartFocus={(task) => handleAction('START_FOCUS', { task })} 
            motivationState={motivationState}
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-text_secondary">AI Insight</h2>
            <Brain size={14} className="text-primary cursor-pointer hover:scale-110 transition-transform" onClick={generateAiInsights} />
          </div>
          <motion.div 
            whileHover={theme.motion.hover}
            className="stitch-card p-4 bg-surface border-l-4 border-primary"
          >
            <p className="text-sm font-bold text-text_primary leading-relaxed">
              {aiInsight || motivationQuote}
            </p>
          </motion.div>
          
          {/* Basic Analytics */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div whileHover={theme.motion.hover} className="glass-card p-3 border-border">
              <div className="text-[8px] font-black uppercase tracking-widest text-text_secondary mb-1">Done Today</div>
              <div className="text-xl font-black text-text_primary">{completedToday}</div>
            </motion.div>
            <motion.div whileHover={theme.motion.hover} className="glass-card p-3 border-border">
              <div className="text-[8px] font-black uppercase tracking-widest text-text_secondary mb-1">Focus Time</div>
              <div className="text-xl font-black text-primary">{selfAwareness?.focusTimeMinutes || 0}m</div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Core Actions */}
      <motion.div variants={theme.motion.variants.item} className="space-y-4">
        <motion.button 
          whileHover={theme.motion.hover}
          whileTap={theme.motion.tap}
          onClick={() => handleAction('PILOT_MY_DAY')}
          className="pilot-button"
        >
          <Sparkles className="size-5 md:size-6" />
          {theme.wording.pilot}
        </motion.button>
        
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <motion.button 
            whileHover={theme.motion.hover}
            whileTap={theme.motion.tap}
            onClick={() => setActiveTab('tasks')}
            className="stitch-card p-4 md:p-5 flex flex-col items-center gap-3 hover:bg-surface transition-all"
          >
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <LayoutGrid size={20} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest text-text_primary`}>{theme.wording.missions}</span>
          </motion.button>
          <motion.button 
            whileHover={theme.motion.hover}
            whileTap={theme.motion.tap}
            onClick={() => setActiveTab('schedule')}
            className="stitch-card p-4 md:p-5 flex flex-col items-center gap-3 hover:bg-surface transition-all"
          >
            <div className="size-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <Activity size={20} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest text-text_primary`}>{theme.wording.timeline}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Active Missions */}
      <motion.div variants={theme.motion.variants.item} className="space-y-4">
        <div className="flex items-center justify-between px-0">
          <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-text_secondary">{theme.wording.activeMissions}</h2>
          <button onClick={() => setActiveTab('tasks')} className="text-[10px] font-black uppercase tracking-widest text-primary">View All</button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {missions.filter(m => m.status === 'pending').slice(0, 3).map(mission => (
            <MissionCard key={mission.id} mission={mission} theme={theme} handleAction={handleAction} />
          ))}
        </div>
      </motion.div>

      {/* Consistency Pulse */}
      <motion.div 
        variants={theme.motion.variants.item}
        whileHover={theme.motion.hover}
        className={`stitch-card p-4 md:p-6 bg-primary/5 border-border`}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
            <Activity size={20} className="md:hidden" />
            <Activity size={24} className="hidden md:block" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-primary">Consistency Pulse</div>
            <div className={`text-base md:text-lg font-bold text-text_primary`}>{Math.round(getConsistencyPulse().reduce((a, b) => a + b, 0) / 12)}% Stability</div>
          </div>
        </div>
        <div className="flex gap-1 h-8 items-end">
          {getConsistencyPulse().map((h, i) => (
            <motion.div 
              key={i} 
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.05 }}
              className="flex-1 bg-primary/20 rounded-t-sm"
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
