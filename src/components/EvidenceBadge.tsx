import React from 'react';
import { EvidenceClassification } from '../types/standard';

interface EvidenceBadgeProps {
  classification: EvidenceClassification;
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  classification,
  showLabel = false,
  className = '',
  onClick,
}) => {
  const config = {
    E: {
      tag: '[E]',
      label: 'Established',
      tooltip: 'Established clinical standard validated by recognized guidelines or regulatory criteria',
      classes: 'bg-stone-100 text-stone-800 border-stone-300 font-semibold',
    },
    I: {
      tag: '[I]',
      label: 'Interpretation',
      tooltip: 'Empirical interpretation derived from observational or clinical consensus datasets',
      classes: 'bg-amber-50 text-amber-900 border-amber-300 font-medium',
    },
    P: {
      tag: '[P]',
      label: 'Proposed',
      tooltip: 'Proposed heuristic or computational metric. Not clinically validated.',
      classes: 'bg-teal-50 text-teal-900 border-teal-300 font-medium',
    },
  }[classification];

  return (
    <span
      onClick={onClick}
      title={config.tooltip}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 border text-[11px] font-mono-ledger rounded-[2px] transition-colors ${config.classes} ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
    >
      <span>{config.tag}</span>
      {showLabel && <span className="text-[10px] tracking-tight">{config.label}</span>}
    </span>
  );
};
