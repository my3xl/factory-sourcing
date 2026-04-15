import { useState, useEffect } from 'react';
import type { Opportunity } from '../../types/opportunity';
import { useLang } from '../../context/LanguageContext';
import { t } from '../../locales';
import { matchResults } from '../../data/factories';
import MatchResults from './MatchResults';

function formatRelativeTime(dateStr: string, lang: 'en' | 'zh'): string {
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

function getTotalMatchCount(opId: string): number {
  const r = matchResults[opId];
  if (!r) return 0;
  return r.internalWithCapacity.length + r.internalNoCapacity.length + r.external.length;
}

function getTop3Ids(opId: string): Set<string> {
  const r = matchResults[opId];
  if (!r) return new Set();
  const all = [...r.internalWithCapacity, ...r.external].sort((a, b) => b.matchScore - a.matchScore);
  return new Set(all.slice(0, 3).map((f) => f.id));
}

interface OpRowProps {
  op: Opportunity;
}

export default function OpRow({ op }: OpRowProps) {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [matchedAt, setMatchedAt] = useState(op.matchedAt);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => getTop3Ids(op.id));

  const result = matchResults[op.id];
  const totalMatched = getTotalMatchCount(op.id);

  useEffect(() => {
    setSelectedIds(getTop3Ids(op.id));
  }, [op.id]);

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
        className="grid grid-cols-8 gap-2 px-5 py-3 items-center cursor-pointer hover:bg-brand-brown/5 transition-colors text-sm"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="font-medium text-brand-dark">{op.brand}</span>
        <span className="text-brand-warm">{op.productCategory}</span>
        <span>{op.coo}</span>
        <span className="text-brand-brown font-medium">{formatPrice(op.unitPrice, lang)}</span>
        <span>{formatQty(op.qty, lang)}</span>
        <span>{formatDate(op.exFactoryDate, lang)}</span>
        <span>{op.accountManager}</span>
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs text-brand-gray">
            {totalMatched > 0
              ? t(lang, 'matchingCount', { count: totalMatched })
              : formatRelativeTime(matchedAt, lang)}
          </span>
          <svg
            className={`w-4 h-4 text-brand-gray transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded match results */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
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
