import React from 'react';
import { DualAssessorPair } from '../../types/caregiver';
import { Badge } from '../ui/Badge';
import { Users2, ShieldCheck } from 'lucide-react';

export interface DualAssessorPanelProps {
  pairs: DualAssessorPair[];
}

export const DualAssessorPanel: React.FC<DualAssessorPanelProps> = ({ pairs }) => {
  const completePairs = pairs.filter((p) => p.hasBothAssessors);

  if (completePairs.length === 0) {
    return (
      <div className="border border-[#D9D3C5] bg-white rounded-[2px] p-5 text-left space-y-2">
        <div className="flex items-center gap-2">
          <Users2 className="w-4 h-4 text-[#0F6B6E]" aria-hidden="true" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#14213D] m-0">
            Dual-Assessor Inter-Rater Reliability Ledger
          </h3>
        </div>
        <p className="text-xs text-[#5B6475] leading-relaxed">
          No dual-assessor pairs recorded in the current dataset.
        </p>
        <p className="text-[11px] text-[#5B6475] italic">
          Inter-rater audit comparison requires paired evaluations from Assessor A and Assessor B on identical competency targets. Statistical correlation metrics are calculated only in formal pilot studies.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[#D9D3C5] bg-white rounded-[2px] overflow-hidden text-left shadow-xs space-y-0">
      <div className="px-4 py-3 bg-[#FAF8F3] border-b border-[#D9D3C5] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0F6B6E]" aria-hidden="true" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#14213D] m-0">
            Dual-Assessor Inter-Rater Reliability Ledger
          </h3>
        </div>
        <span className="text-xs font-mono text-[#5B6475]">
          <strong className="text-[#14213D]">{completePairs.length}</strong> paired evaluations
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-xs border-collapse" aria-label="Dual assessor comparison table">
          <thead>
            <tr className="bg-[#FAF8F3]/60 border-b border-[#D9D3C5] text-[11px] font-mono font-semibold uppercase tracking-wider text-[#5B6475]">
              <th scope="col" className="py-2 px-3 text-left w-28">
                Caregiver ID
              </th>
              <th scope="col" className="py-2 px-3 text-left">
                Competency
              </th>
              <th scope="col" className="py-2 px-3 text-left">
                Assessor A (Primary)
              </th>
              <th scope="col" className="py-2 px-3 text-left">
                Assessor B (Secondary)
              </th>
              <th scope="col" className="py-2 px-3 text-right w-28">
                Agreement Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D3C5]/60 font-body">
            {completePairs.map((pair, idx) => (
              <tr
                key={`${pair.caregiverId}-${pair.competencyId}-${idx}`}
                className="hover:bg-[#FAF8F3]/60 transition-colors"
              >
                <td className="py-2 px-3 font-mono font-bold text-[#14213D]">
                  {pair.caregiverId}
                </td>
                <td className="py-2 px-3 font-mono text-[11px] text-[#14213D]">
                  {pair.competencyId}
                </td>
                <td className="py-2 px-3 font-mono text-[11px] text-[#5B6475]">
                  <span>{pair.assessorA?.assessorId}</span> · Level{' '}
                  <strong className="text-[#14213D]">{pair.assessorA?.level}</strong>
                </td>
                <td className="py-2 px-3 font-mono text-[11px] text-[#5B6475]">
                  <span>{pair.assessorB?.assessorId}</span> · Level{' '}
                  <strong className="text-[#14213D]">{pair.assessorB?.level}</strong>
                </td>
                <td className="py-2 px-3 text-right">
                  {pair.levelAgreement ? (
                    <Badge variant="ok">Agreed (Level {pair.assessorA?.level})</Badge>
                  ) : (
                    <Badge variant="warn">Discrepancy</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-3 py-2 bg-[#FAF8F3]/60 border-t border-[#D9D3C5] text-[11px] font-mono text-[#5B6475]">
        Preserves raw dual assessor inputs without calculating statistical metrics.
      </div>
    </div>
  );
};
