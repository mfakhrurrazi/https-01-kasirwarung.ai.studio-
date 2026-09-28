'use client';

import React from 'react';
import { BookOpen, FileText, Lock, X, CheckCircle, ShieldCheck } from 'lucide-react';

interface GuideAndLicenceModalProps {
  type: 'guide' | 'licence' | 'privacy' | null;
  onClose: () => void;
}

export const GuideAndLicenceModal: React.FC<GuideAndLicenceModalProps> = ({
  type,
  onClose
}) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-orange-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            {type === 'guide' && <BookOpen className="w-5 h-5 text-amber-200" />}
            {type === 'licence' && <FileText className="w-5 h-5 text-amber-200" />}
            {type === 'privacy' && <Lock className="w-5 h-5 text-amber-200" />}
            <h3 className="font-extrabold text-sm">
              {type === 'guide' && 'Panduan Penggunaan KasirWarung AI'}
              {type === 'licence' && 'Syarat Lisensi Penggunaan'}
              {type === 'privacy' && 'Kebijakan Privasi Data Warung'}
            </h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          {type === 'guide' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900">
                <span className="font-bold">Tips Cepat Kasir:</span>
                <p className="text-[11px] mt-0.5">
                  Gunakan barcode scanner USB atau ketik 3 huruf pertama nama barang. Harga grosir otomatis diterapkan saat jumlah mencapai batas minimal dus/slop!
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">1. Cara Transaksi Kasbon</h4>
                <p>
                  Pilih nama pelanggan di dropdown kasir. Pilih metode pembayaran &ldquo;Kasbon&rdquo;. Sistem akan memeriksa batas limit kredit pelanggan. Klik &ldquo;Bayar &amp; Cetak Struk&rdquo;. Catatan otomatis tersimpan di Buku Kasbon.
                </p>

                <h4 className="font-bold text-slate-900">2. Cara Kulakan & Menghitung Modal Baru</h4>
                <p>
                  Masuk ke menu <strong>Stok Masuk</strong>, pilih produk dan masukkan harga kulakan dari agen. Sistem otomatis menghitung harga pokok rata-rata tertimbang agar margin laba akurat.
                </p>

                <h4 className="font-bold text-slate-900">3. Menagih Kasbon Santun lewat WhatsApp</h4>
                <p>
                  Buka menu <strong>Pelanggan & Kasbon</strong>, klik tombol <strong>Tagih</strong> di sebelah nama tetangga. Sistem AI akan menyusun kalimat salam dan pengingat yang santun. Klik <em>Buka WhatsApp</em> untuk langsung mengirim.
                </p>

                <h4 className="font-bold text-slate-900">4. Tutup Kasir Harian</h4>
                <p>
                  Di akhir shift, buka menu <strong>Laporan</strong>, masukkan hitungan fisik uang kertas dan koin di laci kasir. Sistem akan membandingkannya dengan kas sistem dan menampilkan selisih bila ada.
                </p>
              </div>
            </div>
          )}

          {type === 'licence' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Lisensi Terverifikasi: PRO-2026-PIYU (Aktif Selamanya)</span>
              </div>

              <div className="space-y-2">
                <p>
                  Aplikasi ini didistribusikan untuk pemilik toko kelontong / warung sembako mandiri di Indonesia.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>Hak penggunaan seumur hidup untuk 1 toko/warung fisik.</li>
                  <li>Dilarang menjual kembali kode sumber tanpa izin dari pengembang (Piyu).</li>
                  <li>Dukungan pembaruan database dan perbaikan kompatibilitas Google Sheets.</li>
                </ul>
              </div>
            </div>
          )}

          {type === 'privacy' && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-blue-900 font-bold">
                Kedaulatan Data 100% Milik Pemilik Toko
              </div>
              <p>
                Seluruh data transaksi, pelanggan, catatan utang kasbon, dan rincian produk disimpan di dalam <strong>Google Spreadsheet akun Google Drive Anda sendiri</strong> (DB_KasirWarung).
              </p>
              <p>
                Tidak ada data sensitif keuangan yang dikirim ke server pihak ketiga manapun. Kunci API AI hanya digunakan sementara untuk memproses saran kulakan atau draf kalimat santun.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
