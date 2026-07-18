import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

interface CustomDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  required?: boolean;
}

const CustomInput = forwardRef<HTMLDivElement, any>(
  ({ value, onClick, placeholder, required }, ref) => (
    <div className="relative w-full" onClick={onClick} ref={ref}>
      <input
        type="text"
        value={value}
        readOnly
        required={required}
        placeholder={placeholder}
        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm cursor-pointer"
      />
      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 w-5 h-5" />
    </div>
  )
);

export default function CustomDatePicker({ selected, onChange, placeholderText = 'Select date', required = false }: CustomDatePickerProps) {
  return (
    <div className="w-full custom-datepicker-wrapper">
      <DatePicker
        selected={selected}
        onChange={onChange}
        customInput={<CustomInput placeholder={placeholderText} required={required} />}
        dateFormat="dd-MM-yyyy"
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        calendarClassName="!border-slate-200 dark:border-slate-800 !rounded-xl !shadow-xl !font-sans"
        dayClassName={(date) => "!rounded-lg hover:!bg-indigo-50 dark:hover:!bg-indigo-900/50 !transition-colors"}
        portalId="datepicker-portal"
      />
    </div>
  );
}
