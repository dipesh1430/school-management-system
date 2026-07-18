import React from 'react';
import { FileBadge, Download, Printer } from 'lucide-react';

interface ReportCardProps {
  result: any;
  onClose: () => void;
}

export default function ReportCardPreview({ result, onClose }: ReportCardProps) {
  if (!result) return null;

  const { studentId, examId, marks } = result;
  
  const totalObtained = marks.reduce((sum: number, m: any) => sum + m.marksObtained, 0);
  const maxPossible = marks.reduce((sum: number, m: any) => {
    const subjectDef = examId.subjects.find((s: any) => s.subjectId === m.subjectId?._id);
    return sum + (subjectDef?.maxMarks || 100);
  }, 0);
  
  const percentage = maxPossible > 0 ? ((totalObtained / maxPossible) * 100).toFixed(2) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm print:bg-white print:p-0 print:block">
      {/* Non-printable overlay controls */}
      <div className="absolute top-4 right-4 flex space-x-4 print:hidden">
        <button onClick={handlePrint} className="bg-white text-slate-700 px-4 py-2 rounded-lg shadow-lg font-bold flex items-center hover:bg-slate-50">
          <Printer className="w-4 h-4 mr-2" /> Print PDF
        </button>
        <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg font-bold hover:bg-red-600">
          Close
        </button>
      </div>

      {/* The Printable A4 area */}
      <div className="bg-white w-full max-w-3xl min-h-[1056px] shadow-2xl p-12 relative overflow-hidden print:shadow-none print:max-w-none print:h-auto print:min-h-0 text-slate-800">
        
        {/* Header */}
        <div className="text-center border-b-2 border-slate-800 pb-8 mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white">
              <FileBadge className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">ACADEMIC REPORT CARD</h1>
          <p className="text-lg font-medium text-slate-600 mt-2">{examId.name} &bull; {examId.term}</p>
          <p className="text-sm text-slate-500 mt-1">Date: {new Date(examId.date).toLocaleDateString()}</p>
        </div>

        {/* Student Info */}
        <div className="flex justify-between items-start mb-10 bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div className="space-y-2">
            <p><span className="font-bold text-slate-500 uppercase text-xs tracking-wider w-24 inline-block">Student Name:</span> <span className="font-bold text-lg">{studentId.userId?.name}</span></p>
            <p><span className="font-bold text-slate-500 uppercase text-xs tracking-wider w-24 inline-block">Class/Sec:</span> <span className="font-semibold">{studentId.classId?.name} - {studentId.sectionId?.name}</span></p>
            <p><span className="font-bold text-slate-500 uppercase text-xs tracking-wider w-24 inline-block">Roll Number:</span> <span className="font-semibold">{studentId.rollNo || 'N/A'}</span></p>
          </div>
          {studentId.userId?.profilePic ? (
            <img src={studentId.userId.profilePic} alt="Profile" className="w-24 h-24 rounded-lg object-cover border-2 border-slate-200" />
          ) : (
            <div className="w-24 h-24 rounded-lg border-2 border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs text-center p-2">No Photo</div>
          )}
        </div>

        {/* Grades Table */}
        <table className="w-full mb-10 border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="py-3 px-4 text-left font-bold border border-slate-800 rounded-tl-lg">Subject</th>
              <th className="py-3 px-4 text-center font-bold border border-slate-800">Max Marks</th>
              <th className="py-3 px-4 text-center font-bold border border-slate-800">Marks Obtained</th>
              <th className="py-3 px-4 text-left font-bold border border-slate-800 rounded-tr-lg">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {marks.map((m: any, index: number) => {
              const subjectDef = examId.subjects.find((s: any) => s.subjectId === m.subjectId?._id);
              const max = subjectDef?.maxMarks || 100;
              return (
                <tr key={index} className="even:bg-slate-50">
                  <td className="py-3 px-4 border border-slate-300 font-bold text-slate-700">{m.subjectId?.name}</td>
                  <td className="py-3 px-4 border border-slate-300 text-center font-medium">{max}</td>
                  <td className="py-3 px-4 border border-slate-300 text-center font-bold">{m.marksObtained}</td>
                  <td className="py-3 px-4 border border-slate-300 text-sm text-slate-600">{m.remarks || '-'}</td>
                </tr>
              );
            })}
            <tr className="bg-indigo-50">
              <td className="py-3 px-4 border border-indigo-200 font-black text-indigo-900 text-right uppercase tracking-wider" colSpan={1}>Total</td>
              <td className="py-3 px-4 border border-indigo-200 text-center font-black text-indigo-900">{maxPossible}</td>
              <td className="py-3 px-4 border border-indigo-200 text-center font-black text-indigo-900">{totalObtained}</td>
              <td className="py-3 px-4 border border-indigo-200 font-black text-indigo-900">{percentage}%</td>
            </tr>
          </tbody>
        </table>

        {/* Footer Signatures */}
        <div className="absolute bottom-12 left-12 right-12 flex justify-between pt-8 border-t-2 border-slate-200">
          <div className="text-center w-40">
            <div className="border-b border-slate-400 h-10 mb-2"></div>
            <p className="font-bold text-sm text-slate-600 uppercase tracking-wider">Class Teacher</p>
          </div>
          <div className="text-center w-40">
            <div className="border-b border-slate-400 h-10 mb-2"></div>
            <p className="font-bold text-sm text-slate-600 uppercase tracking-wider">Principal</p>
          </div>
          <div className="text-center w-40">
            <div className="border-b border-slate-400 h-10 mb-2"></div>
            <p className="font-bold text-sm text-slate-600 uppercase tracking-wider">Parent/Guardian</p>
          </div>
        </div>

      </div>
    </div>
  );
}
