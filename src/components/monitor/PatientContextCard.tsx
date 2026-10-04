import React from 'react';
import { MonitorPatient } from '../../types/monitor';
import { Badge } from '../ui/Badge';
import { User, Activity, ShieldAlert } from 'lucide-react';

export interface PatientContextCardProps {
  patients: MonitorPatient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  selectedPatient: MonitorPatient | null;
  observationCount: number;
  lastObservationAt: string | null;
}

export const PatientContextCard: React.FC<PatientContextCardProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  selectedPatient,
  observationCount,
  lastObservationAt,
}) => {
  return (
    <div className="border border-[#D9D3C5] bg-white rounded-[2px] p-4 text-left transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Patient Selection Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label
            htmlFor="monitor-patient-select"
            className="text-xs font-mono font-semibold uppercase tracking-wider text-[#14213D] shrink-0 flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
            <span>Select Simulated Patient:</span>
          </label>
          <select
            id="monitor-patient-select"
            aria-label="Select simulated patient"
            value={selectedPatientId}
            onChange={(e) => onSelectPatient(e.target.value)}
            className="h-9 px-3 text-xs font-mono bg-[#FAF8F3] text-[#14213D] border border-[#D9D3C5] rounded-[2px] focus-visible:outline-2 focus-visible:outline-[#0F6B6E] hover:border-[#5B6475] transition-colors"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} · {p.label} ({p.observationProfile})
              </option>
            ))}
          </select>
        </div>

        {/* Anonymized Simulated Metadata */}
        {selectedPatient && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-mono text-[#5B6475]">ID:</span>
            <span className="font-mono font-bold text-[#14213D]">{selectedPatient.id}</span>
            <span className="text-[#D9D3C5]">|</span>
            <Badge variant="accent">
              <Activity className="w-3 h-3 mr-1 inline" aria-hidden="true" />
              {selectedPatient.observationProfile}
            </Badge>
            <Badge variant="neutral">Status: {selectedPatient.status}</Badge>
            <Badge variant="warn">
              <ShieldAlert className="w-3 h-3 mr-1 inline" aria-hidden="true" />
              SIMULATED DATA
            </Badge>
          </div>
        )}
      </div>

      {/* Secondary Context Stats */}
      {selectedPatient && (
        <div className="mt-3 pt-3 border-t border-[#D9D3C5]/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#5B6475]">
          <div className="flex items-center gap-4 flex-wrap">
            <span>
              Recorded Observations:{' '}
              <strong className="text-[#14213D] font-semibold">{observationCount}</strong>
            </span>
            <span>·</span>
            <span>
              Latest Observation:{' '}
              <strong className="text-[#14213D] font-semibold">
                {lastObservationAt ? new Date(lastObservationAt).toISOString().replace('.000Z', 'Z') : 'None'}
              </strong>
            </span>
          </div>
          <div className="text-[11px] text-[#5B6475] italic">
            Zero PII · Anonymized synthetic dataset
          </div>
        </div>
      )}
    </div>
  );
};
