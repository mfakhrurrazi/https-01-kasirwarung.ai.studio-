'use client';

import React, { useState } from 'react';
import { AppSettings, User } from '@/lib/types';
import { Store, Database, Sparkles, Check, ChevronRight, X, ArrowLeft } from 'lucide-react';

interface SetupWizardModalProps {
  settings: AppSettings;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newSettings: Partial<AppSettings>) => void;
}

export const SetupWizardModal: React.FC<SetupWizardModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSave
}) => {
  const [step, setStep] = useState<number>(1);
  const [businessName, setBusinessName] = useState(settings.BUSINESS_NAME || 'Warung Sembako Berkah Jaya');
  const [whatsapp, setWhatsapp] = useState(settings.WHATSAPP || '081234567890');
  const [aiEnabled, setAiEnabled] = useState(settings.AI_ENABLED);

  if (!isOpen) return null;

  const handleFinish = () => {
    onSave({
      BUSINESS_NAME: businessName,
      WHATSAPP: whatsapp,
      AI_ENABLED: aiEnabled
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-amber-200 flex flex-col">
        {/* Wizard Top */}
        <div className="px-5 py-4 bg-linear-to-r from-orange-600 to-amber-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-200" />
            <h3 className="font-extrabold text-sm">Setup Wizard KasirWarung AI</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-5 pt-3 pb-1 flex justify-between text-xs font-bold text-slate-400 border-b border-slate-100">
          <span className={step >= 1 ? 'text-orange-600' : ''}>1. Profil Warung</span>
          <span className={step >= 2 ? 'text-orange-600' : ''}>2. Database Sheet</span>
          <span className={step >= 3 ? 'text-orange-600' : ''}>3. Selesai</span>
        </div>

        {/* Body Content */}
        <div className="p-5 text-xs space-y-4">
          {step === 1 && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Selamat Datang di KasirWarung AI!</h4>
              <p className="text-slate-500">
                Langkah pertama, tentukan nama warung sembako dan nomor kontak WhatsApp yang akan dicetak di struk belanja.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Toko / Warung *</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  placeholder="Warung Sembako Berkah Jaya"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp Toko *</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  placeholder="081234567890"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Arsitektur Database DB_KasirWarung</h4>
              <p className="text-slate-500">
                Sistem terhubung dengan database Google Sheets dengan skema lengkap:
              </p>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-1.5 text-[11px] text-amber-900">
                <div className="flex items-center gap-1.5 font-bold">
                  <Database className="w-4 h-4 text-amber-700" />
                  <span>8 Lembar Kerja Terstruktur:</span>
                </div>
                <div>• <strong>Products:</strong> Katalog sembako & harga bertingkat</div>
                <div>• <strong>Customers & Credits:</strong> Catatan limit & buku kasbon</div>
                <div>• <strong>Sales & StockMoves:</strong> Riwayat kasir & kartu stok</div>
                <div>• <strong>Users & Settings:</strong> Sandi terenkripsi & konfigurasi</div>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-800 text-[11px] font-semibold">
                ✓ 10 data sampel sembako realistis Indonesia siap digunakan!
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Preferensi Modul AI & Penutup</h4>
              <p className="text-slate-500">
                Pilih apakah fitur cerdas (Saran Kulakan, Pesan Tagih Santun, Cerita Omzet) diaktifkan:
              </p>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Aktifkan Nilai Tambah AI</div>
                  <div className="text-[10px] text-slate-400">Bisa dimatikan kapan saja lewat menu Pengaturan</div>
                </div>
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={e => setAiEnabled(e.target.checked)}
                  className="w-5 h-5 accent-orange-600 rounded"
                />
              </div>

              <div className="p-3 bg-orange-50 rounded-2xl border border-orange-200 text-orange-950 font-bold text-center">
                🎉 Warung Anda Siap Melayani Pembeli!
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 flex items-center gap-1 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs shadow-xs"
            >
              <span>Lanjut</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Selesai & Buka Kasir</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
