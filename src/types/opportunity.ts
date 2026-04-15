export type OpStatus = 'open' | 'in_progress' | 'won' | 'lost';
export type MatchStatus = 'matched' | 'sourcing_needed' | 'no_match';

export interface Opportunity {
  id: string;
  opNumber: string;           // OP-XXX for SC association
  brand: string;
  brandCode: string;
  productCategory: string;
  coo: string[];
  unitPrice: number;
  qty: number;
  exFactoryDate: string;
  accountManager: string;
  status: OpStatus;
  createdAt: string;
  matchStatus: MatchStatus;
  matchedAt: string;
  matchedCount: number;
  selectedFactoryIds?: string[];
}
