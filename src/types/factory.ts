export type SupplierType = 'internal' | 'external';

export type CapacityStatus = 'available' | 'tight' | 'full';

export type FactoryRating = 'A' | 'B' | 'C';

export interface RatingDetail {
  quality: number;       // 0-100
  delivery: number;      // 0-100
  price: number;         // 0-100
  cooperation: number;   // 0-100
}

export interface CapacityDetail {
  window: string;        // e.g. "Aug 1 - Sep 15, 2025"
  availableLines: number;
  totalLines: number;
}

export interface Factory {
  id: string;
  name: string;
  code?: string;                   // 5-char internal code, only for internal
  supplierType: SupplierType;
  rating?: FactoryRating;           // Only for internal
  ratingDetail?: RatingDetail;      // Score breakdown for tooltip
  location: string;                 // e.g. "Dongguan, China"
  country: string;
  productCategories: string[];      // e.g. ["Woven Shirt", "Blazer"]
  hscodes?: string[];               // Only for external
  servedBrands?: string[];          // Mainly for external, from BOL
  orderVolume?: string;             // e.g. "~500K pcs/year" — external from BOL
  capacityStatus?: CapacityStatus;  // Only for internal
  capacityDetail?: CapacityDetail;  // Window info for tooltip
  matchScore: number;               // 0-100
  matchReasons: string[];           // e.g. ["Category match", "COO match"]
  lastActivity?: string;            // ISO date — last order or BOL record
}

export interface OpMatchResult {
  opId: string;
  internalWithCapacity: Factory[];
  internalNoCapacity: Factory[];
  external: Factory[];
}
