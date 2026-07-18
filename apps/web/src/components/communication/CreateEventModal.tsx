import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateEvent } from '../../hooks/useCommunication';
import CustomSelect from '../ui/CustomSelect';
import CustomDatePicker from '../ui/CustomDatePicker';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('event');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  
  const createMutation = useCreateEvent();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createMutation.mutate(
      { title, type, startDate, endDate, description },
      {
        onSuccess: () => {
          toast.success('Event added to calendar!');
          setTitle('');
          setStartDate(null);
          setEndDate(null);
          setDescription('');
          onClose();
        },
        onError: () => {
          toast.error('Failed to add event.');
        }
      }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Add Academic Event</h2>
          <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Event Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-shadow dark:text-white"
                placeholder="e.g., Summer Break"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Event Type</label>
              <CustomSelect
                value={type}
                onChange={(val) => setType(val)}
                options={[
                  { value: 'event', label: 'General Event' },
                  { value: 'holiday', label: 'Holiday' },
                  { value: 'exam', label: 'Examination' }
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Start Date</label>
              <CustomDatePicker selected={startDate} onChange={(date) => setStartDate(date)} placeholderText="Select Start Date" required />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">End Date</label>
              <CustomDatePicker selected={endDate} onChange={(date) => setEndDate(date)} placeholderText="Select End Date" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-shadow resize-none dark:text-white"
              placeholder="Any additional details..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm shadow-indigo-200 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {createMutation.isPending ? 'Saving...' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
