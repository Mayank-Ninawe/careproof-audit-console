import React from 'react';
import { CaregiverGap } from '../../types/caregiver';
import { Badge } from '../ui/Badge';
import { AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

export interface CaregiverGapReportProps {
  gaps: CaregiverGap[];
  isCompetenciesConfigured: boolean;
  onSelectCaregiver?: (caregiverId: string) => void;
}

export const CaregiverGapReport: React.FC<CaregiverGapReportProps> = ({
  gaps,
  isCompetenciesConfigured,
  onSelectCaregiver,
}) => {
  // If competencies or gap target rules are unconfigured
  if (!isCompetenciesConfigured) {
    return (
      <div className="border border-[#D9D3C5] bg-white rounded-[2px] p-5 text-left space-y-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#B7791F]" aria-hidden="true" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#14213D] m-0">
            Competency Gap Audit Report
          </h3>
        </div>
        <p className="text-xs text-[#5B6475] leading-relaxed">
          Gap rules are not configured in the current dataset.
        </p>
        <p className="text-[11px] text-[#5B6475] italic">
          Audit gaps are reported exclusively when target competency levels are explicitly specified. No arbitrary target thresholds are fabricated.
        </p>
      </div>
    );
  }

  // If competencies are configured and 0 gaps exist
  if (gaps.length === 0) {
    return (
      <div className="border border-[#D9D3C5] bg-white rounded-[2px] p-5 text-left space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#2F6B3F]" aria-hidden="true" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#14213D] m-0">
            Competency Gap Audit Report
          </h3>
        </div>
        <p className="text-xs text-[#5B6475] leading-relaxed">
          No competency gaps identified for configured targets.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[#D9D3C5] bg-white rounded-[2px] overflow-hidden text-left shadow-xs space-y-0">
      <div className="px-4 py-3 bg-[#FAF8F3] border-b border-[#D9D3C5] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#B7791F]" aria-hidden="true" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#14213D] m-0">
            Competency Gap Audit Report
          </h3>
        </div>
        <span className="text-xs font-mono text-[#5B6475]">
          <strong className="text-[#14213D]">{gaps.length}</strong> identified{' '}
          {gaps.length === 1 ? 'gap' : 'gaps'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-xs border-collapse" aria-label="Competency gap audit report">
          <thead>
            <tr className="bg-[#FAF8F3]/60 border-b border-[#D9D3C5] text-[11px] font-mono font-semibold uppercase tracking-wider text-[#5B6475]">
              <th scope="col" className="py-2 px-3 text-left w-28">
                Caregiver ID
              </th>
              <th scope="col" className="py-2 px-3 text-left">
                Competency
              </th>
              <th scope="col" className="py-2 px-3 text-center w-24">
                Current Level
              </th>
              <th scope="col" className="py-2 px-3 text-center w-24">
                Target Level
              </th>
              <th scope="col" className="py-2 px-3 text-center w-20">
                Deficit
              </th>
              <th scope="col" className="py-2 px-3 text-right w-28">
                Gap Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D3C5]/60 font-body">
            {gaps.map((gap, idx) => (
              <tr
                key={`${gap.caregiverId}-${gap.competencyId}-${idx}`}
                className="hover:bg-[#FAF8F3]/60 transition-colors"
              >
                <td className="py-2 px-3 font-mono font-bold text-[#14213D]">
                  {onSelectCaregiver ? (
                    <button
                      type="button"
                      onClick={() => onSelectCaregiver(gap.caregiverId)}
                      className="hover:text-[#0F6B6E] focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
                    >
                      {gap.caregiverId}
                    </button>
                  ) : (
                    gap.caregiverId
                  )}
                </td>
                <td className="py-2 px-3 text-[#14213D] font-mono text-[11px]">
                  {gap.competencyId}
                </td>
                <td className="py-2 px-3 text-center font-mono font-semibold text-[#14213D] tabular-nums">
                  {gap.currentLevel !== null ? gap.currentLevel : 'Unassessed'}
                </td>
                <td className="py-2 px-3 text-center font-mono font-semibold text-[#14213D] tabular-nums">
                  {gap.targetLevel}
                </td>
                <td className="py-2 px-3 text-center font-mono font-bold text-[#B7791F] tabular-nums">
                  {`-${gap.gapDeficit}`}
                </td>
                <td className="py-2 px-3 text-right">
                  <Badge variant={gap.status === 'below_target' ? 'warn' : 'neutral'}>
                    {gap.status === 'below_target' ? 'Below Target' : 'Unassessed'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-3 py-2 bg-[#FAF8F3]/60 border-t border-[#D9D3C5] text-[11px] font-mono text-[#5B6475]">
        Audit gap report derived strictly from configured targets. Not a clinical deficiency finding.
      </div>
    </div>
  );
};
