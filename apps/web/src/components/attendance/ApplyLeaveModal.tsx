import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApplyLeave } from '../../hooks/useLeave';
import CustomDatePicker from '../ui/CustomDatePicker';
import { X } from 'lucide-react';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplyLeaveModal({ isOpen, onClose }: ApplyLeaveModalProps) {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [reason, setReason] = useState('');

  const applyMutation = useApplyLeave();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason) return;

    applyMutation.mutate(
      {
        fromDate: fromDate.toISOString().split('T')[0],
        toDate: toDate.toISOString().split('T')[0],
        reason
      },
      {
        onSuccess: () => {
          setFromDate(null);
          setToDate(null);
          setReason('');
          onClose();
        }
      }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Apply for Leave</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">From Date</label>
              <CustomDatePicker selected={fromDate} onChange={(date) => setFromDate(date)} placeholderText="Start date" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">To Date</label>
              <CustomDatePicker selected={toDate} onChange={(date) => setToDate(date)} placeholderText="End date" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Reason for Leave</label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field w-full h-24 resize-none"
              placeholder="Please provide a valid reason..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={applyMutation.isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
