'use client';

import React, { useState } from 'react';
import { AppSettings, User } from '@/lib/types';
import { 
  Settings as SettingsIcon, Save, RefreshCw, Key, 
  Database, ShieldCheck, Check, AlertTriangle 
} from 'lucide-react';

interface SettingsScreenProps {
  settings: AppSettings;
  currentUser: User | null;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetDemoData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  currentUser,
  onUpdateSettings,
  onResetDemoData
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [backupMsg, setBackupMsg] = useState('');

  const isOwner = currentUser?.role === 'Owner';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSimulateBackup = () => {
    setBackupMsg('Membuat salinan cadangan Google Spreadsheet DB_KasirWarung...');
    setTimeout(() => {
      setBackupMsg(`Cadangan harian berhasil disimpan ke Google Drive: DB_KasirWarung_Backup_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }, 1200);
  };

  const handleConfirmReset = () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang data kembali ke data contoh warung sembako bawaan? Semua perubahan baru akan diganti.')) {
      onResetDemoData();
      alert('Data berhasil di-reset ke data demo!');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Pengaturan Warung & Integrasi</h2>
          <p className="text-xs text-slate-500">Konfigurasi profil usaha, tombol AI, kunci lisensi, dan script properties</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan warung berhasil disimpan!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {/* General Store Info */}
        <div className="bg-white rounded-3xl border border-amber-200 p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-orange-600" />
            <span>Identitas Warung Sembako (Sheet Settings)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Toko / Warung *</label>
              <input
                type="text"
                required
                value={formData.BUSINESS_NAME}
                onChange={e => setFormData({ ...formData, BUSINESS_NAME: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">No. WhatsApp Warung *</label>
              <input
                type="text"
                required
                value={formData.WHATSAPP}
                onChange={e => setFormData({ ...formData, WHATSAPP: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                placeholder="081234567890"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">URL Logo Warung (Opsional)</label>
              <input
                type="text"
                value={formData.LOGO_URL}
                onChange={e => setFormData({ ...formData, LOGO_URL: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Pajak Tambahan (PPN %)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.TAX_PERCENT}
                onChange={e => setFormData({ ...formData, TAX_PERCENT: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* AI Control Card */}
        <div className="bg-white rounded-3xl border border-amber-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span>Modul AI & Kunci Properti (Script Properties)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Fitur AI adalah nilai tambah yang dapat dinonaktifkan kapan saja oleh pemilik toko.
              </p>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.AI_ENABLED}
                onChange={e => setFormData({ ...formData, AI_ENABLED: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              <span className="ml-2 font-bold text-slate-700">
                {formData.AI_ENABLED ? 'AI AKTIF' : 'NONAKTIF'}
              </span>
            </label>
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-[11px] space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Prinsip Keandalan 100%:</span>
            </div>
            <div>
              Aplikasi KasirWarung AI dirancang untuk bekerja 100% tanpa hambatan meskipun AI dimatikan atau tanpa koneksi internet. Setiap tombol analisis (Saran Kulakan, Pesan Tagih Santun, Cerita Omzet) memiliki rumus aturan otomatis (*rule-based fallback*) sehingga kasir tidak akan pernah terhenti.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">AI_BASE_URL (Endpoint Proxy OpenAI)</label>
              <input
                type="text"
                value={formData.AI_BASE_URL || ''}
                onChange={e => setFormData({ ...formData, AI_BASE_URL: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-600"
                placeholder="http://43.133.148.28:20128/v1"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">AI_MODEL</label>
              <input
                type="text"
                value={formData.AI_MODEL || ''}
                onChange={e => setFormData({ ...formData, AI_MODEL: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                placeholder="gpt-3.5-turbo"
              />
            </div>

            <div className="col-span-2">
              <label className="font-bold text-slate-700 block mb-1">LICENSE_KEY (Kunci Lisensi Penjualan)</label>
              <input
                type="text"
                value={formData.LICENSE_KEY || ''}
                onChange={e => setFormData({ ...formData, LICENSE_KEY: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-emerald-700"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="py-2.5 px-6 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md shadow-orange-500/20 transition active:scale-98 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Pengaturan</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Backup & Demo Data Reset (Owner Only) */}
      {isOwner && (
        <div className="bg-white rounded-3xl border border-red-200 p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold text-red-900 text-sm pb-2 border-b border-red-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Pusat Kendali Pemilik Toko (Owner Only)</span>
          </h3>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="font-bold text-slate-800">Pencadangan Spreadsheet Google Drive</div>
              <div className="text-[11px] text-slate-400">Jalankan pemicu salinan otomatis (Trigger Backup) harian</div>
            </div>
            <button
              onClick={handleSimulateBackup}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Database className="w-4 h-4 text-slate-600" />
              <span>Cadangkan Sekarang</span>
            </button>
          </div>

          {backupMsg && (
            <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-semibold">
              {backupMsg}
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="font-bold text-red-700">Atur Ulang Data ke Contoh Sembako (Demo Reset)</div>
              <div className="text-[11px] text-slate-400">Kembalikan 10 produk, pelanggan, dan kasbon awal bawaan</div>
            </div>
            <button
              onClick={handleConfirmReset}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-4 h-4 text-red-600" />
              <span>Reset Data Demo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
