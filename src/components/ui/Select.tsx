import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, disabled, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1 w-full text-left">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-[#14213D]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={`h-9 px-3 text-xs bg-white text-[#14213D] border rounded-[2px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0F6B6E] disabled:bg-[#FAF8F3] disabled:text-[#5B6475] disabled:cursor-not-allowed ${
            error
              ? 'border-[#B3341A] focus-visible:outline-[#B3341A]'
              : 'border-[#D9D3C5] hover:border-[#5B6475]'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-[11px] text-[#B3341A] font-medium">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
