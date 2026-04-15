import React, { useState } from 'react';
import type { Opportunity, OpStatus, MatchStatus } from '../../types/opportunity';
import type { OpMatchResult } from '../../types/factory';
import { useLang } from '../../context/LanguageContext';
import { t } from '../../locales';
import { matchResults } from '../../data/factories';
import MatchResults from './MatchResults';

function formatRelativeTime(dateStr: string, lang: 'en' | 'zh'): string {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return t(lang, 'matchedJustNow');
  if (diffMin < 60) return t(lang, 'matchedAgo', { time: `${diffMin}m` });

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return t(lang, 'matchedAgo', { time: `${diffHours}h` });

  const diffDays = Math.floor(diffHours / 24);
  return t(lang, 'matchedAgo', { time: `${diffDays}d` });
}

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

function getMatchCount(result: OpMatchResult | undefined): number {
  if (!result) return 0;
  return result.internalWithCapacity.length + result.internalNoCapacity.length + result.external.length;
}

interface OpRowProps {
  op: Opportunity;
  isMatching?: boolean;
  onMatchDone?: () => void;
  dynamicMatchResult?: OpMatchResult;
}

export default function OpRow({ op, isMatching, onMatchDone, dynamicMatchResult }: OpRowProps) {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [matchedAt, setMatchedAt] = useState(op.matchedAt);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Auto-match for new OPs
  React.useEffect(() => {
    if (isMatching) {
      const timer = setTimeout(() => {
        onMatchDone?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isMatching, onMatchDone]);

  const result = dynamicMatchResult ?? matchResults[op.id];
  const totalMatched = getMatchCount(result);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setMatchedAt(new Date().toISOString());
      setRefreshing(false);
    }, 1500);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="border-b border-brand-border last:border-b-0">
      {/* Main row */}
      <div
        className="grid grid-cols-[1.2fr_1fr_1fr_0.7fr_0.8fr_0.9fr_0.7fr_100px_1fr] gap-3 px-5 py-3 items-center cursor-pointer hover:bg-brand-brown/5 transition-colors text-sm"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-brand-gray font-mono">{op.brandCode}</span>
          <span className="font-medium text-brand-dark">{op.brand}</span>
        </div>
        <span className="text-brand-warm">{op.productCategory}</span>
        <span className="text-xs">{op.coo.join(', ')}</span>
        <span className="text-brand-brown font-medium">{formatPrice(op.unitPrice, lang)}</span>
        <span>{formatQty(op.qty, lang)}</span>
        <span>{formatDate(op.exFactoryDate, lang)}</span>
        <span>{op.accountManager}</span>
        <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium text-center min-w-[80px] ${opStatusColor[op.status]}`}>
          {t(lang, opStatusLabel[op.status])}
        </span>
        <div className="flex items-center gap-2">
          {(refreshing || isMatching) ? (
            <span className="inline-flex items-center justify-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium bg-yellow-100 text-yellow-700 min-w-[120px]">
              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t(lang, 'matchMatching')}
            </span>
          ) : (
            <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-medium text-center min-w-[120px] ${matchStatusColor[op.matchStatus]}`}>
              {t(lang, matchStatusLabel[op.matchStatus])}
              {op.matchStatus === 'matched' && totalMatched > 0 && ` (${totalMatched})`}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-brand-gray transition-transform ml-auto ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded match results */}
      <div
        className={`overflow-visible transition-all duration-300 ${
          expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-5 pb-4 pt-1 bg-brand-cream/50 border-t border-brand-border">
          {/* Header: match time + refresh + BU selection count */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-brand-gray">
                {formatRelativeTime(matchedAt, lang)}
              </span>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-xs px-2.5 py-1 rounded bg-brand-brown text-white hover:bg-brand-brown/90 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                {refreshing ? (
                  <>
                    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t(lang, 'refreshing')}
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {t(lang, 'refreshMatch')}
                  </>
                )}
              </button>
            </div>
            {selectedIds.size > 0 && (
              <span className="text-xs text-brand-brown font-medium">
                {t(lang, 'buSelect')}: {selectedIds.size} selected
              </span>
            )}
          </div>

          {/* Match results */}
          {result ? (
            <MatchResults
              result={result}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
            />
          ) : (
            <p className="text-xs text-brand-gray">No match results</p>
          )}
        </div>
      </div>
    </div>
  );
}
