export type ProductCategory = 
  | 'Sembako' 
  | 'Minuman' 
  | 'Rokok' 
  | 'Snack' 
  | 'Toiletries' 
  | 'Gas & Air' 
  | 'Lainnya';

export type ProductUnit = 'pcs' | 'renteng' | 'dus' | 'kg' | 'liter' | 'slop' | 'tabung' | 'galon';

export type PaymentMethod = 'Tunai' | 'QRIS' | 'Transfer' | 'Kasbon';

export type CreditStatus = 'Belum Lunas' | 'Cicil' | 'Lunas';

export interface Product {
  product_id: string; // PRD-YYMMDD-###
  barcode: string;
  name: string;
  category: ProductCategory;
  unit: ProductUnit;
  price_retail: number;
  price_bundle: number;
  bundle_qty: number;
  price_wholesale: number;
  wholesale_qty: number;
  cost_price: number; // Harga Modal
  stock: number;
  min_stock: number;
  expiry_date: string; // YYYY-MM-DD
  active: boolean;
}

export interface Customer {
  customer_id: string; // PLG-YYMMDD-###
  name: string;
  phone: string;
  address: string;
  credit_limit: number;
  notes: string;
  current_balance?: number; // total unpaid kasbon
}

export interface CartItem {
  product: Product;
  qty: number;
  applied_price: number;
  tier_name: 'Eceran' | 'Paket/Bundle' | 'Grosir';
  subtotal: number;
}

export interface SaleItemJson {
  product_id: string;
  name: string;
  unit: string;
  qty: number;
  price: number;
  cost_price: number;
  tier: string;
  subtotal: number;
}

export interface Sale {
  trx_id: string; // TRX-YYMMDD-###
  datetime: string; // ISO string
  cashier: string;
  customer_id: string;
  customer_name?: string;
  items_json: string; // JSON string of SaleItemJson[]
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  change: number;
  method: PaymentMethod;
  status: 'Selesai' | 'Batal';
}

export interface Credit {
  credit_id: string; // KSB-YYMMDD-###
  customer_id: string;
  customer_name?: string;
  trx_id: string;
  amount: number;
  paid_amount: number;
  due_date: string;
  status: CreditStatus;
  last_reminder: string;
}

export interface StockMove {
  move_id: string; // MOV-YYMMDD-###
  date: string;
  product_id: string;
  product_name?: string;
  type: 'IN' | 'OUT' | 'ADJUST' | 'SALE';
  qty: number;
  cost_price: number;
  note: string;
  user: string;
}

export interface User {
  username: string;
  password_hash: string;
  salt: string;
  role: 'Owner' | 'Kasir';
  full_name: string;
  active: boolean;
}

export interface AppSettings {
  BUSINESS_NAME: string;
  LOGO_URL: string;
  WHATSAPP: string;
  TAX_PERCENT: number;
  AI_ENABLED: boolean;
  AI_BASE_URL?: string;
  AI_MODEL?: string;
  LICENSE_KEY?: string;
}

export interface LogAI {
  timestamp: string;
  user: string;
  feature: 'Saran Kulakan' | 'Pesan Tagih Halus' | 'Cerita Omzet Hari Ini';
  status: 'SUCCESS' | 'FALLBACK' | 'ERROR';
  details?: string;
}
