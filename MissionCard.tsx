import React, { useState } from 'react';
import { Trash2, X, CheckCircle2, Clock, Heart, Briefcase, Target, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface Mission {
  id: string;
  title: string;
  impact: 'low' | 'moderate' | 'high' | 'critical';
  urgency_score?: number;
  estimated_effort?: number;
  impact_level?: number;
  duration: number;
  deadline?: any;
  is_habit: boolean;
  streak: number;
  status: 'pending' | 'completed' | 'overdue';
  category: string;
  startTime?: string;
  endTime?: string;
  completed_at?: any;
  created_at: any;
}

interface MissionCardProps {
  mission: Mission;
  onComplete: (id: string, streak: number) => void;
  onDelete: (id: string) => void;
  onStartFocus: (task: Mission) => void;
  onEdit: (mission: Mission) => void;
  themeId: string;
  animationsType: string;
}

const toDate = (val: any): Date => {
  if (!val) return new Date(0);
  if (val instanceof Date) return val;
  if (val.seconds) return new Date(val.seconds * 1000);
  return new Date(val);
};

export const MissionCard: React.FC<MissionCardProps> = ({
  mission, onComplete, onDelete, onStartFocus, onEdit, themeId, animationsType
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const impactColor =
    mission.impact === 'critical' ? 'text-danger' :
    mission.impact === 'high' ? 'text-primary' : 'text-secondary';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete(mission.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const categoryIcon =
    mission.category === 'health' ? <Heart size={20} /> :
    mission.category === 'work' ? <Briefcase size={20} /> :
    <Target size={20} />;

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01, borderColor: 'var(--color-primary)' }}
      initial={animationsType !== 'minimal' ? { opacity: 0, y: 20 } : { opacity: 1 }}
      animate={{ opacity: 1, y: 0 }}
      onPointerDown={(e) => {
        // Long press to edit
        const timer = setTimeout(() => {
          if (window.navigator.vibrate) window.navigator.vibrate(50);
          onEdit(mission);
        }, 600);
        const cancel = () => clearTimeout(timer);
        e.currentTarget.addEventListener('pointerup', cancel, { once: true });
        e.currentTarget.addEventListener('pointercancel', cancel, { once: true });
      }}
      className={`stitch-card p-4 sm:p-6 group relative overflow-hidden transition-all border-transparent hover:border-primary/30 cursor-pointer ${mission.status === 'completed' ? 'opacity-60 grayscale-[0.5]' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${impactColor}`}>
              {mission.status === 'overdue' ? 'OVERDUE' : mission.impact}
              {themeId === 'elite' ? ' Impact' : themeId === 'simple' ? ' Level' : ''}
            </span>
            <span className="text-[10px] font-bold text-text_secondary/50 uppercase tracking-widest">•</span>
            <span className="text-[10px] font-bold text-text_secondary uppercase tracking-widest">{mission.category}</span>
          </div>
          <h3 className={`text-xl font-bold tracking-tight transition-colors ${themeId === 'elite' ? 'text-text_primary group-hover:text-primary' : 'text-text_primary'} ${mission.status === 'completed' ? 'line-through opacity-50' : ''}`}>
            {mission.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className={`size-8 rounded-lg flex items-center justify-center transition-all ${confirmDelete ? 'bg-danger text-white' : 'text-text_secondary hover:text-danger hover:bg-danger/10 opacity-40 hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100'}`}
            title={confirmDelete ? 'Click again to confirm' : 'Delete Mission'}
          >
            {confirmDelete ? <X size={16} /> : <Trash2 size={16} />}
          </button>
          <div className="size-10 rounded-xl flex items-center justify-center text-text_secondary bg-surface border border-border">
            {categoryIcon}
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
              Done {toDate(mission.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {mission.status !== 'completed' && (
          <button
            onClick={(e) => { e.stopPropagation(); onComplete(mission.id, mission.streak); }}
            className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"
            title="Complete"
          >
            <CheckCircle2 size={20} />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onStartFocus(mission); }}
          className="size-11 rounded-xl bg-surface border border-border text-text_secondary flex items-center justify-center hover:text-primary hover:border-primary/30 transition-all"
          title="Start Focus Mode"
        >
          <Zap size={18} />
        </button>
      </div>
    </motion.div>
  );
};
