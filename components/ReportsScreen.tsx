'use client';

import React, { useState, useMemo } from 'react';
import { Sale, AppSettings } from '@/lib/types';
import { 
  FileText, Calendar, Download, Eye, Printer, 
  Banknote, AlertCircle, CheckCircle2, DollarSign 
} from 'lucide-react';

interface ReportsScreenProps {
  sales: Sale[];
  settings: AppSettings;
  onOpenReceipt: (sale: Sale) => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  sales,
  settings,
  onOpenReceipt
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [physicalCashInput, setPhysicalCashInput] = useState<number>(0);
  const [hasCalculatedClose, setHasCalculatedClose] = useState<boolean>(false);

  // Sales for the selected date
  const dateSales = useMemo(() => {
    return sales.filter(s => s.datetime.slice(0, 10) === selectedDate && s.status === 'Selesai');
  }, [sales, selectedDate]);

  // System closing calculation
  const summary = useMemo(() => {
    let cash = 0;
    let qris = 0;
    let transfer = 0;
    let kasbon = 0;
    let total = 0;
    const methodCount = { Tunai: 0, QRIS: 0, Transfer: 0, Kasbon: 0 };

    dateSales.forEach(s => {
      total += s.total;
      if (s.method === 'Tunai') {
        cash += (s.paid - s.change);
        methodCount.Tunai++;
      } else if (s.method === 'QRIS') {
        qris += s.total;
        methodCount.QRIS++;
      } else if (s.method === 'Transfer') {
        transfer += s.total;
        methodCount.Transfer++;
      } else if (s.method === 'Kasbon') {
        kasbon += s.total;
        methodCount.Kasbon++;
      }
    });

    return { total, cash, qris, transfer, kasbon, count: dateSales.length, methodCount };
  }, [dateSales]);

  // Variance calculation
  const variance = physicalCashInput - summary.cash;

  const handleExportCSV = () => {
    const headers = [
      'trx_id', 'datetime', 'cashier', 'customer_id', 'customer_name',
      'subtotal', 'discount', 'total', 'paid', 'change', 'method', 'status'
    ];
    const rows = dateSales.map(s => [
      s.trx_id,
      s.datetime,
      `"${s.cashier}"`,
      s.customer_id,
      `"${(s.customer_name || 'Umum').replace(/"/g, '""')}"`,
      s.subtotal,
      s.discount,
      s.total,
      s.paid,
      s.change,
      s.method,
      s.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Penjualan_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Laporan & Tutup Kasir Harian</h2>
          <p className="text-xs text-slate-500">Rekapitulasi penjualan, kas masuk, dan rekonsiliasi uang fisik di laci kasir</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={e => {
              setSelectedDate(e.target.value);
              setHasCalculatedClose(false);
            }}
            className="px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-orange-500"
          />

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Tutup Kasir Reconcile Card */}
      <div className="bg-white rounded-3xl border border-amber-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-amber-200/80 mb-4">
          <Banknote className="w-5 h-5 text-orange-600" />
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Rekonsiliasi Tutup Buku Kasir ({selectedDate})</h3>
            <p className="text-[11px] text-slate-400">Cocokkan uang tunai fisik yang dihitung di laci dengan catatan sistem</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* System Cash Total */}
          <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200 space-y-1">
            <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider block">
              1. Kas Tunai di Sistem
            </span>
            <div className="text-xl font-black text-orange-600">
              Rp {summary.cash.toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-slate-500">
              Dari {summary.count} transaksi ({summary.methodCount?.Tunai || ''} tunai)
            </div>
          </div>

          {/* Physical Cash Input */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              2. Uang Fisik Dihitung di Laci (Rp)
            </span>
            <input
              type="number"
              placeholder="Ketik total uang laci..."
              value={physicalCashInput || ''}
              onChange={e => {
                setPhysicalCashInput(Number(e.target.value) || 0);
                setHasCalculatedClose(true);
              }}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-base font-black text-slate-900 focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Variance Status */}
          <div className={`p-4 rounded-2xl border space-y-1 ${
            !hasCalculatedClose ? 'bg-slate-50 border-slate-200 text-slate-400' :
            variance === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
            variance > 0 ? 'bg-blue-50 border-blue-200 text-blue-900' :
            'bg-red-50 border-red-200 text-red-900'
          }`}>
            <span className="text-[11px] font-bold uppercase tracking-wider block">
              3. Selisih Kas Laci
            </span>
            <div className="text-xl font-black">
              {!hasCalculatedClose ? 'Rp 0' : (
                variance === 0 ? 'Rp 0 (PAS COCOK)' :
                variance > 0 ? `+Rp ${variance.toLocaleString('id-ID')} (LEBIH)` :
                `-Rp ${Math.abs(variance).toLocaleString('id-ID')} (KURANG)`
              )}
            </div>
            <div className="text-[10px]">
              {!hasCalculatedClose ? 'Masukkan jumlah uang laci di kolom 2' :
                variance === 0 ? 'Alhamdulillah, uang kas di laci pas dengan transaksi!' :
                variance > 0 ? 'Ada uang lebih di laci, periksa kembali uang kembalian' :
                'Uang laci kurang, cek transaksi kasbon atau uang keluar belum tercatat'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards of Selected Day */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Total Omzet Hari Ini</div>
          <div className="text-base font-black text-slate-900 mt-0.5">
            Rp {summary.total.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-blue-600 font-bold uppercase">QRIS Diterima</div>
          <div className="text-base font-black text-blue-700 mt-0.5">
            Rp {summary.qris.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-purple-600 font-bold uppercase">Transfer Bank</div>
          <div className="text-base font-black text-purple-700 mt-0.5">
            Rp {summary.transfer.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-amber-600 font-bold uppercase">Kasbon Baru</div>
          <div className="text-base font-black text-amber-700 mt-0.5">
            Rp {summary.kasbon.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-amber-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              Daftar Transaksi Tanggal {selectedDate} ({dateSales.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">No. TRX</th>
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Kasir</th>
                <th className="py-2.5 px-3">Pelanggan</th>
                <th className="py-2.5 px-3 text-center">Metode</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3 text-center">Struk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dateSales.map(s => (
                <tr key={s.trx_id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{s.trx_id}</td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {new Date(s.datetime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">{s.cashier}</td>
                  <td className="py-2.5 px-3 text-slate-800 font-semibold">{s.customer_name || 'Umum'}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.method === 'Tunai' ? 'bg-emerald-100 text-emerald-800' :
                      s.method === 'QRIS' ? 'bg-blue-100 text-blue-800' :
                      s.method === 'Transfer' ? 'bg-purple-100 text-purple-800' :
                      'bg-amber-100 text-amber-900'
                    }`}>
                      {s.method}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-slate-900">
                    Rp {s.total.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onOpenReceipt(s)}
                      className="p-1.5 hover:bg-orange-50 rounded-lg text-orange-600 transition"
                      title="Cetak Ulang Struk 58mm"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {dateSales.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            Tidak ada transaksi pada tanggal ini.
          </div>
        )}
      </div>
    </div>
  );
};
