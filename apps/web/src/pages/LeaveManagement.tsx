import React, { useState } from 'react';
import { useLeaveRequests, useUpdateLeaveStatus } from '../hooks/useLeave';
import { useAuthStore } from '../store/authStore';
import { Calendar, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import ApplyLeaveModal from '../components/attendance/ApplyLeaveModal';

export default function LeaveManagement() {
  const { user } = useAuthStore();
  const { data: leaves, isLoading } = useLeaveRequests();
  const updateStatusMutation = useUpdateLeaveStatus();
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdminOrPrincipal = ['admin', 'superadmin', 'principal'].includes(user?.role || '');

  const handleUpdateStatus = (id: string, status: 'Approved' | 'Rejected') => {
    updateStatusMutation.mutate({ id, status });
  };

  const pendingLeaves = leaves?.filter((l: any) => l.status === 'Pending') || [];
  const processedLeaves = leaves?.filter((l: any) => l.status !== 'Pending') || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Leave Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAdminOrPrincipal ? 'Review and manage leave applications.' : 'Apply for leave and track status.'}
          </p>
        </div>
        {!isAdminOrPrincipal && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Apply Leave
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-medium">Loading leaves...</div>
      ) : (
        <div className="space-y-8">
          {/* Pending Section */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-amber-500" />
              Pending Requests ({pendingLeaves.length})
            </h2>
            {pendingLeaves.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 text-sm">No pending leave requests.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingLeaves.map((leave: any) => (
                  <LeaveCard 
                    key={leave._id} 
                    leave={leave} 
                    isAdmin={isAdminOrPrincipal} 
                    onUpdate={handleUpdateStatus} 
                  />
                ))}
              </div>
            )}
          </section>

          {/* Processed Section */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              Processed Requests ({processedLeaves.length})
            </h2>
            {processedLeaves.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 text-sm">No processed leave requests.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedLeaves.map((leave: any) => (
                  <LeaveCard 
                    key={leave._id} 
                    leave={leave} 
                    isAdmin={false} // don't show action buttons for already processed
                    onUpdate={handleUpdateStatus} 
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <ApplyLeaveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

function LeaveCard({ leave, isAdmin, onUpdate }: { leave: any, isAdmin: boolean, onUpdate: (id: string, status: 'Approved'|'Rejected') => void }) {
  const from = new Date(leave.fromDate).toLocaleDateString();
  const to = new Date(leave.toDate).toLocaleDateString();
  const days = Math.max(1, Math.ceil((new Date(leave.toDate).getTime() - new Date(leave.fromDate).getTime()) / (1000 * 3600 * 24)));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 relative group transition-shadow hover:shadow-md">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">{leave.userId?.name || 'Unknown User'}</h3>
          <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            {leave.userId?.role || 'user'}
          </span>
        </div>
        <StatusBadge status={leave.status} />
      </div>

      <div className="flex items-center text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/50">
        <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
        {from} {from !== to ? `- ${to}` : ''}
        <span className="ml-auto text-xs font-bold text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm">
          {days} Day{days > 1 ? 's' : ''}
        </span>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2" title={leave.reason}>
        {leave.reason}
      </p>

      {isAdmin && leave.status === 'Pending' && (
        <div className="flex space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800/50">
          <button
            onClick={() => onUpdate(leave._id, 'Approved')}
            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-xs font-bold rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-1.5" /> Approve
          </button>
          <button
            onClick={() => onUpdate(leave._id, 'Rejected')}
            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-red-200 dark:border-red-900/50 text-xs font-bold rounded-lg text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <XCircle className="w-4 h-4 mr-1.5" /> Reject
          </button>
        </div>
      )}
      
      {leave.status !== 'Pending' && leave.reviewedBy && (
        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/50 text-xs font-semibold text-slate-400 dark:text-slate-500">
          Reviewed by: {leave.reviewedBy.name}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'Approved') return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"><CheckCircle className="w-3.5 h-3.5 mr-1" /> Approved</span>;
  if (status === 'Rejected') return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"><XCircle className="w-3.5 h-3.5 mr-1" /> Rejected</span>;
  return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"><Clock className="w-3.5 h-3.5 mr-1" /> Pending</span>;
}
