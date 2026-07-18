import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCreateClass } from '../../hooks/useClasses';
import { X, BookOpen, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomSelect from '../ui/CustomSelect';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateClassModal({ isOpen, onClose }: CreateClassModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'nep'>('basic');

  const [name, setName] = useState('');
  const [stream, setStream] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [stage, setStage] = useState('middle');
  const [shift, setShift] = useState('morning');
  const [gradingType, setGradingType] = useState('marks');
  
  const createClassMutation = useCreateClass();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast.promise(
      new Promise((resolve, reject) => {
        createClassMutation.mutate(
          { name, stream: stream === '' ? null : stream, academicYear, stage, shift, gradingType },
          {
            onSuccess: (data) => {
              onClose();
              setName('');
              setStream('');
              setStage('middle');
              setShift('morning');
              setGradingType('marks');
              resolve(data);
            },
            onError: (err) => reject(err)
          }
        );
      }),
      {
        loading: 'Creating class...',
        success: 'Class created successfully!',
        error: 'Failed to create class.',
      }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Create New Class</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Configure class structures according to CBSE NEP guidelines.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800/50 px-6 shrink-0 bg-slate-50 dark:bg-slate-950/50">
          <button onClick={() => setActiveTab('basic')} className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'basic' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-200'}`}>
            <BookOpen className="inline-block w-4 h-4 mr-2" /> Basic Details
          </button>
          <button onClick={() => setActiveTab('nep')} className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'nep' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-200'}`}>
            <Settings className="inline-block w-4 h-4 mr-2" /> NEP Configuration
          </button>
        </div>

        <form id="class-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {activeTab === 'basic' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Class Name (e.g. 10, Jr. KG)</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Academic Year</label>
                  <input type="text" required value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="input-field" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nep' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">NEP Educational Stage</label>
                  <CustomSelect
                    value={stage}
                    onChange={(val) => setStage(val)}
                    options={[
                      { value: 'foundational', label: 'Foundational Stage (Nursery - Class 2)' },
                      { value: 'preparatory', label: 'Preparatory Stage (Class 3 - 5)' },
                      { value: 'middle', label: 'Middle Stage (Class 6 - 8)' },
                      { value: 'secondary', label: 'Secondary Stage (Class 9 - 12)' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Class Shift</label>
                  <CustomSelect
                    value={shift}
                    onChange={(val) => setShift(val)}
                    options={[
                      { value: 'morning', label: 'Morning Shift' },
                      { value: 'noon', label: 'Noon Shift' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Grading Type</label>
                  <CustomSelect
                    value={gradingType}
                    onChange={(val) => setGradingType(val)}
                    options={[
                      { value: 'marks', label: 'Standard Marks (Out of 100)' },
                      { value: 'holistic', label: 'Holistic Progress Card (Qualitative)' }
                    ]}
                  />
                </div>

                <div className="col-span-2 border-t border-slate-100 dark:border-slate-800/50 pt-4 mt-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Stream Allocation (Class 11 & 12 Only)</h4>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Stream (Optional)</label>
                  <CustomSelect
                    value={stream}
                    onChange={(val) => setStream(val)}
                    placeholder="None (For Foundational, Prep & Middle)"
                    options={[
                      { value: '', label: 'None (For Foundational, Prep & Middle)' },
                      { value: 'Science', label: 'Science' },
                      { value: 'Commerce', label: 'Commerce' },
                      { value: 'Arts', label: 'Arts' }
                    ]}
                  />
                </div>
              </div>
            </div>
          )}

        </form>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800/50 shrink-0 flex justify-end space-x-3 bg-white dark:bg-slate-900">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-950 rounded-xl transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            form="class-form"
            disabled={createClassMutation.isPending}
            className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {createClassMutation.isPending ? 'Saving...' : 'Create Class'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
