'use client';

import React from 'react';
import { Sale, AppSettings } from '@/lib/types';
import { Printer, X, CheckCircle2, Share2 } from 'lucide-react';

interface ThermalReceiptModalProps {
  sale: Sale | null;
  settings: AppSettings;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  sale,
  settings,
  onClose
}) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWA = () => {
    let items: any[] = [];
    try {
      items = JSON.parse(sale.items_json);
    } catch (e) {}

    let text = `*STRUK PEMBELIAN - ${settings.BUSINESS_NAME}*\n`;
    text += `No. Transaksi: ${sale.trx_id}\n`;
    text += `Waktu: ${new Date(sale.datetime).toLocaleString('id-ID')}\n`;
    text += `Kasir: ${sale.cashier}\n`;
    text += `Pelanggan: ${sale.customer_name || 'Umum'}\n`;
    text += `--------------------------------\n`;
    items.forEach(it => {
      text += `${it.name}\n${it.qty} x Rp ${it.price.toLocaleString('id-ID')} = Rp ${it.subtotal.toLocaleString('id-ID')}\n`;
    });
    text += `--------------------------------\n`;
    text += `*TOTAL: Rp ${sale.total.toLocaleString('id-ID')}*\n`;
    text += `Metode: ${sale.method}\n`;
    if (sale.method === 'Tunai') {
      text += `Bayar: Rp ${sale.paid.toLocaleString('id-ID')}\nKembali: Rp ${sale.change.toLocaleString('id-ID')}\n`;
    }
    text += `\n_Terima kasih sudah berbelanja di warung kami!_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  let items: any[] = [];
  try {
    items = JSON.parse(sale.items_json);
  } catch (e) {
    items = [];
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-amber-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-100" />
            <h3 className="font-extrabold text-sm tracking-wide">Transaksi Berhasil & Struk</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Printable 58mm Thermal Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-amber-50/40">
          <div
            id="thermal-receipt-print-area"
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-slate-900 font-mono text-xs mx-auto w-[240px]"
          >
            {/* Store Banner */}
            <div className="text-center border-b border-dashed border-slate-300 pb-2 mb-2">
              <div className="font-bold text-sm tracking-tight">{settings.BUSINESS_NAME}</div>
              <div className="text-[10px] text-slate-500">Sembako, Minuman & Kelontong</div>
              <div className="text-[10px] text-slate-500">WA: {settings.WHATSAPP}</div>
            </div>

            {/* Meta info */}
            <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-300 pb-2 mb-2">
              <div className="flex justify-between">
                <span>No. TRX:</span>
                <span className="font-bold">{sale.trx_id}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{new Date(sale.datetime).toLocaleDateString('id-ID')} {new Date(sale.datetime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{sale.cashier}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span className="font-bold">{sale.customer_name || 'Pelanggan Umum'}</span>
              </div>
            </div>

            {/* Item Table */}
            <div className="border-b border-dashed border-slate-300 pb-2 mb-2 space-y-1.5">
              {items.map((item, idx) => (
                <div key={idx} className="text-[10px]">
                  <div className="font-semibold truncate">{item.name}</div>
                  <div className="flex justify-between text-slate-600">
                    <span>
                      {item.qty} x {item.price.toLocaleString('id-ID')}
                      {item.tier !== 'Eceran' && (
                        <span className="text-[9px] text-amber-700 ml-1">({item.tier})</span>
                      )}
                    </span>
                    <span className="font-bold text-slate-900">
                      {item.subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 border-b border-dashed border-slate-300 pb-2 mb-2 text-[10px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rp {sale.subtotal.toLocaleString('id-ID')}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Diskon:</span>
                  <span>-Rp {sale.discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-200">
                <span>TOTAL:</span>
                <span>Rp {sale.total.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode:</span>
                <span className="font-bold">{sale.method}</span>
              </div>
              {sale.method === 'Tunai' ? (
                <>
                  <div className="flex justify-between">
                    <span>Bayar:</span>
                    <span>Rp {sale.paid.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>Kembali:</span>
                    <span>Rp {sale.change.toLocaleString('id-ID')}</span>
                  </div>
                </>
              ) : sale.method === 'Kasbon' ? (
                <div className="p-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-center text-[9px] font-semibold mt-1">
                  Dicatat ke Buku Kasbon (Jatuh tempo 7 hari)
                </div>
              ) : null}
            </div>

            {/* Barcode & Cordial Greeting */}
            <div className="text-center pt-1 text-[9px] text-slate-500 space-y-1">
              <div className="font-bold tracking-widest text-slate-700 text-xs">
                ||| | |||| | ||| || |||
              </div>
              <div>Matur Nuwun / Terima Kasih!</div>
              <div className="text-[8px] text-slate-400">KasirWarung AI · Made by Piyu</div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md shadow-orange-500/20 transition active:scale-98"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk (58mm)
          </button>
          <button
            onClick={handleShareWA}
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs transition active:scale-98"
            title="Kirim Struk ke WhatsApp"
          >
            <Share2 className="w-4 h-4" />
            WA
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
