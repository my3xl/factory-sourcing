import { useState, useRef } from 'react';
import type { SalesContract, SCStatus, FactorySelection } from '../../types/salesContract';
import type { Factory } from '../../types/factory';
import type { Route } from '../../App';
import { useLang } from '../../context/LanguageContext';
import { t } from '../../locales';
import { matchResults } from '../../data/factories';
import { FixedTooltip, RatingPopup, CapacityPopup, capacityColor, capacityKey, ratingColor } from '../shared/Tooltip';

function formatAmount(amount: number): string {
  return `$${(amount / 1000).toFixed(1)}K`;
}

function formatDate(dateStr: string, lang: 'en' | 'zh'): string {
  const date = new Date(dateStr);
  return lang === 'en'
    ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
}

function simulateCapacityUpdate(f: Factory): 'available' | 'tight' | 'full' {
  if (!f.capacityStatus) return 'available';
  if (f.id === 'F-001') return 'full';
  if (f.id === 'F-005') return 'tight';
  return f.capacityStatus;
}

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
                        <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: cw.colorCode === 'WH001' || cw.colorCode === 'WH002' ? '#f5f5f5' : cw.colorCode === 'BK001' ? '#222' : cw.colorCode.startsWith('NV') ? '#1e3a5f' : cw.colorCode.startsWith('OL') ? '#556b2f' : cw.colorCode.startsWith('SD') ? '#c2b280' : cw.colorCode.startsWith('BS') ? '#4a6fa5' : cw.colorCode.startsWith('PC') ? '#d4736e' : cw.colorCode.startsWith('FG') ? '#2d5a27' : cw.colorCode.startsWith('BG') ? '#6b2d3e' : cw.colorCode.startsWith('KH') ? '#c3b091' : cw.colorCode.startsWith('SG') ? '#9dc183' : cw.colorCode.startsWith('HG') ? '#b2beb5' : cw.colorCode.startsWith('OM') ? '#d4c5a9' : cw.colorCode.startsWith('CG') ? '#b5651d' : cw.colorCode.startsWith('CH') ? '#555' : cw.colorCode.startsWith('IV') ? '#f5f0e8' : '#888' }} />
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

// Factory row with hover tooltips for rating/capacity
function FactoryRow({ fac, isSelected, onSelect, showRadio }: {
  fac: FactorySelection;
  isSelected: boolean;
  onSelect: () => void;
  showRadio: boolean;
}) {
  const { lang } = useLang();
  const ratingRef = useRef<HTMLSpanElement>(null);
  const capacityRef = useRef<HTMLSpanElement>(null);
  const [showRating, setShowRating] = useState(false);
  const [showCapacity, setShowCapacity] = useState(false);

  const isExternal = fac.supplierType === 'external';

  return (
    <>
      <div
        onClick={showRadio ? onSelect : undefined}
        className={`border rounded-lg p-3 text-xs transition-colors ${
          showRadio ? 'cursor-pointer' : ''
        } ${
          isSelected ? 'border-brand-brown bg-brand-brown/5' : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {showRadio && (
            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
              isSelected ? 'border-brand-brown' : 'border-gray-300'
            }`}>
              {isSelected && <div className="w-2 h-2 rounded-full bg-brand-brown" />}
            </div>
          )}
          {fac.factoryCode && <span className="text-brand-gray font-mono">{fac.factoryCode}</span>}
          <span className="font-medium text-brand-dark">{fac.factoryName}</span>
          <div className="ml-auto flex items-center gap-1.5">
            {fac.rating && !isExternal && (
              <span
                ref={ratingRef}
                onMouseEnter={() => setShowRating(true)}
                onMouseLeave={() => setShowRating(false)}
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium cursor-default ${ratingColor[fac.rating]}`}
              >
                {fac.rating}
              </span>
            )}
            <span
              ref={capacityRef}
              onMouseEnter={() => { setShowRating(false); setShowCapacity(true); }}
              onMouseLeave={() => setShowCapacity(false)}
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium cursor-default ${capacityColor[fac.capacityStatus]}`}
            >
              {t(lang, capacityKey[fac.capacityStatus])}
            </span>
            {fac.selectionStatus === 'capacity_changed' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-yellow-100 text-yellow-700">
                {t(lang, 'scCapacityChanged')}
              </span>
            )}
            {fac.selectionStatus === 'newly_available' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-blue-100 text-blue-700">
                {t(lang, 'scNewlyAvailable')}
              </span>
            )}
            {isExternal && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 font-medium">
                {t(lang, 'noRating')}
              </span>
            )}
          </div>
        </div>
        {fac.note && <div className="ml-5.5 mt-1 text-[10px] text-blue-600 italic">{fac.note}</div>}
      </div>

      {showRating && ratingRef.current && (
        <FixedTooltip anchorRef={ratingRef}>
          <RatingPopup detail={{ quality: fac.rating === 'A' ? 92 : 75, delivery: fac.rating === 'A' ? 88 : 70, price: fac.rating === 'A' ? 85 : 78, cooperation: fac.rating === 'A' ? 90 : 72 }} />
        </FixedTooltip>
      )}
      {showCapacity && capacityRef.current && (
        <FixedTooltip anchorRef={capacityRef}>
          <CapacityPopup detail={{
            window: fac.capacityStatus === 'full' ? 'Closed' : fac.capacityStatus === 'tight' ? 'Aug 15 – Sep 30' : 'Jul 1 – Nov 30',
            availableLines: fac.capacityStatus === 'full' ? 0 : fac.capacityStatus === 'tight' ? 2 : 5,
            totalLines: 8,
          }} />
        </FixedTooltip>
      )}
    </>
  );
}

interface ScDetailPageProps {
  scId: string;
  scList: SalesContract[];
  onUpdateSc: (scId: string, updates: Partial<SalesContract>) => void;
  navigate: (r: Route) => void;
}

export default function ScDetailPage({ scId, scList, onUpdateSc, navigate }: ScDetailPageProps) {
  const { lang } = useLang();
  const sc = scList.find((s) => s.id === scId);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(
    sc?.factorySelections.find((f) => f.selected)?.factoryId ?? null
  );
  const [refreshing, setRefreshing] = useState(false);
  const [allFactories, setAllFactories] = useState<FactorySelection[] | null>(null);
  const [showPushSuccess, setShowPushSuccess] = useState(false);

  if (!sc) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center text-brand-gray">
        Sales Order not found
      </div>
    );
  }

  const opSelectedIds = new Set(sc.factorySelections.filter((f) => f.selected).map((f) => f.factoryId));
  const displayFactories = allFactories ?? sc.factorySelections;
  const opSelected = displayFactories.filter((f) => opSelectedIds.has(f.factoryId));
  const selectable = displayFactories.filter((f) => !opSelectedIds.has(f.factoryId));
  const selectedFactory = displayFactories.find((f) => f.factoryId === selectedFactoryId);

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

  const handlePush = () => {
    if (!selectedFactory || selectedFactory.capacityStatus === 'full') return;
    onUpdateSc(scId, { status: 'pushed' });
    setShowPushSuccess(true);
    setTimeout(() => setShowPushSuccess(false), 5000);
  };

  const pushDisabled = sc.status !== 'pending' || !selectedFactoryId || !selectedFactory || selectedFactory.capacityStatus === 'full';

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate({ page: 'sc' })}
        className="text-sm text-brand-brown hover:underline flex items-center gap-1 mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t(lang, 'scDetailBack')}
      </button>

      {/* SC Info Card */}
      <div className="bg-white rounded-xl border border-brand-border shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-brand-dark">
            {sc.id}
          </h2>
          <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${scStatusColor[sc.status]}`}>
            {t(lang, scStatusLabel[sc.status])}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
          <div>
            <span className="text-xs text-brand-gray block">{t(lang, 'scTableOpId')}</span>
            <span className="font-medium text-brand-brown">{sc.opId}</span>
          </div>
          <div>
            <span className="text-xs text-brand-gray block">{t(lang, 'opFormBrand')}</span>
            <span className="font-medium text-brand-dark">
              <span className="text-brand-gray font-mono text-[10px] mr-1">{sc.brandCode}</span>
              {sc.brand}
            </span>
          </div>
          <div>
            <span className="text-xs text-brand-gray block">{t(lang, 'opFormCategory')}</span>
            <span className="font-medium text-brand-warm">{sc.productCategory}</span>
          </div>
          <div>
            <span className="text-xs text-brand-gray block">{t(lang, 'scTableQty')}</span>
            <span className="font-medium">{sc.totalQty.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-xs text-brand-gray block">{t(lang, 'scTableAmount')}</span>
            <span className="font-medium text-brand-brown">{formatAmount(sc.totalAmount)}</span>
          </div>
          <div>
            <span className="text-xs text-brand-gray block">{t(lang, 'scTableExFactory')}</span>
            <span className="font-medium">{formatDate(sc.exFactoryDate, lang)}</span>
          </div>
          <div>
            <span className="text-xs text-brand-gray block">{t(lang, 'opFormAM')}</span>
            <span className="font-medium">{sc.accountManager}</span>
          </div>
          <div>
            <span className="text-xs text-brand-gray block">{t(lang, 'opFormCoo')}</span>
            <span className="font-medium">{sc.coo.join(', ')}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm pt-4 border-t border-gray-100">
          <div>
            <span className="text-xs text-brand-gray block">{t(lang, 'scTradeTerm')}</span>
            <span className="font-medium">{sc.tradeTerm}</span>
          </div>
          <div>
            <span className="text-xs text-brand-gray block">{t(lang, 'scShipMode')}</span>
            <span className="font-medium">{sc.shipMode}</span>
          </div>
          <div>
            <span className="text-xs text-brand-gray block">{t(lang, 'scPaymentTerm')}</span>
            <span className="font-medium">{sc.paymentTerm}</span>
          </div>
          <div>
            <span className="text-xs text-brand-gray block">{t(lang, 'scSeason')}</span>
            <span className="font-medium">{sc.season}</span>
          </div>
          <div>
            <span className="text-xs text-brand-gray block">{t(lang, 'scDropship')}</span>
            <span className="font-medium">{sc.dropshipDest}</span>
          </div>
        </div>
      </div>

      {/* Style & PO Details */}
      {sc.styles.length > 0 && (
        <div className="bg-white rounded-xl border border-brand-border shadow-sm p-6 mb-6">
          <h3 className="text-base font-semibold text-brand-dark mb-4">
            {t(lang, 'scDetailStyleSection')}
          </h3>
          <StyleTable sc={sc} />
        </div>
      )}

      {/* Factory Selection */}
      <div className="bg-white rounded-xl border border-brand-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-brand-dark">
            {t(lang, 'scFactorySelection')}
          </h3>
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

        {/* OP-selected factories (reference only) */}
        {opSelected.length > 0 && (
          <div className="mb-4">
            <div className="text-[10px] text-brand-gray uppercase tracking-wider mb-1.5">
              {t(lang, 'scOpSelected')}
            </div>
            <div className="space-y-1.5">
              {opSelected.map((fac) => (
                <div key={fac.factoryId} className="border border-brand-brown/30 rounded-lg p-2.5 bg-brand-brown/5">
                  <FactoryRow fac={fac} isSelected={false} onSelect={() => {}} showRadio={false} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selectable factories */}
        <div className="space-y-1.5">
          {selectable.map((fac) => (
            <FactoryRow
              key={fac.factoryId}
              fac={fac}
              isSelected={fac.factoryId === selectedFactoryId}
              onSelect={() => setSelectedFactoryId(fac.factoryId === selectedFactoryId ? null : fac.factoryId)}
              showRadio
            />
          ))}
        </div>

        {/* Push to Factory button */}
        {sc.status === 'pending' && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            {pushDisabled && selectedFactory?.capacityStatus === 'full' && (
              <p className="text-xs text-yellow-700 mb-2">{t(lang, 'scDetailPushDisabled')}</p>
            )}
            <button
              onClick={handlePush}
              disabled={pushDisabled}
              className="w-full py-2.5 rounded-lg bg-brand-brown text-white font-medium hover:bg-brand-brown/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {t(lang, 'scPushToFactory')}
            </button>
          </div>
        )}
      </div>

      {/* Success toast */}
      {showPushSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg shadow-lg text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t(lang, 'scDetailPushSuccess')}
          </div>
        </div>
      )}
    </div>
  );
}
