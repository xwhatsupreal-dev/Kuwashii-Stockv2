export interface StockItem {
  id: string;
  game?: 'AOTR' | 'ASTD' | 'ROV';
  name: string;
  category: 'Serum' | 'Bloodline' | 'Skin' | 'Artifact' | 'Scroll/Key' | 'Perk' | 'Starter Accounts' | 'High Level / PvP' | 'Rare Units' | 'Gems / Currency' | 'Rank Boosting' | 'Bundle Offers' | 'Gifts / Codes' | 'Other Services' | 'สุ่มตัวละคร - ออสตา' | 'ไอดี ROV' | 'คูปอง ROV' | 'รับปั้มแรงค์ ROV' | 'Other';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  quantity: number;
  initialQuantity?: number;
  piecesPerUnit?: number;
  price: number; // in Thai Baht
  description: string;
  imageUrl?: string;
  imageUrls?: string[];
  isPinned?: boolean;
  isPopular?: boolean;
  gachaPool?: { id: string; name: string; color?: string; guaranteedAtStock?: number; guaranteedAtStocks?: number[]; }[];
  accountCredentials?: string[]; 
  updatedAt: string;
}

export interface PurchaseRecord {
  id: string;
  itemId: string;
  itemName: string;
  price: number;
  quantity?: number;
  date: string;
  gachaDrops?: { name: string; color?: string; }[];
  credentialData?: string; 
  game?: string;
}

export interface TopupRecord {
  id: string;
  amount: number;
  date: string;
  method?: string;
  refCode?: string;
  game?: string;
}

export interface UserData {
  username: string;
  email?: string;
  password?: string;
  avatar?: string;
  balance: number;
  balance_rov?: number;
  joinDate: string;
  purchases: PurchaseRecord[];
  topups?: TopupRecord[];
  purchaseCount?: number;
  topupCount?: number;
}

export type CategoryFilter = 'all' | StockItem['category'];
export type RarityFilter = 'all' | StockItem['rarity'];
export type StockStatusFilter = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
