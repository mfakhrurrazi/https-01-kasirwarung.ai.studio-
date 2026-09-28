'use client';

import { useState, useSyncExternalStore } from 'react';
import { 
  Product, Customer, Sale, Credit, StockMove, AppSettings, User, CartItem, PaymentMethod 
} from './types';
import { 
  INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_SALES, INITIAL_CREDITS, 
  INITIAL_STOCK_MOVES, INITIAL_SETTINGS, INITIAL_USERS 
} from './sample-data';

const STORAGE_KEY = 'KW_APP_DATA_V2';

export interface AppState {
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  credits: Credit[];
  stockMoves: StockMove[];
  settings: AppSettings;
  users: User[];
  currentUser: User | null;
}

function getInitialState(): AppState {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          products: parsed.products || INITIAL_PRODUCTS,
          customers: parsed.customers || INITIAL_CUSTOMERS,
          sales: parsed.sales || INITIAL_SALES,
          credits: parsed.credits || INITIAL_CREDITS,
          stockMoves: parsed.stockMoves || INITIAL_STOCK_MOVES,
          settings: parsed.settings || INITIAL_SETTINGS,
          users: INITIAL_USERS,
          currentUser: parsed.currentUser !== undefined ? parsed.currentUser : INITIAL_USERS[0]
        };
      }
    } catch (e) {
      console.error('Failed to load stored state:', e);
    }
  }

  return {
    products: INITIAL_PRODUCTS,
    customers: INITIAL_CUSTOMERS,
    sales: INITIAL_SALES,
    credits: INITIAL_CREDITS,
    stockMoves: INITIAL_STOCK_MOVES,
    settings: INITIAL_SETTINGS,
    users: INITIAL_USERS,
    currentUser: INITIAL_USERS[0]
  };
}

export function useAppStore() {
  const [data, setData] = useState<AppState>(getInitialState);
  const isLoaded = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [activeTab, setActiveTab] = useState<'pos' | 'dashboard' | 'products' | 'stockin' | 'kasbon' | 'reports' | 'settings' | 'guide' | 'gas_studio'>('pos');

  const { products, customers, sales, credits, stockMoves, settings, currentUser } = data;

  const setCurrentUser = (user: User | null) => {
    setData(prev => {
      const next = { ...prev, currentUser: user };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  // Helper to recalculate customer balance
  const getCustomerBalance = (customerId: string): number => {
    return credits
      .filter(c => c.customer_id === customerId && c.status !== 'Lunas')
      .reduce((sum, c) => sum + (c.amount - c.paid_amount), 0);
  };

  // Reset to Demo Data
  const resetDemoData = () => {
    const next: AppState = {
      products: INITIAL_PRODUCTS,
      customers: INITIAL_CUSTOMERS,
      sales: INITIAL_SALES,
      credits: INITIAL_CREDITS,
      stockMoves: INITIAL_STOCK_MOVES,
      settings: INITIAL_SETTINGS,
      users: INITIAL_USERS,
      currentUser: data.currentUser
    };
    setData(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  // Tier Price Calculation
  const calculateTierPrice = (product: Product, qty: number): { price: number; tier: 'Eceran' | 'Paket/Bundle' | 'Grosir' } => {
    if (product.wholesale_qty > 0 && qty >= product.wholesale_qty) {
      return { price: product.price_wholesale, tier: 'Grosir' };
    }
    if (product.bundle_qty > 0 && qty >= product.bundle_qty) {
      return { price: product.price_bundle, tier: 'Paket/Bundle' };
    }
    return { price: product.price_retail, tier: 'Eceran' };
  };

  // Checkout Transaction
  const processCheckout = (params: {
    items: CartItem[];
    customer_id: string;
    customer_name: string;
    subtotal: number;
    discount: number;
    total: number;
    paid: number;
    change: number;
    method: PaymentMethod;
  }): { success: boolean; error?: string; sale?: Sale } => {
    const { items, customer_id, customer_name, subtotal, discount, total, paid, change, method } = params;

    if (method === 'Kasbon') {
      if (!customer_id) {
        return { success: false, error: 'Transaksi Kasbon wajib memilih data Pelanggan!' };
      }
      const customer = customers.find(c => c.customer_id === customer_id);
      if (!customer) {
        return { success: false, error: 'Data pelanggan tidak ditemukan!' };
      }
      const currentDebt = getCustomerBalance(customer_id);
      if (currentDebt + total > customer.credit_limit) {
        return { 
          success: false, 
          error: `Melebihi Limit Kasbon! Limit ${customer.name}: Rp ${customer.credit_limit.toLocaleString('id-ID')}, Piutang saat ini: Rp ${currentDebt.toLocaleString('id-ID')}, Sisa Limit: Rp ${(customer.credit_limit - currentDebt).toLocaleString('id-ID')}` 
        };
      }
    }

    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = ('0' + (now.getMonth() + 1)).slice(-2);
    const dd = ('0' + now.getDate()).slice(-2);
    const countToday = sales.length + 1;
    const trxId = `TRX-${yy}${mm}${dd}-${('000' + countToday).slice(-3)}`;

    const itemsJsonData = items.map(it => ({
      product_id: it.product.product_id,
      name: it.product.name,
      unit: it.product.unit,
      qty: it.qty,
      price: it.applied_price,
      cost_price: it.product.cost_price,
      tier: it.tier_name,
      subtotal: it.subtotal
    }));

    const newSale: Sale = {
      trx_id: trxId,
      datetime: now.toISOString(),
      cashier: currentUser ? currentUser.full_name : 'Kasir',
      customer_id,
      customer_name: customer_name || 'Pelanggan Umum',
      items_json: JSON.stringify(itemsJsonData),
      subtotal,
      discount,
      total,
      paid,
      change,
      method,
      status: 'Selesai'
    };

    const newStockMoves: StockMove[] = [];
    const updatedProducts = products.map(prod => {
      const cartItem = items.find(it => it.product.product_id === prod.product_id);
      if (cartItem) {
        const newStock = Math.max(0, prod.stock - cartItem.qty);
        const moveId = `MOV-${yy}${mm}${dd}-${('000' + (stockMoves.length + newStockMoves.length + 1)).slice(-3)}`;
        newStockMoves.push({
          move_id: moveId,
          date: now.toISOString(),
          product_id: prod.product_id,
          product_name: prod.name,
          type: 'SALE',
          qty: cartItem.qty,
          cost_price: prod.cost_price,
          note: `Penjualan Kasir TRX ${trxId}`,
          user: currentUser?.username || 'kasir'
        });
        return { ...prod, stock: newStock };
      }
      return prod;
    });

    let updatedCredits = [...credits];
    if (method === 'Kasbon') {
      const creditId = `KSB-${yy}${mm}${dd}-${('000' + (credits.length + 1)).slice(-3)}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      const newCredit: Credit = {
        credit_id: creditId,
        customer_id,
        customer_name,
        trx_id: trxId,
        amount: total,
        paid_amount: 0,
        due_date: dueDate.toISOString().slice(0, 10),
        status: 'Belum Lunas',
        last_reminder: ''
      };
      updatedCredits = [newCredit, ...updatedCredits];
    }

    const nextState: AppState = {
      ...data,
      sales: [newSale, ...sales],
      products: updatedProducts,
      stockMoves: [...newStockMoves, ...stockMoves],
      credits: updatedCredits
    };

    setData(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    }

    return { success: true, sale: newSale };
  };

  // Stock In (Kulakan)
  const processStockIn = (params: {
    product_id: string;
    qty: number;
    cost_price: number;
    note: string;
  }) => {
    const { product_id, qty, cost_price, note } = params;
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = ('0' + (now.getMonth() + 1)).slice(-2);
    const dd = ('0' + now.getDate()).slice(-2);
    const moveId = `MOV-${yy}${mm}${dd}-${('000' + (stockMoves.length + 1)).slice(-3)}`;

    let targetProductName = '';
    const updatedProducts = products.map(prod => {
      if (prod.product_id === product_id) {
        targetProductName = prod.name;
        const curStock = prod.stock;
        const curCost = prod.cost_price;
        const newStock = curStock + qty;
        const newCost = newStock > 0 ? Math.round(((curStock * curCost) + (qty * cost_price)) / newStock) : curCost;
        return {
          ...prod,
          stock: newStock,
          cost_price: newCost
        };
      }
      return prod;
    });

    const newMove: StockMove = {
      move_id: moveId,
      date: now.toISOString(),
      product_id,
      product_name: targetProductName,
      type: 'IN',
      qty,
      cost_price,
      note: note || 'Stok Masuk / Kulakan',
      user: currentUser?.username || 'admin'
    };

    const nextState: AppState = {
      ...data,
      products: updatedProducts,
      stockMoves: [newMove, ...stockMoves]
    };

    setData(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    }
  };

  // Record Kasbon Payment
  const recordCreditPayment = (credit_id: string, paymentAmount: number) => {
    const updatedCredits = credits.map(c => {
      if (c.credit_id === credit_id) {
        const newPaid = Math.min(c.amount, c.paid_amount + paymentAmount);
        const newStatus = newPaid >= c.amount ? ('Lunas' as const) : ('Cicil' as const);
        return {
          ...c,
          paid_amount: newPaid,
          status: newStatus
        };
      }
      return c;
    });

    const nextState: AppState = { ...data, credits: updatedCredits };
    setData(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    }
  };

  // Update Settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const nextState: AppState = { ...data, settings: { ...settings, ...newSettings } };
    setData(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    }
  };

  // Save Product
  const saveProduct = (product: Product) => {
    let updated: Product[];
    const exists = products.some(p => p.product_id === product.product_id);
    if (exists) {
      updated = products.map(p => p.product_id === product.product_id ? product : p);
    } else {
      updated = [product, ...products];
    }
    const nextState: AppState = { ...data, products: updated };
    setData(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    }
  };

  // Save Customer
  const saveCustomer = (customer: Customer) => {
    let updated: Customer[];
    const exists = customers.some(c => c.customer_id === customer.customer_id);
    if (exists) {
      updated = customers.map(c => c.customer_id === customer.customer_id ? customer : c);
    } else {
      updated = [customer, ...customers];
    }
    const nextState: AppState = { ...data, customers: updated };
    setData(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    }
  };

  return {
    isLoaded,
    products,
    customers,
    sales,
    credits,
    stockMoves,
    settings,
    currentUser,
    activeTab,
    setActiveTab,
    setCurrentUser,
    getCustomerBalance,
    calculateTierPrice,
    processCheckout,
    processStockIn,
    recordCreditPayment,
    updateSettings,
    saveProduct,
    saveCustomer,
    resetDemoData
  };
}
