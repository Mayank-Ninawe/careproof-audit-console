/**
 * CareProof Audit Console - Incident Workflow Stepper Component (Phase 11B)
 * Source of Truth: CareProof Website Roadmap (Phase 11B)
 * 
 * 6 CANONICAL STAGES:
 * 1. Intake
 * 2. Timeline
 * 3. Indicator Mapping
 * 4. Root Cause (5-Why)
 * 5. Corrective Actions
 * 6. Re-Audit
 */

import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { IncidentProgress } from '../../types/incident';

export type WorkflowStage = 1 | 2 | 3 | 4 | 5 | 6;

export interface WorkflowStageInfo {
  step: WorkflowStage;
  label: string;
  isComplete: boolean;
}

export interface IncidentWorkflowStepperProps {
  activeStage: WorkflowStage;
  onSelectStage: (stage: WorkflowStage) => void;
  progress: IncidentProgress;
  className?: string;
}

export const IncidentWorkflowStepper: React.FC<IncidentWorkflowStepperProps> = ({
  activeStage,
  onSelectStage,
  progress,
  className = '',
}) => {
  const stages: WorkflowStageInfo[] = [
    { step: 1, label: 'Intake', isComplete: progress.intakeComplete },
    { step: 2, label: 'Timeline', isComplete: progress.timelineComplete },
    { step: 3, label: 'Indicator Mapping', isComplete: progress.indicatorMappingPresent },
    { step: 4, label: 'Root Cause (5-Why)', isComplete: progress.rootCausePresent },
    { step: 5, label: 'Corrective Actions', isComplete: progress.correctiveActionsPresent },
    { step: 6, label: 'Re-Audit', isComplete: progress.reauditPlanPresent },
  ];

  return (
    <nav
      aria-label="Incident Response 6-Stage Workflow Stepper"
      className={`border border-[#D9D3C5] bg-white rounded-[2px] p-3 text-left font-body ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 pb-2.5 border-b border-[#D9D3C5]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#14213D]">
            Workflow Sequence
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#FAF8F3] border border-[#D9D3C5] text-[#5B6475] rounded-[2px]">
            {progress.completedStepCount} of {progress.totalStepCount} Sections Completed
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#5B6475]">
          <span>Audit Completeness:</span>
          <strong className="text-[#0F6B6E]">{progress.percentComplete}%</strong>
        </div>
      </div>

      {/* Stepper Tabs */}
      <ol className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 list-none p-0 m-0">
        {stages.map((stage) => {
          const isActive = activeStage === stage.step;
          return (
            <li key={stage.step}>
              <button
                type="button"
                onClick={() => onSelectStage(stage.step)}
                aria-current={isActive ? 'step' : undefined}
                className={`w-full text-left p-2.5 rounded-[2px] border transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0F6B6E] ${
                  isActive
                    ? 'border-[#0F6B6E] bg-[#0F6B6E]/10 text-[#0F6B6E] font-semibold'
                    : 'border-[#D9D3C5] bg-[#FAF8F3] hover:bg-white text-[#14213D]'
                }`}
              >
                <div className="shrink-0">
                  {stage.isComplete ? (
                    <CheckCircle2
                      className={`w-4 h-4 ${isActive ? 'text-[#0F6B6E]' : 'text-[#2F6B3F]'}`}
                      aria-hidden="true"
                    />
                  ) : (
                    <Circle
                      className={`w-4 h-4 ${isActive ? 'text-[#0F6B6E]' : 'text-[#9CA3AF]'}`}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase text-[#5B6475]">
                    Step {stage.step}
                  </div>
                  <div className="text-xs font-bold truncate">
                    {stage.label}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
