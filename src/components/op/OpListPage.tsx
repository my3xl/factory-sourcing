import { opportunities } from '../../data/opportunities';
import { useLang } from '../../context/LanguageContext';
import { t } from '../../locales';
import OpRow from './OpRow';

export default function OpListPage() {
  const { lang } = useLang();

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <h2 className="text-xl font-semibold text-brand-dark mb-4">{t(lang, 'pageTitle')}</h2>

      <div className="bg-white rounded-lg border border-brand-border shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-9 gap-2 px-5 py-2.5 bg-gray-50 border-b border-brand-border text-xs font-medium text-brand-gray uppercase tracking-wider">
          <span>{t(lang, 'tableBrand')}</span>
          <span>{t(lang, 'tableCategory')}</span>
          <span>{t(lang, 'tableCOO')}</span>
          <span>{t(lang, 'tableUnitPrice')}</span>
          <span>{t(lang, 'tableQty')}</span>
          <span>{t(lang, 'tableExFactory')}</span>
          <span>{t(lang, 'tableAM')}</span>
          <span>{t(lang, 'tableOpStatus')}</span>
          <span className="text-right">{t(lang, 'tableMatchStatus')}</span>
        </div>

        {/* Table body */}
        <div>
          {opportunities.map((op) => (
            <OpRow key={op.id} op={op} />
          ))}
        </div>
      </div>
    </div>
  );
}
