import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export interface MonitorConfidenceRibbonProps {
  confidence: number;
  threshold: number;
  isDataGap: boolean;
  completeness: number;
  freshness: number;
}

export const MonitorConfidenceRibbon: React.FC<MonitorConfidenceRibbonProps> = ({
  confidence,
  threshold,
  isDataGap,
  completeness,
  freshness,
}) => {
  const confidencePercent = (confidence * 100).toFixed(1);
  const thresholdPercent = (threshold * 100).toFixed(0);
  const completenessPercent = (completeness * 100).toFixed(1);
  const freshnessPercent = (freshness * 100).toFixed(1);

  if (isDataGap) {
    return (
      <div
        role="region"
        aria-label="Telemetry Data Confidence Status Ribbon"
        className="border border-[#B7791F]/50 bg-[#FAF8F3] px-3.5 py-2.5 rounded-[2px] text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-left transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="shrink-0 p-1 bg-[#B7791F]/10 text-[#B7791F] rounded-[2px]">
            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap font-mono">
              <span className="font-bold text-[#B7791F] uppercase tracking-wider text-[11px]">
                Data-Gap Quality Warning
              </span>
              <span className="text-[#D9D3C5]">·</span>
              <span className="text-[#14213D] font-semibold">
                Confidence: {confidencePercent}% (&lt; {thresholdPercent}% threshold)
              </span>
            </div>
            <p className="text-[11px] text-[#5B6475] mt-0.5">
              Completeness: {completenessPercent}% | Freshness: {freshnessPercent}%. Data gaps reduce confidence. Does not imply clinical diagnosis or deterioration.
            </p>
          </div>
        </div>
        <div className="shrink-0 text-[10px] font-mono text-[#5B6475] uppercase border border-[#D9D3C5] px-2 py-0.5 rounded-[1px] bg-white">
          Data Quality Notice
        </div>
      </div>
    );
  }

  // Healthy data confidence state
  return (
    <div
      role="region"
      aria-label="Telemetry Data Confidence Status Ribbon"
      className="border border-[#2F6B3F]/40 bg-[#FAF8F3] px-3.5 py-2.5 rounded-[2px] text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-left transition-colors"
    >
      <div className="flex items-center gap-2.5">
        <div className="shrink-0 p-1 bg-[#2F6B3F]/10 text-[#2F6B3F] rounded-[2px]">
          <ShieldCheck className="w-4 h-4" aria-hidden="true" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap font-mono">
            <span className="font-bold text-[#2F6B3F] uppercase tracking-wider text-[11px]">
              Telemetry Data Confidence Stable
            </span>
            <span className="text-[#D9D3C5]">·</span>
            <span className="text-[#14213D] font-semibold">
              Confidence: {confidencePercent}% (≥ {thresholdPercent}% threshold)
            </span>
          </div>
          <p className="text-[11px] text-[#5B6475] mt-0.5">
            Completeness: {completenessPercent}% | Freshness: {freshnessPercent}%. Data quality meets proposed criteria. Data confidence only; does not imply medical certainty.
          </p>
        </div>
      </div>
      <div className="shrink-0 text-[10px] font-mono text-[#2F6B3F] uppercase border border-[#2F6B3F]/30 px-2 py-0.5 rounded-[1px] bg-white">
        Data Confidence OK
      </div>
    </div>
  );
};
