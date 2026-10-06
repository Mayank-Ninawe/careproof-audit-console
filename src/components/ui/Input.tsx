import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = inputId ? `${inputId}-error` : undefined;
    const helperId = inputId ? `${inputId}-helper` : undefined;

    return (
      <div className="flex flex-col gap-1 w-full text-left">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-[#14213D]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : props['aria-invalid']}
          aria-describedby={
            error && errorId
              ? errorId
              : helperText && helperId
              ? helperId
              : props['aria-describedby']
          }
          className={`h-9 px-3 text-xs bg-white text-[#14213D] border rounded-[2px] transition-colors placeholder:text-[#5B6475]/60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0F6B6E] disabled:bg-[#FAF8F3] disabled:text-[#5B6475] disabled:cursor-not-allowed ${
            error
              ? 'border-[#B3341A] focus-visible:outline-[#B3341A]'
              : 'border-[#D9D3C5] hover:border-[#5B6475]'
          } ${className}`}
          {...props}
        />
        {error && (
          <span id={errorId} role="alert" className="text-[11px] text-[#B3341A] font-medium">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={helperId} className="text-[11px] text-[#5B6475]">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
