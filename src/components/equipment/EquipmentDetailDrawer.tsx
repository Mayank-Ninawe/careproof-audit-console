import React, { useEffect, useRef } from 'react';
import { EquipmentDetail } from '../../types/equipment';
import { Badge } from '../ui/Badge';
import {
  X,
  ShieldAlert,
  ClipboardList,
  History,
  Archive,
} from 'lucide-react';

export interface EquipmentDetailDrawerProps {
  detail: EquipmentDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EquipmentDetailDrawer: React.FC<EquipmentDetailDrawerProps> = ({
  detail,
  isOpen,
  onClose,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !detail) {
    return null;
  }

  const { device } = detail;
  const maintenanceDisplay = detail.nextMaintenanceDate
    ? detail.nextMaintenanceDate.slice(0, 10)
    : 'Not provided';
  const calibrationDisplay = detail.nextCalibrationDate
    ? detail.nextCalibrationDate.slice(0, 10)
    : 'Not provided';
  const incidentDisplay =
    detail.incidentCount !== null && detail.incidentCount !== undefined
      ? `${detail.incidentCount}`
      : 'Not available';

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-[1px] flex justify-end"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="equipment-drawer-title"
        className="w-full max-w-lg bg-white h-full shadow-2xl border-l border-[#D9D3C5] flex flex-col text-left transition-transform duration-200 ease-out font-body"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-[#D9D3C5] bg-[#FAF8F3] flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-[#14213D]" id="equipment-drawer-title">
                {device.id}
              </span>
              <span className="text-[#D9D3C5]">·</span>
              <span className="text-xs font-mono uppercase text-[#0F6B6E] font-semibold">
                {detail.lifecycleStage}
              </span>
            </div>
            <h2 className="text-xs text-[#5B6475] mt-0.5 font-medium truncate max-w-xs">
              {device.deviceType}
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close equipment detail drawer"
            className="p-1.5 text-[#5B6475] hover:text-[#14213D] hover:bg-white border border-[#D9D3C5] rounded-[2px] focus-visible:outline-2 focus-visible:outline-[#0F6B6E] transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Simulated Data Disclosure Banner */}
          <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#B7791F] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <span className="font-mono font-bold uppercase tracking-wider text-[11px] text-[#B7791F] block">
                SIMULATED DATA — Demonstration equipment records only.
              </span>
              <p className="text-[11px] text-[#5B6475] leading-relaxed">
                Synthetic device parameters are provided strictly for audit workflow demonstration.
                Proposed framework, not clinically validated. Decision support, not diagnosis.
              </p>
            </div>
          </div>

          {/* Operational Metrics Ledger */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#14213D] m-0">
              Device Telemetry &amp; Operational Metrics
            </h3>
            <div className="grid grid-cols-2 gap-2.5 font-mono">
              <div className="p-2.5 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
                <span className="text-[10px] text-[#5B6475] uppercase block mb-1">Operational Status</span>
                <span className="font-bold text-[#14213D] text-xs uppercase">{detail.status}</span>
              </div>

              <div className="p-2.5 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
                <span className="text-[10px] text-[#5B6475] uppercase block mb-1">Simulated Uptime</span>
                <span className="font-bold text-[#14213D] text-sm tabular-nums">
                  {`${detail.uptimePercent.toFixed(1)}%`}
                </span>
              </div>

              <div className="p-2.5 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
                <span className="text-[10px] text-[#5B6475] uppercase block mb-1">Active Alerts</span>
                <span className="font-bold text-[#14213D] text-sm tabular-nums">
                  {detail.alertCount}
                </span>
              </div>

              <div className="p-2.5 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
                <span className="text-[10px] text-[#5B6475] uppercase block mb-1">Recorded Incidents</span>
                <span className="font-medium text-[#5B6475] text-xs">
                  {incidentDisplay}
                </span>
              </div>

              <div className="p-2.5 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
                <span className="text-[10px] text-[#5B6475] uppercase block mb-1">Next Maintenance</span>
                <span className="font-medium text-[#14213D] text-xs tabular-nums">
                  {maintenanceDisplay}
                </span>
              </div>

              <div className="p-2.5 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
                <span className="text-[10px] text-[#5B6475] uppercase block mb-1">Next Calibration</span>
                <span className="font-medium text-[#5B6475] text-xs tabular-nums">
                  {calibrationDisplay}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Standard Operating Procedure (SOP) Checklist */}
          <div className="border border-[#D9D3C5] bg-white rounded-[2px] p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono font-semibold uppercase text-xs text-[#14213D]">
                <ClipboardList className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
                <span>SOP Checklist</span>
              </div>
              <Badge variant="neutral">Not Configured</Badge>
            </div>
            <p className="text-[11px] text-[#5B6475] leading-relaxed">
              {detail.sopChecklist.notice}
            </p>
            <div className="p-2.5 bg-[#FAF8F3] border border-[#D9D3C5]/60 rounded-[2px] text-[10px] text-[#5B6475] italic">
              CareProof audit protocol requires verified operating procedures. No placeholder tasks are fabricated in this demonstration.
            </div>
          </div>

          {/* Section: Lifecycle History Log */}
          <div className="border border-[#D9D3C5] bg-white rounded-[2px] p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono font-semibold uppercase text-xs text-[#14213D]">
                <History className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
                <span>Lifecycle History Log</span>
              </div>
              <Badge variant="neutral">0 Entries</Badge>
            </div>
            <p className="text-[11px] text-[#5B6475] leading-relaxed">
              {detail.historyLog.notice}
            </p>
            <div className="p-2.5 bg-[#FAF8F3] border border-[#D9D3C5]/60 rounded-[2px] text-[10px] text-[#5B6475] italic">
              Audit ledger preserves genuine historical logs only. No synthetic maintenance logs are invented.
            </div>
          </div>

          {/* Section: Retirement Criteria */}
          <div className="border border-[#D9D3C5] bg-white rounded-[2px] p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono font-semibold uppercase text-xs text-[#14213D]">
                <Archive className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
                <span>Retirement Criteria</span>
              </div>
              <Badge variant="neutral">Not Configured</Badge>
            </div>
            <p className="text-[11px] text-[#5B6475] leading-relaxed">
              {detail.retireCriteria.notice}
            </p>
            <div className="p-2.5 bg-[#FAF8F3] border border-[#D9D3C5]/60 rounded-[2px] text-[10px] text-[#5B6475] italic">
              Equipment retirement thresholds require approved institutional policy. No arbitrary service-life or uptime rules are assumed.
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="px-5 py-3 border-t border-[#D9D3C5] bg-[#FAF8F3] flex items-center justify-between text-[11px] font-mono text-[#5B6475] shrink-0">
          <span>Synthetic device entity ({device.id})</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white border border-[#D9D3C5] rounded-[2px] text-[#14213D] hover:border-[#5B6475] focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
