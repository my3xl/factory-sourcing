export type NodeType = 'factory_internal' | 'factory_external' | 'category' | 'order' | 'brand';

export interface GraphNode {
  id: string;
  label: string;
  shortLabel: string;
  type: NodeType;
  rating?: string;
  capacityStatus?: string;
  factoryCode?: string;
  status?: string;
  brandCode?: string;
  category?: string;
  timestamp: number;
  orderCount?: number;      // SC count (internal) or BoL count (external)
  orderType?: 'SC' | 'BoL'; // type of order count
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
}

export type TimeRange = 'FW24' | 'SS25' | 'FW25';
