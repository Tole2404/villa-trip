'use client';

import { useExpenses } from '@/hooks/useExpenses';
import { useState } from 'react';

export function TripExpenses({ totalCollected, onClose }: { totalCollected: number, onClose?: () => void }) {
  const { expenses, totalSpent, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [isSaving, setIsSaving] = useState(false);
  const balance = totalCollected - totalSpent;

  const handleManualSave = () => {
    setIsSaving(true);
    // Logic auto-saves to localStorage via hook, but we provide visual feedback
    setTimeout(() => setIsSaving(false), 800);
  };

  const formatRp = (v: number) => `Rp ${v.toLocaleString('id-ID')}`;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      {/* Top Header with Back Button */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => onClose ? onClose() : (window.location.href = '/?tab=home')}
          className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 active:scale-90 transition-all shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Pengeluaran</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Manajemen Kas Keluar</p>
        </div>
      </div>

      {/* Premium Wallet Header */}
      <div className="bg-gradient-to-br from-slate-900 via-[#0f172a] to-black border border-white/5 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-rose-500/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px]"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Total Pengeluaran</p>
              <h2 className="text-4xl font-black text-white tracking-tighter">
                <span className="text-rose-500 mr-2">↓</span>
                {formatRp(totalSpent).replace('Rp ', '')}
              </h2>
            </div>
            <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
              <span className="text-xl">💸</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-4 border border-white/5">
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Sisa Kas
              </p>
              <p className={`text-sm font-black ${balance >= 0 ? 'text-emerald-400' : 'text-amber-500'}`}>
                {formatRp(balance)}
              </p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-4 border border-white/5">
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> Terkumpul
              </p>
              <p className="text-sm font-black text-white">{formatRp(totalCollected)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Arus Kas Keluar</h3>
          <p className="text-[9px] text-slate-600 mt-0.5 font-medium">{expenses.length} Transaksi Tercatat</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleManualSave}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
              isSaving ? 'bg-emerald-500 text-white border-emerald-400 animate-pulse' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            {isSaving ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            )}
          </button>
          <button 
            onClick={addExpense}
            className="h-10 bg-indigo-600 text-white px-5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>+</span> Item Baru
          </button>
        </div>
      </div>

      {/* Efficient Mobile List */}
      <div className="space-y-4 pb-32">
        {expenses.length === 0 ? (
          <div className="py-20 text-center bg-white/[0.02] rounded-[2rem] border border-dashed border-slate-800">
            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
              <span className="text-2xl text-slate-700">📑</span>
            </div>
            <p className="text-slate-600 text-sm font-medium tracking-tight">Belum ada pengeluaran nyata.<br/><span className="text-[10px] text-slate-700">Gunakan tombol + untuk menambah.</span></p>
          </div>
        ) : (
          [...expenses].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item) => (
            <div key={item.id} className="relative group bg-slate-900/40 border border-slate-800/60 rounded-3xl p-4 transition-all hover:bg-slate-900/60 animate-in slide-in-from-bottom-2">
              
              {/* Category & Date Row */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex gap-1.5 flex-wrap">
                  {(['villa', 'transport', 'konsumsi', 'lainnya'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => updateExpense(item.id, { category: cat })}
                      className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border transition-all ${
                        item.category === cat 
                          ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' 
                          : 'bg-transparent border-transparent text-slate-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <input 
                  type="date" 
                  value={item.date}
                  onChange={e => updateExpense(item.id, { date: e.target.value })}
                  className="bg-transparent text-[9px] text-slate-600 font-black border-none p-0 outline-none uppercase tracking-widest text-right"
                />
              </div>

              {/* Input Area */}
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-1">
                  <input 
                    type="text"
                    placeholder="Apa yang dibayar?"
                    value={item.name}
                    onChange={e => updateExpense(item.id, { name: e.target.value })}
                    className="w-full bg-transparent border-none p-0 text-sm font-bold text-white focus:ring-0 placeholder-slate-800"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-600 font-black">Rp</span>
                    <input 
                      type="text"
                      value={item.amount === 0 ? '' : item.amount.toLocaleString('id-ID')}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        updateExpense(item.id, { amount: val ? parseInt(val, 10) : 0 });
                      }}
                      placeholder="0"
                      className="w-full bg-transparent border-none p-0 text-xl font-black text-rose-400 focus:ring-0 placeholder-rose-900/20"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={() => deleteExpense(item.id)}
                  className="w-10 h-10 flex items-center justify-center text-slate-800 hover:text-rose-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Status Dot */}
              <div className="absolute top-4 right-4 pointer-events-none">
                <div className={`w-1.5 h-1.5 rounded-full ${item.amount > 0 ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`}></div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Save Hint */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[40]">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 shadow-2xl">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Auto-Saved to Local Storage</span>
        </div>
      </div>
    </div>
  );
}
