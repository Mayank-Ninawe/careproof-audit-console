import React, { useEffect, useRef } from 'react';
import { CaregiverDetail } from '../../types/caregiver';
import { Badge } from '../ui/Badge';
import {
  X,
  ShieldAlert,
  Award,
  AlertCircle,
  Users2,
} from 'lucide-react';

export interface CaregiverDetailDrawerProps {
  detail: CaregiverDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CaregiverDetailDrawer: React.FC<CaregiverDetailDrawerProps> = ({
  detail,
  isOpen,
  onClose,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !detail) {
    return null;
  }

  const { caregiver, assessments, gaps, assessorPairs } = detail;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-[1px] flex justify-end"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="caregiver-drawer-title"
        className="w-full max-w-lg bg-white h-full shadow-2xl border-l border-[#D9D3C5] flex flex-col text-left transition-transform duration-200 ease-out font-body"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-[#D9D3C5] bg-[#FAF8F3] flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-[#14213D]" id="caregiver-drawer-title">
                {caregiver.id}
              </span>
              <span className="text-[#D9D3C5]">·</span>
              <span className="text-xs font-mono uppercase text-[#0F6B6E] font-semibold">
                {caregiver.roleId}
              </span>
            </div>
            <h2 className="text-xs text-[#5B6475] mt-0.5 font-medium truncate max-w-xs">
              Profile: {caregiver.competencyProfile}
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close caregiver detail drawer"
            className="p-1.5 text-[#5B6475] hover:text-[#14213D] hover:bg-white border border-[#D9D3C5] rounded-[2px] focus-visible:outline-2 focus-visible:outline-[#0F6B6E] transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Simulated Data Disclosure */}
          <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#B7791F] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <span className="font-mono font-bold uppercase tracking-wider text-[11px] text-[#B7791F] block">
                SIMULATED DATA — Demonstration caregiver record only.
              </span>
              <p className="text-[11px] text-[#5B6475] leading-relaxed">
                Anonymised synthetic profile. Proposed framework, not clinically validated. Decision support, not diagnosis.
              </p>
            </div>
          </div>

          {/* Caregiver Metadata Ledger */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#14213D] m-0">
              Caregiver Audit Profile
            </h3>
            <div className="grid grid-cols-2 gap-2.5 font-mono">
              <div className="p-2.5 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
                <span className="text-[10px] text-[#5B6475] uppercase block mb-1">Assessment Status</span>
                <span className="font-bold text-[#14213D] text-xs uppercase">{caregiver.assessmentStatus}</span>
              </div>

              <div className="p-2.5 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
                <span className="text-[10px] text-[#5B6475] uppercase block mb-1">License Expiry</span>
                <span className="font-bold text-[#14213D] text-xs tabular-nums">
                  {caregiver.licenseExpires.slice(0, 10)}
                </span>
              </div>

              <div className="p-2.5 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
                <span className="text-[10px] text-[#5B6475] uppercase block mb-1">Training Completed</span>
                <span className="font-bold text-[#14213D] text-sm tabular-nums">
                  {`${caregiver.trainingCompletedPercent}%`}
                </span>
              </div>

              <div className="p-2.5 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
                <span className="text-[10px] text-[#5B6475] uppercase block mb-1">License Status</span>
                <span className="font-bold text-[#14213D] text-xs uppercase">
                  {detail.expiryStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Recorded Assessments */}
          <div className="border border-[#D9D3C5] bg-white rounded-[2px] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono font-semibold uppercase text-xs text-[#14213D]">
                <Award className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
                <span>Recorded Assessments</span>
              </div>
              <Badge variant="neutral">{assessments.length} Recorded</Badge>
            </div>

            {assessments.length === 0 ? (
              <p className="text-[11px] text-[#5B6475] italic">
                No formal assessments recorded for this caregiver in the current dataset.
              </p>
            ) : (
              <div className="space-y-2">
                {assessments.map((a) => (
                  <div
                    key={a.id}
                    className="p-2 bg-[#FAF8F3] border border-[#D9D3C5]/60 rounded-[2px] flex items-center justify-between text-[11px] font-mono"
                  >
                    <div>
                      <strong className="text-[#14213D]">{a.competencyId}</strong>
                      <span className="text-[#5B6475] ml-2">via {a.method}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-white border border-[#D9D3C5] rounded-[1px] font-bold text-[#14213D]">
                        Level {a.level}
                      </span>
                      <span className="text-[10px] text-[#5B6475]">{a.assessorId}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Identified Gaps */}
          <div className="border border-[#D9D3C5] bg-white rounded-[2px] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono font-semibold uppercase text-xs text-[#14213D]">
                <AlertCircle className="w-3.5 h-3.5 text-[#B7791F]" aria-hidden="true" />
                <span>Competency Gaps</span>
              </div>
              <Badge variant={gaps.length > 0 ? 'warn' : 'ok'}>
                {gaps.length > 0 ? `${gaps.length} Gaps` : 'No Gaps'}
              </Badge>
            </div>

            {gaps.length === 0 ? (
              <p className="text-[11px] text-[#5B6475] italic">
                No competency gaps identified for configured targets.
              </p>
            ) : (
              <div className="space-y-1.5">
                {gaps.map((g, i) => (
                  <div
                    key={i}
                    className="p-2 bg-[#FAF8F3] border border-[#D9D3C5]/60 rounded-[2px] text-[11px]"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <strong className="text-[#14213D]">{g.competencyId}</strong>
                      <span className="text-[#B7791F] font-bold">Deficit: -{g.gapDeficit}</span>
                    </div>
                    <p className="text-[10px] text-[#5B6475] mt-1">{g.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dual-Assessor Inter-Rater Records */}
          <div className="border border-[#D9D3C5] bg-white rounded-[2px] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono font-semibold uppercase text-xs text-[#14213D]">
                <Users2 className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
                <span>Inter-Rater Pair Evaluations</span>
              </div>
              <Badge variant="neutral">{assessorPairs.length} Pairs</Badge>
            </div>

            {assessorPairs.length === 0 ? (
              <p className="text-[11px] text-[#5B6475] italic">
                No dual-assessor comparisons available for this caregiver.
              </p>
            ) : (
              <div className="space-y-1.5">
                {assessorPairs.map((pair, i) => (
                  <div
                    key={i}
                    className="p-2 bg-[#FAF8F3] border border-[#D9D3C5]/60 rounded-[2px] text-[11px] font-mono flex items-center justify-between"
                  >
                    <span>{pair.competencyId}</span>
                    <span className="text-[#5B6475]">
                      Assessor A: {pair.assessorA?.level ?? 'N/A'} · Assessor B: {pair.assessorB?.level ?? 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="px-5 py-3 border-t border-[#D9D3C5] bg-[#FAF8F3] flex items-center justify-between text-[11px] font-mono text-[#5B6475] shrink-0">
          <span>Synthetic caregiver entity ({caregiver.id})</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white border border-[#D9D3C5] rounded-[2px] text-[#14213D] hover:border-[#5B6475] focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
