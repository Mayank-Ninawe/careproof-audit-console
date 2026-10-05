/**
 * CareProof Audit Console - Pilot Study Protocol Summary Component
 * Source of Truth: CareProof Website Roadmap (Phase 10B)
 * 
 * PROTOCOL SUMMARY CONTRACT:
 * - Displays protocol structure from PilotViewModel.
 * - Explicitly preserves proposed/demo status for sample size and endpoints.
 * - Never converts demonstration configuration into actual clinical claims.
 */

import React from 'react';
import { FileText, Layers, Target, CheckCircle2 } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Badge } from '../ui/Badge';
import { PilotProtocol } from '../../types/pilot';

export interface PilotProtocolCardProps {
  protocol: PilotProtocol;
  className?: string;
}

export const PilotProtocolCard: React.FC<PilotProtocolCardProps> = ({
  protocol,
  className = '',
}) => {
  const { protocolId, studyDesign, sampleSize, primaryEndpoint, secondaryEndpoints } = protocol;

  return (
    <Panel
      title="Protocol Summary &amp; Study Specification"
      className={className}
      headerActions={
        <div className="flex items-center gap-2">
          <Badge variant="neutral">{protocolId}</Badge>
          <Badge variant="accent">DEMONSTRATION PROTOCOL</Badge>
        </div>
      }
    >
      <div className="space-y-5 text-left font-body">
        {/* Top Ledger: Study Design & Demonstration Sample Size */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-[#D9D3C5]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-[#5B6475] mb-1">
              <FileText className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
              <span>Study Design Architecture</span>
            </div>
            <p className="text-sm font-semibold text-[#14213D] m-0">
              {studyDesign}
            </p>
            <p className="text-xs text-[#5B6475] mt-1 m-0">
              In silico simulation framework evaluating computational consistency across synthetic audits.
            </p>
          </div>

          <div className="bg-[#FAF8F3] p-3.5 border border-[#D9D3C5] rounded-[2px]">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-mono font-semibold uppercase text-[#5B6475]">
                Sample Size Specification
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 border border-[#B7791F]/40 bg-[#FCF9F0] text-[#B7791F] rounded-[2px] font-bold">
                SIMULATED CONFIGURATION
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-display font-bold text-[#14213D]">
                {sampleSize.size}
              </span>
              <span className="text-xs font-mono text-[#5B6475]">
                synthetic observations
              </span>
            </div>
            <p className="text-xs text-[#5B6475] mt-1.5 m-0 leading-relaxed">
              {sampleSize.description}
            </p>
          </div>
        </div>

        {/* Primary Endpoint */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-[#5B6475] mb-2">
            <Target className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
            <span>Primary Validation Endpoint</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#0F6B6E]/10 text-[#0F6B6E] border border-[#0F6B6E]/30 rounded-[2px]">
              PROPOSED / DEMO
            </span>
          </div>

          <div className="p-3 bg-white border border-[#D9D3C5] rounded-[2px]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="text-sm font-bold text-[#14213D] m-0 font-body">
                {primaryEndpoint.name}
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 bg-[#FAF8F3] border border-[#D9D3C5] text-[#14213D] rounded-[2px] shrink-0 self-start sm:self-auto">
                Target: {primaryEndpoint.targetMetric}
              </span>
            </div>
            <p className="text-xs text-[#5B6475] mt-1.5 m-0 leading-relaxed font-body">
              {primaryEndpoint.description}
            </p>
          </div>
        </div>

        {/* Secondary Endpoints */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-[#5B6475] mb-2">
            <Layers className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
            <span>Secondary Endpoints</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#FAF8F3] text-[#5B6475] border border-[#D9D3C5] rounded-[2px]">
              PROPOSED METRICS ({secondaryEndpoints.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {secondaryEndpoints.map((ep) => (
              <div
                key={ep.id}
                className="p-3 bg-white border border-[#D9D3C5] rounded-[2px] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 text-[11px] font-mono text-[#5B6475] mb-1">
                    <span>{ep.id}</span>
                    <span className="text-[9px] px-1 py-0.5 bg-[#FAF8F3] border border-[#D9D3C5] text-[#5B6475] rounded-[2px]">
                      PROPOSED
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#14213D] m-0 font-body">
                    {ep.name}
                  </h4>
                  <p className="text-[11px] text-[#5B6475] mt-1 m-0 leading-relaxed font-body">
                    {ep.description}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-[#D9D3C5]/60 text-[11px] font-mono text-[#0F6B6E] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{ep.targetMetric}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
};
