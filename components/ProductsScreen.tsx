'use client';

import React, { useState, useMemo } from 'react';
import { Product, ProductCategory, ProductUnit } from '@/lib/types';
import { 
  Search, Plus, Edit2, Download, Upload, Barcode, 
  Check, X, AlertTriangle, Layers, Tag, Filter 
} from 'lucide-react';

interface ProductsScreenProps {
  products: Product[];
  onSaveProduct: (product: Product) => void;
}

const CATEGORIES: ProductCategory[] = [
  'Sembako', 'Minuman', 'Rokok', 'Snack', 'Toiletries', 'Gas & Air', 'Lainnya'
];

const UNITS: ProductUnit[] = ['pcs', 'renteng', 'dus', 'kg', 'liter', 'slop', 'tabung', 'galon'];

export const ProductsScreen: React.FC<ProductsScreenProps> = ({
  products,
  onSaveProduct
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.includes(searchTerm) ||
        p.product_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'Semua' || p.category === categoryFilter;
      const matchStock = 
        stockFilter === 'all' ? true :
        stockFilter === 'low' ? (p.stock <= p.min_stock && p.stock > 0) :
        p.stock <= 0;
      return matchSearch && matchCat && matchStock;
    });
  }, [products, searchTerm, categoryFilter, stockFilter]);

  const handleAddNew = () => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = ('0' + (now.getMonth() + 1)).slice(-2);
    const dd = ('0' + now.getDate()).slice(-2);
    const count = products.length + 1;
    const newId = `PRD-${yy}${mm}${dd}-${('000' + count).slice(-3)}`;

    setEditingProduct({
      product_id: newId,
      barcode: String(Math.floor(100000000000 + Math.random() * 900000000000)),
      name: '',
      category: 'Sembako',
      unit: 'pcs',
      price_retail: 0,
      price_bundle: 0,
      bundle_qty: 0,
      price_wholesale: 0,
      wholesale_qty: 0,
      cost_price: 0,
      stock: 0,
      min_stock: 5,
      expiry_date: '',
      active: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (prod: Product) => {
    setEditingProduct({ ...prod });
    setIsModalOpen(true);
  };

  const handleModalSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.name.trim()) {
      alert('Nama produk wajib diisi!');
      return;
    }
    onSaveProduct(editingProduct);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'product_id', 'barcode', 'name', 'category', 'unit',
      'price_retail', 'price_bundle', 'bundle_qty', 'price_wholesale',
      'wholesale_qty', 'cost_price', 'stock', 'min_stock', 'expiry_date', 'active'
    ];
    const rows = products.map(p => [
      p.product_id,
      p.barcode,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.unit,
      p.price_retail,
      p.price_bundle,
      p.bundle_qty,
      p.price_wholesale,
      p.wholesale_qty,
      p.cost_price,
      p.stock,
      p.min_stock,
      p.expiry_date,
      p.active ? 'TRUE' : 'FALSE'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DB_KasirWarung_Products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import simulation (loads sample 10+ grocery items template)
  const handleDownloadSampleCSV = () => {
    const sample = `product_id,barcode,name,category,unit,price_retail,price_bundle,bundle_qty,price_wholesale,wholesale_qty,cost_price,stock,min_stock,expiry_date,active
PRD-SAMPLE-001,899886611001,Kecap Bango Manis 550ml,Sembako,pcs,24000,23500,3,22500,12,20500,20,5,2027-12-01,TRUE
PRD-SAMPLE-002,899886611002,Susu Kental Manis Frisian Flag 370g,Minuman,pcs,13000,12500,4,12000,24,11000,30,8,2027-08-15,TRUE
PRD-SAMPLE-003,899886611003,Deterjen Daia Putih 850g,Toiletries,pcs,18500,18000,3,17200,10,16000,15,4,2028-01-01,TRUE
PRD-SAMPLE-004,899886611004,Biskuit Roma Kelapa 300g,Snack,pcs,11500,11000,4,10500,20,9500,25,6,2027-05-10,TRUE`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Template_Produk_Warung_300Item.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Katalog Produk & Harga Grosir</h2>
          <p className="text-xs text-slate-500">Kelola harga eceran, paket bundle, dan grosir per dus/slop</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadSampleCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
            title="Unduh Template CSV Sembako"
          >
            <Download className="w-3.5 h-3.5" />
            Template CSV
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Produk
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama produk, barcode, atau ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500/30"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="Semua">Semua Kategori</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="all">Semua Stok</option>
            <option value="low">Stok Menipis (≤ Min)</option>
            <option value="out">Stok Habis (0)</option>
          </select>
        </div>
      </div>

      {/* Products Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white rounded-3xl border border-amber-200 overflow-hidden shadow-xs">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-orange-50 text-orange-950 font-bold border-b border-amber-200">
              <tr>
                <th className="py-3 px-4">Nama Produk / ID</th>
                <th className="py-3 px-3">Barcode</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3 text-right">Modal</th>
                <th className="py-3 px-3 text-right">Eceran</th>
                <th className="py-3 px-3 text-center">Harga Bertingkat</th>
                <th className="py-3 px-3 text-center">Stok</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => {
                const isLow = p.stock <= p.min_stock;
                return (
                  <tr key={p.product_id} className="hover:bg-amber-50/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{p.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{p.product_id}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">{p.barcode}</td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-medium">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500 font-mono">
                      Rp {p.cost_price.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-orange-600 font-mono">
                      Rp {p.price_retail.toLocaleString('id-ID')}
                      <span className="text-[10px] text-slate-400 font-normal ml-0.5">/{p.unit}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="text-[10px] space-y-0.5">
                        {p.bundle_qty > 0 && (
                          <div className="text-amber-800">
                            Paket {p.bundle_qty}+ : Rp {p.price_bundle.toLocaleString('id-ID')}
                          </div>
                        )}
                        {p.wholesale_qty > 0 && (
                          <div className="text-emerald-800 font-semibold">
                            Grosir {p.wholesale_qty}+ : Rp {p.price_wholesale.toLocaleString('id-ID')}
                          </div>
                        )}
                        {!p.bundle_qty && !p.wholesale_qty && (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-orange-600 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredProducts.map(p => (
            <div key={p.product_id} className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{p.name}</h4>
                  <div className="text-[10px] text-slate-400 font-mono">{p.product_id} · {p.category}</div>
                </div>
                <button
                  onClick={() => handleEdit(p)}
                  className="p-1.5 bg-slate-100 rounded-lg text-slate-700 text-xs font-bold"
                >
                  Edit
                </button>
              </div>

              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500">Eceran: </span>
                  <span className="font-bold text-orange-600">Rp {p.price_retail.toLocaleString('id-ID')}</span>
                  <span className="text-[10px] text-slate-400">/{p.unit}</span>
                </div>
                <div>
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                    p.stock <= p.min_stock ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    Stok: {p.stock}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            Tidak ada produk yang cocok dengan pencarian.
          </div>
        )}
      </div>

      {/* Edit / Add Product Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-200 max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 bg-orange-600 text-white flex justify-between items-center">
              <h3 className="font-black text-sm">
                {editingProduct.product_id.includes('SAMPLE') || products.some(p => p.product_id === editingProduct.product_id) ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleModalSave} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Nama Produk Sembako *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-500"
                    placeholder="Contoh: Beras Ramos 5kg"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Barcode</label>
                  <input
                    type="text"
                    value={editingProduct.barcode}
                    onChange={e => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori</label>
                  <select
                    value={editingProduct.category}
                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Satuan Unit</label>
                  <select
                    value={editingProduct.unit}
                    onChange={e => setEditingProduct({ ...editingProduct, unit: e.target.value as ProductUnit })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                  >
                    {UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Harga Modal / Kulakan (Rp)</label>
                  <input
                    type="number"
                    value={editingProduct.cost_price || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, cost_price: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-orange-700 block mb-1">Harga Jual Eceran (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price_retail || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, price_retail: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-orange-300 rounded-xl font-bold text-orange-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stok Saat Ini</label>
                  <input
                    type="number"
                    value={editingProduct.stock || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                {/* Tier Pricing Section */}
                <div className="col-span-2 p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                  <div className="font-bold text-amber-900 flex items-center gap-1 text-[11px]">
                    <Layers className="w-3.5 h-3.5 text-amber-700" />
                    <span>Pengaturan Harga Bertingkat Otomatis</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-600 block">Min. Qty Paket / Bundle</label>
                      <input
                        type="number"
                        placeholder="cth: 3"
                        value={editingProduct.bundle_qty || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, bundle_qty: Number(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 bg-white border border-amber-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 block">Harga Paket (Rp)</label>
                      <input
                        type="number"
                        placeholder="cth: 70000"
                        value={editingProduct.price_bundle || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, price_bundle: Number(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 bg-white border border-amber-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-600 block">Min. Qty Grosir (Dus/Slop)</label>
                      <input
                        type="number"
                        placeholder="cth: 10"
                        value={editingProduct.wholesale_qty || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, wholesale_qty: Number(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 bg-white border border-amber-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 block">Harga Grosir (Rp)</label>
                      <input
                        type="number"
                        placeholder="cth: 68000"
                        value={editingProduct.price_wholesale || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, price_wholesale: Number(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 bg-white border border-amber-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batas Minimal Stok</label>
                  <input
                    type="number"
                    value={editingProduct.min_stock || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, min_stock: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Kadaluarsa</label>
                  <input
                    type="date"
                    value={editingProduct.expiry_date || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
