import type {Metadata} from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'KasirWarung AI - POS & Kasbon Warung Sembako Modern',
  description: 'Sistem Kasir, Stok, dan Buku Kasbon Warung Sembako / Toko Kelontong Modern dengan Dukungan AI & Google Sheets. Made by Piyu.',
  openGraph: {
    title: 'KasirWarung AI - POS & Kasbon Warung Sembako Modern',
    description: 'Sistem Kasir, Stok, dan Buku Kasbon Warung Sembako / Toko Kelontong Modern dengan Dukungan AI & Google Sheets.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KasirWarung AI - POS & Kasbon Warung Sembako Modern',
    description: 'Sistem Kasir, Stok, dan Buku Kasbon Warung Sembako / Toko Kelontong Modern dengan Dukungan AI & Google Sheets.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" className={nunito.variable}>
      <body className={`antialiased text-slate-800 bg-[#FFFBEB] ${nunito.className}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
