import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function CustomSelect({ options, value, onChange, placeholder = 'Select...', className = '', disabled = false }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`} ref={containerRef}>
      <div 
        className={`w-full bg-slate-50 dark:bg-slate-950 border ${isOpen && !disabled ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800'} rounded-xl py-2.5 px-3 text-sm shadow-sm transition-all ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-800/50'} flex justify-between items-center`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <ul className="max-h-60 overflow-y-auto custom-scrollbar p-1">
            {options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 text-center">No options available</li>
            ) : (
              options.map(option => (
                <li
                  key={option.value}
                  className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                    value === option.value 
                      ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-950 dark:hover:bg-slate-800/50 dark:bg-slate-950 dark:hover:bg-slate-800/50 dark:bg-slate-950'
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                  {value === option.value && <Check className="w-4 h-4 text-indigo-600" />}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
