/**
 * CareProof Audit Console - Production Incident Response Page (Phase 11B)
 * Source of Truth: CareProof Website Roadmap (Phase 11B)
 * 
 * CORE CONTRACT:
 * 1. Implements the 6-stage Incident Response workflow:
 *    Intake -> Timeline -> Indicator Mapping -> Root Cause (5-Why) -> Corrective Actions -> Re-Audit.
 * 2. Real print-friendly view via window.print() and dedicated report structure.
 * 3. Prominently discloses SIMULATED DATA on-screen and in print.
 * 4. Local in-memory session editing (zero Firebase persistence claims).
 * 5. Strictly zero patient PII (no names, MRNs, phone numbers, addresses).
 * 6. Zero clinical/legal severity or regulatory claims.
 */

import React, { useState, useTransition } from 'react';
import {
  Printer,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Panel } from '../../components/ui/Panel';
import {
  deriveIncidentProgress,
  filterIncidentRecords,
  getSimulatedIncidentRecords,
  validateIncident,
} from '../../services/incident';
import {
  IncidentFilterOptions,
  IncidentRecord,
} from '../../types/incident';
import {
  IncidentDisclosureBanner,
  IncidentWorkflowStepper,
  WorkflowStage,
  IncidentRegisterTable,
  IncidentIntakeSection,
  IncidentTimelineSection,
  IncidentIndicatorMappingSection,
  IncidentFiveWhySection,
  IncidentCorrectiveActionsSection,
  IncidentReauditPlanSection,
  IncidentPrintReport,
} from '../../components/incident';

export const IncidentPage: React.FC = () => {
  const [records, setRecords] = useState<IncidentRecord[]>(() => getSimulatedIncidentRecords());
  const [selectedId, setSelectedId] = useState<string>(() => records[0]?.id || 'INC-2026-001');
  const [filters, setFilters] = useState<IncidentFilterOptions>({
    searchQuery: '',
    status: 'all',
    indicatorId: '',
  });
  const [activeStage, setActiveStage] = useState<WorkflowStage>(1);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [, startTransition] = useTransition();
  const [errorState, setErrorState] = useState<string | null>(null);

  // Filter records
  const filteredRecords = filterIncidentRecords(records, filters);

  // Resolve currently active record
  const activeRecord = records.find((r) => r.id === selectedId) || records[0] || null;

  // Validation
  const validationResult = activeRecord ? validateIncident(activeRecord) : null;
  const progress = activeRecord
    ? deriveIncidentProgress(activeRecord)
    : {
        intakeComplete: false,
        timelineComplete: false,
        indicatorMappingPresent: false,
        rootCausePresent: false,
        correctiveActionsPresent: false,
        reauditPlanPresent: false,
        isClosed: false,
        completedStepCount: 0,
        totalStepCount: 6,
        percentComplete: 0,
      };

  const handleUpdateRecord = (updated: IncidentRecord) => {
    startTransition(() => {
      setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    });
  };

  const handleNewDraft = () => {
    const nextIdx = records.length + 1;
    const newId = `INC-2026-${String(nextIdx).padStart(3, '0')}`;
    const newDraft: IncidentRecord = {
      id: newId,
      intake: {
        id: newId,
        timestamp: new Date().toISOString(),
        title: 'New Quality Anomaly Draft',
        summary: 'Preliminary quality assurance observation pending investigation.',
        reporterId: 'AUD-001',
        description: '',
        status: 'draft',
        isSimulated: true,
      },
      status: 'draft',
      timeline: [
        {
          id: 'EVT-001',
          timestamp: new Date().toISOString(),
          title: 'Initial Audit Anomaly Logged',
          type: 'observation',
          authorId: 'AUD-001',
          isSimulated: true,
        },
      ],
      linkedIndicators: [],
      rootCause: {
        steps: [
          {
            whyNumber: 1,
            question: 'Why did this deviation occur?',
            answer: '',
          },
        ],
        status: 'not_started',
        isSimulated: true,
      },
      correctiveActions: [],
      reauditPlan: {
        status: 'not_scheduled',
        linkedIndicatorIds: [],
        isSimulated: true,
      },
      datasetType: 'SIMULATED',
      isSimulated: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRecords((prev) => [newDraft, ...prev]);
    setSelectedId(newId);
    setActiveStage(1);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 text-left font-body">
      {/* On-screen Header */}
      <div data-print="hide" className="no-print">
        <PageHeader
          title="Incident Response"
          subtitle="Incident intake, timeline analysis, root cause, corrective actions, and re-audit planning."
          badge={<Badge variant="warn">SIMULATED WORKFLOW</Badge>}
          actions={
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={showPrintPreview ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setShowPrintPreview(!showPrintPreview)}
                className="gap-1.5"
              >
                {showPrintPreview ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Hide Report View</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Preview Print Report</span>
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handlePrint}
                className="gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Print incident report</span>
              </Button>
            </div>
          }
          metadata={
            activeRecord ? (
              <>
                <span>
                  Active File: <strong>{activeRecord.id}</strong>
                </span>
                <span>·</span>
                <span>
                  Status: <strong>{activeRecord.status.toUpperCase()}</strong>
                </span>
                <span>·</span>
                <span>
                  Progress: <strong>{progress.percentComplete}%</strong>
                </span>
                <span>·</span>
                <span>
                  Linked Indicators: <strong>{activeRecord.linkedIndicators.length}</strong>
                </span>
              </>
            ) : null
          }
        />
      </div>

      {/* Prominent Simulated Data Disclosure */}
      <div data-print="hide" className="no-print">
        <IncidentDisclosureBanner />
      </div>

      {/* Error Boundary Banner */}
      {errorState && (
        <Panel title="System Anomaly" className="border-[#B3341A]">
          <div role="alert" className="p-4 bg-[#FAF0ED] text-[#B3341A] text-xs font-mono">
            <p className="font-bold m-0">Computational Error</p>
            <p className="mt-1 m-0">{errorState}</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setErrorState(null)}
              className="mt-3 gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Dismiss Error</span>
            </Button>
          </div>
        </Panel>
      )}

      {/* On-Screen Print Preview Modal / Section */}
      {showPrintPreview && activeRecord && (
        <div data-print="hide" className="no-print mb-6">
          <IncidentPrintReport
            record={activeRecord}
            onPrint={handlePrint}
            isPrintPreview={true}
          />
        </div>
      )}

      {/* Main Interactive Screen Content */}
      <div data-print="hide" className="no-print space-y-6">
        {/* Incident Register Table */}
        <IncidentRegisterTable
          records={filteredRecords}
          allRecords={records}
          activeRecordId={selectedId}
          onSelectRecord={(id) => {
            setSelectedId(id);
            setActiveStage(1);
          }}
          filters={filters}
          onFilterChange={setFilters}
          onNewDraft={handleNewDraft}
        />

        {/* Selected Incident Workflow Stage Area */}
        {activeRecord ? (
          <div className="space-y-4">
            {/* 6-Stage Workflow Stepper */}
            <IncidentWorkflowStepper
              activeStage={activeStage}
              onSelectStage={setActiveStage}
              progress={progress}
            />

            {/* Stage Content */}
            <div className="pt-1">
              {activeStage === 1 && (
                <IncidentIntakeSection
                  record={activeRecord}
                  onUpdateRecord={handleUpdateRecord}
                  errors={validationResult ? validationResult.errors : []}
                />
              )}

              {activeStage === 2 && (
                <IncidentTimelineSection
                  record={activeRecord}
                  onUpdateRecord={handleUpdateRecord}
                />
              )}

              {activeStage === 3 && (
                <IncidentIndicatorMappingSection
                  record={activeRecord}
                  onUpdateRecord={handleUpdateRecord}
                />
              )}

              {activeStage === 4 && (
                <IncidentFiveWhySection
                  record={activeRecord}
                  onUpdateRecord={handleUpdateRecord}
                />
              )}

              {activeStage === 5 && (
                <IncidentCorrectiveActionsSection
                  record={activeRecord}
                  onUpdateRecord={handleUpdateRecord}
                />
              )}

              {activeStage === 6 && (
                <IncidentReauditPlanSection
                  record={activeRecord}
                  onUpdateRecord={handleUpdateRecord}
                />
              )}
            </div>

            {/* Stepper Navigation Footer */}
            <div className="flex items-center justify-between p-3 bg-white border border-[#D9D3C5] rounded-[2px] text-xs">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={activeStage === 1}
                onClick={() => setActiveStage((prev) => (Math.max(1, prev - 1) as WorkflowStage))}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                <span>Previous Stage</span>
              </Button>

              <span className="font-mono text-[#5B6475]">
                Stage <strong>{activeStage}</strong> of 6
              </span>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={activeStage === 6}
                onClick={() => setActiveStage((prev) => (Math.min(6, prev + 1) as WorkflowStage))}
                className="gap-1"
              >
                <span>Next Stage</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ) : (
          <Panel title="Incident Detail">
            <div className="p-8 text-center bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
              <AlertTriangle className="w-8 h-8 text-[#5B6475] mx-auto mb-2" aria-hidden="true" />
              <h3 className="text-sm font-bold text-[#14213D] m-0 font-body">No Incident Selected</h3>
              <p className="text-xs text-[#5B6475] mt-1 m-0 font-body">
                Select an incident from the register or create a new draft to begin workflow analysis.
              </p>
            </div>
          </Panel>
        )}
      </div>

      {/* Hidden Print Structure (Executed during browser window.print()) */}
      {activeRecord && (
        <IncidentPrintReport
          record={activeRecord}
          onPrint={handlePrint}
          isPrintPreview={false}
        />
      )}
    </div>
  );
};
