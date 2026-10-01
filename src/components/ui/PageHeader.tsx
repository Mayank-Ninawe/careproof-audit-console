import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  metadata?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  metadata,
}) => {
  return (
    <header className="border-b border-[#D9D3C5] pb-5 mb-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#14213D] tracking-tight m-0">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#5B6475] mt-1.5 font-body max-w-2xl leading-relaxed m-0">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            {actions}
          </div>
        )}
      </div>
      {metadata && (
        <div className="mt-3 pt-3 border-t border-[#D9D3C5]/60 flex items-center gap-3 text-xs text-[#5B6475] font-mono-ledger flex-wrap">
          {metadata}
        </div>
      )}
    </header>
  );
};
