import { useState } from 'react';
import type { SalesContract } from '../../types/salesContract';
import type { Route } from '../../App';
import { useLang } from '../../context/LanguageContext';
import { t } from '../../locales';
import ScRow from './ScRow';
import ScFormModal from './ScFormModal';

interface ScListPageProps {
  scList: SalesContract[];
  navigate: (r: Route) => void;
  onCreateSc: (sc: SalesContract) => string;
}

export default function ScListPage({ scList, navigate, onCreateSc }: ScListPageProps) {
  const { lang } = useLang();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-brand-dark">{t(lang, 'scPageTitle')}</h2>
        <button
          onClick={() => setShowModal(true)}
          className="text-sm px-4 py-2 rounded-lg bg-brand-brown text-white hover:bg-brand-brown/90 transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t(lang, 'scNewTitle')}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-brand-border shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[100px_80px_1fr_1fr_80px_80px_80px_100px_1fr] gap-2 px-5 py-2.5 bg-gray-50 border-b border-brand-border text-xs font-medium text-brand-gray uppercase tracking-wider">
          <span>{t(lang, 'scTableId')}</span>
          <span>{t(lang, 'scTableOpId')}</span>
          <span>{t(lang, 'scTableBrand')}</span>
          <span>{t(lang, 'scTableCategory')}</span>
          <span>{t(lang, 'scTableQty')}</span>
          <span>{t(lang, 'scTableAmount')}</span>
          <span>{t(lang, 'scTableExFactory')}</span>
          <span>{t(lang, 'scTableStatus')}</span>
          <span>{t(lang, 'scTableFactory')}</span>
        </div>

        {/* Table body */}
        <div>
          {scList.map((sc) => (
            <ScRow
              key={sc.id}
              sc={sc}
              onClick={() => navigate({ page: 'sc-detail', scId: sc.id })}
            />
          ))}
        </div>
      </div>

      {showModal && (
        <ScFormModal
          onClose={() => setShowModal(false)}
          onCreateSc={onCreateSc}
          onNavigate={(scId) => navigate({ page: 'sc-detail', scId })}
        />
      )}
    </div>
  );
}
