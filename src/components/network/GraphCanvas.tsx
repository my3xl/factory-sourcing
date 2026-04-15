import { useRef, useCallback, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { GraphNode, GraphEdge, NodeType } from '../../types/network';

interface FGNode extends GraphNode {
  x: number;
  y: number;
  __bckgDimensions?: number[];
}

interface GraphCanvasProps {
  nodes: GraphNode[];
  links: GraphEdge[];
  selectedNodes: string[];
  visibleTypes: Set<NodeType>;
  onSelectNode: (id: string | null) => void;
}

const typeFillColors: Record<NodeType, string> = {
  factory_internal: '#F0DFD5',
  factory_external: '#D6E8F7',
  category: '#E8E4E3',
  order: '#E8E5E3',
  brand: '#F5ECD8',
};

const typeStrokeColors: Record<NodeType, string> = {
  factory_internal: '#A2674F',
  factory_external: '#1E73BE',
  category: '#534D4F',
  order: '#32373C',
  brand: '#8B6914',
};

const baseSizes: Record<NodeType, number> = {
  factory_internal: 8,
  factory_external: 7,
  category: 6,
  order: 5,
  brand: 7,
};

function getNodeSize(n: GraphNode): number {
  if (n.type === 'order' && n.orderCount) {
    // Scale: count 1→6, 2→8, 3→10, 4→11, 5→12, 7→14, 8→15
    return Math.max(baseSizes.order, 4 + n.orderCount * 1.5);
  }
  return baseSizes[n.type];
}

function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r, y);
  ctx.closePath();
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number) {
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, radius);
  ctx.closePath();
}

export default function GraphCanvas({ nodes, links, selectedNodes, visibleTypes, onSelectNode }: GraphCanvasProps) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 600 });

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setDims({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compute highlighted set
  const highlightedNodes = new Set<string>();
  if (selectedNodes.length > 0) {
    for (const sid of selectedNodes) {
      highlightedNodes.add(sid);
      for (const l of links) {
        const srcId = (typeof l.source === 'object' ? (l.source as any).id : l.source) as string;
        const tgtId = (typeof l.target === 'object' ? (l.target as any).id : l.target) as string;
        if (srcId === sid) highlightedNodes.add(tgtId);
        if (tgtId === sid) highlightedNodes.add(srcId);
      }
    }
  }

  const hasSelection = selectedNodes.length > 0;

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const n = node as FGNode;
    if (!visibleTypes.has(n.type)) {
      n.__bckgDimensions = [0, 0];
      return;
    }

    const isHighlighted = !hasSelection || highlightedNodes.has(n.id);
    const opacity = isHighlighted ? 1 : 0.15;
    const size = getNodeSize(n);
    const fillColor = typeFillColors[n.type];
    const strokeColor = typeStrokeColors[n.type];

    ctx.globalAlpha = opacity;

    // Draw shape based on type
    if (n.type === 'brand') {
      drawHexagon(ctx, n.x, n.y, size);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    } else if (n.type === 'order') {
      drawDiamond(ctx, n.x, n.y, size);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    } else if (n.type === 'category') {
      const label = n.shortLabel || n.label;
      const fontSize = Math.max(8 / globalScale, 2);
      ctx.font = `500 ${fontSize}px sans-serif`;
      const tw = ctx.measureText(label).width + 6 / globalScale;
      const th = fontSize + 4 / globalScale;
      drawRoundedRect(ctx, n.x, n.y, tw, th, 2 / globalScale);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    } else {
      // Factory: circle
      ctx.beginPath();
      ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();
      if (n.type === 'factory_external') {
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    // Label
    const showLabel = globalScale > 0.6 || isHighlighted;
    if (showLabel) {
      const fontSize = Math.max(9 / globalScale, 3);
      ctx.font = `600 ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let label = '';
      if (n.type === 'factory_internal') {
        label = n.factoryCode || n.shortLabel;
      } else if (n.type === 'factory_external') {
        label = n.shortLabel;
      } else if (n.type === 'order') {
        label = n.label; // e.g. "3 SC" or "5 BoL"
      } else {
        label = n.shortLabel || n.label;
      }

      const labelY = n.type === 'category'
        ? n.y
        : n.type === 'order'
          ? n.y  // center label in diamond
          : n.y + size + fontSize;

      ctx.fillStyle = isHighlighted ? '#32373C' : '#999';
      ctx.fillText(label, n.x, labelY);

      // Rating badge for internal factories
      if (n.type === 'factory_internal' && n.rating && isHighlighted) {
        const badgeSize = fontSize * 0.6;
        ctx.font = `700 ${badgeSize}px sans-serif`;
        ctx.fillStyle = n.rating === 'A' ? '#A2674F' : '#8B6914';
        const bx = n.x + size + badgeSize * 0.5;
        const by = n.y - size - badgeSize * 0.3;
        // Draw badge background
        ctx.beginPath();
        ctx.arc(bx, by, badgeSize * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = n.rating === 'A' ? '#A2674F' : '#8B6914';
        ctx.fill();
        // Draw rating letter
        ctx.fillStyle = '#fff';
        ctx.fillText(n.rating, bx, by);
      }
    }

    ctx.globalAlpha = 1;
    const pointerSize = size + 4;
    n.__bckgDimensions = [pointerSize * 2, pointerSize * 2];
  }, [visibleTypes, hasSelection, highlightedNodes]);

  const nodePointerAreaPaint = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    const n = node as FGNode;
    const size = getNodeSize(n) + 6;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const linkColor = useCallback((link: any) => {
    if (!hasSelection) return 'rgba(99,99,99,0.15)';
    const srcId = typeof link.source === 'object' ? link.source.id : link.source;
    const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
    const related = selectedNodes.includes(srcId) || selectedNodes.includes(tgtId);
    return related ? 'rgba(162,103,79,0.6)' : 'rgba(99,99,99,0.04)';
  }, [hasSelection, selectedNodes]);

  const linkWidth = useCallback((link: any) => {
    if (!hasSelection) return 0.5;
    const srcId = typeof link.source === 'object' ? link.source.id : link.source;
    const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
    const related = selectedNodes.includes(srcId) || selectedNodes.includes(tgtId);
    return related ? 1.5 : 0.2;
  }, [hasSelection, selectedNodes]);

  // Center and fit after simulation stops
  const handleEngineStop = useCallback(() => {
    const fg = fgRef.current;
    if (fg) {
      fg.zoomToFit(0, 40);
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <ForceGraph2D
        ref={fgRef}
        width={dims.width}
        height={dims.height}
        graphData={{ nodes, links }}
        nodeId="id"
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={nodePointerAreaPaint}
        onNodeClick={(node: any) => {
          const n = node as GraphNode;
          if (visibleTypes.has(n.type)) {
            onSelectNode(n.id);
          }
        }}
        onBackgroundClick={() => onSelectNode(null)}
        linkColor={linkColor}
        linkWidth={linkWidth}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={0.9}
        linkDirectionalArrowColor={() => 'rgba(162,103,79,0.3)'}
        backgroundColor="transparent"
        cooldownTicks={300}
        onEngineStop={handleEngineStop}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        warmupTicks={80}
      />
    </div>
  );
}
