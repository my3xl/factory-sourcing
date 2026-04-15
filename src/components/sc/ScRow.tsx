import type { SalesContract, SCStatus } from '../../types/salesContract';
import { useLang } from '../../context/LanguageContext';
import { t } from '../../locales';

const scStatusLabel: Record<SCStatus, 'scPending' | 'scFactoryConfirmed' | 'scPushed' | 'scInProduction' | 'scShipped'> = {
  pending: 'scPending',
  factory_confirmed: 'scFactoryConfirmed',
  pushed: 'scPushed',
  in_production: 'scInProduction',
  shipped: 'scShipped',
};

const scStatusColor: Record<SCStatus, string> = {
  pending: 'bg-gray-100 text-gray-600',
  factory_confirmed: 'bg-blue-100 text-blue-700',
  pushed: 'bg-purple-100 text-purple-700',
  in_production: 'bg-orange-100 text-orange-700',
  shipped: 'bg-green-100 text-green-700',
};

function formatAmount(amount: number): string {
  return `$${(amount / 1000).toFixed(1)}K`;
}

function formatDate(dateStr: string, lang: 'en' | 'zh'): string {
  const date = new Date(dateStr);
  return lang === 'en'
    ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
}

interface ScRowProps {
  sc: SalesContract;
  onClick: () => void;
}

export default function ScRow({ sc, onClick }: ScRowProps) {
  const { lang } = useLang();
  const selectedFactory = sc.factorySelections.find((f) => f.selected);

  return (
    <div
      className="grid grid-cols-[100px_80px_1fr_1fr_80px_80px_80px_100px_1fr] gap-2 px-5 py-3 items-center cursor-pointer hover:bg-brand-brown/5 transition-colors text-sm border-b border-brand-border last:border-b-0"
      onClick={onClick}
    >
      <span className="text-xs font-mono text-brand-dark font-medium">{sc.id}</span>
      <span className="text-xs text-brand-gray font-mono">{sc.opId}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-brand-gray font-mono">{sc.brandCode}</span>
        <span className="font-medium text-brand-dark">{sc.brand}</span>
      </div>
      <span className="text-brand-warm">{sc.productCategory}</span>
      <span className="tabular-nums">{sc.totalQty.toLocaleString()}</span>
      <span className="text-brand-brown font-medium tabular-nums">{formatAmount(sc.totalAmount)}</span>
      <span className="text-xs">{formatDate(sc.exFactoryDate, lang)}</span>
      <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium text-center min-w-[80px] ${scStatusColor[sc.status]}`}>
        {t(lang, scStatusLabel[sc.status])}
      </span>
      <div className="flex items-center gap-1.5">
        {selectedFactory ? (
          <>
            {selectedFactory.factoryCode && <span className="text-[10px] text-brand-gray font-mono">{selectedFactory.factoryCode}</span>}
            <span className="text-xs text-brand-dark truncate">{selectedFactory.factoryName}</span>
          </>
        ) : (
          <span className="text-xs text-brand-gray italic">{t(lang, 'scNoFactory')}</span>
        )}
        <svg
          className="w-4 h-4 text-brand-gray ml-auto"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}
