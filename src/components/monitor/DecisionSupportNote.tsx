import React from 'react';
import { Info } from 'lucide-react';

export const DecisionSupportNote: React.FC = () => {
  return (
    <div className="border border-[#D9D3C5] bg-[#FAF8F3] p-4 rounded-[2px] text-left">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-[#0F6B6E]" aria-hidden="true" />
        </div>
        <div className="space-y-2 text-xs">
          <div className="font-mono font-bold uppercase tracking-wider text-[#14213D]">
            Decision-Support &amp; Data Governance Framework
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[#5B6475] leading-relaxed">
            <div className="border-l-2 border-[#0F6B6E] pl-2.5">
              <strong className="text-[#14213D] block font-mono text-[11px] mb-0.5">
                Telemetry Quality Focus
              </strong>
              Monitors telemetry data completeness and temporal recording regularity rather than clinical physiology.
            </div>

            <div className="border-l-2 border-[#0F6B6E] pl-2.5">
              <strong className="text-[#14213D] block font-mono text-[11px] mb-0.5">
                Mathematical Confidence
              </strong>
              Confidence = Completeness × Freshness. Freshness decays exponentially over time via exp(−Δt / τ) to penalize stale observations.
            </div>

            <div className="border-l-2 border-[#B7791F] pl-2.5">
              <strong className="text-[#14213D] block font-mono text-[11px] mb-0.5">
                Non-Diagnostic Boundary
              </strong>
              Alerts indicate observation gaps and telemetry quality degradation only. No disease label, diagnostic assessment, or clinical treatment instruction is provided.
            </div>
          </div>

          <div className="pt-2 border-t border-[#D9D3C5]/60 text-[11px] text-[#5B6475] font-mono">
            <strong>Regulatory Safe Harbor:</strong> Proposed framework, not clinically validated. Decision support, not diagnosis.
          </div>
        </div>
      </div>
    </div>
  );
};
