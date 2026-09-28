'use client';

import React, { useState, useEffect } from 'react';
import { AppSettings, User } from '@/lib/types';
import { 
  Store, Clock, UserCheck, ShieldCheck, Sparkles, 
  HelpCircle, Settings as SettingsIcon, LogOut, ChevronDown 
} from 'lucide-react';

interface HeaderProps {
  settings: AppSettings;
  currentUser: User | null;
  onSwitchUser: (role: 'Owner' | 'Kasir') => void;
  onOpenSetupWizard: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  currentUser,
  onSwitchUser,
  onOpenSetupWizard,
  onOpenGuide
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-amber-200 sticky top-0 z-40 shadow-xs">
      {/* Warung awning stripe */}
      <div className="h-2.5 warung-awning w-full"></div>

      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand & Store Name */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-black shadow-md shadow-orange-500/20 shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-slate-900 text-lg leading-tight tracking-tight">
                {settings.BUSINESS_NAME || 'Warung Sembako Berkah'}
              </h1>
              <span className="text-xs bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full border border-orange-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-600" />
                KasirWarung AI
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="font-semibold text-orange-700">Made by Piyu</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-slate-600">
                <Clock className="w-3 h-3" />
                {timeStr || '12:00'} WIB
              </span>
              <span>·</span>
              <span className="text-emerald-700 font-medium">DB_KasirWarung Siap</span>
            </div>
          </div>
        </div>

        {/* User Role, Help & Actions */}
        <div className="flex items-center gap-2">
          {/* Guide Quick Button */}
          <button
            onClick={onOpenGuide}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition"
            title="Panduan Penggunaan Warung"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Panduan</span>
          </button>

          {/* User Role Badge & Switcher */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition"
            >
              <div className={`w-2 h-2 rounded-full ${currentUser?.role === 'Owner' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
              <div className="text-left hidden sm:block">
                <div className="leading-tight">{currentUser?.full_name || 'Kasir'}</div>
                <div className="text-[10px] text-slate-500 font-normal">Peran: {currentUser?.role || 'Kasir'}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 border-b border-slate-100 text-xs text-slate-500 font-medium">
                  Ganti Pengguna (Simulasi Akun)
                </div>
                <button
                  onClick={() => {
                    onSwitchUser('Owner');
                    setUserMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-orange-50 ${currentUser?.role === 'Owner' ? 'font-bold text-orange-600' : 'text-slate-700'}`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div>Pak Piyu (Owner)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Hak Akses Penuh</div>
                    </div>
                  </div>
                  {currentUser?.role === 'Owner' && <span className="text-xs">✓</span>}
                </button>
                <button
                  onClick={() => {
                    onSwitchUser('Kasir');
                    setUserMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-orange-50 ${currentUser?.role === 'Kasir' ? 'font-bold text-orange-600' : 'text-slate-700'}`}
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <div>
                      <div>Budi Santoso (Kasir)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Penjualan & Kasbon</div>
                    </div>
                  </div>
                  {currentUser?.role === 'Kasir' && <span className="text-xs">✓</span>}
                </button>
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenSetupWizard();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                    Buka Wizard Setup Awal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
