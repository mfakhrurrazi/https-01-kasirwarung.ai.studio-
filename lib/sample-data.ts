import { Product, Customer, Sale, Credit, StockMove, AppSettings, User } from './types';

export const INITIAL_SETTINGS: AppSettings = {
  BUSINESS_NAME: 'Warung Sembako Berkah Jaya',
  LOGO_URL: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=120&auto=format&fit=crop&q=80',
  WHATSAPP: '081234567890',
  TAX_PERCENT: 0,
  AI_ENABLED: true,
  AI_BASE_URL: 'http://43.133.148.28:20128/v1',
  AI_MODEL: 'gpt-3.5-turbo',
  LICENSE_KEY: 'KW-AI-PRO-2026-PIYU-8891'
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    product_id: 'PRD-260926-001',
    barcode: '899999901001',
    name: 'Beras Ramos Setra Ramos 5kg',
    category: 'Sembako',
    unit: 'pcs',
    price_retail: 72000,
    price_bundle: 70000,
    bundle_qty: 3,
    price_wholesale: 68000,
    wholesale_qty: 10,
    cost_price: 64000,
    stock: 24,
    min_stock: 5,
    expiry_date: '2027-06-30',
    active: true
  },
  {
    product_id: 'PRD-260926-002',
    barcode: '899277521001',
    name: 'Minyak Goreng Bimoli Klasik 2L Pouch',
    category: 'Sembako',
    unit: 'pcs',
    price_retail: 38500,
    price_bundle: 37500,
    bundle_qty: 3,
    price_wholesale: 36000,
    wholesale_qty: 6,
    cost_price: 34000,
    stock: 18,
    min_stock: 6,
    expiry_date: '2027-04-15',
    active: true
  },
  {
    product_id: 'PRD-260926-003',
    barcode: '899999901003',
    name: 'Telur Ayam Negeri Fresh 1kg',
    category: 'Sembako',
    unit: 'kg',
    price_retail: 28000,
    price_bundle: 27000,
    bundle_qty: 5,
    price_wholesale: 26000,
    wholesale_qty: 15,
    cost_price: 24500,
    stock: 35,
    min_stock: 10,
    expiry_date: '2026-10-10', // near expiry
    active: true
  },
  {
    product_id: 'PRD-260926-004',
    barcode: '899277511004',
    name: 'Gula Pasir Gulaku Tebu Kuning 1kg',
    category: 'Sembako',
    unit: 'pcs',
    price_retail: 17500,
    price_bundle: 17000,
    bundle_qty: 5,
    price_wholesale: 16200,
    wholesale_qty: 24,
    cost_price: 15500,
    stock: 42,
    min_stock: 10,
    expiry_date: '2027-12-31',
    active: true
  },
  {
    product_id: 'PRD-260926-005',
    barcode: '089686010051',
    name: 'Indomie Goreng Spesial 85g',
    category: 'Snack',
    unit: 'pcs',
    price_retail: 3500,
    price_bundle: 3300,
    bundle_qty: 5,
    price_wholesale: 3050,
    wholesale_qty: 40,
    cost_price: 2900,
    stock: 160,
    min_stock: 40,
    expiry_date: '2027-03-20',
    active: true
  },
  {
    product_id: 'PRD-260926-006',
    barcode: '899277531006',
    name: 'Kopi Kapal Api Special Mix 10x24g',
    category: 'Minuman',
    unit: 'renteng',
    price_retail: 14500,
    price_bundle: 14000,
    bundle_qty: 3,
    price_wholesale: 13500,
    wholesale_qty: 10,
    cost_price: 12500,
    stock: 25,
    min_stock: 6,
    expiry_date: '2027-08-10',
    active: true
  },
  {
    product_id: 'PRD-260926-007',
    barcode: '899999901007',
    name: 'Gas Elpiji 3kg Melon (Isi Ulang)',
    category: 'Gas & Air',
    unit: 'tabung',
    price_retail: 22000,
    price_bundle: 21500,
    bundle_qty: 3,
    price_wholesale: 21000,
    wholesale_qty: 10,
    cost_price: 19500,
    stock: 3, // LOW STOCK!
    min_stock: 5,
    expiry_date: '2030-01-01',
    active: true
  },
  {
    product_id: 'PRD-260926-008',
    barcode: '899999901008',
    name: 'Air Mineral Galon Aqua 19L (Refill)',
    category: 'Gas & Air',
    unit: 'galon',
    price_retail: 20000,
    price_bundle: 19500,
    bundle_qty: 3,
    price_wholesale: 19000,
    wholesale_qty: 5,
    cost_price: 17000,
    stock: 12,
    min_stock: 4,
    expiry_date: '2027-01-01',
    active: true
  },
  {
    product_id: 'PRD-260926-009',
    barcode: '899277541009',
    name: 'Rokok Sampoerna A Mild 16 Batang',
    category: 'Rokok',
    unit: 'pcs',
    price_retail: 34000,
    price_bundle: 33500,
    bundle_qty: 5,
    price_wholesale: 33000,
    wholesale_qty: 10,
    cost_price: 31800,
    stock: 30,
    min_stock: 8,
    expiry_date: '2027-11-15',
    active: true
  },
  {
    product_id: 'PRD-260926-010',
    barcode: '899277551010',
    name: 'Sabun Mandi Batang Lifebuoy Total 10 110g',
    category: 'Toiletries',
    unit: 'pcs',
    price_retail: 5000,
    price_bundle: 4700,
    bundle_qty: 3,
    price_wholesale: 4400,
    wholesale_qty: 12,
    cost_price: 4000,
    stock: 4, // LOW STOCK!
    min_stock: 10,
    expiry_date: '2027-05-18',
    active: true
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    customer_id: 'PLG-260926-001',
    name: 'Pak RT Bambang',
    phone: '081234567801',
    address: 'Jl. Melati No. 12 RT 03/04',
    credit_limit: 500000,
    notes: 'Ketua RT, bayar rutin awal bulan saat arisan',
    current_balance: 120000
  },
  {
    customer_id: 'PLG-260926-002',
    name: 'Bu Siti Warteg Berkah',
    phone: '081398765402',
    address: 'Jl. Raya Samping Pos Ronda',
    credit_limit: 1000000,
    notes: 'Pelanggan kulakan beras & minyak harian, bayar tiap Sabtu',
    current_balance: 340000
  },
  {
    customer_id: 'PLG-260926-003',
    name: 'Mas Joko Bengkel Motor',
    phone: '085712345603',
    address: 'Ruko Depan Lapangan',
    credit_limit: 300000,
    notes: 'Sering beli rokok & kopi, bayar tiap minggu sore',
    current_balance: 65000
  },
  {
    customer_id: 'PLG-260926-004',
    name: 'Bu Mega Laundry Kiloan',
    phone: '081223344504',
    address: 'Gang Mawar 2 No. 5',
    credit_limit: 500000,
    notes: 'Beli sabun & plastik, selalu tertib bayar',
    current_balance: 0
  },
  {
    customer_id: 'PLG-260926-005',
    name: 'Pak Haji Syukur',
    phone: '081188990005',
    address: 'Jl. Cendrawasih Utama No. 1',
    credit_limit: 1500000,
    notes: 'Tokoh masyarakat, sering transfer langsung',
    current_balance: 0
  },
  {
    customer_id: 'PLG-260926-006',
    name: 'Kak Rina Kos Putri',
    phone: '087812998806',
    address: 'Kos Pondok Asri Kamar 3',
    credit_limit: 150000,
    notes: 'Mahasiswi, sering ambil mie & snack, kadang terlambat',
    current_balance: 45000
  },
  {
    customer_id: 'PLG-260926-007',
    name: 'Bang Udin Ojek Online',
    phone: '089677889907',
    address: 'Pangkalan Ojek Pintu Gerbang',
    credit_limit: 100000,
    notes: 'Rokok & kopi saset, bayar saat narik selesai',
    current_balance: 25000
  },
  {
    customer_id: 'PLG-260926-008',
    name: 'Ibu Diah Guru SD',
    phone: '081334455608',
    address: 'Komplek Guru No. 8',
    credit_limit: 600000,
    notes: 'Belanja mingguan keluarga, transfer via QRIS / kasbon gaji',
    current_balance: 180000
  },
  {
    customer_id: 'PLG-260926-009',
    name: 'Pak Slamet Pos Satpam',
    phone: '085299887709',
    address: 'Pos Satpam Blok B',
    credit_limit: 250000,
    notes: 'Ambil kopi & rokok malam hari',
    current_balance: 50000
  },
  {
    customer_id: 'PLG-260926-010',
    name: 'Bu Eni Katering Rumahan',
    phone: '081566778810',
    address: 'Jl. Kenanga No. 20',
    credit_limit: 1200000,
    notes: 'Pesanan telur & minyak saat ada hajatan besar',
    current_balance: 420000
  }
];

export const INITIAL_CREDITS: Credit[] = [
  {
    credit_id: 'KSB-260920-001',
    customer_id: 'PLG-260926-001',
    customer_name: 'Pak RT Bambang',
    trx_id: 'TRX-260920-012',
    amount: 120000,
    paid_amount: 0,
    due_date: '2026-10-01',
    status: 'Belum Lunas',
    last_reminder: '2026-09-25'
  },
  {
    credit_id: 'KSB-260922-002',
    customer_id: 'PLG-260926-002',
    customer_name: 'Bu Siti Warteg Berkah',
    trx_id: 'TRX-260922-019',
    amount: 540000,
    paid_amount: 200000,
    due_date: '2026-09-28',
    status: 'Cicil',
    last_reminder: '2026-09-24'
  },
  {
    credit_id: 'KSB-260923-003',
    customer_id: 'PLG-260926-003',
    customer_name: 'Mas Joko Bengkel Motor',
    trx_id: 'TRX-260923-005',
    amount: 65000,
    paid_amount: 0,
    due_date: '2026-09-27',
    status: 'Belum Lunas',
    last_reminder: '2026-09-25'
  },
  {
    credit_id: 'KSB-260915-004',
    customer_id: 'PLG-260926-006',
    customer_name: 'Kak Rina Kos Putri',
    trx_id: 'TRX-260915-008',
    amount: 45000,
    paid_amount: 0,
    due_date: '2026-09-21', // OVERDUE 5 DAYS
    status: 'Belum Lunas',
    last_reminder: '2026-09-22'
  },
  {
    credit_id: 'KSB-260910-005',
    customer_id: 'PLG-260926-007',
    customer_name: 'Bang Udin Ojek Online',
    trx_id: 'TRX-260910-003',
    amount: 25000,
    paid_amount: 0,
    due_date: '2026-09-14', // OVERDUE 12 DAYS
    status: 'Belum Lunas',
    last_reminder: '2026-09-18'
  },
  {
    credit_id: 'KSB-260924-006',
    customer_id: 'PLG-260926-008',
    customer_name: 'Ibu Diah Guru SD',
    trx_id: 'TRX-260924-015',
    amount: 180000,
    paid_amount: 0,
    due_date: '2026-10-05',
    status: 'Belum Lunas',
    last_reminder: ''
  },
  {
    credit_id: 'KSB-260925-007',
    customer_id: 'PLG-260926-009',
    customer_name: 'Pak Slamet Pos Satpam',
    trx_id: 'TRX-260925-002',
    amount: 50000,
    paid_amount: 0,
    due_date: '2026-09-30',
    status: 'Belum Lunas',
    last_reminder: ''
  },
  {
    credit_id: 'KSB-260921-008',
    customer_id: 'PLG-260926-010',
    customer_name: 'Bu Eni Katering Rumahan',
    trx_id: 'TRX-260921-022',
    amount: 420000,
    paid_amount: 0,
    due_date: '2026-09-29',
    status: 'Belum Lunas',
    last_reminder: '2026-09-24'
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    trx_id: 'TRX-260926-001',
    datetime: '2026-09-26T07:15:00',
    cashier: 'Budi (Kasir)',
    customer_id: '',
    customer_name: 'Pelanggan Umum',
    items_json: JSON.stringify([
      { product_id: 'PRD-260926-006', name: 'Kopi Kapal Api Special Mix', unit: 'renteng', qty: 1, price: 14500, cost_price: 12500, tier: 'Eceran', subtotal: 14500 },
      { product_id: 'PRD-260926-009', name: 'Rokok Sampoerna A Mild 16', unit: 'pcs', qty: 1, price: 34000, cost_price: 31800, tier: 'Eceran', subtotal: 34000 }
    ]),
    subtotal: 48500,
    discount: 0,
    total: 48500,
    paid: 50000,
    change: 1500,
    method: 'Tunai',
    status: 'Selesai'
  },
  {
    trx_id: 'TRX-260926-002',
    datetime: '2026-09-26T08:30:00',
    cashier: 'Budi (Kasir)',
    customer_id: 'PLG-260926-002',
    customer_name: 'Bu Siti Warteg Berkah',
    items_json: JSON.stringify([
      { product_id: 'PRD-260926-001', name: 'Beras Ramos Setra 5kg', unit: 'pcs', qty: 3, price: 70000, cost_price: 64000, tier: 'Paket/Bundle', subtotal: 210000 },
      { product_id: 'PRD-260926-002', name: 'Minyak Bimoli 2L', unit: 'pcs', qty: 3, price: 37500, cost_price: 34000, tier: 'Paket/Bundle', subtotal: 112500 },
      { product_id: 'PRD-260926-003', name: 'Telur Ayam Negeri 1kg', unit: 'kg', qty: 5, price: 27000, cost_price: 24500, tier: 'Paket/Bundle', subtotal: 135000 }
    ]),
    subtotal: 457500,
    discount: 2500,
    total: 455000,
    paid: 455000,
    change: 0,
    method: 'QRIS',
    status: 'Selesai'
  },
  {
    trx_id: 'TRX-260926-003',
    datetime: '2026-09-26T09:45:00',
    cashier: 'Budi (Kasir)',
    customer_id: '',
    customer_name: 'Pelanggan Umum',
    items_json: JSON.stringify([
      { product_id: 'PRD-260926-005', name: 'Indomie Goreng Spesial', unit: 'pcs', qty: 5, price: 3300, cost_price: 2900, tier: 'Paket/Bundle', subtotal: 16500 },
      { product_id: 'PRD-260926-008', name: 'Air Mineral Galon Aqua 19L', unit: 'galon', qty: 1, price: 20000, cost_price: 17000, tier: 'Eceran', subtotal: 20000 }
    ]),
    subtotal: 36500,
    discount: 0,
    total: 36500,
    paid: 50000,
    change: 13500,
    method: 'Tunai',
    status: 'Selesai'
  },
  {
    trx_id: 'TRX-260926-004',
    datetime: '2026-09-26T11:20:00',
    cashier: 'Budi (Kasir)',
    customer_id: 'PLG-260926-003',
    customer_name: 'Mas Joko Bengkel Motor',
    items_json: JSON.stringify([
      { product_id: 'PRD-260926-009', name: 'Rokok Sampoerna A Mild 16', unit: 'pcs', qty: 1, price: 34000, cost_price: 31800, tier: 'Eceran', subtotal: 34000 },
      { product_id: 'PRD-260926-006', name: 'Kopi Kapal Api Special Mix', unit: 'renteng', qty: 1, price: 14500, cost_price: 12500, tier: 'Eceran', subtotal: 14500 }
    ]),
    subtotal: 48500,
    discount: 0,
    total: 48500,
    paid: 0,
    change: 0,
    method: 'Kasbon',
    status: 'Selesai'
  },
  {
    trx_id: 'TRX-260926-005',
    datetime: '2026-09-26T14:10:00',
    cashier: 'Pak Piyu (Owner)',
    customer_id: 'PLG-260926-005',
    customer_name: 'Pak Haji Syukur',
    items_json: JSON.stringify([
      { product_id: 'PRD-260926-001', name: 'Beras Ramos Setra 5kg', unit: 'pcs', qty: 10, price: 68000, cost_price: 64000, tier: 'Grosir', subtotal: 680000 },
      { product_id: 'PRD-260926-004', name: 'Gula Pasir Gulaku 1kg', unit: 'pcs', qty: 24, price: 16200, cost_price: 15500, tier: 'Grosir', subtotal: 388800 }
    ]),
    subtotal: 1068800,
    discount: 8800,
    total: 1060000,
    paid: 1060000,
    change: 0,
    method: 'Transfer',
    status: 'Selesai'
  }
];

export const INITIAL_STOCK_MOVES: StockMove[] = [
  {
    move_id: 'MOV-260920-001',
    date: '2026-09-20',
    product_id: 'PRD-260926-001',
    product_name: 'Beras Ramos Setra Ramos 5kg',
    type: 'IN',
    qty: 30,
    cost_price: 64000,
    note: 'Kulakan dari Distributor Beras Cipinang',
    user: 'admin'
  },
  {
    move_id: 'MOV-260921-002',
    date: '2026-09-21',
    product_id: 'PRD-260926-002',
    product_name: 'Minyak Goreng Bimoli Klasik 2L Pouch',
    type: 'IN',
    qty: 24,
    cost_price: 34000,
    note: 'Restock Grosir Makmur Jaya',
    user: 'admin'
  },
  {
    move_id: 'MOV-260922-003',
    date: '2026-09-22',
    product_id: 'PRD-260926-003',
    product_name: 'Telur Ayam Negeri Fresh 1kg',
    type: 'IN',
    qty: 50,
    cost_price: 24500,
    note: 'Kiriman Peternak Blitar',
    user: 'admin'
  },
  {
    move_id: 'MOV-260925-004',
    date: '2026-09-25',
    product_id: 'PRD-260926-007',
    product_name: 'Gas Elpiji 3kg Melon (Isi Ulang)',
    type: 'IN',
    qty: 15,
    cost_price: 19500,
    note: 'Pangkalan Gas Pertamina',
    user: 'admin'
  }
];

export const INITIAL_USERS: User[] = [
  {
    username: 'admin',
    password_hash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // admin123 + salt
    salt: 'kw_salt_8891',
    role: 'Owner',
    full_name: 'Pak Piyu (Owner)',
    active: true
  },
  {
    username: 'kasir',
    password_hash: '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5', // kasir123 + salt
    salt: 'kw_salt_8891',
    role: 'Kasir',
    full_name: 'Budi Santoso',
    active: true
  }
];
