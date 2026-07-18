import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCreateUser } from '../../hooks/useUsers';
import { X, Briefcase, ShieldCheck, HeartPulse, Shield, Beaker, Truck, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomSelect from '../ui/CustomSelect';

interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateStaffModal({ isOpen, onClose }: CreateStaffModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Staff@123');
  
  const [jobCategory, setJobCategory] = useState('Administrative');
  const [designation, setDesignation] = useState('');
  const [isPOCSOExempt, setIsPOCSOExempt] = useState('false');

  const createUserMutation = useCreateUser();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.promise(
      new Promise((resolve, reject) => {
        createUserMutation.mutate(
          {
            name,
            email: email || undefined,
            phone,
            password,
            role: 'staff',
            staffDetails: {
              jobCategory,
              designation,
              isPOCSOExempt: isPOCSOExempt === 'true'
            }
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
        loading: 'Registering Staff...',
        success: 'Support staff added successfully!',
        error: 'Failed to add staff.',
      }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Add Support Staff</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Register administrative, technical, and maintenance personnel.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form id="staff-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-slate-500 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Phone Number</label>
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-slate-500 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Email (Optional)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-slate-500 dark:text-white" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Department / Category</label>
              <CustomSelect 
                value={jobCategory} 
                onChange={setJobCategory} 
                options={[
                  { value: 'Administrative', label: 'Administrative (Accounts, Clerks, Front Desk)' },
                  { value: 'Laboratory_Technical', label: 'Laboratory & Technical (IT, Science Labs)' },
                  { value: 'Health_and_Safety', label: 'Health & Safety (Nurse, Guards, Nannies)' },
                  { value: 'Housekeeping_Sanitation', label: 'Housekeeping & Sanitation (Peons, Cleaners)' },
                  { value: 'Maintenance_Infrastructure', label: 'Maintenance (Electrician, Plumber, Mali)' },
                  { value: 'Transport', label: 'Transport (Drivers, Bus Conductors)' }
                ]} 
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Specific Designation</label>
              <input type="text" required placeholder="e.g. Physics Lab Attendant, Female Washroom Cleaner" value={designation} onChange={(e) => setDesignation(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-slate-500 dark:text-white" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">POCSO Exemption Flag</label>
              <CustomSelect 
                value={isPOCSOExempt} 
                onChange={setIsPOCSOExempt} 
                options={[
                  { value: 'false', label: 'Strictly Regulated (Police Verification Required)' },
                  { value: 'true', label: 'Exempt (Minimal Student Contact)' }
                ]} 
              />
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 flex justify-end space-x-3 bg-white dark:bg-slate-900 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            form="staff-form"
            disabled={createUserMutation.isPending}
            className="px-6 py-2.5 text-sm font-bold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {createUserMutation.isPending ? 'Processing...' : 'Add Support Staff'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
