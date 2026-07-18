import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCreateUser } from '../../hooks/useUsers';
import { X, ShieldCheck, Upload, BookOpen, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomSelect from '../ui/CustomSelect';

interface CreatePrincipalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePrincipalModal({ isOpen, onClose }: CreatePrincipalModalProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'qualifications' | 'experience' | 'compliance'>('personal');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Principal@123');
  
  // CBSE Fields
  const [highestDegree, setHighestDegree] = useState('');
  const [bEdStatus, setBEdStatus] = useState('Completed');
  const [totalExperience, setTotalExperience] = useState(10);
  const [adminExperience, setAdminExperience] = useState(5);
  const [oasisId, setOasisId] = useState('');
  const [udiseMapped, setUdiseMapped] = useState('true');

  const createUserMutation = useCreateUser();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.promise(
      new Promise((resolve, reject) => {
        createUserMutation.mutate(
          {
            name,
            email,
            phone,
            password,
            role: 'principal',
            staffDetails: {
              highestDegree,
              bEdStatus,
              totalTeachingExperience: totalExperience,
              adminExperience,
              oasisId,
              udiseMapped: udiseMapped === 'true'
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
        loading: 'Registering Principal...',
        success: 'Principal created and mapped successfully!',
        error: 'Failed to create principal.',
      }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Register School Principal</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Complete the mandatory CBSE compliance profile to assign the Head of School.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Horizontal Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 shrink-0 bg-slate-50/50 dark:bg-slate-950/50 overflow-x-auto">
          {[
            { id: 'personal', label: 'Personal Info', icon: BookOpen },
            { id: 'qualifications', label: 'Qualifications', icon: FileText },
            { id: 'experience', label: 'Experience History', icon: Upload },
            { id: 'compliance', label: 'CBSE Mappings', icon: ShieldCheck },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} type="button" onClick={() => setActiveTab(t.id as any)} className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === t.id ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                <Icon className="inline-block w-4 h-4 mr-2" /> {t.label}
              </button>
            )
          })}
        </div>

        <form id="principal-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'personal' && (
            <div className="grid grid-cols-2 gap-5 animate-in fade-in">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Full Legal Name (As per Aadhar)</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-amber-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Official Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-amber-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Phone Number</label>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-amber-500 dark:text-white" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Initial Password</label>
                <input type="text" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-amber-500 dark:text-white" />
              </div>
            </div>
          )}

          {activeTab === 'qualifications' && (
            <div className="grid grid-cols-2 gap-5 animate-in fade-in">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Highest Degree (e.g. M.Sc. Physics)</label>
                <input type="text" value={highestDegree} onChange={(e) => setHighestDegree(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-amber-500 dark:text-white" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">B.Ed Status (Mandatory for CBSE)</label>
                <CustomSelect value={bEdStatus} onChange={setBEdStatus} options={[{value: 'Completed', label: 'Completed'}, {value: 'Pursuing', label: 'Pursuing'}, {value: 'Not Applicable', label: 'Not Applicable (Engineering Exception)'}]} />
              </div>
              <div className="col-span-2">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Upload Degree Certificates (PDF)</p>
                  <p className="text-xs text-slate-500 mt-1">Mock UI: File will be attached to vault</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="grid grid-cols-2 gap-5 animate-in fade-in">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Total Teaching Experience (Years)</label>
                <input type="number" value={totalExperience} onChange={(e) => setTotalExperience(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-amber-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Administrative Experience (Years)</label>
                <input type="number" value={adminExperience} onChange={(e) => setAdminExperience(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-amber-500 dark:text-white" />
              </div>
              <div className="col-span-2">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center mt-4">
                  <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Upload SMC Resolution / Appointment Letter</p>
                  <p className="text-xs text-slate-500 mt-1">Mandatory for inspection dossier</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="grid grid-cols-2 gap-5 animate-in fade-in">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">CBSE OASIS ID</label>
                <input type="text" value={oasisId} onChange={(e) => setOasisId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-amber-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Mapped in UDISE+?</label>
                <CustomSelect value={udiseMapped} onChange={setUdiseMapped} options={[{value: 'true', label: 'Yes, Mapped as Head of School'}, {value: 'false', label: 'No, Pending Mapping'}]} />
              </div>
              <div className="col-span-2">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center mt-4">
                  <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Upload Not-in-Relation Affidavit</p>
                  <p className="text-xs text-slate-500 mt-1">Proof of no conflict of interest with Trust</p>
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 flex justify-end space-x-3 bg-white dark:bg-slate-900 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            form="principal-form"
            disabled={createUserMutation.isPending}
            className="px-6 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm shadow-amber-200 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {createUserMutation.isPending ? 'Processing...' : 'Register Principal Profile'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
