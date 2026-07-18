import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCreateStudent } from '../../hooks/useUsers';
import { useClasses, useSections } from '../../hooks/useClasses';
import { X, User, GraduationCap, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomSelect from '../ui/CustomSelect';
import CustomDatePicker from '../ui/CustomDatePicker';

interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateStudentModal({ isOpen, onClose }: CreateStudentModalProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'documents'>('personal');
  
  // Credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Academic
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState(''); 
  const [rollNo, setRollNo] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [subjectsChosen, setSubjectsChosen] = useState('');
  const [apaarId, setApaarId] = useState('');
  const [pen, setPen] = useState('');
  
  // Demographics / Compliance
  const [dob, setDob] = useState<Date | null>(null);
  const [gender, setGender] = useState('male');
  const [motherName, setMotherName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [category, setCategory] = useState('general');
  const [bloodGroup, setBloodGroup] = useState('');
  const [cwsnStatus, setCwsnStatus] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  // Documentation
  const [hasTransferCertificate, setHasTransferCertificate] = useState(false);
  const [hasMarkSheet, setHasMarkSheet] = useState(false);
  const [hasMigrationCertificate, setHasMigrationCertificate] = useState(false);
  const [hasBirthCertificate, setHasBirthCertificate] = useState(false);

  const { data: classes } = useClasses('2026-2027');
  const { data: sections } = useSections(classId);
  const createStudentMutation = useCreateStudent();

  useEffect(() => {
    if (sections && sections.length > 0) {
      setSectionId(sections[0]._id);
    } else {
      setSectionId('');
    }
  }, [sections]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast.promise(
      new Promise((resolve, reject) => {
        createStudentMutation.mutate(
          { 
            name, email, password, classId, sectionId, 
            rollNo, admissionNo, dob, academicYear: '2026-2027',
            gender, motherName, fatherName, category, bloodGroup, cwsnStatus, aadhaarNumber, 
            apaarId, pen, subjectsChosen,
            hasTransferCertificate, hasMarkSheet, hasMigrationCertificate, hasBirthCertificate
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
        loading: 'Onboarding student...',
        success: 'Student successfully onboarded!',
        error: 'Failed to create student profile.',
      }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Student Onboarding (OASIS/LOC)</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Capture mandatory fields for CBSE compliance.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800/50 px-6 shrink-0 bg-slate-50 dark:bg-slate-950/50">
          <button onClick={() => setActiveTab('personal')} className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'personal' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-200'}`}>
            <User className="inline-block w-4 h-4 mr-2" /> Demographics & Login
          </button>
          <button onClick={() => setActiveTab('academic')} className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'academic' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-200'}`}>
            <GraduationCap className="inline-block w-4 h-4 mr-2" /> Academic Profile
          </button>
          <button onClick={() => setActiveTab('documents')} className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'documents' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-200'}`}>
            <FileCheck className="inline-block w-4 h-4 mr-2" /> Documentation
          </button>
        </div>

        <form id="student-form" onSubmit={handleSubmit} autoComplete="off" className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {activeTab === 'personal' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Full Name (As per birth certificate)</label>
                  <input type="text" required placeholder="e.g. Rahul Sharma" value={name} onChange={(e) => setName(e.target.value)} autoComplete="new-password" data-lpignore="true" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Date of Birth</label>
                  <CustomDatePicker 
                    selected={dob} 
                    onChange={(date) => setDob(date)} 
                    placeholderText="Select Date of Birth" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Gender</label>
                  <CustomSelect
                    value={gender}
                    onChange={(val) => setGender(val)}
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Mother's Name</label>
                  <input type="text" required placeholder="e.g. Priya Sharma" value={motherName} onChange={(e) => setMotherName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Father's Name</label>
                  <input type="text" required placeholder="e.g. Amit Sharma" value={fatherName} onChange={(e) => setFatherName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Category</label>
                  <CustomSelect
                    value={category}
                    onChange={(val) => setCategory(val)}
                    options={[
                      { value: 'general', label: 'General' },
                      { value: 'sc', label: 'SC' },
                      { value: 'st', label: 'ST' },
                      { value: 'obc', label: 'OBC' }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Aadhaar Card Number</label>
                  <input type="text" required placeholder="e.g. 1234 5678 9012" value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Blood Group</label>
                  <CustomSelect
                    value={bloodGroup}
                    onChange={(val) => setBloodGroup(val)}
                    placeholder="Select Blood Group..."
                    options={[
                      { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
                      { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
                      { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
                      { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' }
                    ]}
                  />
                </div>

                <div className="col-span-2 border-t border-slate-100 dark:border-slate-800/50 pt-4 mt-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Login Credentials</h4>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Email Address (Optional)</label>
                  <input type="email" placeholder="student@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="new-password" data-lpignore="true" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
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
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Section</label>
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
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Admission Number</label>
                  <input type="text" required placeholder="e.g. ADM-2026-001" value={admissionNo} onChange={(e) => setAdmissionNo(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Roll Number</label>
                  <input type="text" required placeholder="e.g. 101" value={rollNo} onChange={(e) => setRollNo(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Class 11/12 Subject Combination (If applicable)</label>
                  <input type="text" placeholder="e.g. PCM + Computer Science" value={subjectsChosen} onChange={(e) => setSubjectsChosen(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                
                <div className="col-span-2 border-t border-slate-100 dark:border-slate-800/50 pt-4 mt-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">NEP / CBSE Compliance</h4>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">APAAR ID</label>
                  <input type="text" placeholder="Generated from UDISE+" value={apaarId} onChange={(e) => setApaarId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">PEN (Permanent Education Number)</label>
                  <input type="text" placeholder="Required for Board Reg." value={pen} onChange={(e) => setPen(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>

                <div className="col-span-2 bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between mt-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">CWSN Status</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5">Children With Special Needs</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={cwsnStatus} onChange={(e) => setCwsnStatus(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-4">Please verify original documents before checking these boxes. Required for CBSE compliance.</p>
              
              {[
                { label: 'Original Birth Certificate', state: hasBirthCertificate, setter: setHasBirthCertificate },
                { label: 'Transfer Certificate (Countersigned if applicable)', state: hasTransferCertificate, setter: setHasTransferCertificate },
                { label: 'Previous Class Mark Sheet', state: hasMarkSheet, setter: setHasMarkSheet },
                { label: 'Migration Certificate (If from different board)', state: hasMigrationCertificate, setter: setHasMigrationCertificate },
              ].map((doc, idx) => (
                <label key={idx} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${doc.state ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800'}`}>
                  <span className={`text-sm font-semibold ${doc.state ? 'text-indigo-900' : 'text-slate-700 dark:text-slate-200'}`}>{doc.label}</span>
                  <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" checked={doc.state} onChange={(e) => doc.setter(e.target.checked)} />
                </label>
              ))}
            </div>
          )}

        </form>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800/50 shrink-0 flex justify-end space-x-3 bg-white dark:bg-slate-900">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-950 rounded-xl transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            form="student-form"
            disabled={createStudentMutation.isPending}
            className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {createStudentMutation.isPending ? 'Saving...' : 'Complete Onboarding'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
