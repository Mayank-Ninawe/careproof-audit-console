import React from 'react';

export interface PanelProps {
  title?: string;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: 'surface' | 'paper';
}

export const Panel: React.FC<PanelProps> = ({
  title,
  headerActions,
  footer,
  children,
  className = '',
  variant = 'surface',
}) => {
  const bgClass = variant === 'paper' ? 'bg-[#FAF8F3]' : 'bg-white';

  return (
    <section
      className={`border border-[#D9D3C5] rounded-[2px] ${bgClass} text-left transition-colors ${className}`}
    >
      {title && (
        <div className="px-4 py-3 border-b border-[#D9D3C5] flex items-center justify-between gap-3 bg-[#FAF8F3]/60">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#14213D] m-0">
            {title}
          </h3>
          {headerActions && <div className="shrink-0">{headerActions}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="px-4 py-2.5 border-t border-[#D9D3C5] bg-[#FAF8F3]/40 text-xs text-[#5B6475]">
          {footer}
        </div>
      )}
    </section>
  );
};
