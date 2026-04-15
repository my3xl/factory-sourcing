export type SCStatus = 'pending' | 'factory_confirmed' | 'pushed' | 'in_production' | 'shipped';

export type TradeTerm = 'FOB' | 'DDP' | 'CIF';

export type ShipMode = 'Sea' | 'Air' | 'Express';

export interface ColorwayPO {
  colorName: string;
  colorCode: string;
  poQty: Record<string, number>;    // size -> qty
}

export interface Style {
  styleId: string;                   // PLM style number
  styleName: string;
  colorways: ColorwayPO[];
  sizeRange: string[];               // e.g. ["XS","S","M","L","XL"]
}

export type FactorySelectionStatus = 'confirmed' | 'capacity_changed' | 'newly_available';

export interface FactorySelection {
  factoryId: string;
  factoryName: string;
  factoryCode: string;
  supplierType: 'internal' | 'external';
  rating?: string;
  capacityStatus: 'available' | 'tight' | 'full';
  selectionStatus: FactorySelectionStatus;
  selected: boolean;
  note?: string;                     // e.g. "Capacity changed from Available to Full"
}

export interface SalesContract {
  id: string;                        // e.g. "810SC031371"
  opId: string;                      // linked OP
  brand: string;
  brandCode: string;
  productCategory: string;
  coo: string[];
  totalQty: number;
  totalAmount: number;               // USD
  exFactoryDate: string;
  accountManager: string;
  status: SCStatus;
  styles: Style[];
  tradeTerm: TradeTerm;
  shipMode: ShipMode;
  dropshipDest: string;
  paymentTerm: string;
  season: string;
  factorySelections: FactorySelection[];
}
