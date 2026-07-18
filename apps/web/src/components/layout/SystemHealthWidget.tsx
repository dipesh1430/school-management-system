import React from 'react';
import { useSystemHealth } from '../../hooks/useSystem';
import { Activity } from 'lucide-react';

export default function SystemHealthWidget() {
  const { data: health } = useSystemHealth();

  const cpuVal = health?.metrics.cpu || '0%';
  const cpuNum = parseFloat(cpuVal);
  
  let colorClass = 'bg-emerald-500';
  let textColorClass = 'text-emerald-500';
  
  if (cpuNum > 80) {
    colorClass = 'bg-red-500';
    textColorClass = 'text-red-500';
  } else if (cpuNum > 50) {
    colorClass = 'bg-amber-500';
    textColorClass = 'text-amber-500';
  }

  return (
    <div className="hidden lg:flex items-center space-x-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-1.5 shadow-sm hover:shadow-md transition-shadow cursor-default group" title={`DB Status: ${health?.metrics.database || 'Connecting'}`}>
      <Activity className={`h-4 w-4 ${textColorClass} group-hover:scale-110 transition-transform`} />
      <div className="flex flex-col w-28">
        <div className="flex justify-between text-[9px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">
          <span>Sys Health</span>
          <span className={textColorClass}>{cpuVal}</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`${colorClass} h-1.5 rounded-full transition-all duration-1000 ease-in-out`}
            style={{ width: cpuVal }}
          ></div>
        </div>
      </div>
    </div>
  );
}
