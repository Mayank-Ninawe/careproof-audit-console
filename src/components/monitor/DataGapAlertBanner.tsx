import React from 'react';
import { DataGapAlert } from '../../types/monitor';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export interface DataGapAlertBannerProps {
  alertDetails: DataGapAlert;
  confidence: number;
  threshold: number;
  reason?: string | null;
}

export const DataGapAlertBanner: React.FC<DataGapAlertBannerProps> = ({
  alertDetails,
  confidence,
  threshold,
  reason,
}) => {
  const isAlert = alertDetails.isAlertActive;
  const confidencePercent = (confidence * 100).toFixed(1);
  const thresholdPercent = (threshold * 100).toFixed(0);

  if (isAlert) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="border-l-4 border-l-[#B7791F] border border-[#D9D3C5] bg-[#FAF8F3] p-4 rounded-[2px] text-left transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-[#B7791F]" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#B7791F]">
                Data-Gap Alert Active
              </span>
              <span className="text-[11px] font-mono px-1.5 py-0.2 bg-[#B7791F]/10 text-[#B7791F] border border-[#B7791F]/30 rounded-[2px]">
                Confidence {confidencePercent}% &lt; {thresholdPercent}% Threshold
              </span>
            </div>
            <p className="text-xs font-semibold text-[#14213D] leading-snug">
              {reason ?? 'Data-gap alert — confidence is reduced because observation data are incomplete and/or stale.'}
            </p>
            <p className="text-[11px] text-[#5B6475] leading-relaxed">
              <strong>Quality Notice:</strong> Telemetry confidence is below the proposed threshold due to irregular recording intervals or missing channels. This indicates telemetry data quality degradation. Decision support, not diagnosis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Restrained clear state (no loud triumphant banner)
  return (
    <div
      role="status"
      className="border border-[#D9D3C5] bg-white px-4 py-2.5 rounded-[2px] text-left flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-2.5 text-xs text-[#2F6B3F]">
        <CheckCircle className="w-4 h-4 shrink-0 text-[#2F6B3F]" aria-hidden="true" />
        <span className="font-mono font-semibold">Data Quality Nominal</span>
        <span className="text-[#5B6475]">·</span>
        <span className="text-[#5B6475] font-sans">
          Telemetry confidence ({confidencePercent}%) meets the proposed {thresholdPercent}% operational threshold without active data gaps.
        </span>
      </div>
      <div className="text-[11px] font-mono text-[#5B6475] shrink-0 hidden sm:block">
        Zero Active Data Gaps
      </div>
    </div>
  );
};
