import React from 'react';
import { PatientMonitorViewModel } from '../../types/monitor';
import { Badge } from '../ui/Badge';
import { ShieldCheck, ShieldAlert, Clock, BarChart2, Zap, Target } from 'lucide-react';

export interface ConfidenceSummaryProps {
  viewModel: PatientMonitorViewModel;
}

/**
 * Formats time elapsed into deterministic human-readable intervals.
 * Avoids raw milliseconds while maintaining strict determinism.
 */
export function formatTimeSinceLastObservation(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) {
    return 'No record';
  }
  if (ms < 0) {
    return '0 min';
  }

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remHours = hours % 24;
    return remHours > 0 ? `${days}d ${remHours}hr` : `${days}d`;
  }
  if (hours > 0) {
    const remMinutes = minutes % 60;
    return remMinutes > 0 ? `${hours} hr ${remMinutes} min` : `${hours} hr`;
  }
  if (minutes > 0) {
    return `${minutes} min`;
  }
  return '< 1 min';
}

export const ConfidenceSummary: React.FC<ConfidenceSummaryProps> = ({ viewModel }) => {
  const confidencePercent = (viewModel.confidence * 100).toFixed(1);
  const completenessPercent = (viewModel.completeness * 100).toFixed(1);
  const freshnessPercent = (viewModel.freshness * 100).toFixed(1);
  const thresholdPercent = (viewModel.confidenceThreshold * 100).toFixed(0);
  const formattedTimeSince = formatTimeSinceLastObservation(viewModel.timeSinceLastObservation);

  return (
    <div className="border border-[#D9D3C5] bg-white rounded-[2px] p-4 text-left">
      <div className="flex items-center justify-between pb-3 border-b border-[#D9D3C5]/60 mb-4">
        <div>
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#14213D] m-0">
            Telemetry Quality &amp; Confidence Ledger
          </h2>
          <p className="text-[11px] text-[#5B6475] mt-0.5 font-sans">
            Mathematical model: Confidence = Completeness × Freshness, where Freshness = exp(−Δt / τ)
          </p>
        </div>
        <div>
          {viewModel.dataGapAlert ? (
            <Badge variant="warn" className="px-2 py-0.5">
              <ShieldAlert className="w-3 h-3 mr-1 inline" aria-hidden="true" />
              Quality Alert Triggered
            </Badge>
          ) : (
            <Badge variant="ok" className="px-2 py-0.5">
              <ShieldCheck className="w-3 h-3 mr-1 inline" aria-hidden="true" />
              Confidence Nominal
            </Badge>
          )}
        </div>
      </div>

      {/* Grid of Telemetry Quality Parameters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Metric 1: Overall Confidence */}
        <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#5B6475] font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
              Confidence
            </span>
            <span className="text-[10px] uppercase font-bold text-[#5B6475]">Combined</span>
          </div>
          <div className="my-2">
            <span className="font-serif text-3xl font-bold tracking-tight text-[#14213D] tabular-nums">
              {`${confidencePercent}%`}
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#5B6475] truncate">
            Raw: {viewModel.confidence.toFixed(4)}
          </div>
        </div>

        {/* Metric 2: Completeness */}
        <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#5B6475] font-mono">
            <span className="flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
              Completeness
            </span>
            <span className="text-[10px] uppercase font-bold text-[#5B6475]">Channels</span>
          </div>
          <div className="my-2">
            <span className="font-serif text-3xl font-bold tracking-tight text-[#14213D] tabular-nums">
              {`${completenessPercent}%`}
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#5B6475] truncate">
            {viewModel.config.expectedChannels.length} expected fields
          </div>
        </div>

        {/* Metric 3: Freshness */}
        <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#5B6475] font-mono">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
              Freshness
            </span>
            <span className="text-[10px] uppercase font-bold text-[#5B6475]">Decay</span>
          </div>
          <div className="my-2">
            <span className="font-serif text-3xl font-bold tracking-tight text-[#14213D] tabular-nums">
              {`${freshnessPercent}%`}
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#5B6475] truncate">
            τ = {viewModel.config.tauMs / 3600000} hr constant
          </div>
        </div>

        {/* Metric 4: Elapsed Time Since Last Observation */}
        <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#5B6475] font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
              Observation Age
            </span>
            <span className="text-[10px] uppercase font-bold text-[#5B6475]">Latency</span>
          </div>
          <div className="my-2">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#14213D] tabular-nums truncate block">
              {formattedTimeSince}
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#5B6475] truncate">
            Time since last point
          </div>
        </div>

        {/* Metric 5: Threshold Reference */}
        <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs text-[#5B6475] font-mono">
            <span className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
              Alert Trigger
            </span>
            <span className="text-[10px] uppercase font-bold text-[#5B6475]">Boundary</span>
          </div>
          <div className="my-2">
            <span className="font-serif text-3xl font-bold tracking-tight text-[#14213D] tabular-nums">
              &lt; {thresholdPercent}%
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#5B6475] truncate">
            Proposed parameter
          </div>
        </div>
      </div>
    </div>
  );
};
