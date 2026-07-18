import React, { useState } from 'react';
import { useClasses } from '../hooks/useClasses';
import CreateClassModal from '../components/classes/CreateClassModal';
import ManageSectionsModal from '../components/classes/ManageSectionsModal';
import { Plus } from 'lucide-react';

export default function Classes() {
  const { data: classes, isLoading } = useClasses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sectionsModalData, setSectionsModalData] = useState<{ isOpen: boolean; classId: string | null; classNameStr: string }>({ isOpen: false, classId: null, classNameStr: '' });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Classes</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Manage all classes and sections in your school.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Class
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {classes?.length === 0 && (
            <div className="bg-white dark:bg-slate-900 px-6 py-12 text-center text-gray-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 rounded-md border border-gray-200 dark:border-slate-800 shadow">
              No classes found. Click "New Class" to create one or run the Seeder script.
            </div>
          )}

          {['morning', 'noon', 'other'].map(shiftGroup => {
            let groupClasses = [];
            let title = '';
            let subtitle = '';

            if (shiftGroup === 'morning') {
              groupClasses = classes?.filter(c => c.shift === 'morning') || [];
              title = 'Morning Shift (Middle & Secondary)';
              subtitle = 'Classes 6th to 12th';
            } else if (shiftGroup === 'noon') {
              groupClasses = classes?.filter(c => c.shift === 'noon') || [];
              title = 'Noon Shift (Foundational & Preparatory)';
              subtitle = 'Nursery to Class 5th';
            } else {
              groupClasses = classes?.filter(c => !c.shift) || [];
              title = 'Unassigned / Legacy Classes';
              subtitle = 'Classes without a designated shift';
            }

            if (groupClasses.length === 0) return null;

            return (
              <div key={shiftGroup} className="mb-8">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${shiftGroup === 'morning' ? 'bg-amber-400' : shiftGroup === 'noon' ? 'bg-indigo-500' : 'bg-slate-400'}`}></div>
                    {title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 ml-4">{subtitle}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-slate-800">
                  <ul className="divide-y divide-gray-200 dark:divide-slate-800">
                    {groupClasses.map((cls) => (
                      <li key={cls._id}>
                        <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-slate-800/50 dark:bg-slate-950 dark:hover:bg-slate-800/50 dark:bg-slate-950 transition-colors flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${shiftGroup === 'morning' ? 'bg-amber-50 text-amber-700 border border-amber-100' : shiftGroup === 'noon' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}>
                              {cls.name}
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                Class {cls.name} {cls.stream ? <span className="text-indigo-600">({cls.stream})</span> : ''}
                              </p>
                              <div className="flex items-center text-xs text-gray-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 space-x-2 mt-0.5">
                                <span className="uppercase tracking-wider font-semibold">{cls.stage || 'N/A'} Stage</span>
                                <span>&bull;</span>
                                <span>{cls.gradingType === 'holistic' ? 'Holistic Progress Card' : 'Standard Marks'}</span>
                                <span>&bull;</span>
                                <span>{cls.academicYear}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <button 
                              onClick={() => setSectionsModalData({ isOpen: true, classId: cls._id, classNameStr: cls.name })}
                              className="text-sm text-indigo-600 hover:text-indigo-900 font-medium bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                            >
                              Sections &rarr;
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateClassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ManageSectionsModal 
        isOpen={sectionsModalData.isOpen} 
        onClose={() => setSectionsModalData({ isOpen: false, classId: null, classNameStr: '' })} 
        classId={sectionsModalData.classId} 
        classNameStr={sectionsModalData.classNameStr} 
      />
    </div>
  );
}
