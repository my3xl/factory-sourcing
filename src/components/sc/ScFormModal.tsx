import { useState } from 'react';
import type { SalesContract, TradeTerm, ShipMode } from '../../types/salesContract';
import { scTemplates } from '../../data/salesContracts';
import { opportunities } from '../../data/opportunities';
import { useLang } from '../../context/LanguageContext';
import { t } from '../../locales';

interface ScFormModalProps {
  onClose: () => void;
  onCreateSc: (sc: SalesContract) => void;
}

const tradeTermOptions: TradeTerm[] = ['FOB', 'DDP', 'CIF'];
const shipModeOptions: ShipMode[] = ['Sea', 'Air', 'Express'];

export default function ScFormModal({ onClose, onCreateSc }: ScFormModalProps) {
  const { lang } = useLang();
  const [selectedOpId, setSelectedOpId] = useState('');
  const [template, setTemplate] = useState<Omit<SalesContract, 'id'> | null>(null);

  const handleOpSelect = (opId: string) => {
    setSelectedOpId(opId);
    const tmpl = scTemplates[opId];
    if (tmpl) {
      setTemplate(tmpl);
    } else {
      const op = opportunities.find((o) => o.id === opId);
      if (op) {
        setTemplate({
          opId: op.id,
          brand: op.brand,
          brandCode: op.brandCode,
          productCategory: op.productCategory,
          coo: op.coo,
          totalQty: op.qty,
          totalAmount: Math.round(op.unitPrice * op.qty),
          exFactoryDate: op.exFactoryDate,
          accountManager: op.accountManager,
          status: 'pending',
          styles: [],
          tradeTerm: 'FOB',
          shipMode: 'Sea',
          dropshipDest: '',
          paymentTerm: 'Net 60',
          season: 'FW25',
          factorySelections: [],
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;
    const newId = `810SC${String(Math.floor(Math.random() * 900000) + 100000)}`;
    onCreateSc({ id: newId, ...template });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-brand-dark">{t(lang, 'scNewTitle')}</h2>
            <button onClick={onClose} className="text-brand-gray hover:text-brand-dark">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* OP ID selection */}
            <div>
              <label className="block text-xs font-medium text-brand-dark mb-1.5">{t(lang, 'scNewOpId')}</label>
              <select
                value={selectedOpId}
                onChange={(e) => handleOpSelect(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-brown/30 focus:border-brand-brown"
              >
                <option value="">{t(lang, 'scNewSelectOp')}</option>
                {opportunities.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.opNumber} — {op.brandCode} {op.brand} ({op.productCategory})
                  </option>
                ))}
              </select>
            </div>

            {/* Pre-filled fields (read-only summary) */}
            {template && (
              <div className="space-y-3 p-4 bg-brand-cream/50 rounded-lg border border-brand-border">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-brand-gray">{t(lang, 'opFormBrand')}</span>
                    <p className="font-medium text-brand-dark">
                      <span className="text-brand-gray font-mono text-[10px] mr-1">{template.brandCode}</span>
                      {template.brand}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-brand-gray">{t(lang, 'opFormCategory')}</span>
                    <p className="font-medium text-brand-warm">{template.productCategory}</p>
                  </div>
                  <div>
                    <span className="text-xs text-brand-gray">{t(lang, 'scTableQty')}</span>
                    <p className="font-medium">{template.totalQty.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-xs text-brand-gray">{t(lang, 'scTableAmount')}</span>
                    <p className="font-medium text-brand-brown">${(template.totalAmount / 1000).toFixed(1)}K</p>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                  <div>
                    <label className="block text-xs font-medium text-brand-dark mb-1">{t(lang, 'scNewTradeTerm')}</label>
                    <select
                      value={template.tradeTerm}
                      onChange={(e) => setTemplate({ ...template, tradeTerm: e.target.value as TradeTerm })}
                      className="w-full px-2 py-1.5 rounded border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
                    >
                      {tradeTermOptions.map((tt) => <option key={tt} value={tt}>{tt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-dark mb-1">{t(lang, 'scNewShipMode')}</label>
                    <select
                      value={template.shipMode}
                      onChange={(e) => setTemplate({ ...template, shipMode: e.target.value as ShipMode })}
                      className="w-full px-2 py-1.5 rounded border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
                    >
                      {shipModeOptions.map((sm) => <option key={sm} value={sm}>{sm}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-dark mb-1">{t(lang, 'scNewPaymentTerm')}</label>
                    <input
                      type="text"
                      value={template.paymentTerm}
                      onChange={(e) => setTemplate({ ...template, paymentTerm: e.target.value })}
                      className="w-full px-2 py-1.5 rounded border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-dark mb-1">{t(lang, 'scNewSeason')}</label>
                    <input
                      type="text"
                      value={template.season}
                      onChange={(e) => setTemplate({ ...template, season: e.target.value })}
                      className="w-full px-2 py-1.5 rounded border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-brand-dark mb-1">{t(lang, 'scNewDropship')}</label>
                    <input
                      type="text"
                      value={template.dropshipDest}
                      onChange={(e) => setTemplate({ ...template, dropshipDest: e.target.value })}
                      className="w-full px-2 py-1.5 rounded border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-brown/30"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!template}
              className="w-full py-2.5 rounded-lg bg-brand-brown text-white font-medium hover:bg-brand-brown/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {t(lang, 'scNewSubmit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
