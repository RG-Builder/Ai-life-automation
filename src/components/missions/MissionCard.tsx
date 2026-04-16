import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, X, Heart, Briefcase, Target, Clock, CheckCircle2 } from 'lucide-react';
import { Mission } from '../../types';
import { toDate } from '../../lib/utils';

interface MissionCardProps {
  mission: Mission;
  theme: any;
  handleAction: (type: string, payload?: any) => Promise<void>;
}

export const MissionCard: React.FC<MissionCardProps> = ({ mission, theme, handleAction }) => {
  const impactColor = mission.impact === 'critical' ? 'text-danger' : mission.impact === 'high' ? 'text-primary' : 'text-secondary';
  
  const [deleteState, setDeleteState] = useState<'idle' | 'confirming' | 'deleted'>('idle');

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteState('deleted');
    handleAction('DELETE_TASK', { id: mission.id });
  };

  return (
    <motion.div 
      layout
      whileHover={theme.motion.hover}
      whileTap={theme.motion.tap}
      className={`stitch-card p-4 sm:p-6 group relative overflow-hidden transition-all border-transparent hover:border-primary/30 ${mission.status === 'completed' ? 'opacity-60 grayscale-[0.5]' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${impactColor}`}>
              {mission.status === 'overdue' ? 'OVERDUE' : mission.impact} {theme.id === 'elite' ? 'Impact' : theme.id === 'simple' ? 'Level' : ''}
            </span>
            <span className="text-[10px] font-bold text-text_secondary/50 uppercase tracking-widest">•</span>
            <span className="text-[10px] font-bold text-text_secondary uppercase tracking-widest">
              {mission.category}
            </span>
          </div>
          <h3 className={`text-xl font-bold tracking-tight transition-colors ${theme.id === 'elite' ? 'text-text_primary group-hover:text-primary' : 'text-text_primary'} ${mission.status === 'completed' ? 'line-through opacity-50' : ''}`}>
            {mission.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {deleteState === 'confirming' ? (
            <div className="flex items-center gap-2 bg-danger/10 px-3 py-1.5 rounded-lg border border-danger/20">
              <span className="text-xs text-danger font-bold uppercase tracking-widest">Delete?</span>
              <button 
                onClick={handleConfirmDelete}
                className="text-xs font-bold text-white bg-danger px-2 py-1 rounded hover:bg-danger/80 transition-colors"
              >
                Yes
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setDeleteState('idle'); }}
                className="text-xs font-bold text-text_secondary hover:text-text_primary transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); setDeleteState('confirming'); }}
              className="size-8 rounded-lg flex items-center justify-center transition-all text-text_secondary hover:text-danger hover:bg-danger/10 opacity-40 hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              title="Delete Mission"
            >
              <Trash2 size={16} />
            </motion.button>
          )}
          <div className={`size-10 rounded-xl flex items-center justify-center text-text_secondary bg-surface border border-border`}>
            {mission.category === 'health' ? <Heart size={20} /> : mission.category === 'work' ? <Briefcase size={20} /> : <Target size={20} />}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6">
        <div className="flex items-center gap-1.5 text-text_secondary">
          <Clock size={14} />
          <span className="text-xs font-medium">{mission.duration}m</span>
        </div>
        {mission.deadline && (
          <div className={`flex items-center gap-1.5 ${mission.status === 'overdue' ? 'text-danger' : 'text-text_secondary'}`}>
            <Clock size={14} />
            <span className="text-xs font-medium">
              {toDate(mission.deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
        {mission.status === 'completed' && mission.completed_at && (
          <div className="flex items-center gap-1.5 text-success">
            <CheckCircle2 size={14} />
            <span className="text-xs font-medium">
              Completed {toDate(mission.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {mission.status !== 'completed' && (
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: 'var(--color-primary)', color: '#000' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAction('COMPLETE_TASK', { id: mission.id, streak: mission.streak })}
            className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"
          >
            <CheckCircle2 size={20} />
          </motion.button>
        )}
        <motion.button 
          whileHover={{ scale: 1.02, backgroundColor: 'var(--color-primary)', color: '#000' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleAction('START_FOCUS', { task: mission })}
          className="flex-1 py-3 md:py-4 bg-surface border border-border text-text_primary rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-primary hover:text-black hover:border-primary transition-all"
        >
          {theme.id === 'elite' ? 'Engage Protocol' : 'Start Focus'}
        </motion.button>
      </div>
    </motion.div>
  );
};
