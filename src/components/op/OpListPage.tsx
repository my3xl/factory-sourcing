import type { Opportunity } from '../../types/opportunity';
import type { OpMatchResult } from '../../types/factory';
import type { Route } from '../../App';
import { useLang } from '../../context/LanguageContext';
import { t } from '../../locales';
import OpRow from './OpRow';

interface OpListPageProps {
  opList: Opportunity[];
  dynamicMatches: Record<string, OpMatchResult>;
  navigate: (r: Route) => void;
}

export default function OpListPage({ opList, dynamicMatches, navigate }: OpListPageProps) {
  const { lang } = useLang();

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-brand-dark">{t(lang, 'pageTitle')}</h2>
        <button
          onClick={() => navigate({ page: 'op-form' })}
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
        <div className="grid grid-cols-[80px_1.2fr_1fr_1fr_0.7fr_0.8fr_0.9fr_0.7fr_100px_1fr] gap-3 px-5 py-2.5 bg-gray-50 border-b border-brand-border text-xs font-medium text-brand-gray uppercase tracking-wider">
          <span>{t(lang, 'tableOpId')}</span>
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
              dynamicMatchResult={dynamicMatches[op.id]}
              onClick={() => navigate({ page: 'op-detail', opId: op.id })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
