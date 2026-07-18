import React, { useState, useEffect } from 'react';
import { useClasses, useSections } from '../hooks/useClasses';
import { useStudentRoster, useAttendanceRecord, useMarkAttendance } from '../hooks/useAttendance';
import CustomSelect from '../components/ui/CustomSelect';
import CustomDatePicker from '../components/ui/CustomDatePicker';
import { CheckCircle, XCircle, Clock, FileMinus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Attendance() {
  const { data: classes } = useClasses('2026-2027');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [date, setDate] = useState<Date | null>(new Date());

  const { data: sections } = useSections(classId);
  const { data: roster, isLoading: isRosterLoading } = useStudentRoster(classId, sectionId);
  
  const dateStr = date ? date.toISOString().split('T')[0] : '';
  const { data: savedAttendance, isLoading: isAttendanceLoading } = useAttendanceRecord(classId, sectionId, dateStr);
  const markAttendanceMutation = useMarkAttendance();

  // Local state for the attendance form
  const [localRecords, setLocalRecords] = useState<Record<string, string>>({});

  // Auto-select section when loaded
  useEffect(() => {
    if (sections && sections.length > 0) {
      setSectionId(sections[0]._id);
    } else {
      setSectionId('');
    }
  }, [sections]);

  // Synchronize local state when roster or saved attendance loads
  useEffect(() => {
    if (roster) {
      const newLocal: Record<string, string> = {};
      roster.forEach(student => {
        // Find if they have a saved record, otherwise default to present
        const savedRecord = savedAttendance?.records.find(r => r.studentId === student._id);
        newLocal[student._id] = savedRecord ? savedRecord.status : 'present';
      });
      setLocalRecords(newLocal);
    }
  }, [roster, savedAttendance]);

  const handleStatusChange = (studentId: string, status: string) => {
    setLocalRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = () => {
    if (!classId || !sectionId || !date) return;
    
    const recordsPayload = Object.entries(localRecords).map(([studentId, status]) => ({
      studentId,
      status: status as any
    }));
    
    const dateStr = date.toISOString().split('T')[0];

    toast.promise(
      markAttendanceMutation.mutateAsync({ classId, sectionId, date: dateStr, records: recordsPayload }),
      {
        loading: 'Saving attendance...',
        success: 'Attendance saved successfully!',
        error: 'Failed to save attendance.'
      }
    );
  };

  const isDataReady = !!classId && !!sectionId && !!roster && roster.length > 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Daily Attendance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Mark and view student attendance.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Class</label>
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
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Section</label>
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
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Date</label>
            <CustomDatePicker selected={date} onChange={(d) => setDate(d)} placeholderText="Select Date" required />
          </div>
        </div>
      </div>

      {(!classId || !sectionId) ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 font-medium">Please select a Class and Section</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Attendance records will appear here once you select a target class.</p>
        </div>
      ) : isRosterLoading || isAttendanceLoading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          Loading roster...
        </div>
      ) : roster?.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">No students found in this class/section.</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">Go to the Users directory to onboard students first.</p>
        </div>
      ) : isDataReady ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {savedAttendance && (
            <div className="bg-green-50 px-6 py-3 border-b border-green-100 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                Attendance was already recorded for this date. Modifying will update the existing record.
              </span>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-950">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100">
                {roster?.map((student) => {
                  const status = localRecords[student._id] || 'present';
                  return (
                    <tr key={student._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-950 dark:hover:bg-slate-800/50 dark:bg-slate-950 dark:hover:bg-slate-800/50 dark:bg-slate-950/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-white">{student.rollNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-3">
                            {(student.userId?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{student.userId?.name || 'Unknown Student'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          status === 'present' ? 'bg-green-100 text-green-800' :
                          status === 'absent' ? 'bg-red-100 text-red-800' :
                          status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-orange-100 text-orange-800' // half-day
                        }`}>
                          {status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
                        <div className="flex space-x-1.5">
                          <button onClick={() => handleStatusChange(student._id, 'present')} className={`p-1.5 rounded-lg transition-colors ${status === 'present' ? 'bg-green-100 text-green-700' : 'text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-800'}`} title="Present">
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleStatusChange(student._id, 'absent')} className={`p-1.5 rounded-lg transition-colors ${status === 'absent' ? 'bg-red-100 text-red-700' : 'text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-800'}`} title="Absent">
                            <XCircle className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleStatusChange(student._id, 'late')} className={`p-1.5 rounded-lg transition-colors ${status === 'late' ? 'bg-yellow-100 text-yellow-700' : 'text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-800'}`} title="Late">
                            <Clock className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleStatusChange(student._id, 'half-day')} className={`p-1.5 rounded-lg transition-colors ${status === 'half-day' ? 'bg-orange-100 text-orange-700' : 'text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-800'}`} title="Half Day">
                            <FileMinus className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
            <button 
              onClick={handleSave} 
              disabled={markAttendanceMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {markAttendanceMutation.isPending ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
