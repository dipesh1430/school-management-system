import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSubmitHomework } from '../../hooks/useHomeworkSubmissions';
import { X, Link as LinkIcon, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface SubmitHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  homeworkId: string;
}

export default function SubmitHomeworkModal({ isOpen, onClose, homeworkId }: SubmitHomeworkModalProps) {
  const [fileUrl, setFileUrl] = useState('');
  const [textAnswer, setTextAnswer] = useState('');

  const submitMutation = useSubmitHomework();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl && !textAnswer) {
      toast.error('Please provide either a URL link or a text answer.');
      return;
    }

    submitMutation.mutate(
      { id: homeworkId, fileUrl, textAnswer },
      {
        onSuccess: () => {
          setFileUrl('');
          setTextAnswer('');
          onClose();
        }
      }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Submit Assignment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center">
              <LinkIcon className="w-4 h-4 mr-2" />
              File/Document URL (Optional)
            </label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="input-field w-full"
              placeholder="e.g., https://docs.google.com/..."
            />
            <p className="text-xs text-slate-500 mt-1">Paste a link to your Google Doc, Drive file, or image.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Text Answer (Optional)
            </label>
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              className="input-field w-full h-32 resize-none"
              placeholder="Type your answer here..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Turn In Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
