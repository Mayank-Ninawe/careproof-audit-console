import React, { useState } from 'react';
import {
  CaregiverAssessment,
  CaregiverAssessmentEntry,
  CaregiverAssessmentMethod,
  CaregiverCompetency,
  CaregiverCompetencyLevel,
  VALID_ASSESSMENT_METHODS,
  VALID_COMPETENCY_LEVELS,
} from '../../types/caregiver';
import { validateAssessmentEntry } from '../../services/caregiver';
import { SimulatedCaregiver } from '../../types/simulation';
import { ClipboardCheck, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface AssessorEntryFormProps {
  caregivers: readonly SimulatedCaregiver[];
  competencies: readonly CaregiverCompetency[];
  isCompetenciesConfigured: boolean;
  onRecordAssessment?: (assessment: CaregiverAssessment) => void;
}

export const AssessorEntryForm: React.FC<AssessorEntryFormProps> = ({
  caregivers,
  competencies,
  isCompetenciesConfigured,
  onRecordAssessment,
}) => {
  const [formData, setFormData] = useState<Partial<CaregiverAssessmentEntry>>({
    caregiverId: caregivers[0]?.id ?? '',
    competencyId: competencies[0]?.id ?? '',
    level: 2,
    method: 'Direct Observation',
    assessorId: 'ASR-DEMO',
    timestamp: '2026-01-20T12:00:00.000Z',
    expiryDate: '2026-12-31T00:00:00.000Z',
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // If competencies are not configured
  if (!isCompetenciesConfigured || competencies.length === 0) {
    return (
      <div className="border border-[#D9D3C5] bg-white rounded-[2px] p-5 text-left space-y-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#B7791F]" aria-hidden="true" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#14213D] m-0">
            Assessor Evaluation Entry
          </h3>
        </div>
        <p className="text-xs text-[#5B6475] leading-relaxed">
          Assessment entry unavailable until competencies are configured.
        </p>
        <p className="text-[11px] text-[#5B6475] italic">
          Evaluations must map to verified institutional competencies. No placeholder assessment targets are provided.
        </p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessNotice(null);

    const validation = validateAssessmentEntry(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);

    const newAssessment: CaregiverAssessment = {
      id: `ASM-LOCAL-${Date.now()}`,
      caregiverId: formData.caregiverId!,
      competencyId: formData.competencyId!,
      level: formData.level as CaregiverCompetencyLevel,
      method: formData.method as CaregiverAssessmentMethod,
      assessorId: formData.assessorId!,
      assessorRole: 'assessor_a',
      timestamp: formData.timestamp!,
      expiryDate: formData.expiryDate || null,
      isSimulated: true,
    };

    if (onRecordAssessment) {
      onRecordAssessment(newAssessment);
    }

    setSuccessNotice(
      `Evaluation validated for ${formData.caregiverId} on ${formData.competencyId} at Level ${formData.level}. (Session draft only — not persisted to external databases).`
    );
  };

  return (
    <div className="border border-[#D9D3C5] bg-white rounded-[2px] overflow-hidden text-left shadow-xs space-y-0">
      <div className="px-4 py-3 bg-[#FAF8F3] border-b border-[#D9D3C5] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-[#0F6B6E]" aria-hidden="true" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#14213D] m-0">
            Assessor Evaluation Entry Form
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#5B6475]">Local Session Draft</span>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs font-body">
        {/* Persistence Notice Banner */}
        <div className="p-2.5 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] text-[11px] text-[#5B6475]">
          <strong className="text-[#14213D] uppercase font-mono">Notice:</strong> Local evaluation entry. Session draft only — not persisted to external databases.
        </div>

        {/* Validation Errors Display */}
        {errors.length > 0 && (
          <div className="p-3 bg-[#B3341A]/5 border border-[#B3341A] rounded-[2px] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#B3341A]">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Validation Errors</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-[#B3341A] space-y-0.5">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Success Confirmation */}
        {successNotice && (
          <div className="p-3 bg-[#2F6B3F]/5 border border-[#2F6B3F] rounded-[2px] flex items-start gap-2 text-xs text-[#2F6B3F]">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{successNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Caregiver Select */}
          <div className="space-y-1">
            <label htmlFor="form-caregiver" className="block text-[11px] font-mono font-semibold text-[#14213D]">
              Caregiver:
            </label>
            <select
              id="form-caregiver"
              value={formData.caregiverId ?? ''}
              onChange={(e) => setFormData({ ...formData, caregiverId: e.target.value })}
              className="h-8 w-full px-2 text-xs font-mono bg-white border border-[#D9D3C5] rounded-[2px] focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
            >
              {caregivers.map((cg) => (
                <option key={cg.id} value={cg.id}>
                  {cg.id} ({cg.roleId})
                </option>
              ))}
            </select>
          </div>

          {/* Competency Select */}
          <div className="space-y-1">
            <label htmlFor="form-competency" className="block text-[11px] font-mono font-semibold text-[#14213D]">
              Competency:
            </label>
            <select
              id="form-competency"
              value={formData.competencyId ?? ''}
              onChange={(e) => setFormData({ ...formData, competencyId: e.target.value })}
              className="h-8 w-full px-2 text-xs font-mono bg-white border border-[#D9D3C5] rounded-[2px] focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
            >
              {competencies.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name} ({comp.id})
                </option>
              ))}
            </select>
          </div>

          {/* Competency Level (0 to 4) */}
          <div className="space-y-1">
            <label htmlFor="form-level" className="block text-[11px] font-mono font-semibold text-[#14213D]">
              Competency Level (0–4):
            </label>
            <select
              id="form-level"
              value={formData.level ?? 0}
              onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) as CaregiverCompetencyLevel })}
              className="h-8 w-full px-2 text-xs font-mono bg-white border border-[#D9D3C5] rounded-[2px] focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
            >
              {VALID_COMPETENCY_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  Level {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Assessment Method */}
          <div className="space-y-1">
            <label htmlFor="form-method" className="block text-[11px] font-mono font-semibold text-[#14213D]">
              Assessment Method:
            </label>
            <select
              id="form-method"
              value={formData.method ?? 'OSCE'}
              onChange={(e) => setFormData({ ...formData, method: e.target.value as CaregiverAssessmentMethod })}
              className="h-8 w-full px-2 text-xs font-mono bg-white border border-[#D9D3C5] rounded-[2px] focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
            >
              {VALID_ASSESSMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Assessor ID */}
          <div className="space-y-1">
            <label htmlFor="form-assessor" className="block text-[11px] font-mono font-semibold text-[#14213D]">
              Assessor ID:
            </label>
            <input
              id="form-assessor"
              type="text"
              value={formData.assessorId ?? ''}
              onChange={(e) => setFormData({ ...formData, assessorId: e.target.value })}
              className="h-8 w-full px-2 text-xs font-mono bg-white border border-[#D9D3C5] rounded-[2px] focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
            />
          </div>

          {/* Expiry Date (Optional) */}
          <div className="space-y-1">
            <label htmlFor="form-expiry" className="block text-[11px] font-mono font-semibold text-[#14213D]">
              Expiry Date (Optional):
            </label>
            <input
              id="form-expiry"
              type="text"
              placeholder="YYYY-MM-DD or ISO date"
              value={formData.expiryDate ?? ''}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="h-8 w-full px-2 text-xs font-mono bg-white border border-[#D9D3C5] rounded-[2px] focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-mono bg-[#0F6B6E] text-white rounded-[2px] hover:bg-[#0F6B6E]/90 focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
          >
            Record Local Evaluation
          </button>
        </div>
      </form>
    </div>
  );
};
