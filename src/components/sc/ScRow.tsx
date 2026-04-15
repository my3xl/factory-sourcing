import { useState } from 'react';
import type { SalesContract, SCStatus, FactorySelection } from '../../types/salesContract';
import type { Factory } from '../../types/factory';
import { useLang } from '../../context/LanguageContext';
import { t } from '../../locales';
import { matchResults } from '../../data/factories';

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

// Simulate capacity changes in SC stage
function simulateCapacityUpdate(f: Factory): 'available' | 'tight' | 'full' {
  if (!f.capacityStatus) return 'available';
  // Some factories that were available become full/tight in SC stage
  if (f.id === 'F-001') return 'full';       // Was available → now full
  if (f.id === 'F-005') return 'tight';      // Was available → now tight
  return f.capacityStatus;
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

interface ScRowProps {
  sc: SalesContract;
}

export default function ScRow({ sc }: ScRowProps) {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState(false);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(
    sc.factorySelections.find((f) => f.selected)?.factoryId ?? null
  );
  const [refreshing, setRefreshing] = useState(false);
  const [allFactories, setAllFactories] = useState<FactorySelection[] | null>(null);

  // OP-stage selections (from original data, for reference)
  const opSelectedIds = new Set(sc.factorySelections.filter((f) => f.selected).map((f) => f.factoryId));

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      const opMatch = matchResults[sc.opId];
      if (!opMatch) {
        setAllFactories([]);
        setRefreshing(false);
        return;
      }
      const allFromMatch = [
        ...opMatch.internalWithCapacity.map((f) => {
          const cap = simulateCapacityUpdate(f);
          return {
            factoryId: f.id,
            factoryName: f.name,
            factoryCode: f.code ?? '',
            supplierType: f.supplierType as 'internal' | 'external',
            rating: f.rating,
            capacityStatus: cap,
            selectionStatus: opSelectedIds.has(f.id)
              ? (cap !== f.capacityStatus ? 'capacity_changed' : 'confirmed')
              : 'confirmed',
            selected: false,
            note: cap !== f.capacityStatus ? `Capacity changed: ${f.capacityStatus} → ${cap}` : undefined,
          } satisfies FactorySelection;
        }),
        ...opMatch.internalNoCapacity.map((f) => {
          const cap = simulateCapacityUpdate(f);
          return {
            factoryId: f.id,
            factoryName: f.name,
            factoryCode: f.code ?? '',
            supplierType: f.supplierType as 'internal',
            rating: f.rating,
            capacityStatus: cap,
            selectionStatus: opSelectedIds.has(f.id) ? 'capacity_changed' : 'confirmed',
            selected: false,
            note: `Was full, now ${cap}`,
          } satisfies FactorySelection;
        }),
        ...opMatch.external.map((f) => ({
          factoryId: f.id,
          factoryName: f.name,
          factoryCode: '',
          supplierType: 'external' as const,
          rating: undefined,
          capacityStatus: 'available' as const,
          selectionStatus: 'newly_available' as const,
          selected: false,
          note: 'External sourcing confirmed — now available',
        })),
      ];
      setAllFactories(allFromMatch);
      setRefreshing(false);
    }, 1500);
  };

  const displayFactories = allFactories ?? sc.factorySelections;

  // Split: OP-selected (reference only) vs selectable
  const opSelected = displayFactories.filter((f) => opSelectedIds.has(f.factoryId));
  const selectable = displayFactories.filter((f) => !opSelectedIds.has(f.factoryId));

  const selectedFactory = displayFactories.find((f) => f.factoryId === selectedFactoryId);

  return (
    <div className="border-b border-brand-border last:border-b-0">
      {/* Main row — removed Styles column */}
      <div
        className="grid grid-cols-[100px_80px_1fr_1fr_80px_80px_80px_100px_1fr] gap-2 px-5 py-3 items-center cursor-pointer hover:bg-brand-brown/5 transition-colors text-sm"
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
              <div>
                <h4 className="text-xs font-semibold text-brand-dark uppercase tracking-wider mb-2">
                  {t(lang, 'scStyleInfo')}
                </h4>
                <StyleTable sc={sc} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-brand-dark uppercase tracking-wider mb-2">
                  {t(lang, 'scOrderInfo')}
                </h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-brand-gray">{t(lang, 'scTradeTerm')}</span><span className="font-medium">{sc.tradeTerm}</span></div>
                  <div className="flex justify-between"><span className="text-brand-gray">{t(lang, 'scShipMode')}</span><span className="font-medium">{sc.shipMode}</span></div>
                  <div className="flex justify-between"><span className="text-brand-gray">{t(lang, 'scPaymentTerm')}</span><span className="font-medium">{sc.paymentTerm}</span></div>
                  <div className="flex justify-between"><span className="text-brand-gray">{t(lang, 'scSeason')}</span><span className="font-medium">{sc.season}</span></div>
                  <div className="col-span-2 flex justify-between"><span className="text-brand-gray">{t(lang, 'scDropship')}</span><span className="font-medium">{sc.dropshipDest}</span></div>
                </div>
              </div>
            </div>

            {/* Right: Factory Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-brand-dark uppercase tracking-wider">
                  {t(lang, 'scFactorySelection')}
                </h4>
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
                      {t(lang, 'scUpdateFactory')}
                    </>
                  )}
                </button>
              </div>

              {/* OP-selected factories (reference only, no checkbox) */}
              {opSelected.length > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] text-brand-gray uppercase tracking-wider mb-1.5">
                    {t(lang, 'scOpSelected')}
                  </div>
                  <div className="space-y-1.5">
                    {opSelected.map((fac) => (
                      <div key={fac.factoryId} className="border border-brand-brown/30 rounded-lg p-2.5 bg-brand-brown/5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-brown/10 text-brand-brown font-medium">
                            {t(lang, 'scOpSelectedBadge')}
                          </span>
                          {fac.factoryCode && <span className="text-brand-gray font-mono">{fac.factoryCode}</span>}
                          <span className="font-medium text-brand-dark">{fac.factoryName}</span>
                          <div className="ml-auto flex items-center gap-1.5">
                            {fac.rating && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${fac.rating === 'A' ? 'bg-brand-brown text-white' : 'bg-brand-warm text-white'}`}>{fac.rating}</span>
                            )}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${capacityColor[fac.capacityStatus]}`}>
                              {t(lang, capacityKey[fac.capacityStatus])}
                            </span>
                            {fac.selectionStatus === 'capacity_changed' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-yellow-100 text-yellow-700">
                                {t(lang, 'scCapacityChanged')}
                              </span>
                            )}
                          </div>
                        </div>
                        {fac.note && <div className="ml-1 mt-1 text-[10px] text-yellow-700 italic">{fac.note}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selectable factories (radio single-select) */}
              <div className="space-y-1.5">
                {selectable.map((fac) => (
                  <div
                    key={fac.factoryId}
                    onClick={() => setSelectedFactoryId(fac.factoryId === selectedFactoryId ? null : fac.factoryId)}
                    className={`border rounded-lg p-2.5 text-xs cursor-pointer transition-colors ${
                      fac.factoryId === selectedFactoryId ? 'border-brand-brown bg-brand-brown/5' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                        fac.factoryId === selectedFactoryId ? 'border-brand-brown' : 'border-gray-300'
                      }`}>
                        {fac.factoryId === selectedFactoryId && <div className="w-2 h-2 rounded-full bg-brand-brown" />}
                      </div>
                      {fac.factoryCode && <span className="text-brand-gray font-mono">{fac.factoryCode}</span>}
                      <span className="font-medium text-brand-dark">{fac.factoryName}</span>
                      <div className="ml-auto flex items-center gap-1.5">
                        {fac.rating && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${fac.rating === 'A' ? 'bg-brand-brown text-white' : 'bg-brand-warm text-white'}`}>{fac.rating}</span>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${capacityColor[fac.capacityStatus]}`}>
                          {t(lang, capacityKey[fac.capacityStatus])}
                        </span>
                        {fac.selectionStatus === 'newly_available' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-blue-100 text-blue-700">
                            {t(lang, 'scNewlyAvailable')}
                          </span>
                        )}
                        {fac.supplierType === 'external' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 font-medium">
                            {t(lang, 'noRating')}
                          </span>
                        )}
                      </div>
                    </div>
                    {fac.note && <div className="ml-5.5 mt-1 text-[10px] text-blue-600 italic">{fac.note}</div>}
                  </div>
                ))}
              </div>

              {sc.status === 'pending' && selectedFactoryId && (
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
