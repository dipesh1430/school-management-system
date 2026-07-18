import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSubmissions, useGradeSubmission } from '../../hooks/useHomeworkSubmissions';
import { X, CheckCircle, ExternalLink, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

interface HomeworkSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  homeworkId: string | null;
}

export default function HomeworkSubmissionsModal({ isOpen, onClose, homeworkId }: HomeworkSubmissionsModalProps) {
  const { data: submissions, isLoading } = useSubmissions(homeworkId);
  const gradeMutation = useGradeSubmission();

  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [grade, setGrade] = useState('');
  const [remark, setRemark] = useState('');

  if (!isOpen) return null;

  const handleOpenGradePanel = (sub: any) => {
    setActiveSubmissionId(sub._id);
    setGrade(sub.grade || '');
    setRemark(sub.remark || '');
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmissionId) return;

    gradeMutation.mutate(
      { submissionId: activeSubmissionId, grade, remark },
      {
        onSuccess: () => {
          setActiveSubmissionId(null);
          setGrade('');
          setRemark('');
        }
      }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Submissions & Grading</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* List of Submissions */}
          <div className="w-full md:w-1/3 border-r border-slate-100 dark:border-slate-800/50 overflow-y-auto bg-slate-50 dark:bg-slate-950/30">
            {isLoading ? (
              <p className="p-6 text-center text-slate-500">Loading submissions...</p>
            ) : submissions?.length === 0 ? (
              <p className="p-6 text-center text-slate-500 font-medium">No submissions yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {submissions?.map((sub: any) => (
                  <li key={sub._id}>
                    <button
                      onClick={() => handleOpenGradePanel(sub)}
                      className={`w-full text-left p-4 hover:bg-white dark:hover:bg-slate-900 transition-colors ${activeSubmissionId === sub._id ? 'bg-white dark:bg-slate-900 border-l-4 border-indigo-500 shadow-sm' : 'border-l-4 border-transparent'}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm text-slate-900 dark:text-white block">{sub.studentId?.name || 'Unknown Student'}</span>
                        {sub.status === 'Graded' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                        {new Date(sub.createdAt).toLocaleString()}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Grading Panel */}
          <div className="w-full md:w-2/3 overflow-y-auto p-6 bg-white dark:bg-slate-900">
            {!activeSubmissionId ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                <p>Select a student from the list to view and grade their submission.</p>
              </div>
            ) : (
              (() => {
                const activeSub = submissions?.find((s: any) => s._id === activeSubmissionId);
                if (!activeSub) return null;

                return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="pb-4 border-b border-slate-100 dark:border-slate-800/50">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{activeSub.studentId?.name}'s Work</h3>
                      <div className="mt-4 space-y-4">
                        {activeSub.fileUrl && (
                          <a href={activeSub.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open Attached File/Link
                          </a>
                        )}
                        {activeSub.textAnswer && (
                          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{activeSub.textAnswer}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <form onSubmit={handleSaveGrade} className="space-y-4 bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                      <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-300 mb-2">Grade Assignment</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="col-span-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Grade / Score</label>
                          <input
                            type="text"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            required
                            className="input-field w-full font-bold text-indigo-700 dark:text-indigo-400"
                            placeholder="e.g. 85/100, A+"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Teacher's Remark</label>
                          <input
                            type="text"
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            className="input-field w-full"
                            placeholder="Great job on the second question..."
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={gradeMutation.isPending}
                          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm text-sm transition-all active:scale-95 disabled:opacity-50"
                        >
                          {gradeMutation.isPending ? 'Saving...' : 'Save Grade'}
                        </button>
                      </div>
                    </form>
                  </div>
                );
              })()
            )}
          </div>
          
        </div>
      </div>
    </div>,
    document.body
  );
}
