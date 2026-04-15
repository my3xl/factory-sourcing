import { salesContracts } from '../../data/salesContracts';
import { useLang } from '../../context/LanguageContext';
import { t } from '../../locales';
import ScRow from './ScRow';

export default function ScListPage() {
  const { lang } = useLang();

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <h2 className="text-xl font-semibold text-brand-dark mb-4">{t(lang, 'scPageTitle')}</h2>

      <div className="bg-white rounded-lg border border-brand-border shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[100px_80px_1fr_1fr_80px_80px_80px_100px_60px_1fr] gap-2 px-5 py-2.5 bg-gray-50 border-b border-brand-border text-xs font-medium text-brand-gray uppercase tracking-wider">
          <span>{t(lang, 'scTableId')}</span>
          <span>{t(lang, 'scTableOpId')}</span>
          <span>{t(lang, 'scTableBrand')}</span>
          <span>{t(lang, 'scTableCategory')}</span>
          <span>{t(lang, 'scTableQty')}</span>
          <span>{t(lang, 'scTableAmount')}</span>
          <span>{t(lang, 'scTableExFactory')}</span>
          <span>{t(lang, 'scTableStatus')}</span>
          <span>{t(lang, 'scTableStyles')}</span>
          <span>{t(lang, 'scTableFactory')}</span>
        </div>

        {/* Table body */}
        <div>
          {salesContracts.map((sc) => (
            <ScRow key={sc.id} sc={sc} />
          ))}
        </div>
      </div>
    </div>
  );
}
