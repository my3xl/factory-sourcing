import { useState, useEffect } from 'react';

// Fixed-position tooltip that renders at viewport level to avoid overflow clipping
export function FixedTooltip({ anchorRef, children }: { anchorRef: React.RefObject<HTMLElement | null>; children: React.ReactNode }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    });
  }, [anchorRef]);

  if (!pos) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: `calc(100vh - ${pos.top}px)`,
        left: pos.left,
        transform: 'translateX(-50%)',
        zIndex: 99999,
        pointerEvents: 'none',
      }}
    >
      {children}
    </div>
  );
}

export function RatingPopup({ detail }: { detail: { quality: number; delivery: number; price: number; cooperation: number } }) {
  const items = [
    { label: 'Quality', value: detail.quality },
    { label: 'Delivery', value: detail.delivery },
    { label: 'Price', value: detail.price },
    { label: 'Cooperation', value: detail.cooperation },
  ];
  return (
    <div className="w-48 bg-brand-dark text-white rounded-lg p-3 text-xs shadow-2xl">
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-brand-dark rotate-45" />
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

export function CapacityPopup({ detail }: { detail: { window: string; availableLines: number; totalLines: number } }) {
  return (
    <div className="w-52 bg-brand-dark text-white rounded-lg p-3 text-xs shadow-2xl">
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

// Color maps shared between OP and SC
export const capacityColor: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  tight: 'bg-yellow-100 text-yellow-700',
  full: 'bg-red-100 text-red-600',
};

export const capacityKey: Record<string, 'capacityAvailable' | 'capacityTight' | 'capacityFull'> = {
  available: 'capacityAvailable',
  tight: 'capacityTight',
  full: 'capacityFull',
};

export const ratingColor: Record<string, string> = {
  A: 'bg-brand-brown text-white',
  B: 'bg-brand-warm text-white',
  C: 'bg-gray-400 text-white',
};
