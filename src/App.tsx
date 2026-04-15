import { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { useLang } from './context/LanguageContext';
import { t } from './locales';
import Header from './components/layout/Header';
import OpListPage from './components/op/OpListPage';
import ScListPage from './components/sc/ScListPage';

type Page = 'op' | 'sc';

function Nav({ current, onChange }: { current: Page; onChange: (p: Page) => void }) {
  const { lang } = useLang();
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
      <button
        onClick={() => onChange('op')}
        className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
          current === 'op' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-gray hover:text-brand-dark'
        }`}
      >
        {t(lang, 'navOp')}
      </button>
      <button
        onClick={() => onChange('sc')}
        className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
          current === 'sc' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-gray hover:text-brand-dark'
        }`}
      >
        {t(lang, 'navSc')}
      </button>
    </div>
  );
}

function AppContent() {
  const [page, setPage] = useState<Page>('op');
  return (
    <div className="min-h-screen bg-brand-cream">
      <Header>
        <Nav current={page} onChange={setPage} />
      </Header>
      {page === 'op' ? <OpListPage /> : <ScListPage />}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
