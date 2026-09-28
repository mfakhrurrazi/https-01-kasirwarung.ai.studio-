'use client';

import React, { useState, useMemo } from 'react';
import { Product, Sale, Credit, AppSettings } from '@/lib/types';
import { 
  TrendingUp, Wallet, ShoppingBag, AlertCircle, Sparkles, 
  Clock, Package, RefreshCw, ChevronRight, CheckCircle2 
} from 'lucide-react';

interface DashboardScreenProps {
  products: Product[];
  sales: Sale[];
  credits: Credit[];
  settings: AppSettings;
  onNavigateTab: (tab: any) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  products,
  sales,
  credits,
  settings,
  onNavigateTab
}) => {
  const [ceritaOmzet, setCeritaOmzet] = useState<string>('');
  const [ceritaBadge, setCeritaBadge] = useState<string>('');
  const [loadingCerita, setLoadingCerita] = useState<boolean>(false);

  // Today string YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Today Sales
  const todaySales = useMemo(() => {
    return sales.filter(s => s.datetime.slice(0, 10) === todayStr && s.status === 'Selesai');
  }, [sales, todayStr]);

  const todayOmzet = useMemo(() => {
    return todaySales.reduce((sum, s) => sum + s.total, 0);
  }, [todaySales]);

  // Gross profit calculation
  const todayProfit = useMemo(() => {
    return todaySales.reduce((profit, s) => {
      try {
        const items = JSON.parse(s.items_json);
        const margin = items.reduce((mSum: number, it: any) => {
          const itemCost = (it.cost_price || 0) * it.qty;
          return mSum + (it.subtotal - itemCost);
        }, 0);
        return profit + Math.max(0, margin - s.discount);
      } catch (e) {
        return profit + (s.total * 0.15); // fallback 15% margin
      }
    }, 0);
  }, [todaySales]);

  const totalOutstandingKasbon = useMemo(() => {
    return credits
      .filter(c => c.status !== 'Lunas')
      .reduce((sum, c) => sum + (c.amount - c.paid_amount), 0);
  }, [credits]);

  const todayKasbonCount = useMemo(() => {
    return todaySales
      .filter(s => s.method === 'Kasbon')
      .reduce((sum, s) => sum + s.total, 0);
  }, [todaySales]);

  // Low stock products (< min_stock)
  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.active && p.stock <= p.min_stock);
  }, [products]);

  // Near expiry (< 30 days)
  const nearExpiryProducts = useMemo(() => {
    const now = new Date().getTime();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    return products.filter(p => {
      if (!p.expiry_date || !p.active) return false;
      const exp = new Date(p.expiry_date).getTime();
      return exp > now && exp - now <= thirtyDaysMs;
    });
  }, [products]);

  // Top Products sold
  const topProducts = useMemo(() => {
    const counts: { [name: string]: { qty: number; total: number } } = {};
    sales.forEach(s => {
      try {
        const items = JSON.parse(s.items_json);
        items.forEach((it: any) => {
          if (!counts[it.name]) counts[it.name] = { qty: 0, total: 0 };
          counts[it.name].qty += it.qty;
          counts[it.name].total += it.subtotal;
        });
      } catch (e) {}
    });
    return Object.entries(counts)
      .map(([name, val]) => ({ name, ...val }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [sales]);

  // 7-Day Sales summary
  const last7Days = useMemo(() => {
    const days: { date: string; label: string; omzet: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      const dayTotal = sales
        .filter(s => s.datetime.slice(0, 10) === dStr && s.status === 'Selesai')
        .reduce((sum, s) => sum + s.total, 0);
      days.push({ date: dStr, label, omzet: dayTotal });
    }
    return days;
  }, [sales]);

  const max7DayOmzet = Math.max(...last7Days.map(d => d.omzet), 100000);

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    const map = { Tunai: 0, QRIS: 0, Transfer: 0, Kasbon: 0 };
    todaySales.forEach(s => {
      if (map[s.method] !== undefined) map[s.method] += s.total;
    });
    return map;
  }, [todaySales]);

  // Generate Cerita Omzet Hari Ini
  const handleGenerateCerita = async () => {
    setLoadingCerita(true);
    try {
      const topProdName = topProducts[0]?.name || 'Sembako';
      const payload = {
        totalOmzet: todayOmzet,
        totalProfit: todayProfit,
        trxCount: todaySales.length,
        topProduct: topProdName,
        kasbonToday: todayKasbonCount
      };

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: 'cerita_omzet',
          payload,
          aiEnabled: settings.AI_ENABLED
        })
      });

      const data = await res.json();
      if (data && data.result) {
        setCeritaOmzet(data.result);
        setCeritaBadge(data.badge || (data.source === 'ai' ? 'Dibantu AI' : 'Mode Aturan'));
      }
    } catch (e) {
      // rule fallback
      setCeritaOmzet(
        `Alhamdulillah, hari ini warung membukukan omzet sebesar Rp ${todayOmzet.toLocaleString('id-ID')} dari ${todaySales.length} transaksi. Produk terlaris didominasi sembako dengan estimasi laba kotor Rp ${todayProfit.toLocaleString('id-ID')}. Kasbon baru tercatat Rp ${todayKasbonCount.toLocaleString('id-ID')}; tetap semangat dan semoga besok dagangan makin laris!`
      );
      setCeritaBadge('AI tidak aktif (Fallback)');
    } finally {
      setLoadingCerita(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omzet Card */}
        <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Omzet Hari Ini</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Rp {todayOmzet.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span>{todaySales.length} transaksi selesai</span>
          </div>
        </div>

        {/* Profit Card */}
        <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Laba Kotor Est.</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
            Rp {todayProfit.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Margin ± {todayOmzet > 0 ? Math.round((todayProfit / todayOmzet) * 100) : 0}%
          </div>
        </div>

        {/* Transaksi Card */}
        <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Jumlah Transaksi</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {todaySales.length}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Rata-rata: Rp {todaySales.length > 0 ? Math.round(todayOmzet / todaySales.length).toLocaleString('id-ID') : 0}
          </div>
        </div>

        {/* Outstanding Kasbon Card */}
        <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Kasbon Belum Lunas</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-red-600 tracking-tight">
            Rp {totalOutstandingKasbon.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-orange-700 font-semibold mt-1">
            {credits.filter(c => c.status !== 'Lunas').length} piutang aktif di buku
          </div>
        </div>
      </div>

      {/* Cerita Omzet Hari Ini Card */}
      <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Cerita Omzet Hari Ini</h3>
              <p className="text-xs text-slate-500">Ringkasan narasi ramah penjualan harian untuk pemilik warung</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {ceritaBadge && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                ceritaBadge.includes('AI') ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-slate-200 text-slate-700'
              }`}>
                {ceritaBadge}
              </span>
            )}
            <button
              onClick={handleGenerateCerita}
              disabled={loadingCerita}
              className="py-1.5 px-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition active:scale-98 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingCerita ? 'animate-spin' : ''}`} />
              <span>{loadingCerita ? 'Menganalisis...' : 'Ceritakan Sekarang'}</span>
            </button>
          </div>
        </div>

        <div className="mt-3.5 text-sm text-slate-700 leading-relaxed font-medium">
          {ceritaOmzet ? (
            <p className="bg-white/80 p-3.5 rounded-2xl border border-amber-200/60 shadow-xs">
              &ldquo;{ceritaOmzet}&rdquo;
            </p>
          ) : (
            <div className="text-slate-500 text-xs italic py-2">
              Klik tombol <strong>&ldquo;Ceritakan Sekarang&rdquo;</strong> untuk mendapatkan ringkasan cerdas omzet, produk terlaris, dan catatan kasbon hari ini. Tetap bekerja 100% tanpa internet/AI melalui mode aturan bawaan.
            </div>
          )}
        </div>
      </div>

      {/* Grid: 7-Day Sales & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 7-Day Sales Trend (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-amber-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Tren Penjualan 7 Hari Terakhir</h3>
              <p className="text-xs text-slate-400">Grafik omzet harian warung</p>
            </div>
            <div className="text-xs font-bold text-orange-600">
              Total 7 Hari: Rp {last7Days.reduce((a, b) => a + b.omzet, 0).toLocaleString('id-ID')}
            </div>
          </div>

          {/* Bar Chart Bars */}
          <div className="flex items-end justify-between gap-2 h-44 pt-6 px-2">
            {last7Days.map((d, idx) => {
              const heightPct = Math.max(12, Math.round((d.omzet / max7DayOmzet) * 100));
              const isToday = d.date === todayStr;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] text-slate-500 font-bold opacity-0 group-hover:opacity-100 transition truncate max-w-full">
                    {d.omzet >= 1000 ? `${Math.round(d.omzet / 1000)}k` : d.omzet}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-xl transition-all duration-300 relative ${
                      isToday
                        ? 'bg-linear-to-t from-orange-600 to-amber-500 shadow-md'
                        : 'bg-orange-100 hover:bg-orange-300'
                    }`}
                  />
                  <span className={`text-[11px] font-bold ${isToday ? 'text-orange-600' : 'text-slate-500'}`}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Method Breakdown (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-amber-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Metode Pembayaran Hari Ini</h3>
            <p className="text-xs text-slate-400">Distribusi kas masuk vs kasbon</p>

            <div className="mt-4 space-y-3">
              {[
                { label: 'Tunai (Cash di Laci)', val: paymentBreakdown.Tunai, color: 'bg-emerald-500' },
                { label: 'QRIS', val: paymentBreakdown.QRIS, color: 'bg-blue-500' },
                { label: 'Transfer Bank', val: paymentBreakdown.Transfer, color: 'bg-purple-500' },
                { label: 'Kasbon (Piutang)', val: paymentBreakdown.Kasbon, color: 'bg-amber-500' }
              ].map(item => {
                const pct = todayOmzet > 0 ? Math.round((item.val / todayOmzet) * 100) : 0;
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{item.label}</span>
                      <span className="font-bold">
                        Rp {item.val.toLocaleString('id-ID')} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Uang Fisik Kas Tunai:</span>
            <span className="font-bold text-slate-800 text-sm">
              Rp {paymentBreakdown.Tunai.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Row: Low Stock Warnings & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Stok Menipis & Kadaluarsa */}
        <div className="bg-white rounded-3xl border border-amber-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <h3 className="font-extrabold text-slate-900 text-sm">Peringatan Stok & Kadaluarsa</h3>
            </div>
            <button
              onClick={() => onNavigateTab('stockin')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5"
            >
              <span>Kulakan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {lowStockProducts.map(p => (
              <div
                key={p.product_id}
                className="p-3 bg-red-50/70 border border-red-200 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-red-900">{p.name}</div>
                  <div className="text-[11px] text-red-700">
                    Sisa: <strong>{p.stock} {p.unit}</strong> (Batas minimal aman: {p.min_stock})
                  </div>
                </div>
                <span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                  Segera Kulakan
                </span>
              </div>
            ))}

            {nearExpiryProducts.map(p => (
              <div
                key={p.product_id}
                className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-amber-900">{p.name}</div>
                  <div className="text-[11px] text-amber-700">
                    Kadaluarsa: <strong>{p.expiry_date}</strong> (Kurang dari 30 hari)
                  </div>
                </div>
                <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                  Dekat Exp
                </span>
              </div>
            ))}

            {lowStockProducts.length === 0 && nearExpiryProducts.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                Semua stok aman dan tidak ada produk yang mendekati tanggal kadaluarsa.
              </div>
            )}
          </div>
        </div>

        {/* Top 5 Produk Terlaris */}
        <div className="bg-white rounded-3xl border border-amber-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-slate-900 text-sm">Top 5 Produk Terlaris</h3>
            <span className="text-xs text-slate-400">Berdasarkan total transaksi</span>
          </div>

          <div className="space-y-2.5">
            {topProducts.map((p, idx) => (
              <div
                key={p.name}
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center ${
                    idx === 0 ? 'bg-amber-400 text-amber-950' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-800">{p.name}</div>
                    <div className="text-[10px] text-slate-400">Terjual: {p.qty} unit</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-orange-600">
                    Rp {p.total.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            ))}

            {topProducts.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                Belum ada transaksi penjualan yang tercatat.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
