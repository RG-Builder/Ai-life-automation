import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { useAppContext } from '../context/AppContext';
import { Habit } from '../types';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitToEdit?: Habit | null;
}

export const HabitModal: React.FC<HabitModalProps> = ({ isOpen, onClose, habitToEdit }) => {
  const { addHabit, updateHabit } = useAppContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalCount, setGoalCount] = useState(1);
  const [category, setCategory] = useState('Health');

  React.useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setDescription(habitToEdit.description || '');
      setGoalCount(habitToEdit.goal_count);
      setCategory(habitToEdit.category);
    } else {
      setTitle('');
      setDescription('');
      setGoalCount(1);
      setCategory('Health');
    }
  }, [habitToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (habitToEdit) {
      updateHabit(habitToEdit.id, { 
        title, 
        description, 
        goal_count: goalCount, 
        category 
      });
    } else {
      addHabit({ 
        title, 
        description, 
        goal_count: goalCount, 
        category,
        frequency: 'daily'
      });
    }
    
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={habitToEdit ? 'Edit Ritual' : 'New Ritual'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Ritual Name</label>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Morning Meditation"
            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#405C4A]/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's the goal?"
            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#405C4A]/20 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Daily Goal</label>
            <input
              type="number"
              value={Number.isNaN(goalCount) ? '' : goalCount}
              onChange={(e) => setGoalCount(parseInt(e.target.value))}
              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#405C4A]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-gray-900 focus:ring-2 focus:ring-[#405C4A]/20 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#405C4A] text-white py-4 rounded-2xl font-bold hover:bg-[#2E4536] transition-all shadow-lg shadow-[#405C4A]/20"
        >
          {habitToEdit ? 'Update Ritual' : 'Establish Ritual'}
        </button>
      </form>
    </Modal>
  );
};
