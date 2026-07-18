import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Building2, MapPin, CheckCircle, Copy } from 'lucide-react';
import { useCreateSchool } from '../../hooks/useSuperAdmin';

interface CreateSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateSchoolModal({ isOpen, onClose }: CreateSchoolModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    board: 'CBSE',
    address: '',
    subscriptionPlan: 'Basic'
  });

  const [createdAdmin, setCreatedAdmin] = useState<{ email: string, password: string } | null>(null);

  const createSchool = useCreateSchool();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSchool.mutate(formData, {
      onSuccess: (data) => {
        setCreatedAdmin(data.adminCredentials);
      }
    });
  };

  const handleCopyCredentials = () => {
    if (createdAdmin) {
      navigator.clipboard.writeText(`Email: ${createdAdmin.email}\nPassword: ${createdAdmin.password}`);
      alert('Credentials copied to clipboard!');
    }
  };

  const handleClose = () => {
    setFormData({ name: '', board: 'CBSE', address: '', subscriptionPlan: 'Basic' });
    setCreatedAdmin(null);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {createdAdmin ? 'School Onboarded!' : 'Onboard New School'}
          </h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {createdAdmin ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">School Successfully Created</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                A default School Admin account has been automatically generated. Please save these credentials and securely provide them to the school principal.
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-left border border-slate-200 dark:border-slate-700 relative mb-6">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Email</p>
                <p className="text-md text-slate-900 dark:text-white font-bold mb-3">{createdAdmin.email}</p>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Temporary Password</p>
                <p className="text-md text-slate-900 dark:text-white font-mono font-bold tracking-wider">{createdAdmin.password}</p>
                
                <button 
                  onClick={handleCopyCredentials}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-indigo-600 bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleClose}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">School Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="E.g. Delhi Public School"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Board</label>
                  <select
                    className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    value={formData.board}
                    onChange={(e) => setFormData({...formData, board: e.target.value})}
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Board</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Subscription Plan</label>
                  <select
                    className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    value={formData.subscriptionPlan}
                    onChange={(e) => setFormData({...formData, subscriptionPlan: e.target.value})}
                  >
                    <option value="Basic">Basic</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Address Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    placeholder="City, State"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={createSchool.isPending}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {createSchool.isPending ? 'Deploying Tenant...' : 'Create School & Generate Admin'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
