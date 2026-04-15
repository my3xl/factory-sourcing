import { useState, useCallback } from 'react';
import { opportunities as initialOpportunities } from '../../data/opportunities';
import type { Opportunity, MatchStatus } from '../../types/opportunity';
import { useLang } from '../../context/LanguageContext';
import { t } from '../../locales';
import OpRow from './OpRow';

const newOpTemplates = [
  { brand: 'SPANX', brandCode: 'SPX', productCategory: 'Yoga Legging', coo: ['Vietnam', 'Cambodia'], unitPrice: 12.0, qty: 20000, exFactoryDate: '2025-11-15', accountManager: 'Vince' },
  { brand: 'ALLSAINTS', brandCode: 'ALS', productCategory: 'Knit Sweater', coo: ['Portugal', 'Turkey'], unitPrice: 22.0, qty: 6000, exFactoryDate: '2025-12-01', accountManager: 'David' },
  { brand: 'BONOBOS', brandCode: 'BON', productCategory: 'Wool Overcoat', coo: ['Romania', 'Italy'], unitPrice: 48.0, qty: 3000, exFactoryDate: '2025-11-20', accountManager: 'Michael' },
];

export default function OpListPage() {
  const { lang } = useLang();
  const [opList, setOpList] = useState<Opportunity[]>(initialOpportunities);
  const [matchingIds, setMatchingIds] = useState<Set<string>>(new Set());
  const [templateIdx, setTemplateIdx] = useState(0);

  const handleNewOp = () => {
    const tpl = newOpTemplates[templateIdx % newOpTemplates.length];
    setTemplateIdx((i) => i + 1);

    const newId = `OP-${Date.now().toString().slice(-5)}`;
    const newOp: Opportunity = {
      id: newId,
      ...tpl,
      status: 'open',
      createdAt: new Date().toISOString(),
      matchStatus: 'sourcing_needed' as MatchStatus,
      matchedAt: '',
      matchedCount: 0,
    };

    setOpList((prev) => [newOp, ...prev]);
    setMatchingIds((prev) => new Set(prev).add(newId));
  };

  const handleMatchDone = useCallback((opId: string) => {
    setMatchingIds((prev) => {
      const next = new Set(prev);
      next.delete(opId);
      return next;
    });
    setOpList((prev) =>
      prev.map((op) =>
        op.id === opId
          ? { ...op, matchStatus: 'matched' as MatchStatus, matchedAt: new Date().toISOString(), matchedCount: 3 }
          : op
      )
    );
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-brand-dark">{t(lang, 'pageTitle')}</h2>
        <button
          onClick={handleNewOp}
          className="text-sm px-4 py-2 rounded-lg bg-brand-brown text-white hover:bg-brand-brown/90 transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t(lang, 'newOp')}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-brand-border shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1.2fr_1fr_1fr_0.7fr_0.8fr_0.9fr_0.7fr_100px_1fr] gap-3 px-5 py-2.5 bg-gray-50 border-b border-brand-border text-xs font-medium text-brand-gray uppercase tracking-wider">
          <span>{t(lang, 'tableBrand')}</span>
          <span>{t(lang, 'tableCategory')}</span>
          <span>{t(lang, 'tableCOO')}</span>
          <span>{t(lang, 'tableUnitPrice')}</span>
          <span>{t(lang, 'tableQty')}</span>
          <span>{t(lang, 'tableExFactory')}</span>
          <span>{t(lang, 'tableAM')}</span>
          <span className="text-center">{t(lang, 'tableOpStatus')}</span>
          <span>{t(lang, 'tableMatchStatus')}</span>
        </div>

        {/* Table body */}
        <div>
          {opList.map((op) => (
            <OpRow
              key={op.id}
              op={op}
              isMatching={matchingIds.has(op.id)}
              onMatchDone={() => handleMatchDone(op.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
