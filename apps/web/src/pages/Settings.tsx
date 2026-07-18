import React, { useState, useEffect } from 'react';
import { useMySchool, useUpdateSchool } from '../hooks/useSchools';
import { Building2, MapPin, Settings as SettingsIcon, Save, Image as ImageIcon, ShieldCheck, Clock, Calculator, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomSelect from '../components/ui/CustomSelect';

type Tab = 'general' | 'cbse' | 'academic' | 'timetable' | 'grading';

export default function Settings() {
  const { data: school, isLoading } = useMySchool();
  const updateMutation = useUpdateSchool();

  const [activeTab, setActiveTab] = useState<Tab>('general');

  // Form State
  const [formData, setFormData] = useState<any>({
    name: '',
    board: '',
    address: '',
    cbseAffiliationNumber: '',
    schoolCode: '',
    udiseCode: '',
    affiliationStatus: 'Not Affiliated',
    currentAcademicYear: '2026-2027',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    shifts: [
      { name: 'Morning', startTime: '07:30', endTime: '13:30', defaultPeriodDuration: 40, recessAfterPeriod: 4, recessDuration: 30 }
    ],
    timetableConstraints: {
      maxWeeklyPeriodsPGT: 30,
      maxWeeklyPeriodsTGT: 36,
      maxWeeklyPeriodsPRT: 40,
      preventConsecutivePeriods: true,
      allowUnassignedFallbacks: true
    },
    gradingSchema: {
      system: 'CBSE 9-Point Scale',
      passingThreshold: 33
    }
  });

  // Sync data once loaded
  useEffect(() => {
    if (school) {
      setFormData({
        ...formData,
        name: school.name || '',
        board: school.board || '',
        address: school.address || '',
        cbseAffiliationNumber: school.cbseAffiliationNumber || '',
        schoolCode: school.schoolCode || '',
        udiseCode: school.udiseCode || '',
        affiliationStatus: school.affiliationStatus || 'Not Affiliated',
        currentAcademicYear: school.currentAcademicYear || '2026-2027',
        workingDays: school.workingDays?.length ? school.workingDays : formData.workingDays,
        shifts: school.shifts?.length ? school.shifts : formData.shifts,
        timetableConstraints: { ...formData.timetableConstraints, ...school.timetableConstraints },
        gradingSchema: { ...formData.gradingSchema, ...school.gradingSchema }
      });
    }
  }, [school]);

  const handleUpdate = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNestedUpdate = (category: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      formData,
      {
        onSuccess: () => toast.success('School settings updated successfully!'),
        onError: () => toast.error('Failed to update settings.')
      }
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading settings...</div>;
  }

  const tabs = [
    { id: 'general', label: 'General Profile', icon: Building2 },
    { id: 'cbse', label: 'CBSE Compliance', icon: ShieldCheck },
    { id: 'academic', label: 'Academic & Shifts', icon: Clock },
    { id: 'timetable', label: 'Timetable Rules', icon: SettingsIcon },
    { id: 'grading', label: 'Grading Schema', icon: Calculator },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Superadmin Control Center</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage global institution settings, compliance parameters, and algorithmic constraints.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Vertical Sidebar */}
        <div className="w-full md:w-64 shrink-0 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all mb-1 ${
                    isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 w-full">
          <form onSubmit={handleSubmit}>
            <div className="p-6 min-h-[500px]">
              
              {/* Tab 1: General */}
              {activeTab === 'general' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                    <Building2 className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">General Profile</h2>
                  </div>
                  <div className="flex items-start space-x-8">
                    <div className="w-32 h-32 rounded-2xl bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 flex flex-col items-center justify-center text-indigo-400 shrink-0">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-xs font-semibold">Upload Logo</span>
                    </div>
                    
                    <div className="flex-1 space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Institution Name</label>
                        <input type="text" required value={formData.name} onChange={(e) => handleUpdate('name', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Campus Address</label>
                        <textarea rows={3} value={formData.address} onChange={(e) => handleUpdate('address', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: CBSE Compliance */}
              {activeTab === 'cbse' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                    <ShieldCheck className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">CBSE & Government Affiliation</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">CBSE Affiliation Number</label>
                      <input type="text" value={formData.cbseAffiliationNumber} onChange={(e) => handleUpdate('cbseAffiliationNumber', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Educational Board</label>
                      <CustomSelect value={formData.board} onChange={(val) => handleUpdate('board', val)} options={[{ value: 'CBSE', label: 'CBSE' }, { value: 'ICSE', label: 'ICSE' }, { value: 'State Board', label: 'State Board' }]} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">School Code</label>
                      <input type="text" value={formData.schoolCode} onChange={(e) => handleUpdate('schoolCode', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">UDISE+ Code</label>
                      <input type="text" value={formData.udiseCode} onChange={(e) => handleUpdate('udiseCode', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Affiliation Status</label>
                      <CustomSelect value={formData.affiliationStatus} onChange={(val) => handleUpdate('affiliationStatus', val)} options={[{ value: 'Not Affiliated', label: 'Not Affiliated' }, { value: 'Pending', label: 'Pending Approval' }, { value: 'Provisional', label: 'Provisional' }, { value: 'Permanent', label: 'Permanent' }]} />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Academic & Shifts */}
              {activeTab === 'academic' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Academic & Shift Configs</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Current Academic Year</label>
                      <input type="text" value={formData.currentAcademicYear} onChange={(e) => handleUpdate('currentAcademicYear', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">School Shifts Setup</label>
                      {formData.shifts.map((shift: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Shift Name</label>
                            <input type="text" value={shift.name} readOnly className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Start Time</label>
                            <input type="time" value={shift.startTime} onChange={(e) => {
                              const newShifts = [...formData.shifts];
                              newShifts[idx].startTime = e.target.value;
                              handleUpdate('shifts', newShifts);
                            }} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">End Time</label>
                            <input type="time" value={shift.endTime} onChange={(e) => {
                              const newShifts = [...formData.shifts];
                              newShifts[idx].endTime = e.target.value;
                              handleUpdate('shifts', newShifts);
                            }} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Period Duration (mins)</label>
                            <input type="number" value={shift.defaultPeriodDuration} onChange={(e) => {
                              const newShifts = [...formData.shifts];
                              newShifts[idx].defaultPeriodDuration = parseInt(e.target.value);
                              handleUpdate('shifts', newShifts);
                            }} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Recess After Period</label>
                            <input type="number" value={shift.recessAfterPeriod} onChange={(e) => {
                              const newShifts = [...formData.shifts];
                              newShifts[idx].recessAfterPeriod = parseInt(e.target.value);
                              handleUpdate('shifts', newShifts);
                            }} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Recess Duration (mins)</label>
                            <input type="number" value={shift.recessDuration} onChange={(e) => {
                              const newShifts = [...formData.shifts];
                              newShifts[idx].recessDuration = parseInt(e.target.value);
                              handleUpdate('shifts', newShifts);
                            }} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm dark:text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Timetable Rules */}
              {activeTab === 'timetable' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                    <SettingsIcon className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Algorithmic Constraints & Workloads</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 p-4 rounded-xl text-sm text-amber-800 dark:text-amber-200">
                      These constraints directly control the automated CSP backtracking engine used in Timetable generation.
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Max Workload Caps (Weekly Periods)</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">PGT Teachers</label>
                          <input type="number" value={formData.timetableConstraints.maxWeeklyPeriodsPGT} onChange={(e) => handleNestedUpdate('timetableConstraints', 'maxWeeklyPeriodsPGT', parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">TGT Teachers</label>
                          <input type="number" value={formData.timetableConstraints.maxWeeklyPeriodsTGT} onChange={(e) => handleNestedUpdate('timetableConstraints', 'maxWeeklyPeriodsTGT', parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">PRT Teachers</label>
                          <input type="number" value={formData.timetableConstraints.maxWeeklyPeriodsPRT} onChange={(e) => handleNestedUpdate('timetableConstraints', 'maxWeeklyPeriodsPRT', parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Algorithm Rules</h3>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input type="checkbox" checked={formData.timetableConstraints.preventConsecutivePeriods} onChange={(e) => handleNestedUpdate('timetableConstraints', 'preventConsecutivePeriods', e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Prevent consecutive periods for a single teacher</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input type="checkbox" checked={formData.timetableConstraints.allowUnassignedFallbacks} onChange={(e) => handleNestedUpdate('timetableConstraints', 'allowUnassignedFallbacks', e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Allow unassigned (NULL) fallbacks if the CSP engine encounters impossible constraints</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Grading Schema */}
              {activeTab === 'grading' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                    <Calculator className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Examination & Grading Schema</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Grading System</label>
                      <CustomSelect value={formData.gradingSchema.system} onChange={(val) => handleNestedUpdate('gradingSchema', 'system', val)} options={[{ value: 'CBSE 9-Point Scale', label: 'CBSE 9-Point Scale' }, { value: 'CCE Pattern', label: 'CCE Pattern' }, { value: 'Custom Percentage', label: 'Custom Percentage' }]} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Passing Threshold (%)</label>
                      <input type="number" value={formData.gradingSchema.passingThreshold} onChange={(e) => handleNestedUpdate('gradingSchema', 'passingThreshold', parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                    </div>
                  </div>
                </div>
              )}

            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800/50 flex justify-end bg-slate-50/50 dark:bg-slate-950/50 rounded-b-2xl">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="inline-flex items-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {updateMutation.isPending ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" /> : <Save className="-ml-1 mr-2 h-4 w-4" />}
                {updateMutation.isPending ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
