import React, { useState } from 'react';
import { useFees, usePayFee } from '../hooks/useFees';
import { Wallet, Plus, CreditCard, Clock, CheckCircle2, TrendingUp, Search, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import GenerateFeeModal from '../components/fees/GenerateFeeModal';
import { useAuthStore } from '../store/authStore';
import { downloadCSV } from '../utils/export';

export default function Fees() {
  const { user } = useAuthStore();
  const { data: fees, isLoading } = useFees();
  const payMutation = usePayFee();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate statistics
  const totalRevenue = fees?.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0) || 0;
  const pendingDues = fees?.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0) || 0;
  
  const filteredFees = fees?.filter(f => 
    f.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    if (fees) {
      // Map out the populated fields for CSV
      const flatFees = fees.map(f => ({
        ...f,
        studentName: f.studentId?.name || '',
        studentEmail: f.studentId?.email || '',
        className: f.classId?.name || ''
      }));
      downloadCSV(flatFees, 'fees_report');
      toast.success('Fees exported to CSV');
    }
  };

  const handlePay = (feeId: string) => {
    payMutation.mutate(feeId, {
      onSuccess: () => toast.success('Payment simulated successfully!'),
      onError: () => toast.error('Payment failed.')
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Fee Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Track student dues and collect online payments.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-slate-200 dark:border-slate-800 shadow-sm text-sm font-bold rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-950 dark:hover:bg-slate-800/50 dark:bg-slate-950 dark:hover:bg-slate-800/50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <Download className="-ml-1 mr-2 h-4 w-4 text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500" />
            Export CSV
          </button>
          
          {['admin', 'principal'].includes(user?.role || '') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98]"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Generate Invoice
            </button>
          )}
        </div>
      </div>

      {/* Financial Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl mr-4">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Total Revenue Collected</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl mr-4">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Total Pending Dues</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">${pendingDues.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Fees Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Fee Invoices</h2>
          
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by student or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950 w-64"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Loading fee records...</div>
        ) : filteredFees?.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">No fee records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
              <thead className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase bg-slate-50 dark:bg-slate-950/50">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider">Student</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Title</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Amount</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Due Date</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFees?.map((fee) => (
                  <tr key={fee._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-950 dark:hover:bg-slate-800/50 dark:bg-slate-950 dark:hover:bg-slate-800/50 dark:bg-slate-950 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{fee.studentId?.name || 'Unknown Student'}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">{fee.classId?.name || 'Unknown Class'}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-100">{fee.title}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">${fee.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">{new Date(fee.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {fee.status === 'paid' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                          <Clock className="w-3.5 h-3.5 mr-1" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {fee.status === 'pending' ? (
                        user?.role !== 'superadmin' ? (
                          <button
                            onClick={() => handlePay(fee._id)}
                            disabled={payMutation.isPending}
                            className="inline-flex items-center px-3 py-1.5 border border-indigo-200 text-xs font-bold rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                          >
                            <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                            Simulate Pay
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">Waiting for payment</span>
                        )
                      ) : (
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                          Txn: {fee.transactionId?.substring(0, 8)}...
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <GenerateFeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
