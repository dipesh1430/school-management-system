import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { useClasses } from '../../hooks/useClasses';
import { useUsers } from '../../hooks/useUsers';
import { useGenerateFee } from '../../hooks/useFees';
import CustomSelect from '../ui/CustomSelect';
import CustomDatePicker from '../ui/CustomDatePicker';
import { X } from 'lucide-react';

interface GenerateFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GenerateFeeModal({ isOpen, onClose }: GenerateFeeModalProps) {
  const { data: classes } = useClasses('2026-2027');
  const { data: users } = useUsers();
  
  const students = users?.filter(u => u.role === 'student') || [];

  const [targetType, setTargetType] = useState('class');
  const [classId, setClassId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const generateMutation = useGenerateFee();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (targetType === 'class' && !classId) {
      toast.error('Please select a class');
      return;
    }
    if (targetType === 'student' && (!classId || !studentId)) {
      toast.error('Please select a student (requires class selection)');
      // In a robust implementation, you wouldn't necessarily need classId if studentId is provided,
      // but our backend logic expects classId to link the fee properly for reporting.
      return;
    }

    generateMutation.mutate(
      { 
        classId, 
        studentId: targetType === 'student' ? studentId : undefined,
        title, 
        amount: Number(amount), 
        dueDate 
      },
      {
        onSuccess: () => {
          toast.success('Fee invoice(s) generated successfully!');
          setTitle('');
          setAmount('');
          setDueDate('');
          onClose();
        },
        onError: () => {
          toast.error('Failed to generate fees.');
        }
      }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Generate Fee Invoice</h2>
          <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex space-x-4 mb-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" checked={targetType === 'class'} onChange={() => setTargetType('class')} className="text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Assign to Entire Class</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" checked={targetType === 'student'} onChange={() => setTargetType('student')} className="text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Assign to Single Student</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={targetType === 'class' ? 'col-span-2' : 'col-span-1'}>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Class</label>
              <CustomSelect
                value={classId}
                onChange={(val) => setClassId(val)}
                placeholder="Select a class..."
                options={classes?.map(c => ({
                  value: c._id,
                  label: `${c.name} ${c.stream ? `(${c.stream})` : ''}`
                })) || []}
              />
            </div>

            {targetType === 'student' && (
              <div className="col-span-1">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Student</label>
                <CustomSelect
                  value={studentId}
                  onChange={(val) => setStudentId(val)}
                  placeholder="Select student..."
                  options={students.map(s => ({
                    value: s._id,
                    label: s.name
                  }))}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Fee Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field w-full"
              placeholder="e.g., Term 1 Tuition Fee"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Amount ($)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field w-full"
                placeholder="500.00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Due Date</label>
              <CustomDatePicker selected={dueDate} onChange={(date) => setDueDate(date)} placeholderText="Select Due Date" required />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={generateMutation.isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm shadow-indigo-200 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {generateMutation.isPending ? 'Generating...' : 'Generate Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
