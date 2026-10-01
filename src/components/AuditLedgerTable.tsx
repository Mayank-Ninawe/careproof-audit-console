import { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle,
  Edit3,
  HelpCircle,
  Search,
  Shield,
  XCircle,
} from 'lucide-react';
import {
  EvaluatedIndicatorScore,
  IndicatorAssessment,
} from '../types/standard';
import { CANONICAL_STANDARD } from '../scoring/scoringEngine';
import { EvidenceBadge } from './EvidenceBadge';
import { IndicatorEditorModal } from './IndicatorEditorModal';

interface AuditLedgerTableProps {
  indicators: EvaluatedIndicatorScore[];
  selectedPillarId: string | null;
  onSelectPillar: (pillarId: string | null) => void;
  onUpdateAssessment: (assessment: IndicatorAssessment) => void;
  onOpenEvidenceReference: () => void;
}

export const AuditLedgerTable: React.FC<AuditLedgerTableProps> = ({
  indicators,
  selectedPillarId,
  onSelectPillar,
  onUpdateAssessment,
  onOpenEvidenceReference,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [bandFilter, setBandFilter] = useState<string>('all');
  const [evidenceFilter, setEvidenceFilter] = useState<string>('all');
  const [onlyCritical, setOnlyCritical] = useState<boolean>(false);
  const [sortField, setSortField] = useState<'code' | 'score' | 'weight'>('code');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const [editingIndicator, setEditingIndicator] = useState<EvaluatedIndicatorScore | null>(null);

  // Filter logic
  const filtered = indicators.filter((ind) => {
    // Pillar filter
    if (selectedPillarId && !ind.code.startsWith(selectedPillarId)) {
      return false;
    }
    // Critical filter
    if (onlyCritical && !ind.isCritical) {
      return false;
    }
    // Band filter
    if (bandFilter !== 'all' && ind.band !== bandFilter) {
      return false;
    }
    // Evidence filter
    if (evidenceFilter !== 'all' && ind.evidenceClassification !== evidenceFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = ind.code.toLowerCase().includes(q);
      const matchName = ind.name.toLowerCase().includes(q);
      const matchSource = ind.dataSource.toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchSource) return false;
    }
    return true;
  });

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'score') {
      const diff = a.evaluatedScore - b.evaluatedScore;
      return sortAsc ? diff : -diff;
    }
    if (sortField === 'weight') {
      const diff = a.weight - b.weight;
      return sortAsc ? diff : -diff;
    }
    // code
    const diff = a.code.localeCompare(b.code);
    return sortAsc ? diff : -diff;
  });

  const handleSort = (field: 'code' | 'score' | 'weight') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const bandBadges = {
    pass: {
      label: 'PASS',
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      icon: CheckCircle,
    },
    warning: {
      label: 'WARN',
      classes: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: AlertTriangle,
    },
    fail: {
      label: 'FAIL',
      classes: 'bg-rose-50 text-rose-800 border-rose-300 font-bold',
      icon: XCircle,
    },
    not_assessed: {
      label: 'OMIT',
      classes: 'bg-stone-100 text-stone-600 border-stone-300',
      icon: AlertCircle,
    },
  };

  return (
    <div className="border border-stone-200 bg-white rounded-[2px] mb-8 overflow-hidden">
      {/* Table Toolbar & Filters */}
      <div className="p-4 border-b border-stone-200 bg-stone-50/70 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-stone-900 tracking-tight">
              Audit Ledger Table
            </h2>
            <span className="font-mono-ledger text-xs text-stone-500">
              ({sorted.length} of {indicators.length} indicators showing)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenEvidenceReference}
              className="text-xs font-mono-ledger text-teal-800 hover:text-teal-950 flex items-center gap-1 border border-teal-200 bg-teal-50/60 px-2 py-1 rounded-[2px] cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Evidence Standards [E] [I] [P]
            </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono-ledger">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, title, dataSource..."
              className="w-full pl-8 pr-3 py-1 bg-white border border-stone-300 rounded-[2px] text-xs focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          {/* Pillar Selector */}
          <div className="flex items-center gap-1">
            <span className="text-stone-500 text-[11px]">Pillar:</span>
            <select
              value={selectedPillarId || 'all'}
              onChange={(e) => onSelectPillar(e.target.value === 'all' ? null : e.target.value)}
              className="bg-white border border-stone-300 px-2 py-1 rounded-[2px] text-xs focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="all">All Pillars (5)</option>
              {CANONICAL_STANDARD.pillars.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} - {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Performance Band Filter */}
          <div className="flex items-center gap-1">
            <span className="text-stone-500 text-[11px]">Band:</span>
            <select
              value={bandFilter}
              onChange={(e) => setBandFilter(e.target.value)}
              className="bg-white border border-stone-300 px-2 py-1 rounded-[2px] text-xs focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="all">All Bands</option>
              <option value="pass">Pass Only</option>
              <option value="warning">Warning Only</option>
              <option value="fail">Fail Only</option>
              <option value="not_assessed">Not Assessed</option>
            </select>
          </div>

          {/* Evidence Classification Filter */}
          <div className="flex items-center gap-1">
            <span className="text-stone-500 text-[11px]">Evidence:</span>
            <select
              value={evidenceFilter}
              onChange={(e) => setEvidenceFilter(e.target.value)}
              className="bg-white border border-stone-300 px-2 py-1 rounded-[2px] text-xs focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="all">All Evidence [E,I,P]</option>
              <option value="E">[E] Established Only</option>
              <option value="I">[I] Interpretation Only</option>
              <option value="P">[P] Proposed Only</option>
            </select>
          </div>

          {/* Critical Only Toggle */}
          <label className="flex items-center gap-1.5 px-2 py-1 border border-stone-300 bg-white rounded-[2px] cursor-pointer hover:bg-stone-50 select-none">
            <input
              type="checkbox"
              checked={onlyCritical}
              onChange={(e) => setOnlyCritical(e.target.checked)}
              className="rounded-[1px] text-teal-700 focus:ring-0"
            />
            <span className="text-stone-800 font-semibold text-[11px] flex items-center gap-1">
              <Shield className="w-3 h-3 text-rose-700" />
              Critical Only
            </span>
          </label>
        </div>
      </div>

      {/* Dense Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-100/70 text-[11px] font-mono-ledger text-stone-600 uppercase tracking-wider">
              <th
                onClick={() => handleSort('code')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-stone-900 select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Code</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold">Indicator Definition & Source</th>
              <th className="py-2.5 px-2 font-semibold text-center">Class</th>
              <th className="py-2.5 px-2 font-semibold text-center">Safety</th>
              <th
                onClick={() => handleSort('weight')}
                className="py-2.5 px-2 font-semibold text-right cursor-pointer hover:text-stone-900 select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Weight</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold text-right">Measured</th>
              <th className="py-2.5 px-3 font-semibold text-center">Target Band</th>
              <th
                onClick={() => handleSort('score')}
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-stone-900 select-none"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Score</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold text-center">Status</th>
              <th className="py-2.5 px-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200/80 font-mono-ledger">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-stone-500 font-sans text-xs">
                  No indicators match the selected filter criteria.
                </td>
              </tr>
            ) : (
              sorted.map((ind) => {
                const BadgeConfig = bandBadges[ind.band];
                const Icon = BadgeConfig.icon;
                const isFail = ind.band === 'fail';
                const isCriticalFail = ind.isCritical && isFail;
                const canonical = CANONICAL_STANDARD.indicators.find(i => i.id === ind.indicatorId);
                const thresholds = canonical?.thresholds ?? { pass: 0, warning: 0, fail: 0 };

                return (
                  <tr
                    key={ind.indicatorId}
                    className={`hover:bg-stone-50/80 transition-colors ${
                      isCriticalFail ? 'bg-rose-50/40' : ''
                    }`}
                  >
                    {/* Code */}
                    <td className="py-2 px-3 font-bold text-stone-900 whitespace-nowrap">
                      {ind.code}
                    </td>

                    {/* Title & Data Source */}
                    <td className="py-2 px-3 font-sans">
                      <div className="font-semibold text-stone-900 line-clamp-1" title={ind.name}>
                        {ind.name}
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono-ledger line-clamp-1" title={ind.dataSource}>
                        {ind.dataSource}
                      </div>
                    </td>

                    {/* Evidence Class */}
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      <EvidenceBadge classification={ind.evidenceClassification} />
                    </td>

                    {/* Safety Gate Critical Tag */}
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      {ind.isCritical ? (
                        <span
                          title="Life-Safety Critical Indicator: Failure trips the Safety Gate and caps tier at Tier 3."
                          className={`inline-flex items-center gap-0.5 px-1 py-0.5 border text-[10px] rounded-[2px] font-bold ${
                            isFail
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-stone-100 text-stone-800 border-stone-300'
                          }`}
                        >
                          <Shield className="w-2.5 h-2.5 text-rose-700" />
                          CRIT
                        </span>
                      ) : (
                        <span className="text-stone-300 text-[10px]">—</span>
                      )}
                    </td>

                    {/* Weight */}
                    <td className="py-2 px-2 text-right text-stone-600">
                      {ind.weight.toFixed(1)}x
                    </td>

                    {/* Measured Value */}
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      {ind.status === 'assessed' && ind.measuredValue !== null ? (
                        <span className="font-bold text-stone-900">
                          {ind.measuredValue} <span className="text-[10px] text-stone-500 font-normal">{ind.unit}</span>
                        </span>
                      ) : (
                        <span className="text-stone-400 italic text-[11px]">Unassessed</span>
                      )}
                    </td>

                    {/* Target Band Reference */}
                    <td className="py-2 px-3 text-center text-[10px] text-stone-500 whitespace-nowrap">
                      {ind.isLowerBetter ? (
                        <span>&le;{thresholds.pass} / &gt;{thresholds.fail}</span>
                      ) : (
                        <span>&ge;{thresholds.pass} / &le;{thresholds.fail}</span>
                      )}
                    </td>

                    {/* Evaluated Score */}
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      {ind.status === 'assessed' ? (
                        <span
                          className={`font-bold ${
                            ind.evaluatedScore >= 90
                              ? 'text-emerald-700'
                              : ind.evaluatedScore >= 70
                              ? 'text-teal-800'
                              : ind.evaluatedScore >= 50
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {ind.evaluatedScore.toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>

                    {/* Performance Band Status */}
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 border text-[10px] font-semibold rounded-[2px] ${BadgeConfig.classes}`}
                      >
                        <Icon className="w-2.5 h-2.5" />
                        {BadgeConfig.label}
                      </span>
                    </td>

                    {/* Action: Audit / Edit */}
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => setEditingIndicator(ind)}
                        className="px-2 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 rounded-[2px] text-[11px] font-semibold flex items-center gap-1 mx-auto cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-teal-800" />
                        Audit
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Editor Modal */}
      {editingIndicator && (
        <IndicatorEditorModal
          indicator={editingIndicator}
          onClose={() => setEditingIndicator(null)}
          onSave={onUpdateAssessment}
        />
      )}
    </div>
  );
};
