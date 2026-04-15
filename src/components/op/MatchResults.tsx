import { useState } from 'react';
import type { OpMatchResult } from '../../types/factory';
import { useLang } from '../../context/LanguageContext';
import { t } from '../../locales';
import FactoryCard from './FactoryCard';

interface MatchResultsProps {
  result: OpMatchResult;
  selectedOrder: string[]; // ordered list of selected factory IDs (index+1 = priority)
  onToggleSelect: (id: string) => void;
  selectable?: boolean;
}

export default function MatchResults({ result, selectedOrder, onToggleSelect, selectable = true }: MatchResultsProps) {
  const { lang } = useLang();
  const [noCapacityOpen, setNoCapacityOpen] = useState(false);

  const hasNoCapacity = result.internalNoCapacity.length > 0;

  const getOrder = (id: string): number | null => {
    const idx = selectedOrder.indexOf(id);
    return idx >= 0 ? idx + 1 : null;
  };

  return (
    <div className="space-y-3">
      {/* Section: Internal with capacity */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h4 className="text-xs font-semibold text-brand-dark uppercase tracking-wider">
            {t(lang, 'internalSuppliers')} — {t(lang, 'internalWithCapacity')}
          </h4>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
            {result.internalWithCapacity.length}
          </span>
        </div>
        <div className="space-y-2">
          {result.internalWithCapacity.map((f) => (
            <FactoryCard
              key={f.id}
              factory={f}
              selectionOrder={getOrder(f.id)}
              onToggleSelect={() => onToggleSelect(f.id)}
              selectable={selectable}
            />
          ))}
        </div>
      </div>

      {/* Section: Internal no capacity (collapsible) */}
      {hasNoCapacity && (
        <div>
          <button
            onClick={() => setNoCapacityOpen(!noCapacityOpen)}
            className="flex items-center gap-1.5 text-xs text-brand-gray hover:text-brand-dark transition-colors mb-2"
          >
            <svg
              className={`w-3 h-3 transition-transform ${noCapacityOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="font-medium">
              {t(lang, 'internalNoCapacity')}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
              {result.internalNoCapacity.length}
            </span>
            <span className="text-[10px] text-brand-gray">— {t(lang, 'noCapacityCount', { count: result.internalNoCapacity.length })}</span>
          </button>
          {noCapacityOpen && (
            <div className="space-y-2">
              {result.internalNoCapacity.map((f) => (
                <FactoryCard
                  key={f.id}
                  factory={f}
                  selectionOrder={getOrder(f.id)}
                  onToggleSelect={() => onToggleSelect(f.id)}
                  selectable={selectable}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section: External suppliers */}
      {result.external.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-xs font-semibold text-brand-dark uppercase tracking-wider">
              {t(lang, 'externalSuppliers')}
            </h4>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
              {result.external.length}
            </span>
          </div>
          <div className="space-y-2">
            {result.external.map((f) => (
              <FactoryCard
                key={f.id}
                factory={f}
                selectionOrder={getOrder(f.id)}
                onToggleSelect={() => onToggleSelect(f.id)}
                selectable={selectable}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
