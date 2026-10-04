import React from 'react';
import { EquipmentLifecycleStage, EquipmentRegisterRow, EquipmentStatus } from '../../types/equipment';
import { Badge } from '../ui/Badge';
import { ChevronRight, Wrench } from 'lucide-react';

export interface EquipmentRegisterTableProps {
  rows: EquipmentRegisterRow[];
  selectedDeviceId?: string | null;
  onSelectDevice: (deviceId: string) => void;
  onClearFilters?: () => void;
}

const STAGE_BADGE_STYLES: Record<EquipmentLifecycleStage, { badge: string; label: string }> = {
  procure: {
    badge: 'border-[#D9D3C5] bg-[#FAF8F3] text-[#5B6475]',
    label: 'Procure',
  },
  validate: {
    badge: 'border-[#0F6B6E]/30 bg-[#0F6B6E]/10 text-[#0F6B6E]',
    label: 'Validate',
  },
  maintain: {
    badge: 'border-[#B7791F]/30 bg-[#B7791F]/10 text-[#B7791F]',
    label: 'Maintain',
  },
  monitor: {
    badge: 'border-[#2F6B3F]/30 bg-[#2F6B3F]/10 text-[#2F6B3F]',
    label: 'Monitor',
  },
  retire: {
    badge: 'border-[#5B6475]/30 bg-[#FAF8F3] text-[#5B6475]',
    label: 'Retire',
  },
};

const STATUS_CONFIG: Record<
  EquipmentStatus,
  { label: string; symbol: string; badgeVariant: 'ok' | 'neutral' | 'warn' | 'fail' }
> = {
  active: { label: 'Active', symbol: '●', badgeVariant: 'ok' },
  standby: { label: 'Standby', symbol: '○', badgeVariant: 'neutral' },
  alerting: { label: 'Alerting', symbol: '▲', badgeVariant: 'warn' },
  offline: { label: 'Offline', symbol: '■', badgeVariant: 'fail' },
};

export const EquipmentRegisterTable: React.FC<EquipmentRegisterTableProps> = ({
  rows,
  selectedDeviceId,
  onSelectDevice,
  onClearFilters,
}) => {
  if (rows.length === 0) {
    return (
      <div className="border border-[#D9D3C5] bg-white rounded-[2px] p-8 text-center space-y-3">
        <Wrench className="w-8 h-8 text-[#5B6475] mx-auto" aria-hidden="true" />
        <h3 className="text-xs font-mono font-bold text-[#14213D] uppercase tracking-wider">
          No equipment records match the current filters.
        </h3>
        <p className="text-xs text-[#5B6475] max-w-sm mx-auto">
          Adjust or clear the active stage, status, or search filters to restore registered devices.
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-[#0F6B6E] text-white rounded-[2px] hover:bg-[#0F6B6E]/90 focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="border border-[#D9D3C5] bg-white rounded-[2px] overflow-hidden text-left shadow-xs">
      <div className="overflow-x-auto">
        <table
          className="w-full min-w-[820px] text-xs border-collapse"
          aria-label="Equipment lifecycle register"
        >
          <thead>
            <tr className="bg-[#FAF8F3] border-b border-[#D9D3C5] text-[11px] font-mono font-semibold uppercase tracking-wider text-[#5B6475]">
              <th scope="col" className="py-2.5 px-3 text-left w-24">
                Device ID
              </th>
              <th scope="col" className="py-2.5 px-3 text-left">
                Device Type
              </th>
              <th scope="col" className="py-2.5 px-3 text-left w-24">
                Lifecycle Stage
              </th>
              <th scope="col" className="py-2.5 px-3 text-left w-24">
                Status
              </th>
              <th scope="col" className="py-2.5 px-3 text-left w-28">
                Next Maintenance
              </th>
              <th scope="col" className="py-2.5 px-3 text-left w-28">
                Next Calibration
              </th>
              <th scope="col" className="py-2.5 px-3 text-right w-20">
                Uptime
              </th>
              <th scope="col" className="py-2.5 px-3 text-center w-20">
                Alerts
              </th>
              <th scope="col" className="py-2.5 px-3 text-center w-24">
                Incidents
              </th>
              <th scope="col" className="py-2.5 px-2 text-right w-10">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D3C5]/60 font-body">
            {rows.map((row) => {
              const isSelected = selectedDeviceId === row.id;
              const stageMeta = STAGE_BADGE_STYLES[row.lifecycleStage];
              const statusMeta = STATUS_CONFIG[row.status];
              const maintenanceDisplay = row.nextMaintenanceDate
                ? row.nextMaintenanceDate.slice(0, 10)
                : 'Not provided';
              const calibrationDisplay = row.nextCalibrationDate
                ? row.nextCalibrationDate.slice(0, 10)
                : 'Not provided';

              return (
                <tr
                  key={row.id}
                  id={`device-row-${row.id}`}
                  data-device-id={row.id}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`View detail for device ${row.id}, type ${row.deviceType}, status ${row.status}`}
                  onClick={() => onSelectDevice(row.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectDevice(row.id);
                    }
                  }}
                  className={`cursor-pointer transition-colors duration-100 group focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0F6B6E] ${
                    isSelected
                      ? 'bg-[#0F6B6E]/5'
                      : 'hover:bg-[#FAF8F3]/80'
                  }`}
                >
                  {/* ID */}
                  <td className="py-2.5 px-3 font-mono font-bold text-[#14213D] whitespace-nowrap">
                    <span className="group-hover:text-[#0F6B6E] transition-colors flex items-center gap-1">
                      {row.id}
                    </span>
                  </td>

                  {/* Device Type */}
                  <td className="py-2.5 px-3 text-[#14213D] font-medium">
                    {row.deviceType}
                  </td>

                  {/* Lifecycle Stage */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase border rounded-[2px] ${stageMeta.badge}`}
                    >
                      {stageMeta.label}
                    </span>
                  </td>

                  {/* Operational Status */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <Badge variant={statusMeta.badgeVariant}>
                      <span aria-hidden="true" className="mr-1 text-[9px]">
                        {statusMeta.symbol}
                      </span>
                      {statusMeta.label}
                    </Badge>
                  </td>

                  {/* Next Maintenance */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#5B6475] whitespace-nowrap tabular-nums">
                    {maintenanceDisplay}
                  </td>

                  {/* Next Calibration */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#5B6475] whitespace-nowrap tabular-nums">
                    {calibrationDisplay}
                  </td>

                  {/* Uptime */}
                  <td className="py-2.5 px-3 font-mono text-right font-semibold text-[#14213D] whitespace-nowrap tabular-nums">
                    {`${row.uptimePercent.toFixed(1)}%`}
                  </td>

                  {/* Alerts */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono">
                    {row.alertCount > 0 ? (
                      <Badge variant="warn">{row.alertCount}</Badge>
                    ) : (
                      <span className="text-[#5B6475] text-[11px]">0</span>
                    )}
                  </td>

                  {/* Incidents (NEVER display 0 for unavailable) */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono text-[11px]">
                    {row.incidentCount !== null && row.incidentCount !== undefined ? (
                      <span>{row.incidentCount}</span>
                    ) : (
                      <span className="text-[#5B6475] italic">Not available</span>
                    )}
                  </td>

                  {/* Arrow Action indicator */}
                  <td className="py-2.5 px-2 text-right text-[#5B6475]">
                    <ChevronRight
                      className="w-4 h-4 text-[#5B6475]/60 group-hover:text-[#0F6B6E] group-hover:translate-x-0.5 transition-all inline"
                      aria-hidden="true"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-2 border-t border-[#D9D3C5]/60 bg-[#FAF8F3]/60 flex items-center justify-between text-[11px] font-mono text-[#5B6475]">
        <span>Click or press Enter on any device row to view audit detail</span>
        <span>Simulated synthetic equipment register</span>
      </div>
    </div>
  );
};
