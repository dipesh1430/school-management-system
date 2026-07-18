import React, { useState } from 'react';
import CreateStudentModal from '../components/users/CreateStudentModal';
import CreateTeacherModal from '../components/users/CreateTeacherModal';
import CreatePrincipalModal from '../components/users/CreatePrincipalModal';
import CreateStaffModal from '../components/users/CreateStaffModal';
import UserProfileModal from '../components/users/UserProfileModal';
import { UserPlus, Shield, GraduationCap, BookOpen, Download } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { useAuthStore } from '../store/authStore';
import { downloadCSV } from '../utils/export';
import toast from 'react-hot-toast';

export default function Users() {
  const { user } = useAuthStore();
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isPrincipalModalOpen, setIsPrincipalModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const { data: users, isLoading } = useUsers();

  const filteredUsers = users?.filter(u => activeFilter === 'all' || u.role === activeFilter);

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'superadmin':
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'teacher':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'student':
        return <GraduationCap className="w-4 h-4 text-emerald-600" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'principal':
        return 'bg-amber-100 text-amber-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-emerald-100 text-emerald-800';
      case 'staff':
        return 'bg-slate-200 text-slate-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100';
    }
  };

  const handleExport = () => {
    if (users) {
      downloadCSV(users, 'users_directory');
      toast.success('Roster exported to CSV');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Users Directory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Manage students, teachers, and staff.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-slate-200 dark:border-slate-800 shadow-sm text-sm font-bold rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <Download className="-ml-1 mr-2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            Export CSV
          </button>
          
          {(user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'principal') && (
            <>
              <button
                onClick={() => setIsStudentModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-[0.98]"
              >
                <UserPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add Student
              </button>
              <button
                onClick={() => setIsTeacherModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-slate-200 dark:border-slate-800 shadow-sm text-sm font-bold rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <UserPlus className="-ml-1 mr-2 h-5 w-5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                Add Teacher
              </button>
            </>
          )}
          {user?.role === 'superadmin' && (
            <>
              <button
                onClick={() => setIsPrincipalModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-amber-200 dark:border-amber-900/30 shadow-sm text-sm font-bold rounded-lg text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
              >
                <Shield className="-ml-1 mr-2 h-5 w-5 text-amber-600 dark:text-amber-500" aria-hidden="true" />
                Add Principal
              </button>
              <button
                onClick={() => setIsStaffModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-slate-200 dark:border-slate-800 shadow-sm text-sm font-bold rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <UserPlus className="-ml-1 mr-2 h-5 w-5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                Add Staff
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {['all', 'student', 'teacher', 'principal', 'staff', 'admin'].map((role) => (
          <button
            key={role}
            onClick={() => setActiveFilter(role)}
            className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-colors ${
              activeFilter === role 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {role === 'all' ? 'All Users' : `${role}s`}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Loading users...</td>
                </tr>
              ) : users?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">No users found. Add a student to get started!</td>
                </tr>
              ) : (
                filteredUsers?.map((user) => (
                  <tr 
                    key={user._id} 
                    onClick={() => setSelectedUserId(user._id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-950 dark:hover:bg-slate-800/50 dark:bg-slate-950 dark:hover:bg-slate-800/50 dark:bg-slate-950/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 dark:text-slate-300">{user.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getRoleBadge(user.role)}`}>
                        <span className="mr-1.5">{getRoleIcon(user.role)}</span>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateStudentModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} />
      <CreateTeacherModal isOpen={isTeacherModalOpen} onClose={() => setIsTeacherModalOpen(false)} />
      <CreatePrincipalModal isOpen={isPrincipalModalOpen} onClose={() => setIsPrincipalModalOpen(false)} />
      <CreateStaffModal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} />
      <UserProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
    </div>
  );
}
