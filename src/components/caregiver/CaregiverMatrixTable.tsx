import React from 'react';
import {
  CaregiverCompetencyCell,
  CaregiverMatrixColumn,
  CaregiverMatrixRow,
} from '../../types/caregiver';
import { Badge } from '../ui/Badge';
import { ChevronRight, Users, ShieldAlert } from 'lucide-react';

export interface CaregiverMatrixTableProps {
  rows: CaregiverMatrixRow[];
  columns: CaregiverMatrixColumn[];
  isCompetenciesConfigured: boolean;
  selectedCaregiverId?: string | null;
  onSelectCaregiver: (caregiverId: string) => void;
  onSelectCell?: (caregiverId: string, competencyId: string) => void;
  onClearFilters?: () => void;
}

export const CaregiverMatrixTable: React.FC<CaregiverMatrixTableProps> = ({
  rows,
  columns,
  isCompetenciesConfigured,
  selectedCaregiverId,
  onSelectCaregiver,
  onSelectCell,
  onClearFilters,
}) => {
  // Empty state when filters yield no matches
  if (rows.length === 0) {
    return (
      <div className="border border-[#D9D3C5] bg-white rounded-[2px] p-8 text-center space-y-3">
        <Users className="w-8 h-8 text-[#5B6475] mx-auto" aria-hidden="true" />
        <h3 className="text-xs font-mono font-bold text-[#14213D] uppercase tracking-wider">
          No caregivers match the current filters.
        </h3>
        <p className="text-xs text-[#5B6475] max-w-sm mx-auto">
          Adjust or clear your search, role, or status filters to view registered caregivers.
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

  // State when competency definitions are unconfigured in dataset
  if (!isCompetenciesConfigured || columns.length === 0) {
    return (
      <div className="border border-[#D9D3C5] bg-white rounded-[2px] overflow-hidden text-left shadow-xs">
        <div className="p-6 bg-[#FAF8F3]/60 border-b border-[#D9D3C5] flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#B7791F] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#14213D]">
              Competency definitions are not configured in the current dataset.
            </h3>
            <p className="text-xs text-[#5B6475] leading-relaxed max-w-2xl">
              CareProof audit protocol strictly prohibits fabricating arbitrary clinical categories.
              The matrix columns remain unconfigured until a formal institutional competency framework is configured.
            </p>
          </div>
        </div>

        {/* Basic Caregiver Register Table when Competencies are Unconfigured */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-xs border-collapse" aria-label="Caregiver register">
            <thead>
              <tr className="bg-[#FAF8F3] border-b border-[#D9D3C5] text-[11px] font-mono font-semibold uppercase tracking-wider text-[#5B6475]">
                <th scope="col" className="py-2.5 px-3 text-left w-28">
                  Caregiver ID
                </th>
                <th scope="col" className="py-2.5 px-3 text-left">
                  Assigned Role
                </th>
                <th scope="col" className="py-2.5 px-3 text-left">
                  Competency Profile
                </th>
                <th scope="col" className="py-2.5 px-3 text-left w-32">
                  License Expiry
                </th>
                <th scope="col" className="py-2.5 px-3 text-right w-24">
                  Training
                </th>
                <th scope="col" className="py-2.5 px-2 text-right w-10">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D3C5]/60 font-body">
              {rows.map((row) => {
                const isSelected = selectedCaregiverId === row.caregiverId;
                return (
                  <tr
                    key={row.caregiverId}
                    data-caregiver-id={row.caregiverId}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isSelected}
                    aria-label={`View caregiver detail for ${row.caregiverId}, role ${row.roleId}`}
                    onClick={() => onSelectCaregiver(row.caregiverId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectCaregiver(row.caregiverId);
                      }
                    }}
                    className={`cursor-pointer transition-colors duration-100 group focus-visible:outline-2 focus-visible:outline-[#0F6B6E] ${
                      isSelected ? 'bg-[#0F6B6E]/5' : 'hover:bg-[#FAF8F3]/80'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-[#14213D] whitespace-nowrap">
                      <span className="group-hover:text-[#0F6B6E] transition-colors">
                        {row.caregiverId}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#14213D]">
                      {row.roleId}
                    </td>
                    <td className="py-2.5 px-3 text-[#5B6475] font-mono text-[11px]">
                      {row.competencyProfile}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#5B6475] whitespace-nowrap tabular-nums">
                      {row.licenseExpires.slice(0, 10)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#14213D] tabular-nums">
                      {`${row.trainingCompletedPercent}%`}
                    </td>
                    <td className="py-2.5 px-2 text-right text-[#5B6475]">
                      <ChevronRight className="w-4 h-4 text-[#5B6475]/60 group-hover:text-[#0F6B6E] inline" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Full Competency Matrix when Competencies ARE configured
  return (
    <div className="border border-[#D9D3C5] bg-white rounded-[2px] overflow-hidden text-left shadow-xs">
      <div className="overflow-x-auto">
        <table
          className="w-full min-w-[880px] text-xs border-collapse"
          aria-label="Caregiver competency matrix"
        >
          <thead>
            <tr className="bg-[#FAF8F3] border-b border-[#D9D3C5] text-[11px] font-mono font-semibold uppercase tracking-wider text-[#5B6475]">
              <th scope="col" className="py-2.5 px-3 text-left w-28 sticky left-0 bg-[#FAF8F3] z-10 border-r border-[#D9D3C5]">
                Caregiver ID
              </th>
              <th scope="col" className="py-2.5 px-3 text-left w-36">
                Role
              </th>
              {columns.map((col) => (
                <th
                  key={col.competencyId}
                  scope="col"
                  className="py-2.5 px-3 text-center border-l border-[#D9D3C5]/60 min-w-[130px]"
                >
                  <div className="font-mono text-[#14213D] font-bold truncate">
                    {col.name}
                  </div>
                  <div className="text-[10px] text-[#5B6475] font-normal">
                    {col.targetLevel !== undefined ? `Target: Level ${col.targetLevel}` : 'No target'}
                  </div>
                </th>
              ))}
              <th scope="col" className="py-2.5 px-2 text-right w-10 border-l border-[#D9D3C5]/60">
                <span className="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D3C5]/60 font-body">
            {rows.map((row) => {
              const isSelected = selectedCaregiverId === row.caregiverId;

              return (
                <tr
                  key={row.caregiverId}
                  data-caregiver-id={row.caregiverId}
                  className={`transition-colors duration-100 ${
                    isSelected ? 'bg-[#0F6B6E]/5' : 'hover:bg-[#FAF8F3]/50'
                  }`}
                >
                  {/* Caregiver ID Header Cell */}
                  <td
                    tabIndex={0}
                    role="button"
                    aria-label={`View caregiver ${row.caregiverId}`}
                    onClick={() => onSelectCaregiver(row.caregiverId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectCaregiver(row.caregiverId);
                      }
                    }}
                    className="py-2.5 px-3 font-mono font-bold text-[#14213D] whitespace-nowrap sticky left-0 bg-white border-r border-[#D9D3C5] cursor-pointer hover:text-[#0F6B6E] focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
                  >
                    {row.caregiverId}
                  </td>

                  {/* Role */}
                  <td className="py-2.5 px-3 text-[#14213D] font-medium truncate max-w-[140px]">
                    {row.roleId}
                  </td>

                  {/* Competency Cells */}
                  {columns.map((col) => {
                    const cell: CaregiverCompetencyCell = row.cells[col.competencyId] ?? {
                      competencyId: col.competencyId,
                      level: null,
                      status: 'not_assessed',
                      expiryStatus: 'not_configured',
                      isConfigured: true,
                    };

                    const accessibleLabel = `Caregiver ${row.caregiverId}, ${col.name}, Level ${
                      cell.level !== null ? cell.level : 'unassessed'
                    }, status ${cell.status}${
                      cell.primaryMethod ? `, method ${cell.primaryMethod}` : ''
                    }`;

                    return (
                      <td
                        key={col.competencyId}
                        tabIndex={0}
                        role="button"
                        aria-label={accessibleLabel}
                        onClick={() => {
                          if (onSelectCell) {
                            onSelectCell(row.caregiverId, col.competencyId);
                          } else {
                            onSelectCaregiver(row.caregiverId);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (onSelectCell) {
                              onSelectCell(row.caregiverId, col.competencyId);
                            } else {
                              onSelectCaregiver(row.caregiverId);
                            }
                          }
                        }}
                        className="py-2 px-2 text-center border-l border-[#D9D3C5]/60 cursor-pointer hover:bg-white focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
                      >
                        {cell.level !== null ? (
                          <div className="inline-flex flex-col items-center">
                            {/* Strict Numeric Level (0, 1, 2, 3, 4) */}
                            <span className="font-mono text-sm font-bold text-[#14213D] tabular-nums px-2 py-0.5 border border-[#D9D3C5] bg-[#FAF8F3] rounded-[2px]">
                              {cell.level}
                            </span>
                            <span className="text-[10px] font-mono text-[#5B6475] mt-0.5 truncate max-w-[100px]">
                              {cell.primaryMethod ?? 'Not provided'}
                            </span>
                            {cell.expiryStatus === 'expired' && (
                              <Badge variant="fail" className="text-[9px] mt-0.5">
                                Expired
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center">
                            <span className="text-[11px] font-mono text-[#5B6475] italic">
                              Unassessed
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Detail Arrow */}
                  <td
                    className="py-2.5 px-2 text-right border-l border-[#D9D3C5]/60 cursor-pointer"
                    onClick={() => onSelectCaregiver(row.caregiverId)}
                  >
                    <ChevronRight className="w-4 h-4 text-[#5B6475]/60 hover:text-[#0F6B6E] inline" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-2 border-t border-[#D9D3C5]/60 bg-[#FAF8F3]/60 flex items-center justify-between text-[11px] font-mono text-[#5B6475]">
        <span>Click any caregiver or competency cell to inspect audit detail</span>
        <span>Competency Scale: Numeric Levels 0–4</span>
      </div>
    </div>
  );
};
