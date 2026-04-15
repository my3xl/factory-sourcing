import { useState } from 'react';
import type { Opportunity, OpStatus, MatchStatus } from '../../types/opportunity';
import type { OpMatchResult } from '../../types/factory';
import { useLang } from '../../context/LanguageContext';
import { t } from '../../locales';
import { matchResults } from '../../data/factories';

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
  dynamicMatchResult?: OpMatchResult;
  onClick: () => void;
}

export default function OpRow({ op, dynamicMatchResult, onClick }: OpRowProps) {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState(false);

  const result = dynamicMatchResult ?? matchResults[op.id];
  const totalMatched = getMatchCount(result);

  // Get selected factory names from match results
  const selectedFactories = (op.selectedFactoryIds ?? []).map((fid) => {
    if (!result) return { id: fid, name: fid, code: '' };
    const allFactories = [
      ...result.internalWithCapacity,
      ...result.internalNoCapacity,
      ...result.external,
    ];
    const f = allFactories.find((fac) => fac.id === fid);
    return f ? { id: f.id, name: f.name, code: f.code ?? '' } : { id: fid, name: fid, code: '' };
  });

  const handleRowClick = () => {
    setExpanded(!expanded);
  };

  const handleDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <div className="border-b border-brand-border last:border-b-0">
      {/* Main row */}
      <div
        className="grid grid-cols-[80px_1.2fr_1fr_1fr_0.7fr_0.8fr_0.9fr_0.7fr_100px_1fr] gap-3 px-5 py-3 items-center cursor-pointer hover:bg-brand-brown/5 transition-colors text-sm"
        onClick={handleRowClick}
      >
        <span className="text-xs text-brand-gray font-mono">{op.opNumber}</span>
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
          <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-medium text-center min-w-[120px] ${matchStatusColor[op.matchStatus]}`}>
            {t(lang, matchStatusLabel[op.matchStatus])}
            {op.matchStatus === 'matched' && totalMatched > 0 && ` (${totalMatched})`}
          </span>
          <svg
            className={`w-4 h-4 text-brand-gray transition-transform ml-auto ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded: BU selected factories + view detail link */}
      {expanded && (
        <div className="px-5 pb-4 pt-1 bg-brand-cream/50 border-t border-brand-border">
          {selectedFactories.length > 0 && (
            <div className="mb-3">
              <div className="text-[10px] text-brand-gray uppercase tracking-wider mb-1.5">
                {t(lang, 'opBuSelected')}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedFactories.map((f, idx) => (
                  <span
                    key={f.id}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-brand-brown/30 bg-brand-brown/5"
                  >
                    <span className="w-4 h-4 rounded-full bg-brand-brown text-white text-[10px] font-bold flex items-center justify-center leading-none">{idx + 1}</span>
                    {f.code && <span className="text-brand-gray font-mono text-[10px]">{f.code}</span>}
                    <span className="font-medium text-brand-dark">{f.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleDetailClick}
            className="text-xs text-brand-brown hover:underline flex items-center gap-1"
          >
            {t(lang, 'expandDetails')}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
