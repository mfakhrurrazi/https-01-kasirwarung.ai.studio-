'use client';

import React from 'react';
import { AppSettings } from '@/lib/types';
import { ShieldCheck, MessageCircle, BookOpen, FileText, Lock } from 'lucide-react';

interface FooterProps {
  settings: AppSettings;
  onOpenGuide: () => void;
  onOpenLicence: () => void;
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenGuide,
  onOpenLicence,
  onOpenPrivacy
}) => {
  const waUrl = `https://wa.me/${(settings.WHATSAPP || '081234567890').replace(/[^0-9]/g, '').replace(/^0/, '62')}`;

  return (
    <footer className="mt-auto bg-slate-900 text-slate-400 text-xs py-5 px-4 border-t border-slate-800 pb-20 md:pb-5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Left: Copyright & Author */}
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
          <span className="font-bold text-slate-200">© 2026 KasirWarung AI · Made by Piyu</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="text-slate-400">Versi 2.4-PRO (Google Sheets Database)</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full text-[11px] font-semibold">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Lisensi: AKTIF - PRO
          </span>
        </div>

        {/* Right: Quick Links */}
        <div className="flex items-center flex-wrap justify-center gap-4 text-xs">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition font-medium"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Bantuan WhatsApp
          </a>

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 hover:text-amber-400 transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Panduan
          </button>

          <button
            onClick={onOpenLicence}
            className="flex items-center gap-1 hover:text-amber-400 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            Syarat Lisensi
          </button>

          <button
            onClick={onOpenPrivacy}
            className="flex items-center gap-1 hover:text-amber-400 transition"
          >
            <Lock className="w-3.5 h-3.5" />
            Kebijakan Privasi
          </button>
        </div>
      </div>
    </footer>
  );
};
