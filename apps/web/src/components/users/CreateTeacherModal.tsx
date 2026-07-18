import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCreateTeacher } from '../../hooks/useUsers';
import { X, User, Briefcase, GraduationCap, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomSelect from '../ui/CustomSelect';
import CustomDatePicker from '../ui/CustomDatePicker';

interface CreateTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTeacherModal({ isOpen, onClose }: CreateTeacherModalProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'experience'>('personal');
  const createTeacherMutation = useCreateTeacher();

  // Personal/Credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fatherOrHusbandName, setFatherOrHusbandName] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  
  // Academic/Professional
  const [designation, setDesignation] = useState('PRT');
  const [academicQualifications, setAcademicQualifications] = useState('');
  const [professionalQualifications, setProfessionalQualifications] = useState('');
  const [tetStatus, setTetStatus] = useState(false);
  const [tetScore, setTetScore] = useState('');
  
  // Experience
  const [dateOfAppointment, setDateOfAppointment] = useState<Date | null>(null);
  const [experienceYears, setExperienceYears] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast.promise(
      new Promise((resolve, reject) => {
        createTeacherMutation.mutate(
          { 
            name, email, password,
            fatherOrHusbandName, dob, aadhaarNumber, designation,
            academicQualifications, professionalQualifications, tetStatus, tetScore,
            dateOfAppointment, experienceYears: Number(experienceYears) || 0
          },
          {
            onSuccess: (data) => {
              onClose();
              resolve(data);
            },
            onError: (err) => reject(err)
          }
        );
      }),
      {
        loading: 'Onboarding teacher...',
        success: 'Teacher successfully onboarded!',
        error: 'Failed to create teacher profile.',
      }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Teacher Onboarding (Compliance Form)</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Capture mandatory fields for NCTE/RTE compliance.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800/50 px-6 shrink-0 bg-slate-50 dark:bg-slate-950/50">
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'personal' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-200'}`}
          >
            <User className="inline-block w-4 h-4 mr-2" /> Personal & Login
          </button>
          <button
            onClick={() => setActiveTab('academic')}
            className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'academic' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-200'}`}
          >
            <GraduationCap className="inline-block w-4 h-4 mr-2" /> Qualifications
          </button>
          <button
            onClick={() => setActiveTab('experience')}
            className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'experience' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-200'}`}
          >
            <Briefcase className="inline-block w-4 h-4 mr-2" /> Experience & Appointment
          </button>
        </div>
        
        <form id="teacher-form" onSubmit={handleSubmit} autoComplete="off" className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {activeTab === 'personal' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Full Name</label>
                  <input type="text" required placeholder="e.g. Dr. Meera Deshmukh" value={name} onChange={(e) => setName(e.target.value)} autoComplete="new-password" data-lpignore="true" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Father's / Husband's Name</label>
                  <input type="text" required placeholder="e.g. Rahul Deshmukh" value={fatherOrHusbandName} onChange={(e) => setFatherOrHusbandName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Aadhaar Card Number</label>
                  <input type="text" required placeholder="e.g. 1234 5678 9012" value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Date of Birth</label>
                  <CustomDatePicker selected={dob} onChange={(date) => setDob(date)} placeholderText="Select Date of Birth" required />
                </div>
                <div className="col-span-2 border-t border-slate-100 dark:border-slate-800/50 pt-4 mt-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Login Credentials</h4>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Email Address</label>
                  <input type="email" required placeholder="teacher@schoolsaas.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="new-password" data-lpignore="true" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Temporary Password</label>
                  <input type="password" required placeholder="Enter secure password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" data-lpignore="true" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Designation / Role</label>
                  <CustomSelect
                    value={designation}
                    onChange={(val) => setDesignation(val)}
                    options={[
                      { value: 'PGT', label: 'PGT (Post Graduate Teacher)' },
                      { value: 'TGT', label: 'TGT (Trained Graduate Teacher)' },
                      { value: 'PRT', label: 'PRT (Primary Teacher)' },
                      { value: 'Principal', label: 'Principal / Headmaster' },
                      { value: 'Special Educator', label: 'Special Educator' }
                    ]}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Academic Qualifications (Graduation / Post Grad)</label>
                  <input type="text" required placeholder="e.g. B.Sc Physics, M.Sc (Delhi University)" value={academicQualifications} onChange={(e) => setAcademicQualifications(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Professional Qualifications (Teaching Degrees)</label>
                  <input type="text" required placeholder="e.g. B.Ed, D.El.Ed" value={professionalQualifications} onChange={(e) => setProfessionalQualifications(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                
                <div className="col-span-2 bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-indigo-900">TET / CTET Qualified?</h4>
                    <p className="text-xs text-indigo-600 mt-0.5">Mandatory for PRT and TGT levels</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={tetStatus} onChange={(e) => setTetStatus(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {tetStatus && (
                  <div className="col-span-2 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">TET / CTET Score Details</label>
                    <input type="text" required={tetStatus} placeholder="e.g. CTET Paper 1 (110/150)" value={tetScore} onChange={(e) => setTetScore(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Date of Appointment</label>
                  <CustomDatePicker selected={dateOfAppointment} onChange={(date) => setDateOfAppointment(date)} placeholderText="Select Appointment Date" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Prior Teaching Experience (Years)</label>
                  <input type="number" min="0" required placeholder="e.g. 5" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                
                <div className="col-span-2 mt-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-start space-x-3 text-slate-500 dark:text-slate-400 dark:text-slate-500">
                  <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-sm">By saving this profile, you confirm that all KYC and NCTE compliance fields have been collected and verified from original documents.</p>
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
            form="teacher-form"
            disabled={createTeacherMutation.isPending}
            className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {createTeacherMutation.isPending ? 'Saving...' : 'Complete Onboarding'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
