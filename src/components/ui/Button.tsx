import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors border select-none rounded-[2px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6B6E] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1 min-h-[32px] gap-1.5',
    md: 'text-xs px-4 py-2 min-h-[36px] gap-2',
    lg: 'text-sm px-5 py-2.5 min-h-[42px] gap-2.5',
  }[size];

  const variantStyles = {
    primary:
      'bg-[#0F6B6E] text-white border-[#0F6B6E] hover:bg-[#0c575a] active:bg-[#0a484a]',
    secondary:
      'bg-white text-[#14213D] border-[#D9D3C5] hover:bg-[#FAF8F3] active:bg-[#f2efe6]',
    outline:
      'bg-transparent text-[#0F6B6E] border-[#0F6B6E] hover:bg-[#0F6B6E]/5 active:bg-[#0F6B6E]/10',
    ghost:
      'bg-transparent text-[#5B6475] border-transparent hover:text-[#14213D] hover:bg-[#14213D]/5 active:bg-[#14213D]/10',
  }[variant];

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
