import type { NodeType, TimeRange } from '../../types/network';
import { useLang } from '../../context/LanguageContext';
import { t, type TranslationKey } from '../../locales';

interface FilterPanelProps {
  visibleTypes: Set<NodeType>;
  onToggleType: (type: NodeType) => void;
  timeRange: TimeRange;
  onTimeChange: (tr: TimeRange) => void;
  sourcingActive: boolean;
  sourcingComplete: boolean;
  onSourcingStart: () => void;
  sourcingPhase: number; // 0=idle, 1=sourcing, 2=analyzing, 3=found
  sourcingFoundCount: number;
}

const typeOptions: { type: NodeType; labelKey: TranslationKey; color: string }[] = [
  { type: 'factory_internal', labelKey: 'networkTypeFactory', color: '#A2674F' },
  { type: 'factory_external', labelKey: 'networkTypeFactoryExt', color: '#1E73BE' },
  { type: 'category', labelKey: 'networkTypeCategory', color: '#534D4F' },
  { type: 'order', labelKey: 'networkTypeOrder', color: '#32373C' },
  { type: 'brand', labelKey: 'networkTypeBrand', color: '#8B6914' },
];

const timeOptions: { value: TimeRange; label: string }[] = [
  { value: 'FW24', label: 'FW24' },
  { value: 'SS25', label: 'SS25' },
  { value: 'FW25', label: 'FW25' },
];

export default function FilterPanel({
  visibleTypes,
  onToggleType,
  timeRange,
  onTimeChange,
  sourcingActive,
  sourcingComplete,
  onSourcingStart,
  sourcingPhase,
  sourcingFoundCount,
}: FilterPanelProps) {
  const { lang } = useLang();

  return (
    <div className="w-[200px] shrink-0 border-r border-gray-200 bg-white p-4 space-y-5 overflow-y-auto">
      {/* Node Types */}
      <div>
        <h4 className="text-[11px] font-semibold text-brand-gray uppercase tracking-wider mb-2">
          {t(lang, 'networkFilterTypes')}
        </h4>
        <div className="space-y-1.5">
          {typeOptions.map(({ type, labelKey, color }) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={visibleTypes.has(type)}
                onChange={() => onToggleType(type)}
                className="sr-only"
              />
              <span
                className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-colors ${
                  visibleTypes.has(type) ? 'border-transparent' : 'border-gray-300 bg-white'
                }`}
                style={{ backgroundColor: visibleTypes.has(type) ? color : undefined }}
              >
                {visibleTypes.has(type) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className="text-xs text-brand-dark group-hover:text-brand-brown transition-colors">
                {t(lang, labelKey)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Time Range Buttons */}
      <div>
        <h4 className="text-[11px] font-semibold text-brand-gray uppercase tracking-wider mb-2">
          {t(lang, 'networkFilterTime')}
        </h4>
        <div className="flex gap-1">
          {timeOptions.map((o) => (
            <button
              key={o.value}
              onClick={() => onTimeChange(o.value)}
              className={`flex-1 py-1.5 rounded text-[10px] font-medium transition-colors ${
                timeRange === o.value
                  ? 'bg-brand-brown text-white'
                  : 'bg-gray-100 text-brand-gray hover:bg-gray-200'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Sourcing Button */}
      <div className="pt-2">
        <button
          onClick={onSourcingStart}
          disabled={sourcingActive || sourcingComplete}
          className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            sourcingComplete
              ? 'bg-green-100 text-green-700 cursor-default'
              : sourcingActive
                ? 'bg-brand-brown/80 text-white cursor-wait'
                : 'bg-brand-brown text-white hover:bg-brand-brown/90 cursor-pointer'
          }`}
        >
          {sourcingActive && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {sourcingComplete
            ? t(lang, 'networkSourcingDone')
            : sourcingPhase === 1
              ? t(lang, 'networkSourcingLoading')
              : sourcingPhase === 2
                ? t(lang, 'networkSourcingAnalyzing')
                : sourcingPhase === 3
                  ? t(lang, 'networkSourcingFound', { count: sourcingFoundCount })
                  : t(lang, 'networkAISourcing')}
        </button>
        {sourcingActive && (
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-brown rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${Math.min(sourcingPhase * 33, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
