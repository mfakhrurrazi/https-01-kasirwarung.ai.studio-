'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Product, Customer, CartItem, PaymentMethod, ProductCategory, Sale 
} from '@/lib/types';
import { 
  Search, Barcode, Plus, Minus, Trash2, ShoppingCart, 
  CreditCard, Banknote, QrCode, AlertTriangle, Check, UserPlus 
} from 'lucide-react';

interface PosScreenProps {
  products: Product[];
  customers: Customer[];
  getCustomerBalance: (customerId: string) => number;
  calculateTierPrice: (product: Product, qty: number) => { price: number; tier: 'Eceran' | 'Paket/Bundle' | 'Grosir' };
  onProcessCheckout: (params: {
    items: CartItem[];
    customer_id: string;
    customer_name: string;
    subtotal: number;
    discount: number;
    total: number;
    paid: number;
    change: number;
    method: PaymentMethod;
  }) => { success: boolean; error?: string; sale?: Sale };
  onSaleCompleted: (sale: Sale) => void;
}

const CATEGORIES: ProductCategory[] = [
  'Sembako', 'Minuman', 'Rokok', 'Snack', 'Toiletries', 'Gas & Air', 'Lainnya'
];

export const PosScreen: React.FC<PosScreenProps> = ({
  products,
  customers,
  getCustomerBalance,
  calculateTierPrice,
  onProcessCheckout,
  onSaleCompleted
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Active products filter
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!p.active) return false;
      const matchesCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.includes(searchTerm) ||
        p.product_id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  // Selected customer data & kasbon status
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.customer_id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  const customerDebt = useMemo(() => {
    return selectedCustomer ? getCustomerBalance(selectedCustomer.customer_id) : 0;
  }, [selectedCustomer, getCustomerBalance]);

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, it) => sum + it.subtotal, 0);
  }, [cart]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount);
  }, [subtotal, discount]);

  const change = useMemo(() => {
    if (paymentMethod !== 'Tunai') return 0;
    return Math.max(0, paidAmount - total);
  }, [paymentMethod, paidAmount, total]);

  // Add Product to Cart
  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.product_id === product.product_id);
      if (existing) {
        const newQty = existing.qty + 1;
        const { price, tier } = calculateTierPrice(product, newQty);
        return prev.map(item =>
          item.product.product_id === product.product_id
            ? { ...item, qty: newQty, applied_price: price, tier_name: tier, subtotal: newQty * price }
            : item
        );
      } else {
        const newQty = 1;
        const { price, tier } = calculateTierPrice(product, newQty);
        return [...prev, {
          product,
          qty: newQty,
          applied_price: price,
          tier_name: tier,
          subtotal: newQty * price
        }];
      }
    });
    setErrorMessage('');
  };

  // Update Item Qty
  const handleUpdateQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.product_id === productId) {
          const newQty = item.qty + delta;
          if (newQty <= 0) return null;
          const { price, tier } = calculateTierPrice(item.product, newQty);
          return {
            ...item,
            qty: newQty,
            applied_price: price,
            tier_name: tier,
            subtotal: newQty * price
          };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.product_id !== productId));
  };

  // Barcode quick add handler
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const found = products.find(p => p.barcode === barcodeInput.trim() || p.product_id === barcodeInput.trim());
    if (found) {
      handleAddToCart(found);
      setBarcodeInput('');
    } else {
      setErrorMessage(`Barcode ${barcodeInput} tidak ditemukan!`);
    }
  };

  // Quick cash setter
  const handleQuickCash = (amount: number) => {
    setPaidAmount(amount);
  };

  // Checkout Execution
  const handleCheckout = () => {
    if (cart.length === 0) {
      setErrorMessage('Keranjang belanja masih kosong!');
      return;
    }

    if (paymentMethod === 'Tunai' && paidAmount < total) {
      setErrorMessage(`Uang tunai kurang! Total belanja: Rp ${total.toLocaleString('id-ID')}, Uang dibayar: Rp ${paidAmount.toLocaleString('id-ID')}`);
      return;
    }

    if (paymentMethod === 'Kasbon') {
      if (!selectedCustomerId) {
        setErrorMessage('Transaksi Kasbon wajib memilih Pelanggan Terdaftar!');
        return;
      }
      if (selectedCustomer && (customerDebt + total > selectedCustomer.credit_limit)) {
        setErrorMessage(`Melebihi limit kasbon! Limit: Rp ${selectedCustomer.credit_limit.toLocaleString('id-ID')}, Piutang berjalan: Rp ${customerDebt.toLocaleString('id-ID')}`);
        return;
      }
    }

    const res = onProcessCheckout({
      items: cart,
      customer_id: selectedCustomerId,
      customer_name: selectedCustomer ? selectedCustomer.name : 'Pelanggan Umum',
      subtotal,
      discount,
      total,
      paid: paymentMethod === 'Tunai' ? paidAmount : total,
      change,
      method: paymentMethod
    });

    if (res.success && res.sale) {
      setCart([]);
      setDiscount(0);
      setPaidAmount(0);
      setSelectedCustomerId('');
      setErrorMessage('');
      onSaleCompleted(res.sale);
    } else {
      setErrorMessage(res.error || 'Gagal memproses transaksi.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
      {/* LEFT COLUMN: Catalog & Products (8 Cols on Desktop) */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
        {/* Top Control Bar: Search & Barcode */}
        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs flex flex-col sm:flex-row gap-3">
          {/* Text Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama barang sembako (cth: beras, bimoli, rokok)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition"
            />
          </div>

          {/* Barcode Scanner Input */}
          <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
            <div className="relative">
              <Barcode className="w-4 h-4 text-orange-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Scan / Ketik Barcode"
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                className="w-44 pl-9 pr-3 py-2.5 bg-orange-50/50 border border-orange-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition"
            >
              Enter
            </button>
          </form>
        </div>

        {/* Category Pills (Warung categories) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('Semua')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'Semua'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-orange-50'
            }`}
          >
            Semua ({products.filter(p => p.active).length})
          </button>
          {CATEGORIES.map(cat => {
            const count = products.filter(p => p.active && p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-orange-50'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto max-h-[calc(100vh-270px)] pr-1">
          {filteredProducts.map(prod => {
            const isLow = prod.stock <= prod.min_stock;
            const inCart = cart.find(item => item.product.product_id === prod.product_id);

            return (
              <div
                key={prod.product_id}
                onClick={() => handleAddToCart(prod)}
                className={`bg-white rounded-2xl border p-3 cursor-pointer select-none transition-all flex flex-col justify-between hover:shadow-md hover:border-orange-300 relative ${
                  inCart ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/20' : 'border-slate-200'
                }`}
              >
                {/* Cart badge counter */}
                {inCart && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-orange-600 text-white font-black text-xs flex items-center justify-center shadow-md animate-in zoom-in-75">
                    {inCart.qty}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-1 text-[11px] mb-1">
                    <span className="text-slate-400 font-mono text-[10px]">{prod.category}</span>
                    <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                      isLow ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      Stok: {prod.stock} {prod.unit}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 leading-snug">
                    {prod.name}
                  </h4>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100">
                  <div className="text-base font-extrabold text-orange-600 tracking-tight">
                    Rp {prod.price_retail.toLocaleString('id-ID')}
                    <span className="text-[10px] font-normal text-slate-400 ml-1">/{prod.unit}</span>
                  </div>

                  {/* Tier Pricing Mini Badges */}
                  <div className="mt-1 space-y-0.5 text-[10px]">
                    {prod.bundle_qty > 0 && (
                      <div className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-medium truncate">
                        Paket {prod.bundle_qty}+ : Rp {prod.price_bundle.toLocaleString('id-ID')}
                      </div>
                    )}
                    {prod.wholesale_qty > 0 && (
                      <div className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-medium truncate">
                        Grosir {prod.wholesale_qty}+ : Rp {prod.price_wholesale.toLocaleString('id-ID')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
              <p className="font-semibold text-slate-600">Produk tidak ditemukan</p>
              <p className="text-xs text-slate-400">Coba ganti kata kunci pencarian atau kategori</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Cart Drawer & Checkout (5 Cols on Desktop) */}
      <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border border-amber-200 shadow-md p-4 flex flex-col justify-between">
        <div>
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Keranjang Belanja</h3>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-red-500 hover:text-red-700 font-semibold transition"
              >
                Kosongkan
              </button>
            )}
          </div>

          {/* Customer Selector */}
          <div className="mt-3 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Pelanggan:</span>
              </label>
              {selectedCustomer && (
                <span className="text-[11px] font-bold text-orange-700">
                  Limit Kasbon: Rp {selectedCustomer.credit_limit.toLocaleString('id-ID')}
                </span>
              )}
            </div>

            <select
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="w-full bg-white border border-amber-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            >
              <option value="">-- Pelanggan Umum (Tanpa Kasbon) --</option>
              {customers.map(c => {
                const debt = getCustomerBalance(c.customer_id);
                return (
                  <option key={c.customer_id} value={c.customer_id}>
                    {c.name} {debt > 0 ? `(Kasbon: Rp ${debt.toLocaleString('id-ID')})` : '(Lunas)'}
                  </option>
                );
              })}
            </select>

            {selectedCustomer && (
              <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                <div className="flex justify-between">
                  <span>Kasbon Berjalan:</span>
                  <span className={`font-bold ${customerDebt > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    Rp {customerDebt.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sisa Limit:</span>
                  <span className="font-bold text-slate-800">
                    Rp {Math.max(0, selectedCustomer.credit_limit - customerDebt).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="mt-3 overflow-y-auto max-h-56 pr-1 space-y-2">
            {cart.map(item => (
              <div
                key={item.product.product_id}
                className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-slate-800 truncate">
                    {item.product.name}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span className="font-semibold text-orange-600">
                      Rp {item.applied_price.toLocaleString('id-ID')}
                    </span>
                    <span>·</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      item.tier_name === 'Grosir'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.tier_name === 'Paket/Bundle'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {item.tier_name}
                    </span>
                  </div>
                </div>

                {/* Qty Steppers */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleUpdateQty(item.product.product_id, -1)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 active:scale-95 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-black text-xs text-slate-800">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => handleUpdateQty(item.product.product_id, 1)}
                    className="w-7 h-7 rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center font-bold active:scale-95 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveItem(item.product.product_id)}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-500 flex items-center justify-center transition ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                Belum ada barang di keranjang.<br />
                Klik produk di sebelah kiri untuk menambahkan.
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION: Payment, Totals & Checkout Button */}
        <div className="mt-4 pt-3 border-t border-slate-200 space-y-3">
          {/* Subtotal & Discount */}
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-800">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Potongan / Diskon (Rp):</span>
              <input
                type="number"
                min="0"
                value={discount || ''}
                placeholder="0"
                onChange={e => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                className="w-24 text-right px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
              />
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-100">
              <span>TOTAL BAYAR:</span>
              <span className="text-orange-600 text-base">Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Tunai', 'QRIS', 'Transfer', 'Kasbon'] as PaymentMethod[]).map(m => (
                <button
                  key={m}
                  onClick={() => {
                    setPaymentMethod(m);
                    setErrorMessage('');
                    if (m === 'Tunai' && paidAmount === 0) setPaidAmount(total);
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    paymentMethod === m
                      ? 'bg-orange-600 text-white shadow-xs ring-2 ring-orange-500/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {m === 'Tunai' && <Banknote className="w-3.5 h-3.5" />}
                  {m === 'QRIS' && <QrCode className="w-3.5 h-3.5" />}
                  {m === 'Transfer' && <CreditCard className="w-3.5 h-3.5" />}
                  {m === 'Kasbon' && <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>{m}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tunai Specific: Quick Cash & Paid Input */}
          {paymentMethod === 'Tunai' && (
            <div className="p-2.5 bg-orange-50/50 rounded-2xl border border-orange-200/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Uang Diterima:</span>
                <input
                  type="number"
                  value={paidAmount || ''}
                  onChange={e => setPaidAmount(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-32 text-right px-2 py-1 bg-white border border-orange-300 rounded-lg text-sm font-black text-slate-900"
                />
              </div>

              {/* Quick Cash Chips */}
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => handleQuickCash(total)}
                  className="px-2 py-1 bg-white border border-orange-200 hover:bg-orange-100 rounded-lg text-[10px] font-bold text-orange-700"
                >
                  Uang Pas
                </button>
                {[10000, 20000, 50000, 100000, 200000].map(val => (
                  <button
                    key={val}
                    onClick={() => handleQuickCash(val)}
                    className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-[10px] font-bold text-slate-700"
                  >
                    {val >= 1000 ? `${val / 1000}k` : val}
                  </button>
                ))}
              </div>

              <div className="flex justify-between text-xs pt-1 border-t border-orange-200/50 font-bold">
                <span className="text-slate-600">Kembalian:</span>
                <span className={change > 0 ? 'text-emerald-700 font-black' : 'text-slate-500'}>
                  Rp {change.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          )}

          {/* Kasbon Warning Info */}
          {paymentMethod === 'Kasbon' && (
            <div className="p-2.5 bg-amber-100/70 border border-amber-300 rounded-2xl text-[11px] text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Transaksi Kasbon Warung</span>
              </div>
              <div>
                Akan dicatat di Buku Kasbon dengan jatuh tempo 7 hari.
                {selectedCustomer ? (
                  <span className="block font-semibold mt-0.5">
                    Pelanggan: {selectedCustomer.name} (Sisa limit setelah transaksi: Rp {Math.max(0, selectedCustomer.credit_limit - (customerDebt + total)).toLocaleString('id-ID')})
                  </span>
                ) : (
                  <span className="block text-red-600 font-bold mt-0.5">
                    ⚠️ Silakan pilih data pelanggan di atas terlebih dahulu!
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Big Chunky Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3 px-4 font-black rounded-2xl text-white text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
              cart.length === 0
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-orange-500/20'
            }`}
          >
            <Check className="w-5 h-5" />
            <span>Bayar & Cetak Struk (Rp {total.toLocaleString('id-ID')})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
