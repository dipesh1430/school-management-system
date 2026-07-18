import React, { useState } from 'react';
import { usePlatformAnalytics, useAllSchools, useUpdateSchoolStatus } from '../hooks/useSuperAdmin';
import { Building2, Users, Activity, Plus, MoreVertical, CheckCircle2, XCircle, Shield } from 'lucide-react';
import CreateSchoolModal from '../components/superadmin/CreateSchoolModal';

export default function Schools() {
  const { data: analytics, isLoading: isLoadingAnalytics } = usePlatformAnalytics();
  const { data: schools, isLoading: isLoadingSchools } = useAllSchools();
  const updateStatus = useUpdateSchoolStatus();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);

  const toggleSchoolStatus = (id: string, currentStatus: boolean) => {
    updateStatus.mutate({ id, data: { isActive: !currentStatus } });
    setDropdownOpenId(null);
  };

  const changeSubscription = (id: string, plan: string) => {
    updateStatus.mutate({ id, data: { subscriptionPlan: plan } });
    setDropdownOpenId(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">SaaS Command Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage tenants, subscriptions, and platform analytics.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-[0.98]"
        >
          <Plus className="-ml-1 mr-2 h-4 w-4" />
          Onboard New School
        </button>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Schools Onboarded</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{analytics?.totalSchools || 0}</p>
          </div>
          <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
            <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Active Schools</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{analytics?.activeSchools || 0}</p>
          </div>
          <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
            <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Platform Users</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{analytics?.users?.total || 0}</p>
          </div>
          <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Schools Table */}
      <div className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Active Tenants</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
            <Shield className="w-3 h-3 mr-1" /> Super Admin View
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">School Name</th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Board</th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Location</th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Plan</th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoadingSchools ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading schools...</td>
                </tr>
              ) : schools?.map((school: any) => (
                <tr key={school._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white flex items-center">
                    <div className="h-8 w-8 rounded bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 flex items-center justify-center font-bold mr-3">
                      {school.name.charAt(0)}
                    </div>
                    {school.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{school.board || 'N/A'}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{school.address || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                      school.subscriptionPlan === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                      school.subscriptionPlan === 'Pro' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {school.subscriptionPlan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {school.isActive ? (
                      <span className="inline-flex items-center text-emerald-600 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-600 text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setDropdownOpenId(dropdownOpenId === school._id ? null : school._id)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {dropdownOpenId === school._id && (
                      <div className="absolute right-6 top-10 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden z-10 text-left">
                        <div className="py-1">
                          <button 
                            onClick={() => toggleSchoolStatus(school._id, school.isActive)}
                            className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            {school.isActive ? 'Suspend Access' : 'Reactivate Access'}
                          </button>
                          <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                          <div className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Change Plan</div>
                          {['Basic', 'Pro', 'Enterprise'].map(plan => (
                            <button 
                              key={plan}
                              onClick={() => changeSubscription(school._id, plan)}
                              className={`block w-full text-left px-4 py-2 text-sm ${school.subscriptionPlan === plan ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                            >
                              {plan}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateSchoolModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
