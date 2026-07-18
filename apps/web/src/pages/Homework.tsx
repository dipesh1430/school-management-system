import React, { useState, useEffect } from 'react';
import { useClasses, useSections } from '../hooks/useClasses';
import { useHomework } from '../hooks/useHomework';
import { Plus, BookOpen, Paperclip, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import CreateHomeworkModal from '../components/classes/CreateHomeworkModal';
import SubmitHomeworkModal from '../components/classes/SubmitHomeworkModal';
import HomeworkSubmissionsModal from '../components/classes/HomeworkSubmissionsModal';
import CustomSelect from '../components/ui/CustomSelect';

export default function Homework() {
  const { user } = useAuthStore();
  const { data: classes } = useClasses('2026-2027');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string | null>(null);

  const { data: sections } = useSections(classId);
  const { data: homeworkList, isLoading } = useHomework(classId, sectionId);

  // Auto-select section when loaded
  useEffect(() => {
    if (sections && sections.length > 0) {
      setSectionId(sections[0]._id);
    } else {
      setSectionId('');
    }
  }, [sections]);

  const handleOpenModal = () => {
    if (!classId || !sectionId) {
      toast.error('Please select a Class and Section first.');
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Homework Assignments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Manage class assignments and due dates.</p>
        </div>
        {['teacher', 'admin', 'principal'].includes(user?.role || '') && (
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98]"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Assign Homework
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Class filter</label>
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
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Section filter</label>
            <CustomSelect
              value={sectionId}
              onChange={(val) => setSectionId(val)}
              disabled={!classId || sections?.length === 0}
              placeholder="Select a section..."
              options={sections?.map(s => ({
                value: s._id,
                label: `Section ${s.name}`
              })) || []}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
          Loading assignments...
        </div>
      ) : !classId || !sectionId ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
          Select a class and section to view homework assignments.
        </div>
      ) : homeworkList?.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">No homework assigned yet.</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">Click "Assign Homework" to create the first assignment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {homeworkList?.map((hw) => (
            <div key={hw._id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                    <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                    Assignment
                  </div>
                  <div className="inline-flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    Due: {new Date(hw.dueDate).toLocaleDateString()}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{hw.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 mb-4">{hw.description}</p>
                
                <div className="border-t border-slate-100 dark:border-slate-800/50 pt-4 flex items-center justify-between">
                  <button className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors inline-flex items-center">
                    <Paperclip className="w-4 h-4 mr-1.5" />
                    {hw.attachments?.length || 0} Attachments
                  </button>
                  
                  {user?.role === 'student' ? (
                    hw.mySubmission ? (
                      <span className={`text-sm font-bold ${hw.mySubmission.status === 'Graded' ? 'text-green-600' : 'text-amber-600'}`}>
                        {hw.mySubmission.status} {hw.mySubmission.grade ? `(${hw.mySubmission.grade})` : ''}
                      </span>
                    ) : (
                      <button 
                        onClick={() => { setSelectedHomeworkId(hw._id); setSubmitModalOpen(true); }}
                        className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Turn In
                      </button>
                    )
                  ) : (
                    <button 
                      onClick={() => { setSelectedHomeworkId(hw._id); setSubmissionsModalOpen(true); }}
                      className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      View Submissions &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateHomeworkModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        classId={classId}
        sectionId={sectionId}
      />
      
      {selectedHomeworkId && (
        <>
          <SubmitHomeworkModal 
            isOpen={submitModalOpen} 
            onClose={() => { setSubmitModalOpen(false); setSelectedHomeworkId(null); }} 
            homeworkId={selectedHomeworkId} 
          />
          <HomeworkSubmissionsModal 
            isOpen={submissionsModalOpen} 
            onClose={() => { setSubmissionsModalOpen(false); setSelectedHomeworkId(null); }} 
            homeworkId={selectedHomeworkId} 
          />
        </>
      )}
    </div>
  );
}
