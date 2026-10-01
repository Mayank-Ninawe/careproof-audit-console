import React from 'react';

export interface LedgerRowProps {
  code: string;
  title: string;
  evidenceTag?: React.ReactNode;
  value?: React.ReactNode;
  reference?: string;
  statusBadge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const LedgerRow: React.FC<LedgerRowProps> = ({
  code,
  title,
  evidenceTag,
  value,
  reference,
  statusBadge,
  action,
  className = '',
}) => {
  return (
    <div
      className={`border-b border-[#D9D3C5]/70 py-2.5 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono-ledger hover:bg-[#FAF8F3]/60 transition-colors ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="font-bold text-[#14213D] shrink-0 w-16">
          {code}
        </span>
        {evidenceTag && <div className="shrink-0">{evidenceTag}</div>}
        <span className="font-body text-[#14213D] truncate" title={title}>
          {title}
        </span>
      </div>

      <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
        {reference && (
          <span className="text-[11px] text-[#5B6475] hidden md:inline">
            Ref: {reference}
          </span>
        )}
        {value !== undefined && (
          <span className="font-bold text-[#14213D] tabular-nums">
            {value}
          </span>
        )}
        {statusBadge && <div>{statusBadge}</div>}
        {action && <div>{action}</div>}
      </div>
    </div>
  );
};
