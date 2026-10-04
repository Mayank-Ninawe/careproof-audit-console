import React, { useState } from 'react';
import { MonitorObservation, MonitorTimelinePoint } from '../../types/monitor';
import { Badge } from '../ui/Badge';
import { Info, AlertTriangle, Eye } from 'lucide-react';

export interface ObservationTimelineProps {
  timelinePoints: MonitorTimelinePoint[];
  selectedObservationId?: string | null;
  onSelectObservation?: (observation: MonitorObservation) => void;
  gapThresholdMs?: number;
}

export const ObservationTimeline: React.FC<ObservationTimelineProps> = ({
  timelinePoints,
  selectedObservationId,
  onSelectObservation,
  gapThresholdMs = 21_600_000, // 6 hours default
}) => {
  // Local selection if not controlled from above
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    selectedObservationId ?? (timelinePoints.length > 0 ? timelinePoints[timelinePoints.length - 1].observation.id : null)
  );

  const activeId = selectedObservationId !== undefined ? selectedObservationId : internalSelectedId;
  const activePoint = timelinePoints.find((p) => p.observation.id === activeId) ?? timelinePoints[timelinePoints.length - 1] ?? null;

  const handleSelect = (obs: MonitorObservation) => {
    setInternalSelectedId(obs.id);
    onSelectObservation?.(obs);
  };

  if (!timelinePoints || timelinePoints.length === 0) {
    return (
      <div className="border border-[#D9D3C5] bg-white rounded-[2px] p-8 text-center text-xs text-[#5B6475] font-mono">
        No observation records available for timeline rendering.
      </div>
    );
  }

  // --- Coordinate calculations ---
  const svgWidth = 840;
  const svgHeight = 240;
  const marginLeft = 65;
  const marginRight = 55;
  const marginTop = 40;
  const marginBottom = 45;
  const plotWidth = svgWidth - marginLeft - marginRight;
  const plotHeight = svgHeight - marginTop - marginBottom;

  const minTime = timelinePoints[0].observation.timestampMs;
  const maxTime = timelinePoints[timelinePoints.length - 1].observation.timestampMs;
  const timeSpan = Math.max(1, maxTime - minTime);

  // Channel 1 value range for scaling (nominal 50 - 110)
  const valMin = 50;
  const valMax = 110;
  const valSpan = valMax - valMin;

  const getX = (timestampMs: number): number => {
    if (timeSpan <= 0) return marginLeft + plotWidth / 2;
    return marginLeft + ((timestampMs - minTime) / timeSpan) * plotWidth;
  };

  const getY = (val: number | null | undefined): number => {
    if (val === null || val === undefined || !Number.isFinite(val)) {
      return marginTop + plotHeight + 10; // Plotted on missing baseline
    }
    const clamped = Math.max(valMin, Math.min(valMax, val));
    return marginTop + plotHeight - ((clamped - valMin) / valSpan) * plotHeight;
  };

  // Group continuous observation segments (CRITICAL: line is broken across irregular gaps)
  interface LineSegment {
    points: { x: number; y: number; obs: MonitorObservation }[];
  }

  const segments: LineSegment[] = [];
  let currentSegment: { x: number; y: number; obs: MonitorObservation }[] = [];

  interface GapZone {
    startX: number;
    endX: number;
    durationMs: number;
    prevObsId: string;
    nextObsId: string;
  }

  const gapZones: GapZone[] = [];

  for (let i = 0; i < timelinePoints.length; i++) {
    const point = timelinePoints[i];
    const obs = point.observation;
    const x = getX(obs.timestampMs);
    const hasNumericVal = obs.values?.channel1 !== null && obs.values?.channel1 !== undefined;

    // Check for gap preceding this observation
    const isGap = point.isGapPreceding || obs.hasTimingGap || (i > 0 && point.gapDurationMs >= gapThresholdMs);

    if (isGap && i > 0) {
      // Record gap visual zone
      const prevX = getX(timelinePoints[i - 1].observation.timestampMs);
      gapZones.push({
        startX: prevX,
        endX: x,
        durationMs: point.gapDurationMs,
        prevObsId: timelinePoints[i - 1].observation.id,
        nextObsId: obs.id,
      });

      // Break current line segment
      if (currentSegment.length > 0) {
        segments.push({ points: currentSegment });
        currentSegment = [];
      }
    }

    if (hasNumericVal) {
      const y = getY(obs.values.channel1);
      currentSegment.push({ x, y, obs });
    } else {
      // Missing value breaks continuous line
      if (currentSegment.length > 0) {
        segments.push({ points: currentSegment });
        currentSegment = [];
      }
    }
  }

  if (currentSegment.length > 0) {
    segments.push({ points: currentSegment });
  }

  return (
    <div className="border border-[#D9D3C5] bg-white rounded-[2px] p-4 text-left space-y-4">
      {/* Header and Honest Scorer Policy Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D9D3C5]/60">
        <div>
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#14213D] m-0 flex items-center gap-2">
            <span>Observation Timeline &amp; Telemetry Trace</span>
            <Badge variant="neutral">Channel 1 (Telemetry Value)</Badge>
          </h2>
          <p className="text-[11px] text-[#5B6475] mt-0.5">
            Lines represent continuous intervals. Large timing gaps remain visually disconnected without synthetic interpolation.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#5B6475]">
          <span className="inline-block w-2.5 h-0.5 bg-[#0F6B6E]" aria-hidden="true" /> Recorded Telemetry
          <span className="inline-block w-2.5 h-2.5 bg-[#B7791F]/20 border border-[#B7791F]/40 rounded-[1px] ml-2" aria-hidden="true" /> Timing Gap
        </div>
      </div>

      {/* SVG Canvas Container with Responsive Horizontal Scrolling on Mobile */}
      <div className="relative overflow-x-auto pb-2 focus:outline-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full min-w-[700px] h-[260px] bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] select-none"
          role="region"
          aria-label="Patient observation timeline chart showing recorded telemetry points and data gaps"
        >
          {/* Background Score-Band Region: Intentionally Honest Unconfigured State */}
          <rect
            x={marginLeft}
            y={marginTop}
            width={plotWidth}
            height={plotHeight}
            fill="#FFFFFF"
            stroke="#D9D3C5"
            strokeWidth="0.75"
          />

          {/* Dotted Grid Guidelines */}
          {[60, 80, 100].map((v) => {
            const y = getY(v);
            return (
              <g key={`grid-${v}`}>
                <line
                  x1={marginLeft}
                  y1={y}
                  x2={marginLeft + plotWidth}
                  y2={y}
                  stroke="#E5DFD3"
                  strokeWidth="0.75"
                  strokeDasharray="3 3"
                />
                <text
                  x={marginLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-[#5B6475] font-mono select-none"
                >
                  {v}
                </text>
              </g>
            );
          })}

          {/* Unconfigured Score-Band Notice Watermark */}
          <text
            x={marginLeft + plotWidth / 2}
            y={marginTop + 16}
            textAnchor="middle"
            className="text-[10px] fill-[#5B6475]/60 font-mono tracking-wide uppercase select-none pointer-events-none"
          >
            Score bands not configured (Clinical early-warning thresholds unverified)
          </text>

          {/* Timing Gap Visual Zones (CRITICAL: Visible honest empty gap) */}
          {gapZones.map((gap, gIdx) => {
            const gapWidth = Math.max(12, gap.endX - gap.startX);
            const gapHours = Math.round(gap.durationMs / 3600000);
            return (
              <g key={`gap-zone-${gIdx}`}>
                {/* Shaded gap region */}
                <rect
                  x={gap.startX}
                  y={marginTop}
                  width={gapWidth}
                  height={plotHeight}
                  fill="#B7791F"
                  fillOpacity="0.08"
                  stroke="#B7791F"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                {/* Gap demarcation label */}
                <line
                  x1={gap.startX}
                  y1={marginTop}
                  x2={gap.startX}
                  y2={marginTop + plotHeight}
                  stroke="#B7791F"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <line
                  x1={gap.endX}
                  y1={marginTop}
                  x2={gap.endX}
                  y2={marginTop + plotHeight}
                  stroke="#B7791F"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <text
                  x={gap.startX + gapWidth / 2}
                  y={marginTop + plotHeight / 2}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-[#B7791F] font-bold select-none"
                >
                  [Data Gap: +{gapHours}h]
                </text>
              </g>
            );
          })}

          {/* Continuous Line Segments (Drawn strictly within continuous observation spans) */}
          {segments.map((seg, sIdx) => {
            if (seg.points.length < 2) return null;
            const d = seg.points.reduce(
              (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`,
              ''
            );
            return (
              <path
                key={`seg-${sIdx}`}
                d={d}
                fill="none"
                stroke="#0F6B6E"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}

          {/* Interactive Observation Markers */}
          {timelinePoints.map((point) => {
            const obs = point.observation;
            const x = getX(obs.timestampMs);
            const hasNumeric = obs.values?.channel1 !== null && obs.values?.channel1 !== undefined;
            const y = getY(obs.values?.channel1);
            const isSelected = activeId === obs.id;

            return (
              <g
                key={`obs-${obs.id}`}
                id={`obs-marker-${obs.id}`}
                data-observation-id={obs.id}
                tabIndex={0}
                role="button"
                aria-label={`Observation ${obs.id}, timestamp ${obs.timestamp}, Channel 1 value ${hasNumeric ? obs.values.channel1 : 'missing'}`}
                aria-pressed={isSelected}
                onClick={() => handleSelect(obs)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(obs);
                  }
                }}
                className="cursor-pointer focus:outline-none group"
              >
                {/* Active marker indicator ring */}
                {isSelected && (
                  <circle
                    cx={x}
                    y={y}
                    r="8"
                    fill="none"
                    stroke="#0F6B6E"
                    strokeWidth="2.5"
                    className="animate-pulse"
                  />
                )}

                {hasNumeric ? (
                  // Valid numeric marker
                  <circle
                    cx={x}
                    y={y}
                    r={isSelected ? '5' : '4'}
                    fill={isSelected ? '#0F6B6E' : '#FFFFFF'}
                    stroke="#0F6B6E"
                    strokeWidth="2"
                    className="transition-all duration-150 group-hover:r-6 group-focus:r-6 group-focus:stroke-[#14213D]"
                  />
                ) : (
                  // Explicit missing value marker (NEVER plotted as zero)
                  <g>
                    <circle
                      cx={x}
                      y={y}
                      r="4.5"
                      fill="#FFFFFF"
                      stroke="#B3341A"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                    <line
                      x1={x - 3}
                      y1={y - 3}
                      x2={x + 3}
                      y2={y + 3}
                      stroke="#B3341A"
                      strokeWidth="1.5"
                    />
                  </g>
                )}

                {/* X-axis Timestamp labels */}
                <text
                  x={x}
                  y={marginTop + plotHeight + 20}
                  textAnchor="middle"
                  className="text-[9px] fill-[#5B6475] font-mono select-none"
                >
                  {obs.timestamp.slice(11, 16)}
                </text>
              </g>
            );
          })}

          {/* Missing Baseline Notice if any null observations exist */}
          {timelinePoints.some((p) => p.observation.values?.channel1 === null) && (
            <text
              x={marginLeft}
              y={marginTop + plotHeight + 13}
              textAnchor="start"
              className="text-[8px] fill-[#B3341A] font-mono font-medium"
            >
              * Missing telemetry values plotted on baseline (not evaluated as zero)
            </text>
          )}
        </svg>
      </div>

      {/* Observation Point Inspection Drawer / Panel */}
      {activePoint && (
        <div
          tabIndex={-1}
          className="border border-[#D9D3C5] bg-[#FAF8F3] p-3.5 rounded-[2px] text-xs transition-all"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2.5 border-b border-[#D9D3C5]/60 mb-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Eye className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
              <span className="font-mono font-bold text-[#14213D]">
                Observation Detail: {activePoint.observation.id}
              </span>
              <span className="text-[#D9D3C5]">|</span>
              <span className="font-mono text-[#5B6475]">
                {activePoint.observation.timestamp}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={activePoint.observation.completeness === 'complete' ? 'ok' : 'warn'}>
                Completeness: {activePoint.observation.completeness}
              </Badge>
              {activePoint.observation.hasTimingGap ? (
                <Badge variant="warn">
                  <AlertTriangle className="w-3 h-3 mr-1 inline" aria-hidden="true" />
                  Preceding Gap (+{Math.round(activePoint.gapDurationMs / 3600000)}h)
                </Badge>
              ) : (
                <Badge variant="neutral">Regular Interval</Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            <div className="p-2 bg-white border border-[#D9D3C5] rounded-[2px]">
              <span className="text-[10px] text-[#5B6475] uppercase block">Channel 1 (Telemetry)</span>
              <span className="text-sm font-semibold text-[#14213D]">
                {activePoint.observation.values?.channel1 !== null && activePoint.observation.values?.channel1 !== undefined
                  ? activePoint.observation.values.channel1
                  : 'Unavailable / Null'}
              </span>
            </div>
            <div className="p-2 bg-white border border-[#D9D3C5] rounded-[2px]">
              <span className="text-[10px] text-[#5B6475] uppercase block">Channel 2 (Auxiliary)</span>
              <span className="text-sm font-semibold text-[#14213D]">
                {activePoint.observation.values?.channel2 !== null && activePoint.observation.values?.channel2 !== undefined
                  ? activePoint.observation.values.channel2
                  : 'Unavailable / Null'}
              </span>
            </div>
            <div className="p-2 bg-white border border-[#D9D3C5] rounded-[2px]">
              <span className="text-[10px] text-[#5B6475] uppercase block">State Tag</span>
              <span className="text-sm font-semibold text-[#14213D]">
                {activePoint.observation.values?.stateTag ?? 'None'}
              </span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-[#5B6475] italic flex items-center gap-1 font-sans">
            <Info className="w-3 h-3 text-[#5B6475]" aria-hidden="true" />
            Values rendered verbatim from simulated telemetry record without synthetic interpolation.
          </div>
        </div>
      )}
    </div>
  );
};
