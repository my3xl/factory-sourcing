export type SupplierType = 'internal' | 'external';

export type CapacityStatus = 'available' | 'tight' | 'full';

export type FactoryRating = 'A' | 'B' | 'C';

export interface Factory {
  id: string;
  name: string;
  code: string;
  supplierType: SupplierType;
  rating?: FactoryRating;           // Only for internal
  location: string;                 // e.g. "Dongguan, China"
  country: string;
  productCategories: string[];      // e.g. ["Woven Shirt", "Blazer"]
  hscodes?: string[];               // Only for external
  servedBrands?: string[];          // Mainly for external, from BOL
  orderVolume?: string;             // e.g. "~500K pcs/year" — external from BOL
  capacityStatus?: CapacityStatus;  // Only for internal
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
