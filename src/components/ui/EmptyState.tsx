import React from 'react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  phaseContext?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  phaseContext = 'Scheduled for subsequent development phase',
  className = '',
}) => {
  return (
    <div
      className={`border border-dashed border-[#D9D3C5] bg-white/60 p-8 rounded-[2px] text-center flex flex-col items-center justify-center max-w-2xl mx-auto my-6 ${className}`}
    >
      {icon && <div className="text-[#5B6475] mb-3">{icon}</div>}
      <div className="text-[11px] font-mono uppercase tracking-wider text-[#0F6B6E] font-semibold mb-1">
        {phaseContext}
      </div>
      <h3 className="text-base font-display font-semibold text-[#14213D] mb-1">
        {title}
      </h3>
      <p className="text-xs text-[#5B6475] max-w-md font-body leading-relaxed mb-4">
        {description}
      </p>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
