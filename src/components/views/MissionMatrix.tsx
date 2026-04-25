import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MissionCard } from '../missions/MissionCard';
import { MissionForm } from '../missions/MissionForm';
import { Mission } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../theme';

export const MissionMatrix: React.FC = () => {
  const { missions, handleAction, isLoading } = useAppContext();
  const { theme } = useTheme();

  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [editingMission, setEditingMission] = useState<Mission | null>(null);

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
      </motion.div>

      <div className="space-y-8 md:space-y-10">
        <MissionForm 
          editingMission={editingMission} 
          onSave={handleSave} 
          onCancel={() => setEditingMission(null)}
          isLoading={isLoading}
        />

        <motion.div variants={theme.motion.variants.container} className="space-y-5">
          {missions
            .filter(m => {
              if (taskFilter === 'all') return true;
              if (taskFilter === 'pending') return m.status === 'pending';
              if (taskFilter === 'completed') return m.status === 'completed';
              if (taskFilter === 'overdue') return m.status === 'overdue';
              return true;
            })
            .map((mission: Mission) => (
              <motion.div key={mission.id} variants={theme.motion.variants.item}>
                <MissionCard mission={mission} theme={theme} handleAction={localHandleAction} />
              </motion.div>
            ))}
        </motion.div>
      </div>
    </motion.div>
  );
};
