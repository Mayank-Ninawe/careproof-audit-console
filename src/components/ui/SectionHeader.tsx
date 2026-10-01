import React from 'react';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  actions,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 pb-2 mb-3 border-b border-[#D9D3C5] ${className}`}>
      <div>
        <h2 className="text-base font-display font-semibold text-[#14213D] m-0">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-[#5B6475] mt-0.5 font-body m-0">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="shrink-0 flex items-center gap-2">{actions}</div>
      )}
    </div>
  );
};
