import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FileBadge, Plus, Search, Calendar, ChevronRight, Save, User as UserIcon } from 'lucide-react';
import { useExams, useCreateExam, useExamResults, useSubmitResults } from '../hooks/useExams';
import { useClasses } from '../hooks/useClasses';
import { useStudentsByClass } from '../hooks/useUsers';
import { useAuthStore } from '../store/authStore';
import CustomSelect from '../components/ui/CustomSelect';
import CustomDatePicker from '../components/ui/CustomDatePicker';
import ReportCardPreview from '../components/exams/ReportCardPreview';
import api from '../lib/api';

export default function Exams() {
  const { user } = useAuthStore();
  const { data: exams, isLoading: isExamsLoading } = useExams();
  const { data: classes } = useClasses();
  
  const createExam = useCreateExam();
  const submitResults = useSubmitResults();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { data: students } = useStudentsByClass(selectedClass);
  const { data: existingResults } = useExamResults(selectedExam?._id);

  // New Exam Form
  const [newExam, setNewExam] = useState({ name: '', term: 'Term 1', classId: '', date: new Date(), subjects: [] as { subjectId: string, maxMarks: number }[] });
  
  // Gradebook State
  const [marksState, setMarksState] = useState<any>({});
  
  // Report Card Preview State
  const [reportCardData, setReportCardData] = useState<any>(null);

  // Load existing results into gradebook when exam is selected
  React.useEffect(() => {
    if (existingResults && existingResults.length > 0) {
      const state: any = {};
      existingResults.forEach((res: any) => {
        state[res.studentId._id] = res.marks.reduce((acc: any, m: any) => {
          acc[m.subjectId._id] = m.marksObtained;
          return acc;
        }, {});
      });
      setMarksState(state);
    } else {
      setMarksState({});
    }
  }, [existingResults]);

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    createExam.mutate(newExam, {
      onSuccess: () => {
        setShowCreateModal(false);
        setNewExam({ name: '', term: 'Term 1', classId: '', date: new Date(), subjects: [] });
      }
    });
  };

  const handleSaveMarks = () => {
    if (!selectedExam) return;
    
    // Transform marksState into API format
    const results = Object.keys(marksState).map(studentId => {
      const marks = Object.keys(marksState[studentId]).map(subjectId => ({
        subjectId,
        marksObtained: Number(marksState[studentId][subjectId]),
      }));
      return { studentId, marks };
    });

    submitResults.mutate({ examId: selectedExam._id, results });
  };

  const handleMarkChange = (studentId: string, subjectId: string, value: string) => {
    setMarksState((prev: any) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: value
      }
    }));
  };

  const handleViewReportCard = async (studentId: string) => {
    try {
      const res = await api.get(`/exams/report-card/${selectedExam._id}/${studentId}`);
      setReportCardData(res.data);
    } catch (error) {
      console.error('Failed to load report card');
    }
  };

  const handleClassChangeForNewExam = (val: string) => {
    const cls = classes?.find((c: any) => c._id === val);
    if (cls) {
      setNewExam({
        ...newExam, 
        classId: val,
        subjects: cls.subjects?.map((s:any) => ({ subjectId: s._id, maxMarks: 100 })) || []
      });
    }
  };

  const filteredExams = exams?.filter((e: any) => e.classId?._id === selectedClass);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Exams & Results</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage tests, enter marks, and generate report cards.</p>
        </div>
        {user?.role !== 'student' && user?.role !== 'parent' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Schedule Exam
          </button>
        )}
      </div>

      {/* Class Selection & Exam List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* Left Sidebar: Select Class & Exam */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Select Class</label>
          <CustomSelect
            value={selectedClass}
            onChange={(val) => { setSelectedClass(val); setSelectedExam(null); }}
            options={classes?.map((c: any) => ({ value: c._id, label: `${c.name} - ${c.stream || 'General'}` })) || []}
          />

          <div className="mt-6 flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Scheduled Exams</h3>
            {!selectedClass ? (
              <p className="text-sm text-slate-500">Select a class first.</p>
            ) : filteredExams?.length === 0 ? (
              <p className="text-sm text-slate-500">No exams scheduled.</p>
            ) : (
              <div className="space-y-2">
                {filteredExams?.map((exam: any) => (
                  <button
                    key={exam._id}
                    onClick={() => setSelectedExam(exam)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${selectedExam?._id === exam._id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-200 dark:hover:border-slate-700'}`}
                  >
                    <div className="font-bold text-sm">{exam.name}</div>
                    <div className="text-xs opacity-80 mt-1 flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(exam.date).toLocaleDateString()}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Gradebook */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col">
          {!selectedExam ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <FileBadge className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" />
              <p className="font-medium">Select an exam from the left to enter marks or view results.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedExam.name} - Gradebook</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Class: {classes?.find((c:any) => c._id === selectedClass)?.name} &bull; Term: {selectedExam.term}</p>
                </div>
                {user?.role !== 'student' && user?.role !== 'parent' && (
                  <button
                    onClick={handleSaveMarks}
                    disabled={submitResults.isPending}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <Save className="-ml-1 mr-2 h-4 w-4" />
                    {submitResults.isPending ? 'Saving...' : 'Save Results'}
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl relative">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-950 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 sticky left-0 bg-slate-50 dark:bg-slate-950 z-20 shadow-[1px_0_0_0_#e2e8f0] dark:shadow-[1px_0_0_0_#1e293b]">Student Name</th>
                      {selectedExam.subjects.map((s: any) => (
                        <th key={s.subjectId._id} className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 text-center">
                          {s.subjectId.name} <br/><span className="text-[10px] font-medium text-slate-500">Max: {s.maxMarks}</span>
                        </th>
                      ))}
                      <th className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {students?.map((student: any) => (
                      <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="py-2 px-4 font-medium text-slate-800 dark:text-slate-200 sticky left-0 bg-white dark:bg-slate-900 shadow-[1px_0_0_0_#f1f5f9] dark:shadow-[1px_0_0_0_#1e293b]">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                              {student.userId?.profilePic ? <img src={student.userId.profilePic} className="w-6 h-6 rounded-full" /> : <UserIcon className="w-3 h-3 text-slate-400" />}
                            </div>
                            <span>{student.userId?.name}</span>
                          </div>
                        </td>
                        {selectedExam.subjects.map((s: any) => (
                          <td key={s.subjectId._id} className="py-2 px-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max={s.maxMarks}
                              className="w-16 px-2 py-1 text-center text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                              value={marksState[student._id]?.[s.subjectId._id] || ''}
                              onChange={(e) => handleMarkChange(student._id, s.subjectId._id, e.target.value)}
                              disabled={user?.role === 'student' || user?.role === 'parent'}
                            />
                          </td>
                        ))}
                        <td className="py-2 px-4 text-right">
                          <button 
                            onClick={() => handleViewReportCard(student._id)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40"
                          >
                            Preview Card
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Exam Modal */}
      {showCreateModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Schedule Exam</h2>
            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Class</label>
                <CustomSelect
                  value={newExam.classId}
                  onChange={handleClassChangeForNewExam}
                  options={classes?.map((c: any) => ({ value: c._id, label: `${c.name} - ${c.stream || 'General'}` })) || []}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Exam Name</label>
                  <input type="text" required placeholder="e.g. Mid-Term" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white" value={newExam.name} onChange={e => setNewExam({...newExam, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Term</label>
                  <CustomSelect
                    value={newExam.term}
                    onChange={(val) => setNewExam({...newExam, term: val})}
                    options={[{value: 'Term 1', label: 'Term 1'}, {value: 'Term 2', label: 'Term 2'}, {value: 'Finals', label: 'Finals'}]}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                <CustomDatePicker selected={newExam.date} onChange={(d) => setNewExam({...newExam, date: d || new Date()})} />
              </div>

              {newExam.classId && newExam.subjects.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subject Max Marks</label>
                  <div className="space-y-2">
                    {newExam.subjects.map((sub, index) => {
                      const subjectName = classes?.find((c:any) => c._id === newExam.classId)?.subjects?.find((s:any) => s._id === sub.subjectId)?.name;
                      return (
                        <div key={sub.subjectId} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{subjectName}</span>
                          <input 
                            type="number" 
                            className="w-20 px-2 py-1 text-center text-sm border rounded-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            value={sub.maxMarks}
                            onChange={(e) => {
                              const updated = [...newExam.subjects];
                              updated[index].maxMarks = Number(e.target.value);
                              setNewExam({...newExam, subjects: updated});
                            }}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 px-4 border rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" disabled={createExam.isPending || !newExam.classId} className="flex-1 py-2.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors">Schedule Exam</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Report Card Preview Modal */}
      {reportCardData && (
        <ReportCardPreview 
          result={reportCardData} 
          onClose={() => setReportCardData(null)} 
        />
      )}
    </div>
  );
}
