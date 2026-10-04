import React from 'react';
import { EarlyWarningResult, ScoreBandConfiguration } from '../../types/monitor';
import { Badge } from '../ui/Badge';
import { Shield, BookOpen } from 'lucide-react';

export interface EarlyWarningStatusCardProps {
  earlyWarningResult: EarlyWarningResult;
  scoreBandConfiguration: ScoreBandConfiguration | null;
}

export const EarlyWarningStatusCard: React.FC<EarlyWarningStatusCardProps> = ({
  earlyWarningResult,
  scoreBandConfiguration: _scoreBandConfiguration,
}) => {
  const isUnconfigured =
    earlyWarningResult.status === 'not_configured' ||
    earlyWarningResult.status === 'unconfigured';

  return (
    <div className="border border-[#D9D3C5] bg-white rounded-[2px] p-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D9D3C5]/60 mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#0F6B6E]" aria-hidden="true" />
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#14213D] m-0">
            Early-Warning Scoring &amp; Score-Band Configuration
          </h3>
        </div>
        <div>
          {isUnconfigured ? (
            <Badge variant="neutral">Score Bands Not Configured</Badge>
          ) : (
            <Badge variant="accent">Configured</Badge>
          )}
        </div>
      </div>

      <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] space-y-2">
        <div className="flex items-start gap-2.5">
          <BookOpen className="w-4 h-4 text-[#5B6475] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1 text-xs">
            <div className="font-mono font-semibold text-[#14213D]">
              Early-warning score configuration not available in this demonstration.
            </div>
            <p className="text-[#5B6475] leading-relaxed">
              In accordance with CareProof clinical evidence standards, clinical early-warning algorithms
              require verified source implementation from official guidelines (such as the Royal College
              of Physicians). Because clinical threshold tables are not yet independently certified in
              this release, score bands remain intentionally unconfigured.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#5B6475]">
              <span>
                Status: <strong className="text-[#14213D]">Not Configured</strong>
              </span>
              <span>·</span>
              <span>
                Policy: <strong className="text-[#14213D]">No Approximated Bands</strong>
              </span>
              <span>·</span>
              <span>
                Classification: <strong className="text-[#14213D]">Research-Integrity State</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
