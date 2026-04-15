import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { NodeType, TimeRange } from '../../types/network';
import { buildGraphData } from '../../data/networkData';
import { useLang } from '../../context/LanguageContext';
import { t } from '../../locales';
import GraphCanvas from './GraphCanvas';
import FilterPanel from './FilterPanel';
import NodeDetail from './NodeDetail';

export default function NetworkPage() {
  const { lang } = useLang();

  const [visibleTypes, setVisibleTypes] = useState<Set<NodeType>>(
    new Set(['factory_internal', 'factory_external', 'category', 'order', 'brand'])
  );
  const [timeRange, setTimeRange] = useState<TimeRange>('FW25');
  const [sourcingComplete, setSourcingComplete] = useState(false);
  const [sourcingActive, setSourcingActive] = useState(false);
  const [sourcingPhase, setSourcingPhase] = useState(0);
  const [sourcingFoundCount, setSourcingFoundCount] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showSourcingSuccess, setShowSourcingSuccess] = useState(false);

  const sourcingTimer = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      sourcingTimer.current.forEach(clearTimeout);
    };
  }, []);

  const handleSourcingStart = useCallback(() => {
    setSourcingActive(true);
    setSourcingPhase(1);
    setSourcingFoundCount(0);

    // Phase 1: Sourcing... (2s)
    const t1 = setTimeout(() => {
      setSourcingPhase(2);
    }, 2000);

    // Phase 2: Analyzing... (2s)
    const t2 = setTimeout(() => {
      setSourcingPhase(3);
      setSourcingFoundCount(8);
    }, 4000);

    // Phase 3: Done (1s)
    const t3 = setTimeout(() => {
      setSourcingActive(false);
      setSourcingComplete(true);
      setShowSourcingSuccess(true);
    }, 5000);

    // Hide success toast after 4s
    const t4 = setTimeout(() => {
      setShowSourcingSuccess(false);
    }, 9000);

    sourcingTimer.current = [t1, t2, t3, t4];
  }, []);

  const handleToggleType = useCallback((type: NodeType) => {
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  // Build graph data
  const fullData = useMemo(
    () => buildGraphData(timeRange, sourcingComplete),
    [timeRange, sourcingComplete]
  );

  // Filter by visible types
  const filteredData = useMemo(() => {
    const visibleIds = new Set(fullData.nodes.filter((n) => visibleTypes.has(n.type)).map((n) => n.id));
    return {
      nodes: fullData.nodes.filter((n) => visibleTypes.has(n.type)),
      links: fullData.links.filter((l) => {
        const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;
        return visibleIds.has(srcId as string) && visibleIds.has(tgtId as string);
      }),
    };
  }, [fullData, visibleTypes]);

  const selectedNodes = selectedNodeId ? [selectedNodeId] : [];
  const selectedGraphNode = selectedNodeId
    ? fullData.nodes.find((n) => n.id === selectedNodeId) ?? null
    : null;

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-4">
      <h2 className="text-lg font-semibold text-brand-dark mb-3">
        {t(lang, 'networkTitle')}
      </h2>
      <div className="flex rounded-xl border border-brand-border shadow-sm overflow-hidden bg-brand-cream/30" style={{ height: 'calc(100vh - 140px)' }}>
        <FilterPanel
          visibleTypes={visibleTypes}
          onToggleType={handleToggleType}
          timeRange={timeRange}
          onTimeChange={setTimeRange}
          sourcingActive={sourcingActive}
          sourcingComplete={sourcingComplete}
          onSourcingStart={handleSourcingStart}
          sourcingPhase={sourcingPhase}
          sourcingFoundCount={sourcingFoundCount}
        />
        <div className="flex-1 bg-white relative">
          {/* Node count badge */}
          <div className="absolute bottom-3 right-3 z-10 bg-white/90 border border-gray-200 rounded-lg px-3 py-1.5 text-[10px] text-brand-gray shadow-sm">
            {t(lang, 'networkNodeCount', { count: filteredData.nodes.length })}
          </div>
          <GraphCanvas
            nodes={filteredData.nodes}
            links={filteredData.links}
            selectedNodes={selectedNodes}
            visibleTypes={visibleTypes}
            onSelectNode={setSelectedNodeId}
          />
        </div>
        <NodeDetail
          node={selectedGraphNode}
          links={filteredData.links}
          allNodes={filteredData.nodes}
        />
      </div>

      {/* Sourcing success toast */}
      {showSourcingSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg shadow-lg text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t(lang, 'networkSourcingSuccess', { count: 8 })}
          </div>
        </div>
      )}
    </div>
  );
}
