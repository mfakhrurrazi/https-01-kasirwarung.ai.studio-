'use client';

import React, { useState, useMemo } from 'react';
import { Customer, Credit, AppSettings } from '@/lib/types';
import { 
  Users, MessageCircle, AlertTriangle, CheckCircle2, 
  Plus, Search, DollarSign, Clock, Sparkles, Send, Copy, X, Check 
} from 'lucide-react';

interface KasbonScreenProps {
  customers: Customer[];
  credits: Credit[];
  settings: AppSettings;
  getCustomerBalance: (customerId: string) => number;
  onSaveCustomer: (customer: Customer) => void;
  onRecordCreditPayment: (credit_id: string, paymentAmount: number) => void;
}

export const KasbonScreen: React.FC<KasbonScreenProps> = ({
  customers,
  credits,
  settings,
  getCustomerBalance,
  onSaveCustomer,
  onRecordCreditPayment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDebtOnly, setFilterDebtOnly] = useState(false);
  const [selectedCreditForPayment, setSelectedCreditForPayment] = useState<Credit | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);

  // WhatsApp Tagih Halus Modal State
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [activeWaTarget, setActiveWaTarget] = useState<{
    customer: Customer;
    credit: Credit;
    daysOverdue: number;
  } | null>(null);
  const [waMessage, setWaMessage] = useState('');
  const [waBadge, setWaBadge] = useState('');
  const [waLoading, setWaLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Add Customer Modal
  const [isAddCustModalOpen, setIsAddCustModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustLimit, setNewCustLimit] = useState<number>(500000);
  const [newCustNotes, setNewCustNotes] = useState('');

  const nowTime = new Date().getTime();

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const balance = getCustomerBalance(c.customer_id);
      const matchesSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.customer_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDebt = filterDebtOnly ? balance > 0 : true;
      return matchesSearch && matchesDebt;
    });
  }, [customers, searchTerm, filterDebtOnly, getCustomerBalance]);

  // Handle Payment Submit
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreditForPayment) return;
    if (payAmount <= 0) {
      alert('Nominal cicilan/pelunasan harus lebih dari 0!');
      return;
    }
    onRecordCreditPayment(selectedCreditForPayment.credit_id, payAmount);
    setSelectedCreditForPayment(null);
    setPayAmount(0);
  };

  // Open WA Tagih Halus Modal
  const handleOpenWaReminder = async (credit: Credit) => {
    const cust = customers.find(c => c.customer_id === credit.customer_id);
    if (!cust) return;

    const dueTime = new Date(credit.due_date).getTime();
    const diffDays = Math.floor((nowTime - dueTime) / (1000 * 60 * 60 * 24));
    const daysOverdue = Math.max(0, diffDays);
    const sisaUtang = credit.amount - credit.paid_amount;

    setActiveWaTarget({ customer: cust, credit, daysOverdue });
    setWaModalOpen(true);
    setWaLoading(true);
    setCopied(false);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: 'pesan_tagih_halus',
          payload: {
            customerName: cust.name,
            amount: sisaUtang,
            daysOverdue,
            notes: cust.notes
          },
          aiEnabled: settings.AI_ENABLED
        })
      });

      const data = await res.json();
      if (data && data.result) {
        setWaMessage(data.result);
        setWaBadge(data.badge || (data.source === 'ai' ? 'Dibantu AI Gemini' : 'Mode Aturan'));
      }
    } catch (e) {
      // rule template
      setWaMessage(
        `Assalamu’alaikum wr. wb. Selamat siang ${cust.name}.\nSemoga senantiasa sehat dan berkah rezekinya. 🙏\nSekadar info santun dari ${settings.BUSINESS_NAME} terkait catatan kasbon belanjaan sebesar Rp ${sisaUtang.toLocaleString('id-ID')}.\nBila ada kelonggaran rezeki, monggo bisa mampir ke warung nggih. Matur nuwun sanget atas kerja samanya! 😊`
      );
      setWaBadge('AI tidak aktif (Fallback)');
    } finally {
      setWaLoading(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(waMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    if (!activeWaTarget) return;
    const phone = activeWaTarget.customer.phone.replace(/[^0-9]/g, '').replace(/^0/, '62');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(waMessage)}`;
    window.open(url, '_blank');
  };

  // Add customer
  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      alert('Nama pelanggan wajib diisi!');
      return;
    }

    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = ('0' + (now.getMonth() + 1)).slice(-2);
    const dd = ('0' + now.getDate()).slice(-2);
    const custId = `PLG-${yy}${mm}${dd}-${('000' + (customers.length + 1)).slice(-3)}`;

    onSaveCustomer({
      customer_id: custId,
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim(),
      credit_limit: newCustLimit,
      notes: newCustNotes.trim()
    });

    setIsAddCustModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setNewCustLimit(500000);
    setNewCustNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Buku Kasbon & Pelanggan Warung</h2>
          <p className="text-xs text-slate-500">Catatan utang tetangga, limit kredit, cicilan, dan reminder WA santun</p>
        </div>

        <button
          onClick={() => setIsAddCustModalOpen(true)}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pelanggan Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama pelanggan, no. HP, atau alamat..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500/30"
          />
        </div>

        <button
          onClick={() => setFilterDebtOnly(!filterDebtOnly)}
          className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            filterDebtOnly
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Hanya yang Punya Kasbon</span>
        </button>
      </div>

      {/* Grid: Customers Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(cust => {
          const balance = getCustomerBalance(cust.customer_id);
          const limitPct = cust.credit_limit > 0 ? Math.min(100, Math.round((balance / cust.credit_limit) * 100)) : 0;
          const isOverLimit = balance > cust.credit_limit;

          return (
            <div
              key={cust.customer_id}
              className={`bg-white rounded-3xl border p-4 shadow-xs flex flex-col justify-between transition-all ${
                balance > 0 ? 'border-amber-200' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{cust.name}</h3>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {cust.customer_id} · {cust.phone || 'Tanpa HP'}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    balance > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {balance > 0 ? 'Ada Kasbon' : 'Lunas'}
                  </span>
                </div>

                <div className="mt-1 text-xs text-slate-500 line-clamp-1">{cust.address}</div>
                {cust.notes && (
                  <div className="text-[11px] text-slate-400 italic mt-0.5">&ldquo;{cust.notes}&rdquo;</div>
                )}

                {/* Credit Limit Progress */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Kasbon Berjalan:</span>
                    <span className={`font-black ${balance > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                      Rp {balance.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOverLimit ? 'bg-red-600' : limitPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${limitPct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Limit: Rp {cust.credit_limit.toLocaleString('id-ID')}</span>
                    <span>Sisa: Rp {Math.max(0, cust.credit_limit - balance).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Outstanding Credits specific to this customer */}
              <div className="mt-3 pt-2 border-t border-slate-100">
                {credits
                  .filter(c => c.customer_id === cust.customer_id && c.status !== 'Lunas')
                  .map(credit => {
                    const dueTime = new Date(credit.due_date).getTime();
                    const diffDays = Math.floor((nowTime - dueTime) / (1000 * 60 * 60 * 24));
                    const isOverdue = diffDays > 0;
                    const sisa = credit.amount - credit.paid_amount;

                    return (
                      <div
                        key={credit.credit_id}
                        className="mt-2 p-2 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800">
                            Rp {sisa.toLocaleString('id-ID')}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Jatuh tempo: {credit.due_date}</span>
                            {isOverdue && (
                              <span className="text-red-600 font-bold ml-1">
                                (Lewat {diffDays} hr)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenWaReminder(credit)}
                            className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-[10px] font-bold flex items-center gap-1 transition"
                            title="Kirim Pesan Tagih Santun via WA"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tagih</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCreditForPayment(credit);
                              setPayAmount(sisa);
                            }}
                            className="px-2 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[10px] font-bold transition shadow-2xs"
                          >
                            Bayar
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment / Cicilan Modal */}
      {selectedCreditForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-amber-200 p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900">Catat Pembayaran Kasbon</h3>
              <button onClick={() => setSelectedCreditForPayment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div>No. Kasbon: <strong>{selectedCreditForPayment.credit_id}</strong></div>
              <div>Pelanggan: <strong>{selectedCreditForPayment.customer_name}</strong></div>
              <div>
                Total Utang Awal: Rp {selectedCreditForPayment.amount.toLocaleString('id-ID')} | Sudah dicicil: Rp {selectedCreditForPayment.paid_amount.toLocaleString('id-ID')}
              </div>
              <div className="text-sm font-black text-red-600 pt-1 border-t border-amber-200">
                Sisa Tagihan: Rp {(selectedCreditForPayment.amount - selectedCreditForPayment.paid_amount).toLocaleString('id-ID')}
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nominal yang Dibayarkan (Rp)</label>
                <input
                  type="number"
                  min="1"
                  max={selectedCreditForPayment.amount - selectedCreditForPayment.paid_amount}
                  value={payAmount || ''}
                  onChange={e => setPayAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPayAmount(selectedCreditForPayment.amount - selectedCreditForPayment.paid_amount)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-[11px] font-bold text-slate-700"
                >
                  Lunasi Penuh
                </button>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCreditForPayment(null)}
                  className="px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Tagih Halus Modal */}
      {waModalOpen && activeWaTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-amber-200 max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 bg-emerald-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-200" />
                <h3 className="font-extrabold text-sm">Pesan Tagih Halus WhatsApp</h3>
              </div>
              <button onClick={() => setWaModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tujuan: <strong>{activeWaTarget.customer.name}</strong> ({activeWaTarget.customer.phone})</span>
                {waBadge && (
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    waBadge.includes('AI') ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {waBadge}
                  </span>
                )}
              </div>

              {waLoading ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Sparkles className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                  <p className="font-bold">Menyusun draf pesan yang santun & kekeluargaan...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block">Draf Pesan WhatsApp (Bisa diedit manual):</label>
                  <textarea
                    rows={8}
                    value={waMessage}
                    onChange={e => setWaMessage(e.target.value)}
                    className="w-full p-3 bg-emerald-50/40 border border-emerald-200 rounded-2xl text-xs text-slate-800 leading-relaxed font-sans focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
              <button
                onClick={handleCopyMessage}
                className="py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-100 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition text-slate-700"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
              </button>
              <button
                onClick={handleOpenWhatsApp}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition active:scale-98 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Buka WhatsApp (wa.me)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddCustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-amber-200 p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900">Tambah Pelanggan Warung</h3>
              <button onClick={() => setIsAddCustModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Pelanggan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pak RT Bambang / Bu Siti Warteg"
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">No. WhatsApp / HP</label>
                <input
                  type="text"
                  placeholder="081234567890"
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat / RT / RW</label>
                <input
                  type="text"
                  placeholder="Jl. Melati No. 12 RT 03/04"
                  value={newCustAddress}
                  onChange={e => setNewCustAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Batas Maksimal Kasbon (Rp)</label>
                <input
                  type="number"
                  value={newCustLimit || ''}
                  onChange={e => setNewCustLimit(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Khusus</label>
                <input
                  type="text"
                  placeholder="cth: Bayar tiap awal bulan saat arisan"
                  value={newCustNotes}
                  onChange={e => setNewCustNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustModalOpen(false)}
                  className="px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
