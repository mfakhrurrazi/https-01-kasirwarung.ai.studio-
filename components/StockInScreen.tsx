'use client';

import React, { useState, useMemo } from 'react';
import { Product, StockMove, AppSettings } from '@/lib/types';
import { 
  PackagePlus, Sparkles, History, ArrowDownLeft, 
  Calculator, Check, AlertCircle, RefreshCw, X 
} from 'lucide-react';

interface StockInScreenProps {
  products: Product[];
  stockMoves: StockMove[];
  settings: AppSettings;
  onProcessStockIn: (params: {
    product_id: string;
    qty: number;
    cost_price: number;
    note: string;
  }) => void;
}

export const StockInScreen: React.FC<StockInScreenProps> = ({
  products,
  stockMoves,
  settings,
  onProcessStockIn
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [inQty, setInQty] = useState<number>(0);
  const [inCostPrice, setInCostPrice] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // AI Saran Kulakan Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<string>('');
  const [aiBadge, setAiBadge] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const selectedProduct = useMemo(() => {
    return products.find(p => p.product_id === selectedProductId) || null;
  }, [products, selectedProductId]);

  // Recalculate preview of Weighted Average Cost
  const avgCostPreview = useMemo(() => {
    if (!selectedProduct || inQty <= 0) return selectedProduct?.cost_price || 0;
    const curStock = selectedProduct.stock;
    const curCost = selectedProduct.cost_price;
    const newStock = curStock + inQty;
    if (newStock <= 0) return curCost;
    return Math.round(((curStock * curCost) + (inQty * inCostPrice)) / newStock);
  }, [selectedProduct, inQty, inCostPrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert('Pilih produk sembako terlebih dahulu!');
      return;
    }
    if (inQty <= 0) {
      alert('Jumlah masuk harus lebih dari 0!');
      return;
    }

    onProcessStockIn({
      product_id: selectedProductId,
      qty: inQty,
      cost_price: inCostPrice,
      note: note || 'Kulakan / Restock Toko'
    });

    setSuccessMsg(`Stok ${selectedProduct?.name} bertambah ${inQty} ${selectedProduct?.unit}. Rata-rata modal baru: Rp ${avgCostPreview.toLocaleString('id-ID')}`);
    setSelectedProductId('');
    setInQty(0);
    setInCostPrice(0);
    setNote('');

    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // AI Saran Kulakan Trigger
  const handleOpenAiSaran = async () => {
    setIsAiModalOpen(true);
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: 'saran_kulakan',
          payload: { products },
          aiEnabled: settings.AI_ENABLED
        })
      });
      const data = await res.json();
      if (data && data.result) {
        setAiResult(data.result);
        setAiBadge(data.badge || (data.source === 'ai' ? 'Dibantu AI' : 'Mode Aturan'));
      }
    } catch (e) {
      setAiResult(
        'Rekomendasi Kulakan (Mode Aturan Standar):\n- Gas Elpiji 3kg: stok 3 tabung (Min: 5), sarankan beli 10 tabung.\n- Sabun Lifebuoy: stok 4 pcs (Min: 10), sarankan beli 12 pcs (1 dus).'
      );
      setAiBadge('AI tidak aktif (Fallback)');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and AI Kulakan Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Stok Masuk & Kulakan Warung</h2>
          <p className="text-xs text-slate-500">Catat pembelian barang dari agen & hitung harga modal rata-rata otomatis</p>
        </div>

        <button
          onClick={handleOpenAiSaran}
          className="px-4 py-2.5 bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-orange-500/20 transition active:scale-98 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>Saran Kulakan AI</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Stock-In Form & Preview (Two columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-amber-200 p-5 shadow-xs">
          <h3 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <PackagePlus className="w-4 h-4 text-orange-600" />
            <span>Formulir Kulakan Barang Baru</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pilih Produk Sembako *</label>
              <select
                required
                value={selectedProductId}
                onChange={e => {
                  const id = e.target.value;
                  setSelectedProductId(id);
                  const p = products.find(x => x.product_id === id);
                  if (p) setInCostPrice(p.cost_price);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              >
                <option value="">-- Pilih Produk --</option>
                {products.filter(p => p.active).map(p => (
                  <option key={p.product_id} value={p.product_id}>
                    {p.name} (Stok sekarang: {p.stock} {p.unit} | Modal: Rp {p.cost_price.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Jumlah Masuk ({selectedProduct ? selectedProduct.unit : 'Unit'}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={inQty || ''}
                  onChange={e => setInQty(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Harga Beli / Kulakan per {selectedProduct ? selectedProduct.unit : 'Unit'} (Rp) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={inCostPrice || ''}
                  onChange={e => setInCostPrice(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Catatan / Nama Agen Grosir</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Contoh: Kulakan dari Agen Makmur Jaya, Cipinang"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedProductId || inQty <= 0}
              className={`w-full py-3 px-4 font-black rounded-2xl text-white text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
                !selectedProductId || inQty <= 0
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/20'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Simpan Stok Masuk & Update Modal Rata-rata</span>
            </button>
          </form>
        </div>

        {/* Weighted Cost Calculation Preview (5 Cols) */}
        <div className="lg:col-span-5 bg-amber-50/60 rounded-3xl border border-amber-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-amber-200/80 mb-3">
              <Calculator className="w-4 h-4 text-amber-700" />
              <h3 className="font-extrabold text-amber-950 text-sm">Simulasi Harga Pokok Rata-rata</h3>
            </div>

            {selectedProduct ? (
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="font-bold text-slate-900 text-sm">
                  {selectedProduct.name}
                </div>

                <div className="p-3 bg-white rounded-2xl border border-amber-200/60 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Stok Saat Ini:</span>
                    <span className="font-bold">{selectedProduct.stock} {selectedProduct.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Harga Modal Lama:</span>
                    <span className="font-bold">Rp {selectedProduct.cost_price.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-orange-700 font-semibold pt-1 border-t border-slate-100">
                    <span>Tambahan Stok Masuk:</span>
                    <span>+{inQty} {selectedProduct.unit}</span>
                  </div>
                  <div className="flex justify-between text-orange-700 font-semibold">
                    <span>Total Stok Setelah Masuk:</span>
                    <span>{selectedProduct.stock + inQty} {selectedProduct.unit}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1 text-emerald-950">
                  <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
                    Harga Modal Rata-rata Tertimbang Baru:
                  </div>
                  <div className="text-xl font-black text-emerald-700">
                    Rp {avgCostPreview.toLocaleString('id-ID')}
                    <span className="text-xs font-normal text-emerald-800 ml-1">/{selectedProduct.unit}</span>
                  </div>
                  <div className="text-[10px] text-emerald-700">
                    Sistem otomatis menghitung bobot stok lama dan harga kulakan baru.
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Pilih salah satu produk di formulir sebelah kiri untuk melihat simulasi perhitungan modal baru.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-amber-200/70 text-[11px] text-slate-500">
            💡 <strong>Tips Warung:</strong> Membeli dalam satuan dus (karton) langsung dari distributor biasanya menghemat 5-10% harga modal dibanding eceran.
          </div>
        </div>
      </div>

      {/* Movement History Table */}
      <div className="bg-white rounded-3xl border border-amber-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">Riwayat Mutasi Stok (StockMoves)</h3>
          </div>
          <span className="text-xs text-slate-400">Dicatat otomatis ke lembar StockMoves</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">ID Mutasi</th>
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Produk</th>
                <th className="py-2.5 px-3 text-center">Tipe</th>
                <th className="py-2.5 px-3 text-right">Jumlah</th>
                <th className="py-2.5 px-3 text-right">Harga Modal</th>
                <th className="py-2.5 px-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockMoves.slice(0, 10).map(m => (
                <tr key={m.move_id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{m.move_id}</td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {new Date(m.date).toLocaleDateString('id-ID')} {new Date(m.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{m.product_name || m.product_id}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.type === 'IN' ? 'bg-emerald-100 text-emerald-800' :
                      m.type === 'SALE' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-slate-900">
                    {m.type === 'IN' ? `+${m.qty}` : `-${m.qty}`}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    Rp {m.cost_price.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 truncate max-w-xs">{m.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Saran Kulakan Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-amber-200 max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 bg-linear-to-r from-orange-600 to-amber-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-200" />
                <h3 className="font-extrabold text-sm">Saran Kulakan Cerdas</h3>
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 text-xs leading-relaxed">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Status Rekomendasi:</span>
                {aiBadge && (
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                    aiBadge.includes('AI') ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {aiBadge}
                  </span>
                )}
              </div>

              {aiLoading ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-600" />
                  <p className="font-bold">Menganalisis stok dan kecepatan perputaran barang...</p>
                  <p className="text-[11px] text-slate-400">Menghitung prioritas belanja mingguan hemat modal</p>
                </div>
              ) : (
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 text-slate-800 font-mono whitespace-pre-wrap text-[11px] leading-relaxed">
                  {aiResult}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition"
              >
                Tutup Rekomendasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
