/**
 * CareProof Audit Console - Score Distribution Chart Component
 * Source of Truth: CareProof Website Roadmap (Phase 10B)
 * 
 * VISUALIZATION CONTRACT:
 * - Real lightweight SVG histogram rendered from actual PilotViewModel bins.
 * - Displays mean, median, sample standard deviation, and range alongside chart.
 * - Honest unavailable state when dataset is empty or uncomputable.
 * - Semantic accessibility via sr-only data table.
 */

import React from 'react';
import { BarChart3, AlertCircle } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Badge } from '../ui/Badge';
import { ScoreDistribution } from '../../types/pilot';

export interface ScoreDistributionChartProps {
  distribution: ScoreDistribution;
  className?: string;
}

export const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({
  distribution,
  className = '',
}) => {
  const { sampleSize, mean, median, stdDev, min, max, bins } = distribution;

  if (sampleSize === 0 || bins.length === 0) {
    return (
      <Panel
        title="Simulated Score Distribution"
        className={className}
        headerActions={<Badge variant="warn">UNAVAILABLE</Badge>}
      >
        <div
          role="status"
          aria-label="Score Distribution Unavailable"
          className="p-8 text-center bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]"
        >
          <AlertCircle className="w-8 h-8 text-[#5B6475] mx-auto mb-2" aria-hidden="true" />
          <h3 className="text-sm font-bold text-[#14213D] m-0 font-body">
            Score Distribution Unavailable
          </h3>
          <p className="text-xs text-[#5B6475] mt-1 m-0 max-w-md mx-auto font-body">
            No simulated audit scores are present in the current dataset to generate histogram bins.
          </p>
        </div>
      </Panel>
    );
  }

  // Calculate chart dimensions
  const maxCount = Math.max(...bins.map((b) => b.count), 1);
  const chartWidth = 500;
  const chartHeight = 220;
  const padding = { top: 25, right: 25, bottom: 40, left: 45 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const barCount = bins.length;
  const barGap = 6;
  const barWidth = Math.max(10, (plotWidth - (barCount - 1) * barGap) / barCount);

  return (
    <Panel
      title="Simulated Score Distribution &amp; Central Tendency"
      className={className}
      headerActions={
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#5B6475]">
            N = <strong className="text-[#14213D]">{sampleSize}</strong>
          </span>
          <Badge variant="accent">SIMULATED</Badge>
        </div>
      }
    >
      <div className="space-y-5 text-left font-body">
        {/* Metric Badges / Stamps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
            <span className="text-[11px] font-mono font-semibold uppercase text-[#5B6475] block">
              Sample Mean
            </span>
            <span className="text-2xl font-display font-bold text-[#14213D] block mt-1">
              {mean.toFixed(1)}
            </span>
            <span className="text-[10px] font-mono text-[#5B6475] block mt-0.5">
              Arithmetic Average
            </span>
          </div>

          <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
            <span className="text-[11px] font-mono font-semibold uppercase text-[#5B6475] block">
              Sample Median
            </span>
            <span className="text-2xl font-display font-bold text-[#14213D] block mt-1">
              {median.toFixed(1)}
            </span>
            <span className="text-[10px] font-mono text-[#5B6475] block mt-0.5">
              50th Percentile
            </span>
          </div>

          <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
            <span className="text-[11px] font-mono font-semibold uppercase text-[#5B6475] block">
              Std. Deviation
            </span>
            <span className="text-2xl font-display font-bold text-[#14213D] block mt-1">
              {stdDev.toFixed(1)}
            </span>
            <span className="text-[10px] font-mono text-[#5B6475] block mt-0.5">
              Sample Dispersion
            </span>
          </div>

          <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
            <span className="text-[11px] font-mono font-semibold uppercase text-[#5B6475] block">
              Score Range
            </span>
            <span className="text-2xl font-display font-bold text-[#14213D] block mt-1">
              {min.toFixed(0)}–{max.toFixed(0)}
            </span>
            <span className="text-[10px] font-mono text-[#5B6475] block mt-0.5">
              Min to Max Score
            </span>
          </div>
        </div>

        {/* SVG Histogram */}
        <div className="bg-white border border-[#D9D3C5] p-3 sm:p-4 rounded-[2px]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#14213D] uppercase">
              <BarChart3 className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
              <span>Score Frequency Histogram ({bins.length} Equal Bins)</span>
            </div>
            <span className="text-[10px] font-mono text-[#5B6475]">
              Y: Frequency | X: Score Interval
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[340px] max-h-[260px] select-none"
              aria-label={`Score distribution histogram showing ${bins.length} bins across ${sampleSize} simulated observations`}
              role="img"
            >
              {/* Background Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                const y = padding.top + plotHeight * (1 - pct);
                const countVal = Math.round(maxCount * pct);
                return (
                  <g key={pct}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="#E5E7EB"
                      strokeWidth="1"
                      strokeDasharray={pct === 0 ? undefined : '2,2'}
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="10"
                      fill="#5B6475"
                      fontFamily="IBM Plex Mono, monospace"
                    >
                      {countVal}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {bins.map((bin, idx) => {
                const x = padding.left + idx * (barWidth + barGap);
                const barHeight = (bin.count / maxCount) * plotHeight;
                const y = padding.top + plotHeight - barHeight;
                const label = `${bin.binStart.toFixed(0)}–${bin.binEnd.toFixed(0)}`;

                return (
                  <g key={idx} className="group">
                    <title>
                      {`Range ${label}: ${bin.count} observations (${bin.percentage.toFixed(1)}%)`}
                    </title>
                    {/* Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(barHeight, 2)}
                      fill="#0D9488"
                      rx="1"
                      className="transition-colors hover:fill-[#0F766E]"
                    />
                    {/* Value count above bar */}
                    {bin.count > 0 && (
                      <text
                        x={x + barWidth / 2}
                        y={Math.max(padding.top + 10, y - 4)}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="600"
                        fill="#14213D"
                        fontFamily="IBM Plex Mono, monospace"
                      >
                        {bin.count}
                      </text>
                    )}
                    {/* X-axis bin interval label */}
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight - padding.bottom + 16}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#5B6475"
                      fontFamily="IBM Plex Mono, monospace"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}

              {/* Baseline Axis */}
              <line
                x1={padding.left}
                y1={chartHeight - padding.bottom}
                x2={chartWidth - padding.right}
                y2={chartHeight - padding.bottom}
                stroke="#14213D"
                strokeWidth="1.5"
              />
              <line
                x1={padding.left}
                y1={padding.top}
                x2={padding.left}
                y2={chartHeight - padding.bottom}
                stroke="#14213D"
                strokeWidth="1.5"
              />

              {/* Axis Titles */}
              <text
                x={chartWidth / 2}
                y={chartHeight - 6}
                textAnchor="middle"
                fontSize="10"
                fill="#5B6475"
                fontFamily="IBM Plex Mono, monospace"
              >
                Simulated Adherence Score Range
              </text>
            </svg>
          </div>

          {/* Accessible Table for Screen Readers */}
          <table className="sr-only">
            <caption>Simulated Score Distribution Frequency Table</caption>
            <thead>
              <tr>
                <th scope="col">Score Bin Range</th>
                <th scope="col">Observation Count</th>
                <th scope="col">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {bins.map((b, i) => (
                <tr key={i}>
                  <td>{`${b.binStart.toFixed(1)} to ${b.binEnd.toFixed(1)}`}</td>
                  <td>{b.count}</td>
                  <td>{`${b.percentage.toFixed(1)}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
};
