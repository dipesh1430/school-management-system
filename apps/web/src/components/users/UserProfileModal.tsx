import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User, MapPin, Phone, Mail, GraduationCap, Briefcase, Droplet, Hash, CheckCircle, Clock } from 'lucide-react';
import { useUserProfile } from '../../hooks/useUsers';

interface UserProfileModalProps {
  userId: string | null;
  onClose: () => void;
}

export default function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
  const { data, isLoading } = useUserProfile(userId);
  const [activeTab, setActiveTab] = useState<'identity' | 'compliance' | 'contacts' | 'employment' | 'academic'>('identity');

  if (!userId) return null;

  const getAvatarUrl = (seed: string, gender?: string, role?: string) => {
    if (role === 'teacher' && gender) {
      if (gender.toLowerCase() === 'male') return '/Men-teacher.webp';
      if (gender.toLowerCase() === 'female') return '/Female-teacher.avif';
    }
    // Generate beautiful vector avatars from DiceBear for students or fallbacks
    const style = 'avataaars';
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=e2e8f0,indigo&radius=50`;
  };

  const renderStudentTabs = () => (
    <div className="flex space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
      <button
        onClick={() => setActiveTab('identity')}
        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
          activeTab === 'identity' ? 'bg-white dark:bg-slate-900 text-indigo-700 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-200/50'
        }`}
      >
        Identity
      </button>
      <button
        onClick={() => setActiveTab('compliance')}
        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
          activeTab === 'compliance' ? 'bg-white dark:bg-slate-900 text-indigo-700 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-200/50'
        }`}
      >
        CBSE Compliance
      </button>
      <button
        onClick={() => setActiveTab('contacts')}
        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
          activeTab === 'contacts' ? 'bg-white dark:bg-slate-900 text-indigo-700 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-200/50'
        }`}
      >
        Parents & Contacts
      </button>
    </div>
  );

  const renderTeacherTabs = () => (
    <div className="flex space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
      <button
        onClick={() => setActiveTab('identity')}
        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
          activeTab === 'identity' ? 'bg-white dark:bg-slate-900 text-indigo-700 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-200/50'
        }`}
      >
        Identity
      </button>
      <button
        onClick={() => setActiveTab('employment')}
        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
          activeTab === 'employment' ? 'bg-white dark:bg-slate-900 text-indigo-700 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-200/50'
        }`}
      >
        Employment (OASIS)
      </button>
      <button
        onClick={() => setActiveTab('academic')}
        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
          activeTab === 'academic' ? 'bg-white dark:bg-slate-900 text-indigo-700 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-200/50'
        }`}
      >
        Academic Role
      </button>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/50 shrink-0">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
            <User className="w-5 h-5 mr-2 text-indigo-600" />
            User Profile
          </h2>
          <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {isLoading || !data ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {data.user.role === 'student' ? renderStudentTabs() : renderTeacherTabs()}

              <div className="bg-white dark:bg-slate-900">
                {activeTab === 'identity' && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <img 
                        src={getAvatarUrl(data.user.name, data.profile?.gender, data.user.role)} 
                        alt="Avatar" 
                        className="w-24 h-24 rounded-full shadow-sm bg-white dark:bg-slate-900 border-2 border-indigo-100 object-cover object-top scale-105"
                      />
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{data.user.name}</h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 capitalize mt-1">
                          {data.user.role} {data.profile?.classId ? `• Class ${data.profile.classId.name}` : ''}
                        </p>
                        <div className="flex items-center mt-3 space-x-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${data.user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {data.user.isActive ? 'Active Account' : 'Inactive Account'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm">
                        <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Email Address</div>
                        <div className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-200">
                          <Mail className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500" />
                          {data.user.email || 'N/A'}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm">
                        <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Phone Number</div>
                        <div className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-200">
                          <Phone className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500" />
                          {data.user.phone || 'N/A'}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm">
                        <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Date of Birth</div>
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {data.profile?.dob ? new Date(data.profile.dob).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      {data.user.role === 'student' && (
                        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm">
                          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Blood Group</div>
                          <div className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-200">
                            <Droplet className="w-4 h-4 mr-2 text-red-400" />
                            {data.profile?.bloodGroup || 'N/A'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'compliance' && data.user.role === 'student' && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-xl border border-indigo-100 bg-indigo-50/50">
                      <h4 className="text-sm font-bold text-indigo-900 mb-4 flex items-center">
                        <Hash className="w-4 h-4 mr-2" />
                        National Education Policy (NEP) Identifiers
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">APAAR ID</div>
                          <div className="text-sm font-semibold text-indigo-950">{data.profile?.apaarId || 'Not Generated'}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">PEN (UDISE+)</div>
                          <div className="text-sm font-semibold text-indigo-950">{data.profile?.pen || 'Not Assigned'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm">
                        <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Aadhaar Number</div>
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{data.profile?.aadhaarNumber || 'N/A'}</div>
                      </div>
                      <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm">
                        <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Social Category</div>
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize">{data.profile?.category || 'General'}</div>
                      </div>
                      <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm">
                        <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Admission Number</div>
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{data.profile?.admissionNo || 'N/A'}</div>
                      </div>
                      <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm">
                        <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Roll Number</div>
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{data.profile?.rollNo || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'contacts' && data.user.role === 'student' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm">
                      <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Parent / Guardian Details</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1">Father's Name</div>
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{data.profile?.fatherName || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1">Mother's Name</div>
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{data.profile?.motherName || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-2 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm">
                      <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Primary Address</div>
                      <div className="flex items-start text-sm font-medium text-slate-700 dark:text-slate-200 mt-2">
                        <MapPin className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                        Address details would be fetched here based on your database schema.
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'employment' && data.user.role === 'teacher' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm">
                      <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Teacher Code (OASIS)</div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500" />
                        {data.profile?.teacherCode || 'Not Assigned'}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm">
                      <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Designation</div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{data.profile?.designation || 'N/A'}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm">
                      <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Date of Appointment</div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500" />
                        {data.profile?.dateOfAppointment ? new Date(data.profile.dateOfAppointment).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm">
                      <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Experience (Years)</div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{data.profile?.experienceYears || '0'} Years</div>
                    </div>
                  </div>
                )}

                {activeTab === 'academic' && data.user.role === 'teacher' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm">
                      <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Qualifications</div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1">Academic</div>
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{data.profile?.academicQualifications || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1">Professional</div>
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{data.profile?.professionalQualifications || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm">
                      <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Assigned Classes
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.profile?.assignedClasses?.length > 0 ? (
                          data.profile.assignedClasses.map((ac: any, idx: number) => (
                            <span key={idx} className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {ac.classId?.name} - {ac.sectionId?.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">No classes assigned yet.</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
