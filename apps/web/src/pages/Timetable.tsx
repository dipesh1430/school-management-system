import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Coffee, BookOpen, Save, CheckCircle2, Sparkles, Loader2, UserPlus, Users, AlertCircle, ShieldAlert, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useClasses, useSections } from '../hooks/useClasses';
import { 
  useTimetables, useSaveTimetable, useLunchMenus, useSaveLunchMenu, 
  generateTimetableDraft, checkJobStatus, getDraft, 
  useSubstitutions, useSaveSubstitution,
  useTimetableStatus, useUpdateTimetableStatus, useRevokeTimetable
} from '../hooks/useTimetable';
import type { Period } from '../hooks/useTimetable';
import { useUsers } from '../hooks/useUsers';
import { useSubjects } from '../hooks/useSubjects';
import CustomSelect from '../components/ui/CustomSelect';
import CustomDatePicker from '../components/ui/CustomDatePicker';
import { useAuthStore } from '../store/authStore';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DEFAULT_PERIODS: Period[] = [
  { periodNumber: 1, subject: '', teacherId: '', startTime: '07:30', endTime: '08:10' },
  { periodNumber: 2, subject: '', teacherId: '', startTime: '08:10', endTime: '08:50' },
  { periodNumber: 3, subject: '', teacherId: '', startTime: '08:50', endTime: '09:30' },
  { periodNumber: 4, subject: '', teacherId: '', startTime: '09:30', endTime: '10:10' },
  // Recess 10:10 to 10:40
  { periodNumber: 5, subject: '', teacherId: '', startTime: '10:40', endTime: '11:20' },
  { periodNumber: 6, subject: '', teacherId: '', startTime: '11:20', endTime: '12:00' },
  { periodNumber: 7, subject: '', teacherId: '', startTime: '12:00', endTime: '12:40' },
  { periodNumber: 8, subject: '', teacherId: '', startTime: '12:40', endTime: '13:20' }
];

export default function Timetable() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'master' | 'substitutions' | 'cafeteria'>('master');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [substitutionDate, setSubstitutionDate] = useState<Date>(new Date());
  
  const [teacherSelections, setTeacherSelections] = useState<Record<number, string>>({});
  const [subjectSelections, setSubjectSelections] = useState<Record<number, string>>({});
  
  // Background Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [draftSchedule, setDraftSchedule] = useState<any>(null);

  const { data: classes } = useClasses();
  const { data: users } = useUsers();
  const teachers = users?.filter(u => u.role === 'teacher') || [];
  
  const { data: sections } = useSections(selectedClassId || '');
  
  const { data: timetables, isLoading } = useTimetables(selectedClassId, selectedSectionId);
  const saveTimetable = useSaveTimetable();

  const formattedSubDate = substitutionDate.toISOString().split('T')[0];
  const { data: substitutions } = useSubstitutions(formattedSubDate, selectedClassId, selectedSectionId);
  const saveSubstitution = useSaveSubstitution();

  const { data: lunchMenus } = useLunchMenus(selectedClassId, selectedSectionId);
  const saveLunchMenu = useSaveLunchMenu();

  const { data: statusData } = useTimetableStatus(selectedClassId, selectedSectionId);
  const updateStatus = useUpdateTimetableStatus();
  const revokeTimetable = useRevokeTimetable();

  const selectedClass = classes?.find(c => c._id === selectedClassId);
  const { data: subjects } = useSubjects(selectedClass?.stage);

  // RBAC for Master Timetable Edit (only principal/admin can edit, and only when draft/rejected)
  const isPrincipal = ['admin', 'principal'].includes(user?.role || '');
  const isSuperadmin = user?.role === 'superadmin';
  const timetableState = statusData?.status || 'draft';
  const canEditMaster = isPrincipal && ['draft', 'rejected'].includes(timetableState);
  const canEditSubstitutions = ['superadmin', 'admin', 'principal'].includes(user?.role || '');

  // Synchronize draft or published schedule data into the form selections whenever day or draft changes
  useEffect(() => {
    if (draftSchedule?.schedule) {
      const dayDraft = draftSchedule.schedule.find((s: any) => s.dayOfWeek === selectedDay);
      if (dayDraft && dayDraft.periods) {
        const newSubjs: Record<number, string> = {};
        const newTeachers: Record<number, string> = {};
        dayDraft.periods.forEach((p: any) => {
          newSubjs[p.periodNumber] = p.subject || '';
          newTeachers[p.periodNumber] = p.teacherId?._id || p.teacherId || '';
        });
        setSubjectSelections(newSubjs);
        setTeacherSelections(newTeachers);
        return;
      }
    }
    
    // Fallback to published timetables if no draft exists
    const currentTimetable = timetables?.find(t => t.dayOfWeek === selectedDay);
    if (currentTimetable && currentTimetable.periods) {
      const newSubjs: Record<number, string> = {};
      const newTeachers: Record<number, string> = {};
      currentTimetable.periods.forEach(p => {
        newSubjs[p.periodNumber] = p.subject || '';
        newTeachers[p.periodNumber] = (typeof p.teacherId === 'object' ? p.teacherId?._id : p.teacherId) || '';
      });
      setSubjectSelections(newSubjs);
      setTeacherSelections(newTeachers);
    } else {
      setSubjectSelections({});
      setTeacherSelections({});
    }
  }, [selectedDay, draftSchedule, timetables]);

  const generatePeriodsForShift = (shift: string) => {
    let currentHour = shift === 'noon' ? 13 : 7;
    let currentMinute = shift === 'noon' ? 30 : 30; // 7:30 AM or 1:30 PM

    const formatTime = (h: number, m: number) => 
      `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

    const addMinutes = (h: number, m: number, mins: number) => {
      let newM = m + mins;
      let newH = h + Math.floor(newM / 60);
      newM = newM % 60;
      return { h: newH, m: newM };
    };

    const generated: Period[] = [];
    for (let i = 1; i <= 8; i++) {
      if (i === 5) {
        // Add 30 minutes for recess between 4th and 5th period
        const breakEnd = addMinutes(currentHour, currentMinute, 30);
        currentHour = breakEnd.h; currentMinute = breakEnd.m;
      }
      // Each period is strictly 40 minutes
      const end = addMinutes(currentHour, currentMinute, 40);
      generated.push({
        periodNumber: i,
        subject: '',
        teacherId: '',
        startTime: formatTime(currentHour, currentMinute),
        endTime: formatTime(end.h, end.m)
      });
      currentHour = end.h; currentMinute = end.m;
    }
    return generated;
  };

  const handleSaveDaySchedule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClassId || !selectedSectionId || !canEditMaster) return;

    const formData = new FormData(e.currentTarget);
    const periods: Period[] = [];
    
    for (let i = 1; i <= 8; i++) {
      const tId = formData.get(`teacher-${i}`) as string;
      periods.push({
        periodNumber: i,
        subject: formData.get(`subject-${i}`) as string || '',
        teacherId: tId ? tId : null,
        startTime: formData.get(`start-${i}`) as string,
        endTime: formData.get(`end-${i}`) as string,
      });
    }

    saveTimetable.mutate({
      classId: selectedClassId,
      sectionId: selectedSectionId,
      dayOfWeek: selectedDay,
      periods
    }, {
      onSuccess: () => {
        toast.success(`Schedule for ${selectedDay} saved successfully!`);
      },
      onError: () => {
        toast.error(`Failed to save schedule for ${selectedDay}.`);
      }
    });
  };

  const handleAutoGenerate = async () => {
    if (!selectedClassId || !selectedSectionId || !canEditMaster) return;
    setIsGenerating(true);
    setLoadingMessage('Initializing Algorithm...');
    
    try {
      const shift = selectedClass?.shift || 'morning';
      const { jobId } = await generateTimetableDraft({ 
        classId: selectedClassId, 
        sectionId: selectedSectionId, 
        shift 
      });

      setLoadingMessage('Calculating combinations (0%)...');
      
      const pollInterval = setInterval(async () => {
        try {
          const statusData = await checkJobStatus(jobId);
          if (statusData.status === 'completed') {
            clearInterval(pollInterval);
            setLoadingMessage('Draft Generated! Fetching data...');
            
            const draft = await getDraft(statusData.draftId);
            setDraftSchedule(draft);
            setIsGenerating(false);
            toast.success("Timetable algorithm finished successfully!");
          } else if (statusData.status === 'failed') {
            clearInterval(pollInterval);
            setIsGenerating(false);
            toast.error("Timetable generation failed.");
          } else {
            setLoadingMessage('Running heuristic checks...');
          }
        } catch (err) {
          clearInterval(pollInterval);
          setIsGenerating(false);
        }
      }, 2000);
      
    } catch (err) {
      setIsGenerating(false);
      alert("Failed to start generation");
    }
  };

  const handleSaveLunchMenu = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClassId || !selectedSectionId || !canEditSubstitutions) return;

    const formData = new FormData(e.currentTarget);
    
    saveLunchMenu.mutate({
      classId: selectedClassId,
      sectionId: selectedSectionId,
      dayOfWeek: selectedDay,
      foodItems: (formData.get('foodItems') as string).split(',').map(s => s.trim()),
      rules: formData.get('rules') as string,
    });
  };

  const handleAssignProxy = (periodNumber: number, originalTeacherId: string, proxyTeacherId: string) => {
    if (!selectedClassId || !selectedSectionId) return;
    saveSubstitution.mutate({
      date: formattedSubDate,
      classId: selectedClassId,
      sectionId: selectedSectionId,
      periodNumber,
      originalTeacherId,
      substituteTeacherId: proxyTeacherId
    }, {
      onSuccess: () => toast.success('Proxy teacher assigned!'),
      onError: () => toast.error('Failed to assign proxy.')
    });
  };

  const handleStatusChange = (newStatus: string, remarks: string = '') => {
    if (!selectedClassId || !selectedSectionId) return;
    updateStatus.mutate({ classId: selectedClassId, sectionId: selectedSectionId, status: newStatus, remarks }, {
      onSuccess: () => toast.success(`Status updated to ${newStatus}`)
    });
  };

  const handleRevoke = () => {
    if (!selectedClassId || !selectedSectionId || !isSuperadmin) return;
    if (window.confirm("Are you sure you want to REVOKE and CLEAR this master timetable? This is irreversible.")) {
      revokeTimetable.mutate({ classId: selectedClassId, sectionId: selectedSectionId }, {
        onSuccess: () => toast.success('Timetable completely revoked and cleared.')
      });
    }
  };

  // Get current day data
  const currentTimetable = timetables?.find(t => t.dayOfWeek === selectedDay);
  const currentPeriods = currentTimetable?.periods && currentTimetable.periods.length > 0 
    ? currentTimetable.periods 
    : (selectedClass ? generatePeriodsForShift(selectedClass.shift || 'morning') : DEFAULT_PERIODS);

  const currentMenu = lunchMenus?.find(m => m.dayOfWeek === selectedDay);

  // Substitution Day Logic
  const subDayOfWeek = substitutionDate.toLocaleDateString('en-US', { weekday: 'long' });
  const subDayTimetable = timetables?.find(t => t.dayOfWeek === subDayOfWeek);
  const subDayPeriods = subDayTimetable?.periods || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Timetable & Substitutions</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage master schedules, proxies, and cafeteria menus</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 bg-slate-50 dark:bg-slate-950 p-2 sm:px-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap hidden sm:block">Target:</label>
          <CustomSelect
            className="min-w-[180px]"
            value={selectedClassId || ''}
            onChange={(val) => { setSelectedClassId(val); setSelectedSectionId(null); }}
            placeholder="Choose class..."
            options={classes?.map(c => ({
              value: c._id,
              label: `${c.name} ${c.stream ? `(${c.stream})` : ''} - ${c.shift === 'morning' ? 'Morning Shift' : 'Noon Shift'}`
            })) || []}
          />
          <CustomSelect
            className="min-w-[120px]"
            value={selectedSectionId || ''}
            onChange={(val) => setSelectedSectionId(val)}
            placeholder="Section..."
            disabled={!selectedClassId || sections?.length === 0}
            options={sections?.map(s => ({
              value: s._id,
              label: `Sec ${s.name}`
            })) || []}
          />
        </div>
      </div>

      <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('master')}
          className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'master' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-950'
          }`}
        >
          <Calendar className="w-4 h-4 mr-2" /> Master Schedule
        </button>
        <button
          onClick={() => setActiveTab('substitutions')}
          className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'substitutions' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-950'
          }`}
        >
          <Users className="w-4 h-4 mr-2" /> Daily Substitutions
        </button>
        <button
          onClick={() => setActiveTab('cafeteria')}
          className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'cafeteria' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-950'
          }`}
        >
          <Coffee className="w-4 h-4 mr-2" /> Class Cafeteria Rules
        </button>
      </div>

      {activeTab === 'master' && (
        <>
          {selectedClassId && selectedSectionId && (
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              timetableState === 'draft' ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' :
              timetableState === 'pending_approval' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-200' :
              timetableState === 'published' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200' :
              'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-200'
            }`}>
              <div className="flex items-center">
                {timetableState === 'draft' && <BookOpen className="w-5 h-5 mr-3 text-slate-500" />}
                {timetableState === 'pending_approval' && <AlertCircle className="w-5 h-5 mr-3" />}
                {timetableState === 'published' && <CheckCircle2 className="w-5 h-5 mr-3" />}
                {timetableState === 'rejected' && <AlertCircle className="w-5 h-5 mr-3" />}
                <div>
                  <h3 className="font-bold">
                    Status: {timetableState === 'pending_approval' ? 'Pending Superadmin Approval' : timetableState.charAt(0).toUpperCase() + timetableState.slice(1)}
                  </h3>
                  {statusData?.remarks && <p className="text-sm mt-1 opacity-80">Note: {statusData.remarks}</p>}
                </div>
              </div>
              
              <div className="flex space-x-2">
                {isPrincipal && ['draft', 'rejected'].includes(timetableState) && (
                  <button onClick={() => handleStatusChange('pending_approval')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center">
                    <Send className="w-4 h-4 mr-2" /> Submit for Approval
                  </button>
                )}
                {isSuperadmin && timetableState === 'pending_approval' && (
                  <>
                    <button onClick={() => handleStatusChange('published')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Go Live
                    </button>
                    <button onClick={() => {
                      const msg = window.prompt("Rejection reason:");
                      if (msg !== null) handleStatusChange('rejected', msg);
                    }} className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50 px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center">
                      Reject
                    </button>
                  </>
                )}
                {isSuperadmin && timetableState === 'published' && (
                  <button onClick={handleRevoke} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center">
                    <ShieldAlert className="w-4 h-4 mr-2" /> Revoke & Clear
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide mt-4">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedDay === day ? 'bg-slate-800 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-in fade-in">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-indigo-500" /> 
                {selectedDay} Master Schedule
              </h2>
              {canEditMaster && (
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={handleAutoGenerate}
                    disabled={isGenerating}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-sm flex items-center text-sm disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    {isGenerating ? 'Generating...' : 'Auto Generate ✨'}
                  </button>
                </div>
              )}
            </div>

            {!selectedClassId || !selectedSectionId ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                Please select a class and section to view or edit the timetable.
              </div>
            ) : (
              <form onSubmit={handleSaveDaySchedule}>
                <div className="space-y-4 relative">
                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl border border-purple-100 dark:border-purple-900/30">
                      <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">{loadingMessage}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Offloading constraint satisfaction to background worker...</p>
                    </div>
                  )}
                  {currentPeriods.map((period, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                      <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 h-12 w-12 rounded-lg shadow-sm shrink-0 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Period</span>
                        <span className="font-black text-indigo-600 text-lg leading-none">{period.periodNumber}</span>
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
                        <div className="md:col-span-4 flex items-center space-x-2">
                          <input type="time" name={`start-${period.periodNumber}`} defaultValue={period.startTime} className="input-field text-sm font-mono py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800" required disabled={!canEditMaster} />
                          <span className="text-slate-400">-</span>
                          <input type="time" name={`end-${period.periodNumber}`} defaultValue={period.endTime} className="input-field text-sm font-mono py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800" required disabled={!canEditMaster} />
                        </div>
                        <div className="md:col-span-4">
                          <CustomSelect
                            className="w-full"
                            value={subjectSelections[period.periodNumber] || period.subject || ''}
                            onChange={(val) => {
                              if (!canEditMaster) return;
                              setSubjectSelections(prev => ({ ...prev, [period.periodNumber]: val }));
                              const matchingTeacher = teachers.find(t => t.specialization === val);
                              if (matchingTeacher) {
                                setTeacherSelections(prev => ({ ...prev, [period.periodNumber]: matchingTeacher._id }));
                              }
                            }}
                            placeholder="Select Subject..."
                            disabled={!canEditMaster}
                            options={subjects?.map(s => ({
                              value: s.name,
                              label: s.name
                            })) || []}
                          />
                          <input type="hidden" name={`subject-${period.periodNumber}`} value={subjectSelections[period.periodNumber] || period.subject || ''} />
                        </div>
                        <div className="md:col-span-4">
                          <CustomSelect
                            className="w-full"
                            value={teacherSelections[period.periodNumber] || (typeof period.teacherId === 'object' ? period.teacherId?._id : period.teacherId) || ''}
                            onChange={(val) => canEditMaster && setTeacherSelections(prev => ({ ...prev, [period.periodNumber]: val }))}
                            placeholder="Assign Teacher..."
                            disabled={!canEditMaster}
                            options={(() => {
                              const selectedSub = subjectSelections[period.periodNumber] || period.subject;
                              const targetClass = selectedClass?.name || '';
                              
                              const classEligible = targetClass 
                                ? teachers.filter(t => t.teacherDetails?.classes?.includes(targetClass))
                                : teachers;
                                
                              let matched = [];
                              if (selectedSub) {
                                matched = classEligible.filter(t => t.teacherDetails?.subjects?.includes(selectedSub) || (selectedSub.includes('Language') && t.teacherDetails?.subjects?.some(s => selectedSub.includes(s))));
                              }
                              
                              const displayTeachers = matched.length > 0 ? matched : classEligible;
                              
                              return displayTeachers.map(t => ({
                                value: t._id,
                                label: `${t.name} ${t.teacherDetails ? `— ${t.teacherDetails.designation} (${t.teacherDetails.subjects.slice(0,2).join(', ')})` : ''}`
                              }));
                            })()}
                          />
                          <input type="hidden" name={`teacher-${period.periodNumber}`} value={teacherSelections[period.periodNumber] || (typeof period.teacherId === 'object' ? period.teacherId?._id : period.teacherId) || ''} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {canEditMaster && (
                  <div className="mt-8 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={saveTimetable.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold transition-all active:scale-95 shadow-md flex items-center disabled:opacity-50"
                    >
                      {saveTimetable.isPending ? 'Saving...' : <><Save className="w-4 h-4 mr-2"/> Save Schedule</>}
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </>
      )}

      {activeTab === 'substitutions' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-in fade-in">
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
                <UserPlus className="w-5 h-5 mr-2 text-rose-500" /> 
                Daily Substitutions for {subDayOfWeek}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Assign proxy teachers when the original staff member is absent.</p>
            </div>
            <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap hidden sm:block">Date:</label>
              <div className="w-40 z-50">
                <CustomDatePicker 
                  selected={substitutionDate} 
                  onChange={(date: Date) => setSubstitutionDate(date)} 
                  placeholderText="Select Date"
                />
              </div>
            </div>
          </div>

          {!selectedClassId || !selectedSectionId ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              Please select a class and section to view its timetable for substitution.
            </div>
          ) : subDayPeriods.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              No master timetable found for {subDayOfWeek}. Please generate a master schedule first.
            </div>
          ) : (
            <div className="space-y-4">
              {subDayPeriods.map((period, i) => {
                const subForPeriod = substitutions?.find(s => s.periodNumber === period.periodNumber);
                const isSubstituted = !!subForPeriod;
                const originalTeacherName = typeof period.teacherId === 'object' ? period.teacherId?.name : teachers.find(t => t._id === period.teacherId)?.name;
                const originalTeacherIdStr = typeof period.teacherId === 'object' ? period.teacherId?._id : period.teacherId;
                
                return (
                  <div key={i} className={`flex flex-col md:flex-row gap-4 items-center p-4 rounded-xl border ${isSubstituted ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/50' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800/50'}`}>
                    <div className={`flex flex-col items-center justify-center h-12 w-12 rounded-lg shadow-sm shrink-0 border ${isSubstituted ? 'bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Period</span>
                      <span className={`font-black text-lg leading-none ${isSubstituted ? 'text-rose-600' : 'text-slate-600 dark:text-slate-300'}`}>{period.periodNumber}</span>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
                      <div className="md:col-span-3 flex items-center text-sm font-semibold text-slate-700 dark:text-slate-200">
                        <Clock className="w-4 h-4 mr-2 text-slate-400" />
                        {period.startTime} - {period.endTime}
                      </div>
                      <div className="md:col-span-4 flex flex-col justify-center">
                        <span className="font-bold text-slate-800 dark:text-slate-100">{period.subject || 'Free Period'}</span>
                        <span className={`text-xs font-semibold ${isSubstituted ? 'text-slate-400 line-through' : 'text-slate-500'}`}>
                          {originalTeacherName || 'No Teacher Assigned'}
                        </span>
                      </div>
                      <div className="md:col-span-5">
                        <CustomSelect
                          className="w-full"
                          value={subForPeriod?.substituteTeacherId?._id || ''}
                          onChange={(val) => handleAssignProxy(period.periodNumber, originalTeacherIdStr, val)}
                          placeholder="Assign Proxy Teacher..."
                          disabled={!canEditSubstitutions}
                          options={teachers.map(t => ({
                            value: t._id,
                            label: t.name
                          }))}
                        />
                        {isSubstituted && (
                          <div className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                            Proxy Assigned
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'cafeteria' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-in fade-in">
          <div className="mb-6 flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedDay === day ? 'bg-slate-800 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <Coffee className="w-5 h-5 mr-2 text-amber-500" /> 
              {selectedDay} Daily Menu & Policies
            </h2>
          </div>

          {!selectedClassId || !selectedSectionId ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              Please select a class and section to view or edit its policies.
            </div>
          ) : (
            <form onSubmit={handleSaveLunchMenu} className="max-w-2xl">
              <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Today's Menu Items (Comma Separated)</label>
                <input 
                  type="text" 
                  name="foodItems" 
                  defaultValue={currentMenu?.foodItems?.join(', ') || ''} 
                  placeholder="e.g., Rajma Chawal, Roti, Salad" 
                  className="input-field bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800" 
                  required 
                  disabled={!canEditSubstitutions}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Class Rules & CBSE Guidelines</label>
                <textarea 
                  name="rules" 
                  defaultValue={currentMenu?.rules || "1. Minimum 75% attendance required.\n2. No electronic gadgets allowed."} 
                  placeholder="Enter specific class rules here..." 
                  className="input-field h-32 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800" 
                  disabled={!canEditSubstitutions}
                ></textarea>
              </div>

              {canEditSubstitutions && (
                <button 
                  type="submit" 
                  disabled={saveLunchMenu.isPending}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl font-bold transition-all active:scale-95 shadow-md flex items-center disabled:opacity-50"
                >
                  {saveLunchMenu.isPending ? 'Saving...' : <><Save className="w-4 h-4 mr-2"/> Save Menu</>}
                </button>
              )}
            </div>
          </form>
        )}
        </div>
      )}

    </div>
  );
}
