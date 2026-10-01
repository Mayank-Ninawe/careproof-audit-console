import React from 'react';

export interface BadgeProps {
  variant?: 'neutral' | 'accent' | 'ok' | 'warn' | 'fail';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
}) => {
  const variantStyles = {
    neutral: 'bg-[#FAF8F3] text-[#5B6475] border-[#D9D3C5]',
    accent: 'bg-[#0F6B6E]/10 text-[#0F6B6E] border-[#0F6B6E]/30',
    ok: 'bg-[#2F6B3F]/10 text-[#2F6B3F] border-[#2F6B3F]/30',
    warn: 'bg-[#B7791F]/10 text-[#B7791F] border-[#B7791F]/30',
    fail: 'bg-[#B3341A]/10 text-[#B3341A] border-[#B3341A]/30',
  }[variant];

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono font-medium border rounded-[2px] tracking-wide select-none ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
};
