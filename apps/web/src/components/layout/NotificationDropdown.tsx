import React from 'react';
import { useSystemLogs } from '../../hooks/useSystem';
import { Bell, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: Props) {
  const { data: logs, isLoading } = useSystemLogs();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="absolute top-full right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 dark:text-slate-100">System Logs</h3>
        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Live</span>
      </div>
      
      <div className="max-h-80 overflow-y-auto p-2 scrollbar-hide">
        {isLoading ? (
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 py-6">Loading logs...</p>
        ) : !logs || logs.length === 0 ? (
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 py-6">No recent system activity.</p>
        ) : (
          logs.map((log) => (
            <div key={log._id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-950 rounded-xl transition-colors flex items-start space-x-3 group">
              <div className="mt-0.5 shrink-0">
                {getIcon(log.type)}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">{log.action}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 line-clamp-2 mt-0.5">{log.message}</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-mono">{new Date(log.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
