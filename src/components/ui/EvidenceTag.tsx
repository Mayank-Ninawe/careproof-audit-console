import React from 'react';

export type EvidenceClassification = 'E' | 'I' | 'P';

export interface EvidenceTagProps {
  classification: EvidenceClassification;
  showLabel?: boolean;
  className?: string;
}

export const EvidenceTag: React.FC<EvidenceTagProps> = ({
  classification,
  showLabel = false,
  className = '',
}) => {
  const meta = {
    E: {
      tag: '[E]',
      label: 'Established',
      description: 'Validated in clinical guidelines, peer-reviewed literature, or regulatory mandates',
      styles: 'bg-[#2F6B3F]/10 text-[#2F6B3F] border-[#2F6B3F]/30',
    },
    I: {
      tag: '[I]',
      label: 'Interpretation',
      description: 'Derived metric or clinical interpretation of established parameters',
      styles: 'bg-[#0F6B6E]/10 text-[#0F6B6E] border-[#0F6B6E]/30',
    },
    P: {
      tag: '[P]',
      label: 'Proposed',
      description: 'Novel indicator under clinical audit study; not yet guideline-validated',
      styles: 'bg-[#B7791F]/10 text-[#B7791F] border-[#B7791F]/30',
    },
  }[classification];

  return (
    <span
      title={`${meta.label}: ${meta.description}`}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-semibold border rounded-[2px] select-none tracking-wide ${meta.styles} ${className}`}
    >
      <span>{meta.tag}</span>
      {showLabel && <span>{meta.label}</span>}
    </span>
  );
};
