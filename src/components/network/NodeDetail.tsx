import type { GraphNode, GraphEdge, NodeType } from '../../types/network';
import { useLang } from '../../context/LanguageContext';
import { t, type TranslationKey } from '../../locales';

interface NodeDetailProps {
  node: GraphNode | null;
  links: GraphEdge[];
  allNodes: GraphNode[];
}

const typeLabels: Record<NodeType, TranslationKey> = {
  factory_internal: 'networkDetailFactory',
  factory_external: 'networkDetailFactory',
  category: 'networkDetailCategory',
  order: 'networkDetailOrder',
  brand: 'networkDetailBrand',
};

const typeBadgeColor: Record<NodeType, string> = {
  factory_internal: 'bg-brand-brown/10 text-brand-brown',
  factory_external: 'bg-blue-50 text-blue-700',
  category: 'bg-gray-100 text-brand-warm',
  order: 'bg-gray-100 text-brand-dark',
  brand: 'bg-yellow-50 text-yellow-800',
};

export default function NodeDetail({ node, links, allNodes }: NodeDetailProps) {
  const { lang } = useLang();

  if (!node) {
    return (
      <div className="w-[280px] shrink-0 border-l border-gray-200 bg-white p-5 flex items-center justify-center">
        <p className="text-sm text-brand-gray italic">{t(lang, 'networkSelectHint')}</p>
      </div>
    );
  }

  // Find neighbors
  const neighborIds = new Set<string>();
  const neighborLinks: GraphEdge[] = [];
  for (const l of links) {
    const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
    const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;
    if (srcId === node.id) {
      neighborIds.add(tgtId as string);
      neighborLinks.push(l);
    }
    if (tgtId === node.id) {
      neighborIds.add(srcId as string);
      neighborLinks.push(l);
    }
  }

  const neighbors = allNodes.filter((n) => neighborIds.has(n.id));
  const byType = (type: NodeType) => neighbors.filter((n) => n.type === type);

  const ratingColor = (r?: string) =>
    r === 'A' ? 'bg-brand-brown/10 text-brand-brown' : r === 'B' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-600';

  return (
    <div className="w-[280px] shrink-0 border-l border-gray-200 bg-white p-5 overflow-y-auto">
      {/* Header */}
      <div className="mb-4">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeBadgeColor[node.type]}`}>
          {t(lang, typeLabels[node.type])}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-brand-dark mb-3 leading-snug">{node.label}</h3>

      {/* Factory-specific */}
      {node.type === 'factory_internal' && (
        <div className="space-y-2 mb-4">
          {node.factoryCode && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-brand-gray">{t(lang, 'networkDetailCode')}</span>
              <span className="text-xs font-mono font-medium text-brand-dark">{node.factoryCode}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-brand-gray">Rating</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${ratingColor(node.rating)}`}>
              {node.rating}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-brand-gray">Capacity</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              node.capacityStatus === 'available' ? 'bg-green-50 text-green-700' :
              node.capacityStatus === 'tight' ? 'bg-yellow-50 text-yellow-700' :
              'bg-red-50 text-red-700'
            }`}>
              {node.capacityStatus}
            </span>
          </div>
        </div>
      )}

      {node.type === 'factory_external' && (
        <div className="space-y-2 mb-4">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">External Supplier</span>
          {node.capacityStatus && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-brand-gray">Capacity</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 font-medium">
                {node.capacityStatus}
              </span>
            </div>
          )}
        </div>
      )}

      {node.type === 'order' && node.orderCount && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-brand-gray">{node.orderType === 'SC' ? 'Sales Contracts' : 'Bills of Lading'}</span>
            <span className="text-xs font-semibold text-brand-dark">{node.orderCount}</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
            node.orderType === 'SC' ? 'bg-brand-brown/10 text-brand-brown' : 'bg-blue-50 text-blue-700'
          }`}>
            {node.orderType === 'SC' ? 'Internal' : 'External'}
          </span>
        </div>
      )}

      {node.type === 'brand' && node.brandCode && (
        <div className="mb-4">
          <span className="text-[10px] text-brand-gray">Code</span>
          <span className="text-xs font-mono font-medium text-brand-dark ml-2">{node.brandCode}</span>
        </div>
      )}

      {/* Related nodes */}
      <div className="space-y-3 pt-3 border-t border-gray-100">
        {node.type.startsWith('factory') && (
          <>
            {byType('category').length > 0 && (
              <div>
                <h5 className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider mb-1">
                  {t(lang, 'networkRelatedCategories')}
                </h5>
                <div className="flex flex-wrap gap-1">
                  {byType('category').map((n) => (
                    <span key={n.id} className="text-[10px] px-2 py-0.5 rounded bg-gray-50 text-brand-warm">
                      {n.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {byType('order').length > 0 && (
              <div>
                <h5 className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider mb-1">
                  {t(lang, 'networkRelatedOrders')} ({byType('order').length})
                </h5>
                <div className="space-y-0.5">
                  {byType('order').map((n) => (
                    <div key={n.id} className="text-[10px] text-brand-dark">{n.label}</div>
                  ))}
                </div>
              </div>
            )}
            {byType('brand').length > 0 && (
              <div>
                <h5 className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider mb-1">
                  {t(lang, 'networkServedBrands')}
                </h5>
                <div className="flex flex-wrap gap-1">
                  {byType('brand').map((n) => (
                    <span key={n.id} className="text-[10px] px-2 py-0.5 rounded bg-yellow-50 text-yellow-800">
                      {n.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {node.type === 'category' && (
          <>
            {byType('factory_internal').length + byType('factory_external').length > 0 && (
              <div>
                <h5 className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider mb-1">
                  {t(lang, 'networkRelatedFactories')} ({byType('factory_internal').length + byType('factory_external').length})
                </h5>
                <div className="space-y-0.5">
                  {[...byType('factory_internal'), ...byType('factory_external')].map((n) => (
                    <div key={n.id} className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${n.type === 'factory_internal' ? 'bg-brand-brown' : 'bg-blue-500'}`} />
                      <span className="text-[10px] text-brand-dark">{n.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {byType('order').length > 0 && (
              <div>
                <h5 className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider mb-1">
                  {t(lang, 'networkRelatedOrders')} ({byType('order').length})
                </h5>
                <div className="space-y-0.5">
                  {byType('order').map((n) => (
                    <div key={n.id} className="text-[10px] text-brand-dark">{n.label}</div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {node.type === 'order' && (
          <>
            {byType('factory_internal').length + byType('factory_external').length > 0 && (
              <div>
                <h5 className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider mb-1">
                  {t(lang, 'networkRelatedFactories')} ({byType('factory_internal').length + byType('factory_external').length})
                </h5>
                <div className="space-y-0.5">
                  {[...byType('factory_internal'), ...byType('factory_external')].map((n) => (
                    <div key={n.id} className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${n.type === 'factory_internal' ? 'bg-brand-brown' : 'bg-blue-500'}`} />
                      <span className="text-[10px] text-brand-dark">{n.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {byType('brand').length > 0 && (
              <div>
                <h5 className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider mb-1">
                  Brand
                </h5>
                <div className="space-y-0.5">
                  {byType('brand').map((n) => (
                    <div key={n.id} className="text-[10px] text-brand-dark">{n.label}</div>
                  ))}
                </div>
              </div>
            )}
            {byType('category').length > 0 && (
              <div>
                <h5 className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider mb-1">
                  {t(lang, 'networkRelatedCategories')}
                </h5>
                <div className="flex flex-wrap gap-1">
                  {byType('category').map((n) => (
                    <span key={n.id} className="text-[10px] px-2 py-0.5 rounded bg-gray-50 text-brand-warm">
                      {n.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {node.type === 'brand' && (
          <>
            {byType('order').length > 0 && (
              <div>
                <h5 className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider mb-1">
                  {t(lang, 'networkRelatedOrders')} ({byType('order').length})
                </h5>
                <div className="space-y-0.5">
                  {byType('order').map((n) => (
                    <div key={n.id} className="text-[10px] text-brand-dark">{n.label}</div>
                  ))}
                </div>
              </div>
            )}
            {byType('factory_internal').length + byType('factory_external').length > 0 && (
              <div>
                <h5 className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider mb-1">
                  {t(lang, 'networkRelatedFactories')} ({byType('factory_internal').length + byType('factory_external').length})
                </h5>
                <div className="space-y-0.5">
                  {[...byType('factory_internal'), ...byType('factory_external')].map((n) => (
                    <div key={n.id} className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${n.type === 'factory_internal' ? 'bg-brand-brown' : 'bg-blue-500'}`} />
                      <span className="text-[10px] text-brand-dark">{n.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="text-[10px] text-brand-gray">
          {t(lang, 'networkDetailConnections')}: {neighborIds.size}
        </div>
      </div>
    </div>
  );
}
