import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus } from 'lucide-react';
import { Mission } from '../../types';
import { useTheme } from '../../theme';
import { toDate } from '../../lib/utils';

interface MissionFormProps {
  editingMission: Mission | null;
  onSave: (payload: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const MissionForm: React.FC<MissionFormProps> = ({ editingMission, onSave, onCancel, isLoading }) => {
  const { theme } = useTheme();

  const [title, setTitle] = useState('');
  const [urgencyScore, setUrgencyScore] = useState(5);
  const [estimatedEffort, setEstimatedEffort] = useState(3);
  const [impactLevel, setImpactLevel] = useState(5);
  const [duration, setDuration] = useState(30);
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('general');

  useEffect(() => {
    if (editingMission) {
      setTitle(editingMission.title);
      setUrgencyScore(editingMission.urgency_score || 5);
      setEstimatedEffort(editingMission.estimated_effort || 3);
      setImpactLevel(editingMission.impact_level || 5);
      setDuration(editingMission.duration || 30);
      setDeadline(editingMission.deadline ? toDate(editingMission.deadline).toISOString().slice(0, 16) : '');
      setCategory(editingMission.category || 'general');
    } else {
      setTitle('');
      setUrgencyScore(5);
      setEstimatedEffort(3);
      setImpactLevel(5);
      setDuration(30);
      setDeadline('');
      setCategory('general');
    }
  }, [editingMission]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title,
      urgency_score: urgencyScore,
      estimated_effort: estimatedEffort,
      impact_level: impactLevel,
      duration,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      category
    });
  };

  return (
    <motion.form 
      variants={theme.motion.variants.item}
      onSubmit={handleSubmit} 
      className="stitch-card p-4 md:p-10 space-y-6 md:space-y-8 border-border relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-text_secondary">
        <Zap size={120} />
      </div>
      <div className="flex items-center gap-4 relative z-10">
        <motion.div 
          animate={editingMission ? { rotate: [0, 10, -10, 0] } : {}}
          className={`size-10 md:size-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner ${editingMission ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`}
        >
          {editingMission ? <Zap size={20} className="md:size-[24px]" /> : <Plus size={20} className="md:size-[24px]" />}
        </motion.div>
        <h3 className={`text-lg md:text-2xl font-black tracking-tight text-text_primary`}>
          {editingMission ? (theme.id === 'elite' ? 'Refine Mission' : 'Edit Task') : (theme.id === 'elite' ? 'Initialize Mission' : 'New Task')}
        </h3>
      </div>
      <div className="space-y-6 md:space-y-8 relative z-10">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-text_secondary uppercase tracking-widest ml-1">
            {theme.id === 'elite' ? 'Mission Objective' : 'What needs to be done?'}
          </label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={theme.id === 'elite' ? "Enter tactical objective..." : "e.g., Buy groceries"}
            className="w-full bg-surface border border-border rounded-xl md:rounded-2xl px-4 md:px-8 py-3 md:py-6 focus:border-primary/50 transition-all outline-none font-bold text-lg md:text-2xl placeholder:text-text_secondary/30 text-text_primary"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-text_secondary uppercase tracking-widest ml-1">Urgency Score (1-10)</label>
              <span className="text-xs font-black text-primary">{urgencyScore}</span>
            </div>
            <input 
              type="range" min="1" max="10" step="1"
              value={urgencyScore}
              onChange={(e) => setUrgencyScore(parseInt(e.target.value))}
              className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-text_secondary uppercase tracking-widest ml-1">Estimated Effort (1-5)</label>
              <span className="text-xs font-black text-secondary">{estimatedEffort}</span>
            </div>
            <input 
              type="range" min="1" max="5" step="1"
              value={estimatedEffort}
              onChange={(e) => setEstimatedEffort(parseInt(e.target.value))}
              className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-secondary"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-text_secondary uppercase tracking-widest ml-1">Impact Level (1-10)</label>
              <span className="text-xs font-black text-accent">{impactLevel}</span>
            </div>
            <input 
              type="range" min="1" max="10" step="1"
              value={impactLevel}
              onChange={(e) => setImpactLevel(parseInt(e.target.value))}
              className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-accent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text_secondary uppercase tracking-widest ml-1">Duration (min)</label>
            <input 
              type="number" 
              value={Number.isNaN(duration) ? '' : duration}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setDuration(Number.isNaN(val) ? 0 : val);
              }}
              className="w-full bg-surface border border-border rounded-xl md:rounded-2xl px-4 md:px-8 py-3 md:py-5 focus:border-primary/50 outline-none font-bold text-text_primary"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text_secondary uppercase tracking-widest ml-1">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl md:rounded-2xl px-4 md:px-8 py-3 md:py-5 focus:border-primary/50 outline-none font-bold text-text_primary appearance-none"
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="health">Health</option>
              <option value="finance">Finance</option>
              <option value="growth">Growth</option>
              <option value="general">General</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text_secondary uppercase tracking-widest ml-1">
              {theme.id === 'elite' ? 'Temporal Deadline' : 'Due Date'}
            </label>
            <input 
              type="datetime-local" 
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={`w-full bg-surface border border-border focus:border-primary/50 rounded-xl md:rounded-2xl px-4 md:px-8 py-3 md:py-5 outline-none font-bold transition-colors text-text_primary`}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <motion.button 
            whileHover={theme.motion.hover}
            whileTap={theme.motion.tap}
            type="submit"
            disabled={isLoading}
            className="flex-1 py-4 md:py-6 bg-primary text-black rounded-xl md:rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : editingMission ? (theme.id === 'elite' ? 'Update Mission' : 'Save Changes') : (theme.id === 'elite' ? 'Deploy Mission' : 'Add Task')}
          </motion.button>
          {editingMission && (
            <motion.button 
              whileHover={theme.motion.hover}
              whileTap={theme.motion.tap}
              type="button"
              onClick={onCancel}
              className="px-8 py-4 md:py-6 bg-surface border border-border text-text_secondary rounded-xl md:rounded-2xl font-black uppercase tracking-widest hover:bg-danger/10 hover:text-danger transition-all"
            >
              Cancel
            </motion.button>
          )}
        </div>
      </div>
    </motion.form>
  );
};
