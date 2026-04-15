import type { Factory, CapacityStatus } from '../../types/factory';
import { useLang } from '../../context/LanguageContext';
import { t } from '../../locales';

const capacityColor: Record<CapacityStatus, string> = {
  available: 'bg-green-100 text-green-700',
  tight: 'bg-yellow-100 text-yellow-700',
  full: 'bg-red-100 text-red-600',
};

const capacityKey: Record<CapacityStatus, 'capacityAvailable' | 'capacityTight' | 'capacityFull'> = {
  available: 'capacityAvailable',
  tight: 'capacityTight',
  full: 'capacityFull',
};

const ratingColor: Record<string, string> = {
  A: 'bg-brand-brown text-white',
  B: 'bg-brand-warm text-white',
  C: 'bg-gray-400 text-white',
};

function RatingTooltip({ detail }: { detail: { quality: number; delivery: number; price: number; cooperation: number } }) {
  const items = [
    { label: 'Quality', value: detail.quality },
    { label: 'Delivery', value: detail.delivery },
    { label: 'Price', value: detail.price },
    { label: 'Cooperation', value: detail.cooperation },
  ];
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-brand-dark text-white rounded-lg p-3 text-xs shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      style={{ zIndex: 9999 }}
    >
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-2 bg-brand-dark rotate-45" />
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-2">
            <span className="text-white/70">{item.label}</span>
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.value >= 80 ? 'bg-green-400' : item.value >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
              <span className="w-7 text-right font-medium">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CapacityTooltip({ detail }: { detail: { window: string; availableLines: number; totalLines: number } }) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-brand-dark text-white rounded-lg p-3 text-xs shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      style={{ zIndex: 9999 }}
    >
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-2 bg-brand-dark rotate-45" />
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span className="text-white/70">Window</span>
          <span className="font-medium">{detail.window}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Lines</span>
          <span className="font-medium">{detail.availableLines} / {detail.totalLines} available</span>
        </div>
      </div>
    </div>
  );
}

interface FactoryCardProps {
  factory: Factory;
  selected: boolean;
  onToggleSelect: () => void;
}

export default function FactoryCard({ factory, selected, onToggleSelect }: FactoryCardProps) {
  const { lang } = useLang();
  const isExternal = factory.supplierType === 'external';

  return (
    <div className={`border rounded-lg p-3 text-sm transition-colors overflow-visible ${
      selected ? 'border-brand-brown bg-brand-brown/5' : 'border-gray-200 bg-white'
    }`}>
      {/* Row 1: Name + Score + Badges */}
      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="w-4 h-4 rounded border-gray-300 text-brand-brown focus:ring-brand-brown cursor-pointer"
        />
        <span className="font-medium text-brand-dark">{factory.name}</span>
        {factory.code && (
          <span className="text-xs text-brand-gray font-mono">{factory.code}</span>
        )}

        {/* Match score */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-brand-gray">{t(lang, 'matchScore')}</span>
          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${factory.matchScore >= 80 ? 'bg-green-500' : factory.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-400'}`}
              style={{ width: `${factory.matchScore}%` }}
            />
          </div>
          <span className="text-xs font-medium">{factory.matchScore}%</span>
        </div>

        {/* Rating badge with tooltip — internal only */}
        {factory.rating && !isExternal && (
          <div className="relative group">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium cursor-default ${ratingColor[factory.rating]}`}>
              {factory.rating}
            </span>
            {factory.ratingDetail && <RatingTooltip detail={factory.ratingDetail} />}
          </div>
        )}

        {/* Capacity badge with tooltip — internal only */}
        {factory.capacityStatus && !isExternal && (
          <div className="relative group">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium cursor-default ${capacityColor[factory.capacityStatus]}`}>
              {t(lang, capacityKey[factory.capacityStatus])}
            </span>
            {factory.capacityDetail && <CapacityTooltip detail={factory.capacityDetail} />}
          </div>
        )}

        {/* External: gray "No Rating" + "Capacity Unknown" */}
        {isExternal && (
          <>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 font-medium">
              {t(lang, 'noRating')}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 font-medium">
              {t(lang, 'capacityUnknown')}
            </span>
          </>
        )}
      </div>

      {/* Row 2: Details */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-gray ml-6">
        <span>{t(lang, 'location')}: {factory.location}</span>
        <span>{t(lang, 'categories')}: {factory.productCategories.join(', ')}</span>
        {isExternal && factory.hscodes && (
          <span>{t(lang, 'hscodes')}: {factory.hscodes.join(', ')}</span>
        )}
        {isExternal && factory.servedBrands && (
          <span>{t(lang, 'servedBrands')}: {factory.servedBrands.join(', ')}</span>
        )}
        {isExternal && factory.orderVolume && (
          <span>{t(lang, 'orderVolume')}: {factory.orderVolume}</span>
        )}
      </div>

      {/* Row 3: Match reasons */}
      <div className="flex flex-wrap gap-1 mt-1.5 ml-6">
        {factory.matchReasons.map((reason, i) => (
          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-brand-gray">
            {reason}
          </span>
        ))}
      </div>

      {/* External pending note */}
      {isExternal && (
        <div className="ml-6 mt-1.5 text-[10px] text-gray-400 italic">
          {t(lang, 'externalPendingNote')}
        </div>
      )}
    </div>
  );
}
