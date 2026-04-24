import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { useAppContext } from '../context/AppContext';
import { Mission } from '../types';
import { useTheme } from '../theme';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Mission | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit }) => {
  const { addTask, updateTask } = useAppContext();
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Mission['priority']>('medium');
  const [category, setCategory] = useState('Deep Work');
  const [duration, setDuration] = useState(30);

  React.useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setPriority(taskToEdit.priority);
      setCategory(taskToEdit.category);
      setDuration(taskToEdit.duration);
    } else {
      setTitle('');
      setPriority('medium');
      setCategory('Deep Work');
      setDuration(30);
    }
  }, [taskToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (taskToEdit) {
      updateTask(taskToEdit.id, { title, priority, category, duration });
    } else {
      addTask({ title, priority, category, duration });
    }
    onClose();
    // Reset form
    if (!taskToEdit) {
      setTitle('');
      setPriority('medium');
      setCategory('Deep Work');
      setDuration(30);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={taskToEdit ? 'Edit Mission' : 'New Mission'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-text_secondary uppercase tracking-widest mb-2">Mission Title</label>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full bg-surface border border-border rounded-2xl px-6 py-4 text-text_primary focus:ring-2 focus:ring-primary/20 transition-all text-gray-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-text_secondary uppercase tracking-widest mb-2">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full bg-surface border border-border rounded-2xl px-6 py-4 text-text_primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none text-gray-900"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-text_secondary uppercase tracking-widest mb-2">Duration (min)</label>
            <input
              type="number"
              value={Number.isNaN(duration) ? '' : duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full bg-surface border border-border rounded-2xl px-6 py-4 text-text_primary focus:ring-2 focus:ring-primary/20 transition-all text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-text_secondary uppercase tracking-widest mb-2">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Deep Work, Health, Admin"
            className="w-full bg-surface border border-border rounded-2xl px-6 py-4 text-text_primary focus:ring-2 focus:ring-primary/20 transition-all text-gray-900"
          />
        </div>

        <button
          type="submit"
          className="w-full text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg"
          style={{ backgroundColor: theme.colors.primary }}
        >
          {taskToEdit ? 'Update Mission' : 'Initialize Mission'}
        </button>
      </form>
    </Modal>
  );
};
