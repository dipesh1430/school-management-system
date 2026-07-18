import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateHomework } from '../../hooks/useHomework';
import CustomDatePicker from '../ui/CustomDatePicker';

interface CreateHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  sectionId: string;
}

export default function CreateHomeworkModal({ isOpen, onClose, classId, sectionId }: CreateHomeworkModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  
  const createMutation = useCreateHomework();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !sectionId) {
      toast.error('Please select a Class and Section first.');
      return;
    }

    createMutation.mutate(
      { classId, sectionId, title, description, dueDate },
      {
        onSuccess: () => {
          toast.success('Homework assigned successfully!');
          setTitle('');
          setDescription('');
          setDueDate(null);
          onClose();
        },
        onError: () => {
          toast.error('Failed to assign homework.');
        }
      }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Assign Homework</h2>
          <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-shadow"
              placeholder="e.g., Algebra Worksheet 1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Description</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-shadow resize-none"
              placeholder="Instructions for the students..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Due Date</label>
            <CustomDatePicker selected={dueDate} onChange={(date) => setDueDate(date)} placeholderText="Select Due Date" required />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm shadow-indigo-200 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {createMutation.isPending ? 'Assigning...' : 'Assign Homework'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
