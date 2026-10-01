import React from 'react';

export type StatusType = 'neutral' | 'success' | 'warning' | 'failure';

export interface StatusIndicatorProps {
  status: StatusType;
  label: string;
  showIcon?: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  showIcon = true,
  className = '',
}) => {
  const config = {
    neutral: {
      dotColor: 'bg-[#5B6475]',
      textColor: 'text-[#5B6475]',
      symbol: '○',
    },
    success: {
      dotColor: 'bg-[#2F6B3F]',
      textColor: 'text-[#2F6B3F]',
      symbol: '●',
    },
    warning: {
      dotColor: 'bg-[#B7791F]',
      textColor: 'text-[#B7791F]',
      symbol: '▲',
    },
    failure: {
      dotColor: 'bg-[#B3341A]',
      textColor: 'text-[#B3341A]',
      symbol: '■',
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-mono select-none ${config.textColor} ${className}`}
    >
      {showIcon && (
        <span aria-hidden="true" className="text-[10px] leading-none">
          {config.symbol}
        </span>
      )}
      <span className="font-semibold uppercase tracking-wider text-[11px]">
        {label}
      </span>
    </span>
  );
};
