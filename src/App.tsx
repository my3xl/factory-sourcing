import { useState, useCallback } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { useLang } from './context/LanguageContext';
import { t } from './locales';
import Header from './components/layout/Header';
import OpListPage from './components/op/OpListPage';
import OpFormPage from './components/op/OpFormPage';
import OpDetailPage from './components/op/OpDetailPage';
import ScListPage from './components/sc/ScListPage';
import { opportunities as initialOpportunities } from './data/opportunities';
import { matchResults as staticMatchResults } from './data/factories';
import type { Opportunity, MatchStatus } from './types/opportunity';
import type { OpMatchResult } from './types/factory';

export type Route =
  | { page: 'op' }
  | { page: 'sc' }
  | { page: 'op-form' }
  | { page: 'op-detail'; opId: string };

const sampleOpIds = Object.keys(staticMatchResults);

function Nav({ current, onChange }: { current: 'op' | 'sc'; onChange: (p: 'op' | 'sc') => void }) {
  const { lang } = useLang();
  return (
    <div className="flex gap-1 bg-white/10 rounded-lg p-0.5">
      <button
        onClick={() => onChange('op')}
        className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
          current === 'op' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
        }`}
      >
        {t(lang, 'navOp')}
      </button>
      <button
        onClick={() => onChange('sc')}
        className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
          current === 'sc' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
        }`}
      >
        {t(lang, 'navSc')}
      </button>
    </div>
  );
}

function AppContent() {
  const [route, setRoute] = useState<Route>({ page: 'op' });
  const [opList, setOpList] = useState<Opportunity[]>(initialOpportunities);
  const [dynamicMatches, setDynamicMatches] = useState<Record<string, OpMatchResult>>({});
  const [sampleIdx, setSampleIdx] = useState(0);

  const navigate = useCallback((r: Route) => setRoute(r), []);

  const handleCreateOp = useCallback((formData: Partial<Opportunity>) => {
    const sourceOpId = sampleOpIds[sampleIdx % sampleOpIds.length];
    setSampleIdx((i) => i + 1);
    const sourceOp = initialOpportunities.find((o) => o.id === sourceOpId) ?? initialOpportunities[0];

    const newId = `OP-${Date.now().toString().slice(-5)}`;
    const opNum = `OP-${String(Date.now()).slice(-3)}`;

    const newOp: Opportunity = {
      ...sourceOp,
      ...formData,
      id: newId,
      opNumber: opNum,
      status: 'open',
      createdAt: new Date().toISOString(),
      matchStatus: 'sourcing_needed' as MatchStatus,
      matchedAt: '',
      matchedCount: 0,
      selectedFactoryIds: [],
    };

    setOpList((prev) => [newOp, ...prev]);
    setDynamicMatches((prev) => ({
      ...prev,
      [newId]: { ...staticMatchResults[sourceOpId], opId: newId },
    }));

    return newId;
  }, [sampleIdx]);

  const handleUpdateOp = useCallback((opId: string, updates: Partial<Opportunity>) => {
    setOpList((prev) =>
      prev.map((op) => (op.id === opId ? { ...op, ...updates } : op))
    );
  }, []);

  const handleMatchDone = useCallback((opId: string) => {
    const sourceSampleId = sampleOpIds[0];
    const matchResult = staticMatchResults[sourceSampleId];
    const count = matchResult
      ? matchResult.internalWithCapacity.length + matchResult.internalNoCapacity.length + matchResult.external.length
      : 0;

    setOpList((prev) =>
      prev.map((op) =>
        op.id === opId
          ? {
              ...op,
              matchStatus: (count > 0 ? 'matched' : 'sourcing_needed') as MatchStatus,
              matchedAt: new Date().toISOString(),
              matchedCount: count,
            }
          : op
      )
    );
  }, []);

  return (
    <div className="min-h-screen bg-brand-cream">
      <Header>
        {route.page === 'sc' ? (
          <Nav current="sc" onChange={(p) => navigate({ page: p })} />
        ) : (
          <Nav current="op" onChange={(p) => navigate({ page: p })} />
        )}
      </Header>
      {route.page === 'op' && (
        <OpListPage
          opList={opList}
          dynamicMatches={dynamicMatches}
          navigate={navigate}
        />
      )}
      {route.page === 'op-form' && (
        <OpFormPage
          navigate={navigate}
          onCreateOp={handleCreateOp}
        />
      )}
      {route.page === 'op-detail' && (
        <OpDetailPage
          opId={route.opId}
          opList={opList}
          dynamicMatches={dynamicMatches}
          onUpdateOp={handleUpdateOp}
          onMatchDone={handleMatchDone}
          navigate={navigate}
        />
      )}
      {route.page === 'sc' && <ScListPage />}
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
