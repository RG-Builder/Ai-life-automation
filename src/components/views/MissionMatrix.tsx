import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { MissionCard } from '../missions/MissionCard';
import { MissionForm } from '../missions/MissionForm';
import { Mission } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../theme';
import { toDate } from '../../lib/utils';

export const MissionMatrix: React.FC = () => {
  const { missions, handleAction, isLoading } = useAppContext();
  const { theme } = useTheme();

  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'deadline' | 'impact_level' | 'urgency_score'>('created_at');
  const [editingMission, setEditingMission] = useState<Mission | null>(null);

  const filteredMissions = missions
    .filter(m => {
      if (taskFilter === 'all') return true;
      if (taskFilter === 'pending') return m.status === 'pending';
      if (taskFilter === 'completed') return m.status === 'completed';
      if (taskFilter === 'overdue') return m.status === 'overdue';
      return true;
    })
    .filter(m =>
      searchQuery.trim()
        ? m.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          (m.category || '').toLowerCase().includes(searchQuery.trim().toLowerCase())
        : true
    )
    .sort((a, b) => {
      if (sortBy === 'impact_level') return (b.impact_level || 0) - (a.impact_level || 0);
      if (sortBy === 'urgency_score') return (b.urgency_score || 0) - (a.urgency_score || 0);
      if (sortBy === 'deadline') {
        const aDeadline = a.deadline ? toDate(a.deadline).getTime() : Number.POSITIVE_INFINITY;
        const bDeadline = b.deadline ? toDate(b.deadline).getTime() : Number.POSITIVE_INFINITY;
        return aDeadline - bDeadline;
      }
      const aCreated = a.created_at ? toDate(a.created_at).getTime() : 0;
      const bCreated = b.created_at ? toDate(b.created_at).getTime() : 0;
      return bCreated - aCreated;
    });

  const completedCount = missions.filter(m => m.status === 'completed').length;
  const pendingCount = missions.filter(m => m.status === 'pending').length;
  const overdueCount = missions.filter(m => m.status === 'overdue').length;

  const handleSave = async (payload: any) => {
    if (editingMission) {
      await handleAction('UPDATE_TASK', { id: editingMission.id, data: payload });
    } else {
      await handleAction('ADD_TASK', payload);
    }
    setEditingMission(null);
  };

  const localHandleAction = async (type: string, data?: any) => {
    if (type === 'EDIT_TASK') {
      const mission = data as Mission;
      setEditingMission(mission);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    return handleAction(type, data);
  };

  return (
    <motion.div 
      key="tasks"
      variants={theme.motion.variants.container}
      initial="hidden"
      animate="show"
      exit="hidden"
      className="space-y-8 md:space-y-12 pb-32"
    >
      <motion.div variants={theme.motion.variants.item} className="flex flex-col gap-6 md:gap-8">
        <div>
          <h2 className={`text-2xl md:text-5xl font-black tracking-tighter text-text_primary`}>{theme.wording.missions}</h2>
          <p className="text-text_secondary text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-2">
            {theme.id === 'elite' ? 'Tactical Asset Management & Deployment' : theme.id === 'simple' ? 'Keep track of everything you need to do!' : 'Manage your daily focus items.'}
          </p>
        </div>
        <div className={`flex p-1.5 rounded-[20px] md:rounded-[24px] border overflow-x-auto no-scrollbar bg-surface border-border`}>
          {(['all', 'pending', 'completed', 'overdue'] as const).map(f => (
            <motion.button 
              key={f}
              whileHover={theme.motion.hover}
              whileTap={theme.motion.tap}
              onClick={() => setTaskFilter(f)}
              className={`px-4 md:px-8 py-2 md:py-3.5 rounded-[16px] md:rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${taskFilter === f ? 'bg-primary text-black shadow-xl shadow-primary/20' : 'text-text_secondary hover:text-text_primary'}`}
            >
              {f}
            </motion.button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="md:col-span-2 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text_secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search missions by title or category..."
              className="w-full bg-surface border border-border rounded-xl px-10 py-3 text-sm text-text_primary outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text_primary outline-none focus:border-primary/50"
          >
            <option value="created_at">Sort: Newest</option>
            <option value="deadline">Sort: Deadline</option>
            <option value="impact_level">Sort: Highest Impact</option>
            <option value="urgency_score">Sort: Most Urgent</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-surface border border-border text-text_secondary">
            Pending: <span className="text-text_primary">{pendingCount}</span>
          </span>
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-surface border border-border text-text_secondary">
            Completed: <span className="text-text_primary">{completedCount}</span>
          </span>
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-surface border border-border text-text_secondary">
            Overdue: <span className="text-danger">{overdueCount}</span>
          </span>
        </div>
      </motion.div>

      <div className="space-y-8 md:space-y-10">
        <MissionForm 
          editingMission={editingMission} 
          onSave={handleSave} 
          onCancel={() => setEditingMission(null)}
          isLoading={isLoading}
        />

        <motion.div variants={theme.motion.variants.container} className="space-y-5">
          {filteredMissions.map((mission: Mission) => (
              <motion.div key={mission.id} variants={theme.motion.variants.item}>
                <MissionCard mission={mission} theme={theme} handleAction={localHandleAction} />
              </motion.div>
            ))}
          {filteredMissions.length === 0 && (
            <motion.div variants={theme.motion.variants.item} className="p-10 border border-dashed border-border rounded-3xl text-center text-text_secondary">
              No missions match this filter yet.
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
