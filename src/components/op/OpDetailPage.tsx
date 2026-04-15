import { useState, useEffect } from 'react';
import type { Opportunity, OpStatus, MatchStatus } from '../../types/opportunity';
import type { OpMatchResult } from '../../types/factory';
import type { Route } from '../../App';
import { useLang } from '../../context/LanguageContext';
import { t } from '../../locales';
import { matchResults } from '../../data/factories';
import MatchResults from './MatchResults';

function formatDate(dateStr: string, lang: 'en' | 'zh'): string {
  const date = new Date(dateStr);
  return lang === 'en'
    ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function formatPrice(price: number, lang: 'en' | 'zh'): string {
  return t(lang, 'unitPriceDisplay', { price: price.toFixed(2) });
}

function formatQty(qty: number, lang: 'en' | 'zh'): string {
  return t(lang, 'qtyDisplay', { qty: qty.toLocaleString() });
}

const opStatusLabel: Record<OpStatus, 'opOpen' | 'opInProgress' | 'opWon' | 'opLost'> = {
  open: 'opOpen',
  in_progress: 'opInProgress',
  won: 'opWon',
  lost: 'opLost',
};

const opStatusColor: Record<OpStatus, string> = {
  open: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-600',
};

const matchStatusLabel: Record<MatchStatus, 'matchMatched' | 'matchSourcingNeeded' | 'matchNoMatch'> = {
  matched: 'matchMatched',
  sourcing_needed: 'matchSourcingNeeded',
  no_match: 'matchNoMatch',
};

const matchStatusColor: Record<MatchStatus, string> = {
  matched: 'bg-green-100 text-green-700',
  sourcing_needed: 'bg-orange-100 text-orange-700',
  no_match: 'bg-red-100 text-red-600',
};

interface OpDetailPageProps {
  opId: string;
  opList: Opportunity[];
  dynamicMatches: Record<string, OpMatchResult>;
  onUpdateOp: (opId: string, updates: Partial<Opportunity>) => void;
  onMatchDone: (opId: string) => void;
  navigate: (r: Route) => void;
}

export default function OpDetailPage({ opId, opList, dynamicMatches, onUpdateOp, onMatchDone, navigate }: OpDetailPageProps) {
  const { lang } = useLang();
  const op = opList.find((o) => o.id === opId);
  const isNew = op?.matchedAt === '';
  const [isMatching, setIsMatching] = useState(isNew);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(op?.selectedFactoryIds ?? [])
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [maxSelectWarning, setMaxSelectWarning] = useState(false);

  // Auto-match for new OPs
  useEffect(() => {
    if (isMatching) {
      const timer = setTimeout(() => {
        setIsMatching(false);
        onMatchDone(opId);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isMatching, opId, onMatchDone]);

  if (!op) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center text-brand-gray">
        Opportunity not found
      </div>
    );
  }

  const result = dynamicMatches[opId] ?? matchResults[op.id];
  const totalMatched = result
    ? result.internalWithCapacity.length + result.internalNoCapacity.length + result.external.length
    : 0;

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setMaxSelectWarning(false);
      } else {
        if (next.size >= 3) {
          setMaxSelectWarning(true);
          return prev;
        }
        next.add(id);
        setMaxSelectWarning(false);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    onUpdateOp(opId, {
      selectedFactoryIds: [...selectedIds],
      matchStatus: totalMatched > 0 ? 'matched' : op.matchStatus,
      matchedCount: totalMatched || op.matchedCount,
      matchedAt: op.matchedAt || new Date().toISOString(),
    });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate({ page: 'op' });
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate({ page: 'op' })}
        className="text-sm text-brand-brown hover:underline flex items-center gap-1 mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t(lang, 'opDetailBack')}
      </button>

      {/* OP Info Card */}
      <div className="bg-white rounded-xl border border-brand-border shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-brand-dark">
            {op.opNumber} — {op.brand}
          </h2>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${opStatusColor[op.status]}`}>
              {t(lang, opStatusLabel[op.status])}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${matchStatusColor[op.matchStatus]}`}>
              {t(lang, matchStatusLabel[op.matchStatus])}
              {op.matchStatus === 'matched' && op.matchedCount > 0 && ` (${op.matchedCount})`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-xs text-brand-gray block">{t(lang, 'opFormBrand')}</span>
            <span className="font-medium text-brand-dark">
              <span className="text-brand-gray font-mono text-[10px] mr-1">{op.brandCode}</span>
              {op.brand}
            </span>
          </div>
          <div>
            <span className="text-xs text-brand-gray block">{t(lang, 'opFormCategory')}</span>
            <span className="font-medium text-brand-warm">{op.productCategory}</span>
          </div>
          <div>
            <span className="text-xs text-brand-gray block">{t(lang, 'opFormCoo')}</span>
            <span className="font-medium">{op.coo.join(', ')}</span>
          </div>
          <div>
            <span className="text-xs text-brand-gray block">{t(lang, 'opFormUnitPrice')}</span>
            <span className="font-medium text-brand-brown">{formatPrice(op.unitPrice, lang)}</span>
          </div>
          <div>
            <span className="text-xs text-brand-gray block">{t(lang, 'opFormQty')}</span>
            <span className="font-medium">{formatQty(op.qty, lang)}</span>
          </div>
          <div>
            <span className="text-xs text-brand-gray block">{t(lang, 'opFormExFactory')}</span>
            <span className="font-medium">{formatDate(op.exFactoryDate, lang)}</span>
          </div>
          <div>
            <span className="text-xs text-brand-gray block">{t(lang, 'opFormAM')}</span>
            <span className="font-medium">{op.accountManager}</span>
          </div>
        </div>
      </div>

      {/* Factory Matching Section */}
      <div className="bg-white rounded-xl border border-brand-border shadow-sm p-6">
        <h3 className="text-base font-semibold text-brand-dark mb-4">
          {t(lang, 'opDetailMatchSection')}
        </h3>

        {isMatching ? (
          /* Matching spinner */
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="animate-spin w-10 h-10 text-brand-brown mb-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-brand-gray">{t(lang, 'opDetailMatching')}</p>
          </div>
        ) : result ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-brand-gray">
                {t(lang, 'opDetailMatched')} — {t(lang, 'matchingCount', { count: totalMatched })}
              </span>
              {selectedIds.size > 0 && (
                <span className="text-xs text-brand-brown font-medium">
                  {t(lang, 'buSelect')}: {selectedIds.size}
                </span>
              )}
            </div>

            {maxSelectWarning && (
              <div className="mb-3 text-xs text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg">
                {t(lang, 'opDetailMaxSelect')}
              </div>
            )}

            <MatchResults
              result={result}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              selectable
            />

            {/* Submit button */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={handleSubmit}
                disabled={selectedIds.size === 0}
                className="w-full py-2.5 rounded-lg bg-brand-brown text-white font-medium hover:bg-brand-brown/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {selectedIds.size > 0
                  ? t(lang, 'opDetailSubmitCount', { count: selectedIds.size })
                  : t(lang, 'opDetailSubmit')
                }
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-brand-gray">{t(lang, 'opDetailNoMatch')}</p>
        )}
      </div>

      {/* Success toast */}
      {showSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg shadow-lg text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t(lang, 'opDetailSuccess')}
          </div>
        </div>
      )}
    </div>
  );
}
