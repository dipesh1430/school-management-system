import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateNotice } from '../../hooks/useCommunication';
import CustomSelect from '../ui/CustomSelect';

interface CreateNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateNoticeModal({ isOpen, onClose }: CreateNoticeModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  
  const createMutation = useCreateNotice();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createMutation.mutate(
      { title, body, audience },
      {
        onSuccess: () => {
          toast.success('Notice posted successfully!');
          setTitle('');
          setBody('');
          setAudience('all');
          onClose();
        },
        onError: () => {
          toast.error('Failed to post notice.');
        }
      }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Post New Notice</h2>
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
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-shadow dark:text-white"
              placeholder="e.g., Upcoming Parent-Teacher Meeting"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Audience</label>
            <CustomSelect
              value={audience}
              onChange={(val) => setAudience(val)}
              options={[
                { value: 'all', label: 'Entire School' },
                { value: 'teachers', label: 'Teachers Only' },
                { value: 'students', label: 'Students Only' }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Notice Body</label>
            <textarea
              required
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-shadow resize-none dark:text-white"
              placeholder="Write the full announcement here..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm shadow-indigo-200 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {createMutation.isPending ? 'Posting...' : 'Post Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
