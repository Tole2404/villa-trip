'use client';

import { useState, useEffect } from 'react';

interface ChecklistItem {
  id: string;
  label: string;
  isDone: boolean;
  category: 'villa' | 'transport' | 'konsumsi' | 'umum';
}

const STORAGE_KEY = 'villa_trip_monitoring_v1';

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: '1', label: 'Tentukan Villa (Selesai Polling)', isDone: false, category: 'villa' },
  { id: '2', label: 'DP Villa (Booking)', isDone: false, category: 'villa' },
  { id: '3', label: 'Pelunasan Villa', isDone: false, category: 'villa' },
  { id: '4', label: 'Fixing Peserta & Pembayaran', isDone: false, category: 'umum' },
  { id: '5', label: 'Sewa / Booking Transportasi', isDone: false, category: 'transport' },
  { id: '6', label: 'Beli / Siapkan Bumbu & Bahan', isDone: false, category: 'konsumsi' },
  { id: '7', label: 'Pesan Makan Berat (Catering/Warung)', isDone: false, category: 'konsumsi' },
  { id: '8', label: 'Beli Minuman & Snack', isDone: false, category: 'konsumsi' },
  { id: '9', label: 'Siapkan Alat BBQ & Arang', isDone: false, category: 'konsumsi' },
  { id: '10', label: 'Cek Perlengkapan Games / Acara', isDone: false, category: 'umum' },
];

export function Monitoring() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      setItems(DEFAULT_CHECKLIST);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loaded]);

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, isDone: !item.isDone } : item
    ));
  };

  const categories = {
    villa: { label: '🏡 Villa', color: 'blue' },
    transport: { label: '🚗 Transport', color: 'indigo' },
    konsumsi: { label: '🍽️ Konsumsi', color: 'emerald' },
    umum: { label: '📋 Umum', color: 'slate' },
  };

  const progress = Math.round((items.filter(i => i.isDone).length / items.length) * 100) || 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-6 text-white shadow-xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Trip Progress</p>
          <div className="flex items-end gap-3 mb-4">
            <h2 className="text-4xl font-black">{progress}%</h2>
            <p className="text-sm text-slate-400 pb-1 font-medium italic">persiapan selesai</p>
          </div>
          <div className="w-full bg-slate-700/50 h-3 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {(Object.entries(categories) as [keyof typeof categories, typeof categories['villa']][]).map(([catKey, cat]) => {
          const catItems = items.filter(i => i.category === catKey);
          if (catItems.length === 0) return null;

          return (
            <div key={catKey} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">{cat.label}</h3>
              <div className="grid grid-cols-1 gap-2">
                {catItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 text-left ${
                      item.isDone 
                        ? 'bg-emerald-500/5 border-emerald-500/20' 
                        : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-sm'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      item.isDone 
                        ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                    }`}>
                      {item.isDone && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={`text-sm font-medium transition-all ${
                      item.isDone 
                        ? 'text-slate-400 line-through decoration-emerald-500/50 decoration-2' 
                        : 'text-slate-700 dark:text-slate-200'
                    }`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 italic">
        <p className="text-[10px] text-blue-600 dark:text-blue-400 text-center uppercase tracking-widest font-bold">Lakukan checklist setiap ada perkembangan persiapan trip agar semua panitia tahu status terbaru.</p>
      </div>
    </div>
  );
}
export function MonitoringSummary() {
  const [items, setItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  const doneItems = items.filter(i => i.isDone);
  const progress = Math.round((doneItems.length / items.length) * 100) || 0;

  if (doneItems.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 text-center">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Belum ada progres persiapan</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-indigo-500/20 rounded-[2rem] p-5 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <svg className="w-16 h-16 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/></svg>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            Status Trip
            <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-[8px] text-indigo-400 uppercase tracking-widest">Live Update</span>
          </h3>
          <p className="text-[10px] text-slate-500 font-medium">Beberapa progres telah tercatat:</p>
        </div>
        <div className="text-right">
          <span className="text-xl font-black text-white">{progress}%</span>
          <div className="w-12 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {doneItems.map(item => (
          <div key={item.id} className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-in zoom-in-95">
            <span className="text-[10px]">✅</span>
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tight">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
