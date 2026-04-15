import { useState } from 'react';
import type { SalesContract, SCStatus, FactorySelection } from '../../types/salesContract';
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

const selectionStatusColor: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  capacity_changed: 'bg-yellow-100 text-yellow-700',
  newly_available: 'bg-blue-100 text-blue-700',
};

const selectionStatusLabel: Record<string, 'scFactoryConfirmedLabel' | 'scCapacityChanged' | 'scNewlyAvailable'> = {
  confirmed: 'scFactoryConfirmedLabel',
  capacity_changed: 'scCapacityChanged',
  newly_available: 'scNewlyAvailable',
};

const capacityColor: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  tight: 'bg-yellow-100 text-yellow-700',
  full: 'bg-red-100 text-red-600',
};

const capacityKey: Record<string, 'capacityAvailable' | 'capacityTight' | 'capacityFull'> = {
  available: 'capacityAvailable',
  tight: 'capacityTight',
  full: 'capacityFull',
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

function StyleTable({ sc }: { sc: SalesContract }) {
  const { lang } = useLang();
  return (
    <div className="space-y-3">
      {sc.styles.map((style) => (
        <div key={style.styleId}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-brand-dark">{style.styleId}</span>
            <span className="text-xs text-brand-gray">— {style.styleName}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="text-[11px] w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-1 px-2 font-medium text-brand-gray">{t(lang, 'scColorway')}</th>
                  {style.sizeRange.map((size) => (
                    <th key={size} className="text-right py-1 px-2 font-medium text-brand-gray">{size}</th>
                  ))}
                  <th className="text-right py-1 px-2 font-medium text-brand-dark">{t(lang, 'scTotal')}</th>
                </tr>
              </thead>
              <tbody>
                {style.colorways.map((cw) => {
                  const total = Object.values(cw.poQty).reduce((a, b) => a + b, 0);
                  return (
                    <tr key={cw.colorCode} className="border-b border-gray-100">
                      <td className="py-1 px-2 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: cw.colorCode === 'WH001' || cw.colorCode === 'WH002' ? '#f5f5f5' : cw.colorCode === 'BK001' ? '#222' : cw.colorCode.startsWith('NV') ? '#1e3a5f' : cw.colorCode.startsWith('OL') ? '#556b2f' : cw.colorCode.startsWith('SD') ? '#c2b280' : cw.colorCode.startsWith('BS') ? '#4a6fa5' : cw.colorCode.startsWith('PC') ? '#d4736e' : cw.colorCode.startsWith('FG') ? '#2d5a27' : cw.colorCode.startsWith('BG') ? '#6b2d3e' : cw.colorCode.startsWith('KH') ? '#c3b091' : cw.colorCode.startsWith('SG') ? '#9dc183' : cw.colorCode.startsWith('HG') ? '#b2beb5' : '#888' }} />
                        <span>{cw.colorName}</span>
                      </td>
                      {style.sizeRange.map((size) => (
                        <td key={size} className="text-right py-1 px-2 tabular-nums">{(cw.poQty[size] ?? 0).toLocaleString()}</td>
                      ))}
                      <td className="text-right py-1 px-2 font-medium tabular-nums">{total.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function FactorySelectionRow({ fac, onToggle }: { fac: FactorySelection; onToggle: () => void }) {
  const { lang } = useLang();
  return (
    <div className={`border rounded-lg p-3 text-sm ${fac.selected ? 'border-brand-brown bg-brand-brown/5' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={fac.selected}
          onChange={onToggle}
          className="w-4 h-4 rounded border-gray-300 text-brand-brown focus:ring-brand-brown cursor-pointer"
        />
        {fac.factoryCode && <span className="text-xs text-brand-gray font-mono">{fac.factoryCode}</span>}
        <span className="font-medium text-brand-dark">{fac.factoryName}</span>

        <div className="ml-auto flex items-center gap-1.5">
          {fac.rating && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${fac.rating === 'A' ? 'bg-brand-brown text-white' : 'bg-brand-warm text-white'}`}>
              {fac.rating}
            </span>
          )}
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${capacityColor[fac.capacityStatus]}`}>
            {t(lang, capacityKey[fac.capacityStatus])}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${selectionStatusColor[fac.selectionStatus]}`}>
            {t(lang, selectionStatusLabel[fac.selectionStatus])}
          </span>
          {fac.supplierType === 'external' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 font-medium">
              {t(lang, 'noRating')}
            </span>
          )}
        </div>
      </div>
      {fac.note && (
        <div className="ml-6 mt-1 text-[10px] text-yellow-700 italic">{fac.note}</div>
      )}
    </div>
  );
}

interface ScRowProps {
  sc: SalesContract;
}

export default function ScRow({ sc }: ScRowProps) {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState(false);
  const [factories, setFactories] = useState(sc.factorySelections);

  const selectedFactory = factories.find((f) => f.selected);
  const styleCount = sc.styles.length;
  const colorwayCount = sc.styles.reduce((a, s) => a + s.colorways.length, 0);

  const handleToggleFactory = (idx: number) => {
    setFactories((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, selected: !f.selected } : f))
    );
  };

  return (
    <div className="border-b border-brand-border last:border-b-0">
      {/* Main row */}
      <div
        className="grid grid-cols-[100px_80px_1fr_1fr_80px_80px_80px_100px_60px_1fr] gap-2 px-5 py-3 items-center cursor-pointer hover:bg-brand-brown/5 transition-colors text-sm"
        onClick={() => setExpanded(!expanded)}
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
        <span className="text-xs text-brand-gray">{styleCount}S / {colorwayCount}C</span>
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
            className={`w-4 h-4 text-brand-gray transition-transform ml-auto ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 bg-brand-cream/50 border-t border-brand-border">
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Style & PO + Order Info */}
            <div className="space-y-4">
              {/* Style & PO */}
              <div>
                <h4 className="text-xs font-semibold text-brand-dark uppercase tracking-wider mb-2">
                  {t(lang, 'scStyleInfo')}
                </h4>
                <StyleTable sc={sc} />
              </div>

              {/* Order Info */}
              <div>
                <h4 className="text-xs font-semibold text-brand-dark uppercase tracking-wider mb-2">
                  {t(lang, 'scOrderInfo')}
                </h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-brand-gray">{t(lang, 'scTradeTerm')}</span>
                    <span className="font-medium">{sc.tradeTerm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray">{t(lang, 'scShipMode')}</span>
                    <span className="font-medium">{sc.shipMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray">{t(lang, 'scPaymentTerm')}</span>
                    <span className="font-medium">{sc.paymentTerm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray">{t(lang, 'scSeason')}</span>
                    <span className="font-medium">{sc.season}</span>
                  </div>
                  <div className="col-span-2 flex justify-between">
                    <span className="text-brand-gray">{t(lang, 'scDropship')}</span>
                    <span className="font-medium">{sc.dropshipDest}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Factory Selection */}
            <div>
              <h4 className="text-xs font-semibold text-brand-dark uppercase tracking-wider mb-2">
                {t(lang, 'scFactorySelection')}
              </h4>
              <div className="space-y-2">
                {factories.map((fac, idx) => (
                  <FactorySelectionRow
                    key={fac.factoryId}
                    fac={fac}
                    onToggle={() => handleToggleFactory(idx)}
                  />
                ))}
              </div>
              {sc.status === 'pending' && (
                <button className="mt-3 text-xs px-3 py-1.5 rounded bg-brand-brown text-white hover:bg-brand-brown/90 transition-colors">
                  {t(lang, 'scPushToFactory')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
