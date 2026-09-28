'use client';

import React, { useState } from 'react';
import { GAS_SCRIPTS, DEPLOYMENT_GUIDE_MD, GasFile } from '@/lib/gas-scripts';
import { 
  Code2, Copy, Check, Download, FileText, 
  Terminal, ShieldCheck, CheckCircle2, ExternalLink 
} from 'lucide-react';

export const GasStudioScreen: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('Setup.gs');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'code' | 'guide' | 'checklist'>('code');

  const currentFile = GAS_SCRIPTS.find(f => f.name === selectedFile) || GAS_SCRIPTS[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([currentFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', currentFile.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Google Apps Script Studio & Deployment
            </h2>
            <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-black rounded-full border border-orange-200">
              DB_KasirWarung
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Source code lengkap tanpa placeholder untuk dipasang di Google Sheets & Google Apps Script
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'code' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600'}`}
          >
            File Script ({GAS_SCRIPTS.length})
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'guide' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600'}`}
          >
            Panduan Deploy
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'checklist' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600'}`}
          >
            Checklist Uji
          </button>
        </div>
      </div>

      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* File List Navigation (3 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-amber-200 p-3 shadow-xs space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              File Google Apps Script (.gs & .html)
            </div>
            {GAS_SCRIPTS.map(file => (
              <button
                key={file.name}
                onClick={() => {
                  setSelectedFile(file.name);
                  setCopied(false);
                }}
                className={`w-full text-left p-3 rounded-2xl transition flex items-center justify-between cursor-pointer ${
                  selectedFile === file.name
                    ? 'bg-orange-50 text-orange-900 font-extrabold border border-orange-200'
                    : 'hover:bg-slate-50 text-slate-700 font-semibold'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                    file.type === 'server' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {file.type === 'server' ? 'GS' : '<>'}
                  </div>
                  <div className="truncate">
                    <div className="text-xs truncate">{file.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal truncate max-w-44">
                      {file.description}
                    </div>
                  </div>
                </div>
                <span className="text-slate-400 text-xs">›</span>
              </button>
            ))}
          </div>

          {/* Code Viewer (8 Cols) */}
          <div className="lg:col-span-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
            {/* Top Toolbar */}
            <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-orange-400" />
                <span className="font-mono font-bold text-slate-200">{currentFile.name}</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                  {currentFile.type === 'server' ? 'Google Apps Script' : 'HtmlService Part'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadFile}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl flex items-center gap-1.5 transition text-[11px]"
                  title="Unduh File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh</span>
                </button>

                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition active:scale-98 text-[11px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
                </button>
              </div>
            </div>

            {/* Description Banner */}
            <div className="px-5 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              💡 {currentFile.description}
            </div>

            {/* Code Body */}
            <div className="p-4 overflow-x-auto max-h-[550px] overflow-y-auto">
              <pre className="text-slate-300 font-mono text-xs leading-relaxed">
                <code>{currentFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'guide' && (
        <div className="bg-white rounded-3xl border border-amber-200 p-6 shadow-xs max-w-4xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="w-5 h-5 text-orange-600" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Panduan Lengkap Pemasangan di Google Sheets & Google Apps Script
            </h3>
          </div>

          <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-4 text-slate-700">
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200 text-orange-950 space-y-1">
              <h4 className="font-bold text-sm">Langkah Cepat (5 Menit Selesai):</h4>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Buka <strong>sheets.new</strong> dan beri nama spreadsheet <code>DB_KasirWarung</code>.</li>
                <li>Klik <strong>Extensions</strong> &gt; <strong>Apps Script</strong>.</li>
                <li>Salin kode dari tab <em>File Script</em> (Setup.gs, Code.gs, Data.gs, AI.gs, Reports.gs, Index.html, Styles.html, Scripts.html).</li>
                <li>Atur <strong>Script Properties</strong>: <code>AI_BASE_URL</code>, <code>AI_API_KEY</code>, <code>AI_MODEL</code>, <code>LICENSE_KEY</code>.</li>
                <li>Jalankan fungsi <code>setupDatabase()</code> di Setup.gs satu kali untuk otomatisasi lembar &amp; data contoh.</li>
                <li>Klik <strong>Deploy</strong> &gt; <strong>New Deployment</strong> &gt; <strong>Web app</strong> (Execute as: Me, Who has access: Anyone). Buka tautan di HP Android!</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900">Parameter Script Properties:</h5>
                <ul className="space-y-1 font-mono text-[11px] text-slate-600">
                  <li><strong>AI_BASE_URL:</strong> http://43.133.148.28:20128/v1</li>
                  <li><strong>AI_MODEL:</strong> gpt-3.5-turbo</li>
                  <li><strong>AI_API_KEY:</strong> (Kunci API Anda)</li>
                  <li><strong>LICENSE_KEY:</strong> KW-AI-PRO-2026-PIYU-8891</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900">Akun Login Bawaan:</h5>
                <ul className="space-y-1 text-slate-600 text-[11px]">
                  <li><strong>Owner:</strong> username: <code>admin</code> / password: <code>admin123</code></li>
                  <li><strong>Kasir:</strong> username: <code>kasir</code> / password: <code>kasir123</code></li>
                  <li className="text-[10px] text-emerald-700 font-semibold pt-1">
                    *Terenkripsi salted SHA-256 di sheet Users dengan proteksi sel otomatis.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'checklist' && (
        <div className="bg-white rounded-3xl border border-amber-200 p-6 shadow-xs max-w-4xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Kriteria Penyelesaian & Checklist Pengujian Sistem
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {[
              {
                title: 'Transaksi 20 Item Selesai < 30 Detik',
                desc: 'Kasir dapat menambahkan produk dengan barcode atau ketukan cepat, jumlah disesuaikan dengan stepper instan, dan struk tercetak dalam hitungan detik.',
                done: true
              },
              {
                title: 'Harga Bertingkat Otomatis (Tier Pricing)',
                desc: 'Saat kuantitas mencapai bundle_qty atau wholesale_qty, harga otomatis beralih ke harga yang lebih murah tanpa intervensi manual kasir.',
                done: true
              },
              {
                title: 'Validasi Limit Kasbon & Penulisan ke Buku Piutang',
                desc: 'Jika metode Kasbon dipilih, sistem memeriksa credit_limit pelanggan. Jika limit tidak mencukupi, transaksi ditolak; jika cukup, baris Credits otomatis terbuat.',
                done: true
              },
              {
                title: 'Perhitungan Rata-rata Modal Otomatis (Weighted Cost)',
                desc: 'Saat stok masuk kulakan dicatat, sistem menghitung ulang harga pokok rata-rata tertimbang berdasarkan sisa stok lama dan harga kulakan baru.',
                done: true
              },
              {
                title: 'Kemampuan Beroperasi 100% Tanpa AI (Offline Graceful Fallback)',
                desc: 'Tombol AI (Saran Kulakan, Pesan Tagih Halus, Cerita Omzet) selalu memiliki cadangan aturan matematis sehingga tidak pernah gagal.',
                done: true
              },
              {
                title: 'Struk Termal 58mm Siap Cetak',
                desc: 'Tata letak struk pas dengan standar printer bluetooth / USB 58mm untuk warung kelontong.',
                done: true
              },
              {
                title: 'Responsif Layar HP Android 5 Inci',
                desc: 'Target sentuh minimal 44px, navigasi bawah di ponsel, dan font 18px tebal yang ramah pemilik warung usia lanjut.',
                done: true
              }
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
