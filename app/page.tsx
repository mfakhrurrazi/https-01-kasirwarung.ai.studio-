'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PosScreen } from '@/components/PosScreen';
import { DashboardScreen } from '@/components/DashboardScreen';
import { ProductsScreen } from '@/components/ProductsScreen';
import { StockInScreen } from '@/components/StockInScreen';
import { KasbonScreen } from '@/components/KasbonScreen';
import { ReportsScreen } from '@/components/ReportsScreen';
import { SettingsScreen } from '@/components/SettingsScreen';
import { GasStudioScreen } from '@/components/GasStudioScreen';
import { ThermalReceiptModal } from '@/components/ThermalReceiptModal';
import { GuideAndLicenceModal } from '@/components/GuideAndLicenceModal';
import { SetupWizardModal } from '@/components/SetupWizardModal';
import { Sale } from '@/lib/types';
import { 
  ShoppingCart, LayoutDashboard, Package, ArrowDownLeft, 
  BookUser, FileBarChart, Settings as SettingsIcon, Code2, 
  HelpCircle, Menu, X, Store 
} from 'lucide-react';

export default function Home() {
  const {
    isLoaded,
    products,
    customers,
    sales,
    credits,
    stockMoves,
    settings,
    currentUser,
    activeTab,
    setActiveTab,
    setCurrentUser,
    getCustomerBalance,
    calculateTierPrice,
    processCheckout,
    processStockIn,
    recordCreditPayment,
    updateSettings,
    saveProduct,
    saveCustomer,
    resetDemoData
  } = useAppStore();

  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);
  const [modalType, setModalType] = useState<'guide' | 'licence' | 'privacy' | null>(null);
  const [setupWizardOpen, setSetupWizardOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FFFBEB] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-orange-500/30 animate-pulse mb-3">
          🏪
        </div>
        <h2 className="font-black text-slate-800 text-base">Memuat KasirWarung AI...</h2>
        <p className="text-xs text-slate-500 mt-1">Menyiapkan database DB_KasirWarung & kartu stok sembako</p>
      </div>
    );
  }

  const handleSaleCompleted = (sale: Sale) => {
    setActiveReceiptSale(sale);
  };

  const navItems = [
    { id: 'pos', label: 'Kasir (POS)', icon: ShoppingCart },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Produk', icon: Package },
    { id: 'stockin', label: 'Stok Masuk', icon: ArrowDownLeft },
    { id: 'kasbon', label: 'Buku Kasbon', icon: BookUser },
    { id: 'reports', label: 'Laporan & Tutup', icon: FileBarChart },
    { id: 'settings', label: 'Pengaturan', icon: SettingsIcon },
    { id: 'gas_studio', label: 'Apps Script & Deploy', icon: Code2, badge: 'Code' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBEB]">
      {/* Top Header */}
      <Header
        settings={settings}
        currentUser={currentUser}
        onSwitchUser={role => {
          if (role === 'Owner') {
            setCurrentUser({
              username: 'admin',
              password_hash: '',
              salt: '',
              role: 'Owner',
              full_name: 'Pak Piyu (Owner)',
              active: true
            });
          } else {
            setCurrentUser({
              username: 'kasir',
              password_hash: '',
              salt: '',
              role: 'Kasir',
              full_name: 'Budi Santoso (Kasir)',
              active: true
            });
          }
        }}
        onOpenSetupWizard={() => setSetupWizardOpen(true)}
        onOpenGuide={() => setModalType('guide')}
      />

      {/* Main Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex gap-5">
        {/* Desktop Sidebar (Left) */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white rounded-3xl border border-amber-200 p-3 shadow-xs h-fit sticky top-20 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
            Menu Warung
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl font-extrabold text-xs flex items-center justify-between transition cursor-pointer select-none ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-700 hover:bg-orange-50 hover:text-orange-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-white text-orange-600' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100 mt-2 space-y-1">
            <button
              onClick={() => setModalType('guide')}
              className="w-full min-h-[40px] px-3.5 py-2 rounded-2xl font-bold text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Panduan Warung</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'pos' && (
            <PosScreen
              products={products}
              customers={customers}
              getCustomerBalance={getCustomerBalance}
              calculateTierPrice={calculateTierPrice}
              onProcessCheckout={processCheckout}
              onSaleCompleted={handleSaleCompleted}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardScreen
              products={products}
              sales={sales}
              credits={credits}
              settings={settings}
              onNavigateTab={tab => setActiveTab(tab)}
            />
          )}

          {activeTab === 'products' && (
            <ProductsScreen
              products={products}
              onSaveProduct={saveProduct}
            />
          )}

          {activeTab === 'stockin' && (
            <StockInScreen
              products={products}
              stockMoves={stockMoves}
              settings={settings}
              onProcessStockIn={processStockIn}
            />
          )}

          {activeTab === 'kasbon' && (
            <KasbonScreen
              customers={customers}
              credits={credits}
              settings={settings}
              getCustomerBalance={getCustomerBalance}
              onSaveCustomer={saveCustomer}
              onRecordCreditPayment={recordCreditPayment}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsScreen
              sales={sales}
              settings={settings}
              onOpenReceipt={sale => setActiveReceiptSale(sale)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen
              settings={settings}
              currentUser={currentUser}
              onUpdateSettings={updateSettings}
              onResetDemoData={resetDemoData}
            />
          )}

          {activeTab === 'gas_studio' && (
            <GasStudioScreen />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible on < 768px, target >= 44px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-amber-200 py-1.5 px-2 flex justify-around items-center z-40 shadow-lg">
        {[
          { id: 'pos', label: 'Kasir', icon: ShoppingCart },
          { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
          { id: 'kasbon', label: 'Kasbon', icon: BookUser },
          { id: 'products', label: 'Produk', icon: Package },
          { id: 'more', label: 'Lainnya', icon: Menu }
        ].map(item => {
          const Icon = item.icon;
          const isActive = item.id === 'more' ? mobileMenuOpen : activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'more') {
                  setMobileMenuOpen(!mobileMenuOpen);
                } else {
                  setActiveTab(item.id as any);
                  setMobileMenuOpen(false);
                }
              }}
              className={`min-h-[44px] min-w-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 transition ${
                isActive ? 'text-orange-600 font-black' : 'text-slate-500 font-semibold'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] leading-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile "More" Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-5 space-y-2 border-t border-amber-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-black text-slate-800 text-sm">Menu Tambahan Warung</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {[
              { id: 'stockin', label: 'Stok Masuk / Kulakan', icon: ArrowDownLeft },
              { id: 'reports', label: 'Laporan & Tutup Kasir', icon: FileBarChart },
              { id: 'settings', label: 'Pengaturan Warung', icon: SettingsIcon },
              { id: 'gas_studio', label: 'Google Apps Script Studio', icon: Code2 }
            ].map(m => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setActiveTab(m.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full min-h-[44px] px-4 py-3 rounded-2xl bg-slate-50 hover:bg-orange-50 text-slate-800 font-bold text-xs flex items-center gap-3"
                >
                  <Icon className="w-4 h-4 text-orange-600" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 58mm Thermal Receipt Modal */}
      <ThermalReceiptModal
        sale={activeReceiptSale}
        settings={settings}
        onClose={() => setActiveReceiptSale(null)}
      />

      {/* Guide, Licence, and Privacy Modal */}
      <GuideAndLicenceModal
        type={modalType}
        onClose={() => setModalType(null)}
      />

      {/* Setup Wizard Modal */}
      <SetupWizardModal
        settings={settings}
        isOpen={setupWizardOpen}
        onClose={() => setSetupWizardOpen(false)}
        onSave={updateSettings}
      />

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenGuide={() => setModalType('guide')}
        onOpenLicence={() => setModalType('licence')}
        onOpenPrivacy={() => setModalType('privacy')}
      />
    </div>
  );
}
