/**
 * CareProof Audit Console - Receiver Operating Characteristic (ROC) Chart Component
 * Source of Truth: CareProof Website Roadmap (Phase 10B)
 * 
 * ROC CONTRACT:
 * - Real lightweight SVG rendering from actual ROC points in PilotViewModel.
 * - Standard mathematical labels: FPR on X-axis, TPR on Y-axis.
 * - Diagonal chance line (AUC = 0.50).
 * - Exact AUC calculated from simulated data via Wilcoxon-Mann-Whitney.
 * - Honest unavailable state if edge cases occur (all positive, all negative, constant scores).
 * - Screen-reader accessible coordinate data table.
 */

import React from 'react';
import { Activity, AlertCircle } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Badge } from '../ui/Badge';
import { RocResult } from '../../types/pilot';

export interface RocCurveChartProps {
  roc: RocResult;
  className?: string;
}

export const RocCurveChart: React.FC<RocCurveChartProps> = ({
  roc,
  className = '',
}) => {
  const { status, auc, points, positiveCount, negativeCount, totalCount, thresholdsUsed, reason } = roc;

  if (status !== 'calculated' || auc === null || points.length === 0) {
    return (
      <Panel
        title="Event Discrimination (Receiver Operating Characteristic)"
        className={className}
        headerActions={<Badge variant="warn">UNAVAILABLE</Badge>}
      >
        <div
          role="status"
          aria-label="ROC Curve Unavailable"
          className="p-8 text-center bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]"
        >
          <AlertCircle className="w-8 h-8 text-[#5B6475] mx-auto mb-2" aria-hidden="true" />
          <h3 className="text-sm font-bold text-[#14213D] m-0 font-body">
            AUC unavailable for this simulated dataset.
          </h3>
          <p className="text-xs text-[#5B6475] mt-1 m-0 max-w-md mx-auto font-body">
            {reason ||
              'A valid ROC curve cannot be computed because the dataset lacks variance or has zero positive/negative cases.'}
          </p>
        </div>
      </Panel>
    );
  }

  // SVG Chart Geometry
  const chartWidth = 420;
  const chartHeight = 360;
  const padding = { top: 30, right: 30, bottom: 65, left: 65 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Convert (FPR, TPR) to SVG pixel coordinates
  // FPR: 0 to 1 -> padding.left to padding.left + plotWidth
  // TPR: 0 to 1 -> padding.top + plotHeight to padding.top
  const getSvgCoords = (fpr: number, tpr: number) => {
    const x = padding.left + fpr * plotWidth;
    const y = padding.top + (1 - tpr) * plotHeight;
    return { x, y };
  };

  // Sort points by FPR ascending, then TPR ascending to form continuous path
  const sortedPoints = [...points].sort((a, b) => {
    if (Math.abs(a.falsePositiveRate - b.falsePositiveRate) > 1e-6) {
      return a.falsePositiveRate - b.falsePositiveRate;
    }
    return a.truePositiveRate - b.truePositiveRate;
  });

  // Construct SVG path string
  let pathD = '';
  sortedPoints.forEach((pt, index) => {
    const { x, y } = getSvgCoords(pt.falsePositiveRate, pt.truePositiveRate);
    if (index === 0) {
      pathD += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    } else {
      pathD += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
  });

  // Diagonal reference line coordinates (0,0) to (1,1)
  const diagStart = getSvgCoords(0, 0);
  const diagEnd = getSvgCoords(1, 1);

  // Ticks for axes: 0.0, 0.2, 0.4, 0.6, 0.8, 1.0
  const ticks = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <Panel
      title="Event Discrimination (Receiver Operating Characteristic)"
      className={className}
      headerActions={
        <div className="flex items-center gap-2">
          <Badge variant="accent">SIMULATED ROC</Badge>
          <span className="text-[11px] font-mono text-[#5B6475]">
            N = <strong className="text-[#14213D]">{totalCount}</strong>
          </span>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left font-body items-start">
        {/* Left Column: Metric Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
            <span className="text-[11px] font-mono font-semibold uppercase text-[#5B6475] block">
              Empirical Area Under Curve (AUC)
            </span>
            <span className="text-4xl font-display font-bold text-[#14213D] block mt-1">
              {auc.toFixed(3)}
            </span>
            <span className="text-[10px] font-mono text-[#5B6475] block mt-1">
              Wilcoxon-Mann-Whitney Statistic (Simulated)
            </span>
          </div>

          <div className="p-3 bg-white border border-[#D9D3C5] rounded-[2px] space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#D9D3C5]">
              <span className="text-[#5B6475]">Simulated Positive Cases:</span>
              <strong className="text-[#14213D]">{positiveCount}</strong>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-[#D9D3C5]">
              <span className="text-[#5B6475]">Simulated Negative Cases:</span>
              <strong className="text-[#14213D]">{negativeCount}</strong>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-[#D9D3C5]">
              <span className="text-[#5B6475]">Score Thresholds Evaluated:</span>
              <strong className="text-[#14213D]">{thresholdsUsed.length}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#5B6475]">Chance Baseline AUC:</span>
              <span className="text-[#5B6475]">0.500 (Diagonal)</span>
            </div>
          </div>

          <div className="p-3 bg-white border border-[#D9D3C5] rounded-[2px] text-xs text-[#5B6475] leading-relaxed">
            <p className="m-0 font-body">
              <strong>Simulated Discrimination Notice:</strong> Thresholds and AUC are derived directly from the
              synthetic audit adherence score and binary milestone flag. This metric demonstrates algorithmic event
              stratification; it does not claim clinical diagnostic validity or patient predictive accuracy.
            </p>
          </div>
        </div>

        {/* Right Column: SVG ROC Curve */}
        <div className="lg:col-span-7 bg-white border border-[#D9D3C5] p-3 sm:p-4 rounded-[2px]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#14213D] uppercase">
              <Activity className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
              <span>Empirical ROC Curve</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-[#5B6475]">
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-0.5 bg-[#0D9488] inline-block" /> Empirical
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-0.5 border-b border-dashed border-[#9CA3AF] inline-block" /> Chance (0.50)
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[320px] max-h-[380px] select-none"
              aria-label={`ROC curve chart with AUC ${auc.toFixed(3)} showing True Positive Rate versus False Positive Rate`}
              role="img"
            >
              {/* Grid Lines */}
              {ticks.map((t) => {
                const { x, y } = getSvgCoords(t, t);
                return (
                  <g key={t}>
                    {/* Horizontal Grid Line */}
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="#E5E7EB"
                      strokeWidth="1"
                    />
                    {/* Y-axis Label */}
                    <text
                      x={padding.left - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#5B6475"
                      fontFamily="IBM Plex Mono, monospace"
                    >
                      {t.toFixed(1)}
                    </text>

                    {/* Vertical Grid Line */}
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={chartHeight - padding.bottom}
                      stroke="#E5E7EB"
                      strokeWidth="1"
                    />
                    {/* X-axis Label */}
                    <text
                      x={x}
                      y={chartHeight - padding.bottom + 16}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#5B6475"
                      fontFamily="IBM Plex Mono, monospace"
                    >
                      {t.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Diagonal Reference Line (Chance Line) */}
              <line
                x1={diagStart.x}
                y1={diagStart.y}
                x2={diagEnd.x}
                y2={diagEnd.y}
                stroke="#9CA3AF"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />

              {/* Main ROC Curve Path */}
              <path
                d={pathD}
                fill="none"
                stroke="#0D9488"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Data points */}
              {sortedPoints.map((pt, idx) => {
                const { x, y } = getSvgCoords(pt.falsePositiveRate, pt.truePositiveRate);
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="#0D9488"
                    stroke="#FFFFFF"
                    strokeWidth="1"
                  >
                    <title>
                      {`Threshold: ${pt.threshold.toFixed(1)} | Sens (TPR): ${(pt.sensitivity * 100).toFixed(1)}% | Spec: ${(pt.specificity * 100).toFixed(1)}% | FPR: ${(pt.falsePositiveRate * 100).toFixed(1)}%`}
                    </title>
                  </circle>
                );
              })}

              {/* Axes lines */}
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
                x={padding.left + plotWidth / 2}
                y={chartHeight - padding.bottom + 36}
                textAnchor="middle"
                fontSize="11"
                fontWeight="500"
                fill="#14213D"
                fontFamily="IBM Plex Sans, sans-serif"
              >
                False Positive Rate (1 - Specificity)
              </text>

              <text
                x={-(padding.top + plotHeight / 2)}
                y={20}
                transform="rotate(-90)"
                textAnchor="middle"
                fontSize="11"
                fontWeight="500"
                fill="#14213D"
                fontFamily="IBM Plex Sans, sans-serif"
              >
                True Positive Rate (Sensitivity)
              </text>
            </svg>
          </div>

          {/* Screen Reader Accessible Table */}
          <table className="sr-only">
            <caption>ROC Coordinates and Threshold Classification Performance</caption>
            <thead>
              <tr>
                <th scope="col">Threshold</th>
                <th scope="col">FPR</th>
                <th scope="col">TPR (Sensitivity)</th>
                <th scope="col">Specificity</th>
              </tr>
            </thead>
            <tbody>
              {sortedPoints.map((p, i) => (
                <tr key={i}>
                  <td>{p.threshold.toFixed(1)}</td>
                  <td>{p.falsePositiveRate.toFixed(3)}</td>
                  <td>{p.truePositiveRate.toFixed(3)}</td>
                  <td>{p.specificity.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
};
