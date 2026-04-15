import { useState } from 'react';
import type { Opportunity } from '../../types/opportunity';
import type { Route } from '../../App';
import { useLang } from '../../context/LanguageContext';
import { t } from '../../locales';

interface OpFormPageProps {
  navigate: (r: Route) => void;
  onCreateOp: (formData: Partial<Opportunity>) => string;
}

const categoryOptions = [
  'Fleece Hoodie', 'Silk Blouse', 'Woven Shirt', 'Knit Polo', 'Wool Blazer',
  'Trench Coat', 'Chino Pants', 'Denim Jacket', 'Leather Jacket', 'Cashmere Sweater',
];

const cooOptions = [
  'Vietnam', 'Cambodia', 'China', 'Bangladesh', 'Indonesia',
  'India', 'Portugal', 'Italy', 'Turkey', 'Romania',
];

const amOptions = ['Vince', 'Sarah', 'Michael', 'Lisa', 'David'];

export default function OpFormPage({ navigate, onCreateOp }: OpFormPageProps) {
  const { lang } = useLang();
  const [showSuccess, setShowSuccess] = useState(false);

  const [brand, setBrand] = useState('');
  const [brandCode, setBrandCode] = useState('');
  const [category, setCategory] = useState('');
  const [coo, setCoo] = useState<string[]>([]);
  const [unitPrice, setUnitPrice] = useState('');
  const [qty, setQty] = useState('');
  const [exFactoryDate, setExFactoryDate] = useState('');
  const [am, setAm] = useState('');

  const toggleCoo = (c: string) => {
    setCoo((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = onCreateOp({
      brand: brand || 'New Brand',
      brandCode: brandCode || 'NEW',
      productCategory: category || 'Fleece Hoodie',
      coo: coo.length > 0 ? coo : ['Vietnam'],
      unitPrice: unitPrice ? parseFloat(unitPrice) : 10,
      qty: qty ? parseInt(qty) : 10000,
      exFactoryDate: exFactoryDate || '2025-10-15',
      accountManager: am || 'Vince',
    });
    setShowSuccess(true);
    setTimeout(() => {
      navigate({ page: 'op-detail', opId: newId });
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="bg-white rounded-xl border border-brand-border shadow-sm p-10">
          <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-brand-dark mb-2">{t(lang, 'opFormSuccess')}</h3>
          <p className="text-sm text-brand-gray">{t(lang, 'opDetailMatching')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <button
        onClick={() => navigate({ page: 'op' })}
        className="text-sm text-brand-brown hover:underline flex items-center gap-1 mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t(lang, 'opDetailBack')}
      </button>

      <div className="bg-white rounded-xl border border-brand-border shadow-sm p-8">
        <h2 className="text-xl font-semibold text-brand-dark mb-6">{t(lang, 'opFormTitle')}</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Brand & Code */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-brand-dark mb-1.5">{t(lang, 'opFormBrand')}</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-brown/30 focus:border-brand-brown"
                placeholder="e.g. ZARA"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-dark mb-1.5">{t(lang, 'opFormBrandCode')}</label>
              <input
                type="text"
                value={brandCode}
                onChange={(e) => setBrandCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-brown/30 focus:border-brand-brown"
                placeholder="e.g. ZRA"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-brand-dark mb-1.5">{t(lang, 'opFormCategory')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-brown/30 focus:border-brand-brown"
            >
              <option value="">—</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* COO */}
          <div>
            <label className="block text-xs font-medium text-brand-dark mb-1.5">{t(lang, 'opFormCoo')}</label>
            <div className="flex flex-wrap gap-2">
              {cooOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCoo(c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    coo.includes(c)
                      ? 'border-brand-brown bg-brand-brown/10 text-brand-brown font-medium'
                      : 'border-gray-200 text-brand-gray hover:border-gray-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Price & Qty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-dark mb-1.5">{t(lang, 'opFormUnitPrice')}</label>
              <input
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-brown/30 focus:border-brand-brown"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-dark mb-1.5">{t(lang, 'opFormQty')}</label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-brown/30 focus:border-brand-brown"
                placeholder="0"
              />
            </div>
          </div>

          {/* ExFactory Date & AM */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-dark mb-1.5">{t(lang, 'opFormExFactory')}</label>
              <input
                type="date"
                value={exFactoryDate}
                onChange={(e) => setExFactoryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-brown/30 focus:border-brand-brown"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-dark mb-1.5">{t(lang, 'opFormAM')}</label>
              <select
                value={am}
                onChange={(e) => setAm(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-brown/30 focus:border-brand-brown"
              >
                <option value="">—</option>
                {amOptions.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-brand-brown text-white font-medium hover:bg-brand-brown/90 transition-colors text-sm"
            >
              {t(lang, 'opFormSubmit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
