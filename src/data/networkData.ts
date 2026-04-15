import type { GraphNode, GraphEdge, TimeRange } from '../types/network';
import { matchResults } from './factories';
import { opportunities } from './opportunities';
import { salesContracts } from './salesContracts';

// Time range cutoffs (which OPs/factories are visible)
const timeRanges: Record<TimeRange, string[]> = {
  FW24: ['OP-003', 'OP-007'],
  SS25: ['OP-002', 'OP-003', 'OP-005', 'OP-006', 'OP-007', 'OP-008', 'OP-010'],
  FW25: ['OP-001', 'OP-002', 'OP-003', 'OP-004', 'OP-005', 'OP-006', 'OP-007', 'OP-008', 'OP-009', 'OP-010', 'OP-011'],
};

// Simulated BoL counts for external factories (from customs data)
const bolCounts: Record<string, number> = {
  'X-001': 6, 'X-002': 3, 'X-003': 4, 'X-004': 2,
  'X-005': 5, 'X-006': 2, 'X-007': 7, 'X-008': 3,
  'X-009': 2, 'X-010': 5, 'X-011': 3, 'X-012': 4, 'X-013': 3,
};

// AI Sourcing external factories
const sourcingFactories: GraphNode[] = [
  { id: 'fac:XS-001', label: 'Chiang Mai Knit Co.', shortLabel: 'CMK', type: 'factory_external', capacityStatus: 'available', timestamp: new Date('2025-07-28').getTime() },
  { id: 'fac:XS-002', label: 'Izmir Textile Group', shortLabel: 'ITG', type: 'factory_external', capacityStatus: 'available', timestamp: new Date('2025-07-28').getTime() },
  { id: 'fac:XS-003', label: 'Sofia Garment Alliance', shortLabel: 'SGA', type: 'factory_external', capacityStatus: 'available', timestamp: new Date('2025-07-28').getTime() },
  { id: 'fac:XS-004', label: 'Colombo Weave Mills', shortLabel: 'CWM', type: 'factory_external', capacityStatus: 'tight', timestamp: new Date('2025-07-28').getTime() },
  { id: 'fac:XS-005', label: 'Yangon Stitch Works', shortLabel: 'YSW', type: 'factory_external', capacityStatus: 'available', timestamp: new Date('2025-07-28').getTime() },
  { id: 'fac:XS-006', label: 'Addis Cotton Craft', shortLabel: 'ACC', type: 'factory_external', capacityStatus: 'available', timestamp: new Date('2025-07-28').getTime() },
  { id: 'fac:XS-007', label: 'Monterrey Apparel MX', shortLabel: 'MAM', type: 'factory_external', capacityStatus: 'available', timestamp: new Date('2025-07-28').getTime() },
  { id: 'fac:XS-008', label: 'Da Nang Outerwear Ltd', shortLabel: 'DNO', type: 'factory_external', capacityStatus: 'available', timestamp: new Date('2025-07-28').getTime() },
];

// Sourcing factory → category edges
const sourcingEdges: GraphEdge[] = [
  { source: 'fac:XS-001', target: 'cat:Knit Polo', relation: 'produces' },
  { source: 'fac:XS-001', target: 'cat:Fleece Hoodie', relation: 'produces' },
  { source: 'fac:XS-002', target: 'cat:Woven Shirt', relation: 'produces' },
  { source: 'fac:XS-002', target: 'cat:Chino Pants', relation: 'produces' },
  { source: 'fac:XS-003', target: 'cat:Suit', relation: 'produces' },
  { source: 'fac:XS-003', target: 'cat:Wool Blazer', relation: 'produces' },
  { source: 'fac:XS-004', target: 'cat:Trench Coat', relation: 'produces' },
  { source: 'fac:XS-004', target: 'cat:Down Jacket', relation: 'produces' },
  { source: 'fac:XS-005', target: 'cat:Chino Pants', relation: 'produces' },
  { source: 'fac:XS-005', target: 'cat:Woven Shirt', relation: 'produces' },
  { source: 'fac:XS-006', target: 'cat:Fleece Hoodie', relation: 'produces' },
  { source: 'fac:XS-006', target: 'cat:Knit Polo', relation: 'produces' },
  { source: 'fac:XS-007', target: 'cat:Leather Jacket', relation: 'produces' },
  { source: 'fac:XS-007', target: 'cat:Chino Pants', relation: 'produces' },
  { source: 'fac:XS-008', target: 'cat:Down Jacket', relation: 'produces' },
  { source: 'fac:XS-008', target: 'cat:Trench Coat', relation: 'produces' },
];

// Sourcing factory → brand edges
const sourcingBrandEdges: GraphEdge[] = [
  { source: 'fac:XS-001', target: 'brand:ADS', relation: 'serves' },
  { source: 'fac:XS-001', target: 'brand:SPX', relation: 'serves' },
  { source: 'fac:XS-002', target: 'brand:BDN', relation: 'serves' },
  { source: 'fac:XS-002', target: 'brand:BON', relation: 'serves' },
  { source: 'fac:XS-003', target: 'brand:TBT', relation: 'serves' },
  { source: 'fac:XS-003', target: 'brand:TSD', relation: 'serves' },
  { source: 'fac:XS-004', target: 'brand:HDS', relation: 'serves' },
  { source: 'fac:XS-005', target: 'brand:RMW', relation: 'serves' },
  { source: 'fac:XS-006', target: 'brand:SPX', relation: 'serves' },
  { source: 'fac:XS-007', target: 'brand:ALS', relation: 'serves' },
  { source: 'fac:XS-008', target: 'brand:BEG', relation: 'serves' },
];

// Sourcing BoL counts
const sourcingBolCounts: Record<string, number> = {
  'XS-001': 4, 'XS-002': 6, 'XS-003': 3, 'XS-004': 2,
  'XS-005': 5, 'XS-006': 3, 'XS-007': 8, 'XS-008': 4,
};

export function buildGraphData(timeRange: TimeRange, includeSourcing: boolean): { nodes: GraphNode[], links: GraphEdge[] } {
  const visibleOps = timeRanges[timeRange];
  const nodeMap = new Map<string, GraphNode>();
  const links: GraphEdge[] = [];

  const addNode = (n: GraphNode) => {
    if (!nodeMap.has(n.id)) nodeMap.set(n.id, n);
  };

  // 1. Add brand nodes
  const brands = new Map<string, { name: string; code: string }>();
  for (const op of opportunities) {
    if (!visibleOps.includes(op.id)) continue;
    if (!brands.has(op.brandCode)) {
      brands.set(op.brandCode, { name: op.brand, code: op.brandCode });
    }
  }
  for (const [, b] of brands) {
    addNode({
      id: `brand:${b.code}`,
      label: b.name,
      shortLabel: b.code,
      type: 'brand',
      brandCode: b.code,
      timestamp: 0,
    });
  }

  // 2. Add category nodes
  const categories = new Set<string>();
  for (const op of opportunities) {
    if (!visibleOps.includes(op.id)) continue;
    categories.add(op.productCategory);
  }
  for (const cat of categories) {
    addNode({
      id: `cat:${cat}`,
      label: cat,
      shortLabel: cat.length > 10 ? cat.slice(0, 8) + '..' : cat,
      type: 'category',
      category: cat,
      timestamp: 0,
    });
  }

  // 3. Add factory nodes + order nodes (aggregated per factory)
  for (const opId of visibleOps) {
    const result = matchResults[opId];
    if (!result) continue;

    const allFactories = [
      ...result.internalWithCapacity,
      ...result.internalNoCapacity,
      ...result.external,
    ];

    for (const f of allFactories) {
      const isExternal = f.supplierType === 'external';
      const facNodeId = `fac:${f.id}`;
      addNode({
        id: facNodeId,
        label: f.name,
        shortLabel: isExternal ? f.name.split(' ').map(w => w[0]).join('').slice(0, 3) : (f.code ?? f.name.slice(0, 4)),
        type: isExternal ? 'factory_external' : 'factory_internal',
        rating: isExternal ? undefined : f.rating,
        capacityStatus: isExternal ? 'available' : (f.capacityStatus as 'available' | 'tight' | 'full'),
        factoryCode: isExternal ? undefined : f.code,
        timestamp: 0,
      });

      // factory → category edges
      for (const cat of f.productCategories) {
        if (categories.has(cat)) {
          links.push({ source: facNodeId, target: `cat:${cat}`, relation: 'produces' });
        }
      }

      // external factory → served brands
      if (isExternal && 'servedBrands' in f && f.servedBrands) {
        for (const sb of f.servedBrands as string[]) {
          let foundCode: string | undefined;
          for (const [code, val] of brands) {
            if (val.name === sb) { foundCode = code; break; }
          }
          if (foundCode) {
            links.push({ source: facNodeId, target: `brand:${foundCode}`, relation: 'serves' });
          }
        }
      }
    }
  }

  // 4. Create aggregated order nodes per factory
  // Internal: count SCs; External: count BoLs
  const factoryOrderCount = new Map<string, { count: number; orderType: 'SC' | 'BoL'; brands: Set<string>; categories: Set<string> }>();

  // Count SCs per internal factory
  for (const sc of salesContracts) {
    const op = opportunities.find((o) => o.id === sc.opId);
    if (!op || !visibleOps.includes(sc.opId)) continue;
    for (const fs of sc.factorySelections) {
      const facId = `fac:${fs.factoryId}`;
      if (!factoryOrderCount.has(facId)) {
        factoryOrderCount.set(facId, { count: 0, orderType: 'SC', brands: new Set(), categories: new Set() });
      }
      const entry = factoryOrderCount.get(facId)!;
      entry.count++;
      entry.brands.add(sc.brandCode);
      entry.categories.add(sc.productCategory);
      // Also add edge: factory → SC order node
    }
  }

  // Count OP matches per factory (for factories without SCs, count OP matches)
  for (const opId of visibleOps) {
    const result = matchResults[opId];
    if (!result) continue;
    const op = opportunities.find((o) => o.id === opId)!;

    const allFacs = [...result.internalWithCapacity, ...result.internalNoCapacity, ...result.external];
    for (const f of allFacs) {
      const facId = `fac:${f.id}`;
      const isExternal = f.supplierType === 'external';

      if (!factoryOrderCount.has(facId)) {
        if (isExternal) {
          factoryOrderCount.set(facId, {
            count: bolCounts[f.id] ?? 1,
            orderType: 'BoL',
            brands: new Set(),
            categories: new Set(),
          });
        } else {
          factoryOrderCount.set(facId, {
            count: 0,
            orderType: 'SC',
            brands: new Set(),
            categories: new Set(),
          });
        }
      }
      const entry = factoryOrderCount.get(facId)!;
      entry.brands.add(op.brandCode);
      entry.categories.add(op.productCategory);
    }
  }

  // Create order nodes and edges
  for (const [facId, data] of factoryOrderCount) {
    if (data.count === 0 && data.orderType === 'SC') {
      // Internal factory with no SCs yet — count matched OPs
      let opCount = 0;
      for (const opId of visibleOps) {
        const result = matchResults[opId];
        if (!result) continue;
        const allFacs = [...result.internalWithCapacity, ...result.internalNoCapacity];
        if (allFacs.some(f => `fac:${f.id}` === facId)) opCount++;
      }
      data.count = opCount;
      if (data.count === 0) continue; // Skip factories with no orders
    }

    const orderNodeId = facId.replace('fac:', 'order:');
    const countLabel = data.orderType === 'SC' ? `${data.count} SC` : `${data.count} BoL`;
    addNode({
      id: orderNodeId,
      label: countLabel,
      shortLabel: String(data.count),
      type: 'order',
      orderCount: data.count,
      orderType: data.orderType,
      timestamp: 0,
    });

    // order → factory
    links.push({ source: orderNodeId, target: facId, relation: 'from_factory' });
    // order → brands
    for (const bCode of data.brands) {
      links.push({ source: orderNodeId, target: `brand:${bCode}`, relation: 'for_brand' });
    }
    // order → categories
    for (const cat of data.categories) {
      if (nodeMap.has(`cat:${cat}`)) {
        links.push({ source: orderNodeId, target: `cat:${cat}`, relation: 'for_category' });
      }
    }
  }

  // 5. AI Sourcing nodes + edges
  if (includeSourcing) {
    for (const sn of sourcingFactories) {
      addNode(sn);
    }
    // Create order nodes for sourcing factories
    for (const sf of sourcingFactories) {
      const rawId = sf.id.replace('fac:', '');
      const bolCount = sourcingBolCounts[rawId] ?? 2;
      const orderNodeId = `order:${rawId}`;
      addNode({
        id: orderNodeId,
        label: `${bolCount} BoL`,
        shortLabel: String(bolCount),
        type: 'order',
        orderCount: bolCount,
        orderType: 'BoL',
        timestamp: new Date('2025-07-28').getTime(),
      });
      links.push({ source: orderNodeId, target: sf.id, relation: 'from_factory' });
    }
    for (const se of sourcingEdges) {
      if (nodeMap.has(se.target)) {
        links.push(se);
      }
    }
    for (const be of sourcingBrandEdges) {
      if (nodeMap.has(be.target)) {
        // Also create order→brand edge for sourcing
        const rawFacId = be.source.replace('fac:', '');
        const orderNodeId = `order:${rawFacId}`;
        links.push({ source: orderNodeId, target: be.target, relation: 'for_brand' });
      }
    }
    // Sourcing order → category edges
    for (const se of sourcingEdges) {
      const rawFacId = se.source.replace('fac:', '');
      const orderNodeId = `order:${rawFacId}`;
      if (nodeMap.has(se.target) && nodeMap.has(orderNodeId)) {
        links.push({ source: orderNodeId, target: se.target, relation: 'for_category' });
      }
    }
  }

  // Deduplicate links
  const seen = new Set<string>();
  const uniqueLinks = links.filter((l) => {
    const key = `${l.source}|${l.target}|${l.relation}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { nodes: Array.from(nodeMap.values()), links: uniqueLinks };
}
