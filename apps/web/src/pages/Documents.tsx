import React, { useState } from 'react';
import { useClasses } from '../hooks/useClasses';
import { useStudentsByClass } from '../hooks/useUsers';
import { useAuthStore } from '../store/authStore';
import CustomSelect from '../components/ui/CustomSelect';
import { FileText, Printer, ShieldCheck, UserSquare2 } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function Documents() {
  const { user } = useAuthStore();
  const { data: classes } = useClasses();
  
  const [selectedClass, setSelectedClass] = useState('');
  const [documentType, setDocumentType] = useState('id-cards'); // 'id-cards' | 'bonafide'
  const [selectedStudentForCert, setSelectedStudentForCert] = useState('');
  
  const { data: students } = useStudentsByClass(selectedClass);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Documents & Certificates</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Generate bulk student ID cards and official certificates.</p>
        </div>
        <button
          onClick={handlePrint}
          disabled={!selectedClass}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <Printer className="-ml-1 mr-2 h-4 w-4" />
          Print Document
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0 print:hidden">
        
        {/* Controls Sidebar */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Type</label>
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button 
              onClick={() => setDocumentType('id-cards')}
              className={`p-3 border rounded-xl flex flex-col items-center justify-center transition-all ${documentType === 'id-cards' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}
            >
              <UserSquare2 className="w-6 h-6 mb-2" />
              <span className="text-xs font-bold text-center">ID Cards (Grid)</span>
            </button>
            <button 
              onClick={() => setDocumentType('bonafide')}
              className={`p-3 border rounded-xl flex flex-col items-center justify-center transition-all ${documentType === 'bonafide' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}
            >
              <ShieldCheck className="w-6 h-6 mb-2" />
              <span className="text-xs font-bold text-center">Bonafide Cert</span>
            </button>
          </div>

          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Class</label>
          <CustomSelect
            value={selectedClass}
            onChange={(val) => { setSelectedClass(val); setSelectedStudentForCert(''); }}
            options={classes?.map((c: any) => ({ value: c._id, label: `${c.name} - ${c.stream || 'General'}` })) || []}
          />

          {documentType === 'bonafide' && selectedClass && (
            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Student</label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedStudentForCert}
                onChange={e => setSelectedStudentForCert(e.target.value)}
              >
                <option value="">-- Choose Student --</option>
                {students?.map((s:any) => (
                  <option key={s._id} value={s._id}>{s.userId?.name} (Roll: {s.rollNo})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-3 bg-slate-200 dark:bg-slate-950 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-inner p-6 flex flex-col items-center overflow-y-auto">
          {!selectedClass ? (
            <div className="text-slate-400 mt-20 flex flex-col items-center">
              <FileText className="w-16 h-16 mb-4 opacity-50" />
              <p>Select a class and document type to preview.</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500 mb-4 text-center">
              This is a screen preview. Click "Print Document" to generate the final A4 high-res PDF.
            </p>
          )}
        </div>
      </div>

      {/* The Printable DOM - Portaled to avoid all layout constraints when printing */}
      {selectedClass && createPortal(
        <div className="hidden print:block bg-white text-black min-h-screen">
          
          {documentType === 'id-cards' && (
            <div className="grid grid-cols-2 gap-4 p-4">
              {students?.map((student: any) => (
                <div key={student._id} className="border-2 border-indigo-900 rounded-2xl overflow-hidden w-[3.375in] h-[2.125in] relative bg-white flex flex-col break-inside-avoid shadow-[0_0_0_1px_rgba(0,0,0,0.1)]">
                  {/* Card Header */}
                  <div className="bg-indigo-900 text-white px-3 py-1.5 flex items-center justify-between">
                    <h3 className="font-bold text-sm tracking-widest uppercase">EduSaaS Academy</h3>
                    <span className="text-[8px] opacity-80 uppercase tracking-wider">Student ID</span>
                  </div>
                  {/* Card Body */}
                  <div className="flex-1 p-2 flex">
                    <div className="w-20 shrink-0 mr-3">
                      {student.userId?.profilePic ? (
                        <img src={student.userId.profilePic} className="w-20 h-24 object-cover border border-slate-300 rounded" />
                      ) : (
                        <div className="w-20 h-24 bg-slate-100 border border-slate-300 rounded flex items-center justify-center">
                          <UserIcon className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h2 className="font-black text-lg text-slate-900 leading-tight mb-1">{student.userId?.name}</h2>
                      <p className="text-[10px] text-slate-700 font-bold mb-0.5"><span className="text-slate-500 w-12 inline-block">Class:</span> {student.classId?.name} - {student.sectionId?.name}</p>
                      <p className="text-[10px] text-slate-700 font-bold mb-0.5"><span className="text-slate-500 w-12 inline-block">Roll No:</span> {student.rollNo}</p>
                      <p className="text-[10px] text-slate-700 font-bold mb-0.5"><span className="text-slate-500 w-12 inline-block">DOB:</span> {new Date(student.dob).toLocaleDateString()}</p>
                      <p className="text-[10px] text-slate-700 font-bold mb-0.5"><span className="text-slate-500 w-12 inline-block">Blood:</span> {student.bloodGroup || 'N/A'}</p>
                      {student.apaarId && <p className="text-[10px] text-slate-700 font-bold"><span className="text-slate-500 w-12 inline-block">APAAR:</span> {student.apaarId}</p>}
                    </div>
                  </div>
                  {/* Card Footer */}
                  <div className="bg-indigo-50 px-3 py-1 text-[9px] text-indigo-900 text-center font-medium border-t border-indigo-100">
                    Emergency: +91 {student.userId?.phone || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {documentType === 'bonafide' && selectedStudentForCert && (
            <div className="w-full h-screen p-20 flex flex-col justify-center items-center relative">
              {/* Outer Border */}
              <div className="absolute inset-10 border-8 border-double border-indigo-900 pointer-events-none opacity-20 rounded-xl"></div>
              
              {/* Content */}
              <div className="text-center mb-16">
                <h1 className="text-5xl font-black text-indigo-900 uppercase tracking-widest mb-4">EduSaaS Academy</h1>
                <p className="text-lg font-bold text-slate-600">123 Education Lane, Knowledge City, State - 100001</p>
                <p className="text-sm text-slate-500">Affiliated to CBSE, New Delhi | Affiliation No: 1234567</p>
              </div>

              <h2 className="text-4xl font-serif font-bold text-slate-800 mb-16 border-b-2 border-slate-800 inline-block px-10 pb-2">Bonafide Certificate</h2>

              {students?.filter((s:any) => s._id === selectedStudentForCert).map((student: any) => (
                <div key={student._id} className="text-xl leading-loose text-justify w-full max-w-4xl font-serif">
                  <p className="mb-8 indent-12">
                    This is to certify that Master/Miss <span className="font-bold border-b border-dotted border-slate-500 px-2">{student.userId?.name}</span>, 
                    son/daughter of <span className="font-bold border-b border-dotted border-slate-500 px-2">{student.fatherName || '____________________'}</span> and <span className="font-bold border-b border-dotted border-slate-500 px-2">{student.motherName || '____________________'}</span>, 
                    is a bonafide student of this institution.
                  </p>
                  <p className="mb-8">
                    He/She is currently studying in Class <span className="font-bold border-b border-dotted border-slate-500 px-2">{student.classId?.name}</span>, 
                    Section <span className="font-bold border-b border-dotted border-slate-500 px-2">{student.sectionId?.name}</span> during the academic year <span className="font-bold border-b border-dotted border-slate-500 px-2">{student.academicYear || '2025-26'}</span>.
                  </p>
                  <p className="mb-16">
                    His/Her date of birth as per the school register is <span className="font-bold border-b border-dotted border-slate-500 px-2">{new Date(student.dob).toLocaleDateString()}</span>.
                    To the best of our knowledge and belief, he/she bears a good moral character.
                  </p>

                  <div className="flex justify-between mt-32 items-end">
                    <div className="text-center w-64">
                      <p className="font-bold">Date: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="text-center w-64">
                      <div className="border-b-2 border-slate-800 h-16 mb-2 w-full"></div>
                      <p className="font-bold">Principal Signature</p>
                      <p className="text-sm">(with School Seal)</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
