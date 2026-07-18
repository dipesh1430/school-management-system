import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSections, useCreateSection } from '../../hooks/useClasses';
import { X, Users, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomSelect from '../ui/CustomSelect';
import { useUsers } from '../../hooks/useUsers';

interface ManageSectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string | null;
  classNameStr: string;
}

export default function ManageSectionsModal({ isOpen, onClose, classId, classNameStr }: ManageSectionsModalProps) {
  const [newSectionName, setNewSectionName] = useState('');
  const [classTeacherId, setClassTeacherId] = useState('');
  
  const { data: sections, isLoading } = useSections(classId || '');
  const createSection = useCreateSection(classId || '');
  const { data: users } = useUsers();
  
  const teachers = users?.filter(u => u.role === 'teacher') || [];

  if (!isOpen || !classId) return null;

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName) return;

    toast.promise(
      new Promise((resolve, reject) => {
        createSection.mutate(
          { name: newSectionName, classTeacherId: classTeacherId || undefined },
          {
            onSuccess: (data) => {
              setNewSectionName('');
              setClassTeacherId('');
              resolve(data);
            },
            onError: (err) => reject(err)
          }
        );
      }),
      {
        loading: 'Creating section...',
        success: 'Section added successfully!',
        error: 'Failed to create section.',
      }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-500" />
              Manage Sections: Class {classNameStr}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View and add sections for this class.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Existing Sections</h3>
              {sections && sections.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sections.map(sec => (
                    <div key={sec._id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg text-slate-800 dark:text-slate-100">Section {sec.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Teacher: {typeof sec.classTeacherId === 'object' ? sec.classTeacherId?.name : (teachers.find(t => t._id === sec.classTeacherId)?.name || 'Not Assigned')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  No sections exist for this class yet.
                </div>
              )}
            </div>
          )}

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">Add New Section</h3>
            <form onSubmit={handleAddSection} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Section Name (e.g. A, B)</label>
                  <input 
                    type="text" 
                    required 
                    value={newSectionName} 
                    onChange={(e) => setNewSectionName(e.target.value)} 
                    className="input-field" 
                    placeholder="Enter section name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Class Teacher (Optional)</label>
                  <CustomSelect
                    value={classTeacherId}
                    onChange={(val) => setClassTeacherId(val)}
                    placeholder="Select Teacher..."
                    options={teachers.map(t => ({
                      value: t._id,
                      label: t.name
                    }))}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={createSection.isPending || !newSectionName}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center disabled:opacity-50"
                >
                  {createSection.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
