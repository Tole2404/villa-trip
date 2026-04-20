'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { VillaPolling } from '@/types';

interface Vehicle {
  id: string;
  type: 'car' | 'motorcycle';
}

interface AdditionalCost {
  id: string;
  name: string;
  amount: number;
}

interface ConsumptionItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  category: 'makan' | 'minuman' | 'snack' | 'bumbu';
}

interface TripCalculatorProps {
  totalTarget: number;
  totalCollected: number;
  memberCount: number;
  onClose?: () => void;
}

const STORAGE_KEY = 'villa_trip_calculator_v6';

export function TripCalculator({ totalCollected, memberCount, onClose }: TripCalculatorProps) {
  const [pollings, setPollings] = useState<VillaPolling[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const isHydrated = useRef(false);

  // States
  const [selectedVillaId, setSelectedVillaId] = useState<string>('');
  const [manualVillaPrice, setManualVillaPrice] = useState<number>(0);
  const [manualMemberCount, setManualMemberCount] = useState<number>(memberCount);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [carFuel, setCarFuel] = useState(150000);
  const [motorFuel, setMotorFuel] = useState(50000);
  const [tollCost, setTollCost] = useState(50000);
  const [nights, setNights] = useState(1);
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([
    { id: 'b', name: 'BBQ & Alat', amount: 500000 },
  ]);
  const [consumptionItems, setConsumptionItems] = useState<ConsumptionItem[]>([
    { id: 'c1', name: 'Makan Berat (Sekeluarga)', quantity: 1, unit: 'Paket', price: 2000000, category: 'makan' },
    { id: 'c2', name: 'Air Mineral (600ml)', quantity: 2, unit: 'Dus', price: 50000, category: 'minuman' },
  ]);

  // UI Helpers
  const formatInput = (val: number) => {
    if (!val && val !== 0) return '';
    return val.toLocaleString('id-ID');
  };

  const parseInput = (val: string) => {
    const numeric = val.replace(/\D/g, '');
    return numeric ? parseInt(numeric, 10) : 0;
  };

  // Initial Load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.selectedVillaId !== undefined) setSelectedVillaId(data.selectedVillaId);
        if (data.manualVillaPrice !== undefined) setManualVillaPrice(data.manualVillaPrice);
        if (data.manualMemberCount !== undefined) setManualMemberCount(data.manualMemberCount);
        if (data.vehicles !== undefined) setVehicles(data.vehicles);
        if (data.carFuel !== undefined) setCarFuel(data.carFuel);
        if (data.motorFuel !== undefined) setMotorFuel(data.motorFuel);
        if (data.tollCost !== undefined) setTollCost(data.tollCost);
        if (data.nights !== undefined) setNights(data.nights);
        if (data.additionalCosts !== undefined) setAdditionalCosts(data.additionalCosts);
        if (data.consumptionItems !== undefined) {
          const migrated = data.consumptionItems.map((item: any) => ({
            ...item,
            category: item.category || 'makan'
          }));
          setConsumptionItems(migrated);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      setManualMemberCount(memberCount);
    }
    setTimeout(() => { isHydrated.current = true; }, 100);
  }, [memberCount]);

  const handleVillaChange = (id: string) => {
    setSelectedVillaId(id);
    const villa = pollings.find(p => p.id === id);
    if (villa) setManualVillaPrice(villa.price || 0);
  };

  // Save Effect
  useEffect(() => {
    if (!isHydrated.current) return;
    const timeoutId = setTimeout(() => {
      const data = {
        selectedVillaId, manualVillaPrice, manualMemberCount,
        vehicles, carFuel, motorFuel, tollCost, nights,
        additionalCosts, consumptionItems
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedVillaId, manualVillaPrice, manualMemberCount, vehicles, carFuel, motorFuel, tollCost, nights, additionalCosts, consumptionItems]);

  const fetchPollings = useCallback(async () => {
    try {
      const res = await fetch('/api/pollings');
      if (res.ok) {
        const data = await res.json();
        setPollings(data.filter((p: VillaPolling) => p.isActive));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPollings(); }, [fetchPollings]);

  const addVehicle = (type: 'car' | 'motorcycle') => {
    if (vehicles.length >= 12) return;
    setVehicles(prev => [...prev, { id: `v_${Date.now()}`, type }]);
  };

  const addAdditionalCost = () => {
    if (additionalCosts.length >= 12) return;
    setAdditionalCosts(prev => [...prev, { id: `c_${Date.now()}`, name: '', amount: 0 }]);
  };

  const addConsumptionItem = (category: ConsumptionItem['category']) => {
    if (consumptionItems.length >= 40) return;
    setConsumptionItems(prev => [...prev, {
      id: `ci_${Date.now()}`,
      name: '',
      quantity: 1,
      unit: '',
      price: 0,
      category
    }]);
  };

  const carCount = vehicles.filter(v => v.type === 'car').length;
  const motorCount = vehicles.filter(v => v.type === 'motorcycle').length;

  const totalFuelCost = (carCount * carFuel) + (motorCount * motorFuel);
  const totalTollCost = carCount * tollCost;
  const villaTotal = manualVillaPrice * nights;
  const totalConsumptionCost = consumptionItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalAdditionalCosts = additionalCosts.reduce((sum, c) => sum + (c.amount || 0), 0);

  const grandTotal = villaTotal + totalFuelCost + totalTollCost + totalConsumptionCost + totalAdditionalCosts;
  const effectiveMemberCount = manualMemberCount > 0 ? manualMemberCount : 1;
  const perPerson = grandTotal / effectiveMemberCount;
  const diff = grandTotal - totalCollected;

  const formatRp = (v: number) => `Rp ${v.toLocaleString('id-ID')}`;

  const generateWSMessage = () => {
    const villaName = pollings.find(p => p.id === selectedVillaId)?.name || 'Villa Belum Dipilih';
    return `*RINCIAN ESTIMASI VILLA TRIP* 🏡✨\n_Family Gathering Maganghub_ 😼\n\n🏡 *Akomodasi:* \n- Villa: ${villaName} 🏰\n- Durasi: ${nights} Malam 🌙\n- Harga Sewa: ${formatRp(manualVillaPrice)} 💸\n\n🚗 *Transportasi:* \n- Armada: ${carCount} Mobil 🚗, ${motorCount} Motor 🏍️\n- Bensin & Tol: ${formatRp(totalFuelCost + totalTollCost)} ⛽\n\n🍽️ *Biaya Lainnya:* \n- Total Konsumsi: ${formatRp(totalConsumptionCost)} 🍱\n${additionalCosts.map(c => `- ${c.name || 'Lain-lain'}: ${formatRp(c.amount)} 💰`).join('\n')}\n\n---------------------------\n💰 *GRAND TOTAL:* ${formatRp(grandTotal)} ✨\n👥 *PESERTA:* ${manualMemberCount} Orang 👨‍👩‍👧‍👦\n📢 *PATUNGAN:* ${formatRp(Math.round(perPerson))} /Orang 💸\n---------------------------\n\n_Sent via Villa Trip Manager_ 😹`.trim();
  };

  const generateConsumptionWSMessage = () => {
    const categories = [
      { id: 'makan', title: '🟢 MAKAN BERAT' },
      { id: 'minuman', title: '🔵 MINUMAN' },
      { id: 'snack', title: '🟡 SNACK / CEMILAN' },
      { id: 'bumbu', title: '🔴 BUMBU & BAHAN' }
    ] as const;

    let message = `*RINCIAN LIST BELANJA KONSUMSI* 🛒🍱\n_Family Gathering Maganghub_ 😼\n\n`;

    categories.forEach(cat => {
      const items = consumptionItems.filter(i => i.category === cat.id);
      if (items.length > 0) {
        message += `${cat.title} 📋:\n`;
        items.forEach(item => {
          message += `- ${item.name} 🛍️\n  (${item.quantity} ${item.unit}) @${formatRp(item.price).replace('Rp ', '')}\n`;
        });
        const catTotal = items.reduce((sum, i) => sum + (i.quantity * i.price), 0);
        message += `*Subtotal:* ${formatRp(catTotal)} 💸\n\n`;
      }
    });

    message += `---------------------------\n`;
    message += `💰 *TOTAL KONSUMSI:* ${formatRp(totalConsumptionCost)} ✨\n`;
    message += `---------------------------\n\n`;
    message += `_Yuk gercep kumpulin dananya Kawannn_ 😹🚀`;

    return message.trim();
  };

  const handleWhatsAppShare = () => {
    setPreviewText(generateWSMessage());
    setShowPreview(true);
  };

  const handleShareConsumption = () => {
    setPreviewText(generateConsumptionWSMessage());
    setShowPreview(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(previewText);
    alert('Teks berhasil disalin! ✅');
  };

  const confirmShare = () => {
    const encodedMessage = encodeURIComponent(previewText);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    setShowPreview(false);
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-[#070b14] text-white z-[100] flex flex-col overflow-hidden max-w-md mx-auto font-sans shadow-2xl">

      {/* Top Navigation */}
      <div className="absolute top-4 left-4 z-[110]">
        <button
          onClick={() => onClose ? onClose() : window.location.href = '/?tab=home'}
          className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Header Area */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 pt-12 pb-10 rounded-b-[2.5rem] shadow-2xl relative shrink-0">
        <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/50 mb-1">Estimasi Per Orang</p>
          <h2 className="text-3xl font-light tracking-tight mb-4">{formatRp(Math.round(perPerson))}</h2>

          <div className="grid grid-cols-2 bg-black/20 backdrop-blur-xl rounded-2xl p-3 border border-white/5">
            <div className="border-r border-white/10 pr-2 text-left pl-2">
              <p className="text-[8px] font-medium uppercase text-white/40 mb-0.5">Total Budget</p>
              <p className="text-xs font-semibold text-white/90">{formatRp(grandTotal)}</p>
            </div>
            <div className="pl-3 text-left">
              <p className="text-[8px] font-medium uppercase text-white/40 mb-0.5">{diff > 0 ? 'Kurang Dana' : 'Dana Sisa'}</p>
              <p className={`text-xs font-semibold ${diff > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{formatRp(Math.abs(diff))}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Preview Pesan 😼</h3>
              <button onClick={() => setShowPreview(false)} className="text-slate-500 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 max-h-[40vh] overflow-y-auto no-scrollbar mb-6">
                <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed">
                  {previewText}
                </pre>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={copyToClipboard}
                  className="py-4 bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>📋</span> Salin Teks
                </button>
                <button
                  onClick={confirmShare}
                  className="py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 active:scale-95 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <span>🚀</span> Kirim Ke WA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 px-5 py-4 space-y-7 overflow-y-auto no-scrollbar pb-10">

        {/* Participants Control */}
        <div className="bg-indigo-900/10 border border-indigo-500/10 rounded-2xl p-4 flex justify-between items-center mt-2">
          <div>
            <label className="text-[10px] font-medium text-slate-500 uppercase tracking-widest block mb-1">Jumlah Peserta</label>
            <p className="text-[9px] text-indigo-400/70 font-medium italic">*Database: {memberCount} orang</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 px-4 rounded-xl flex items-center gap-4 py-1.5">
            <button onClick={() => setManualMemberCount(Math.max(1, manualMemberCount - 1))} className="text-slate-400 hover:text-white transition-colors text-xl font-light">−</button>
            <input
              type="text"
              value={manualMemberCount || ''}
              onChange={e => setManualMemberCount(parseInput(e.target.value))}
              className="w-10 bg-transparent border-none p-0 text-sm font-semibold text-white text-center focus:ring-0"
            />
            <button onClick={() => setManualMemberCount(manualMemberCount + 1)} className="text-slate-400 hover:text-white transition-colors text-xl font-light">+</button>
          </div>
        </div>

        {/* Villa Select & Price */}
        <div className="space-y-3">
          <label className="text-[9px] font-medium text-slate-500 uppercase tracking-widest px-1">Villa & Harga</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <select
                value={selectedVillaId}
                onChange={(e) => handleVillaChange(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white appearance-none outline-none focus:border-indigo-500/50"
              >
                <option value="">-- Pilih Villa --</option>
                {pollings.map(v => <option key={v.id} value={v.id} className="bg-slate-900">{v.name}</option>)}
              </select>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 px-3 rounded-xl flex items-center gap-3">
              <button onClick={() => setNights(Math.max(1, nights - 1))} className="text-slate-500 text-lg hover:text-white transition-colors">−</button>
              <span className="text-xs font-medium w-3 text-center">{nights}</span>
              <button onClick={() => setNights(nights + 1)} className="text-slate-500 text-lg hover:text-white transition-colors">+</button>
              <span className="text-[10px] text-slate-600 font-bold">N</span>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-3 flex justify-between items-center group font-sans">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Harga Sewa /Malam</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-600 font-semibold">Rp</span>
              <input
                type="text"
                value={formatInput(manualVillaPrice)}
                onChange={e => setManualVillaPrice(parseInput(e.target.value))}
                className="w-32 bg-transparent border-none p-0 text-sm font-semibold text-white text-right focus:ring-0"
              />
            </div>
          </div>
        </div>

        {/* Transport */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <label className="text-[9px] font-medium text-slate-500 uppercase tracking-widest">Transportasi (Unit)</label>
            <div className="flex gap-1.5">
              <button onClick={() => addVehicle('car')} className="px-3 py-1 bg-indigo-600/10 text-indigo-300 border border-indigo-500/20 rounded-lg text-[9px] font-medium uppercase tracking-wider">+ Mobil</button>
              <button onClick={() => addVehicle('motorcycle')} className="px-3 py-1 bg-emerald-600/10 text-emerald-300 border border-emerald-500/20 rounded-lg text-[9px] font-medium uppercase tracking-wider">+ Motor</button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar min-h-[38px]">
            {vehicles.map(v => (
              <div key={v.id} className="flex-shrink-0 bg-slate-900/40 border border-slate-800/60 rounded-lg px-2.5 py-1.5 flex items-center gap-2 group animate-in zoom-in-95">
                <span className="text-base">{v.type === 'car' ? '🚗' : '🏍️'}</span>
                <button onClick={() => setVehicles(prev => prev.filter(x => x.id !== v.id))} className="text-slate-600 hover:text-red-400 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-2">
            {carCount > 0 && (
              <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-right-4">
                <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-3">
                  <p className="text-[7px] font-medium text-slate-500 uppercase mb-1.5 tracking-wider">Bensin /Mobil</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-600 font-semibold">Rp</span>
                    <input type="text" value={formatInput(carFuel)} onChange={e => setCarFuel(parseInput(e.target.value))} className="w-full bg-transparent border-none p-0 text-sm font-semibold text-white focus:ring-0" />
                  </div>
                </div>
                <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-3">
                  <p className="text-[7px] font-medium text-slate-500 uppercase mb-1.5 tracking-wider">Tol /Mobil</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-600 font-semibold">Rp</span>
                    <input type="text" value={formatInput(tollCost)} onChange={e => setTollCost(parseInput(e.target.value))} className="w-full bg-transparent border-none p-0 text-sm font-semibold text-white focus:ring-0" />
                  </div>
                </div>
              </div>
            )}
            {motorCount > 0 && (
              <div className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-3 animate-in slide-in-from-right-4">
                <p className="text-[7px] font-medium text-slate-500 uppercase mb-1.5 tracking-wider">Bensin /Motor</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-600 font-semibold">Rp</span>
                  <input type="text" value={formatInput(motorFuel)} onChange={e => setMotorFuel(parseInput(e.target.value))} className="w-full bg-transparent border-none p-0 text-sm font-semibold text-white focus:ring-0" />
                </div>
              </div>
            )}
          </div>
        </div>



        {/* Expenses (Biaya Lainnya) */}
        <div className="space-y-3 font-sans">
          <div className="flex justify-between items-center px-1">
            <label className="text-[9px] font-medium text-slate-500 uppercase tracking-widest">Biaya Lainnya (Total Trip)</label>
            <button onClick={addAdditionalCost} className="px-3 py-1 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-lg text-[9px] font-medium uppercase hover:bg-blue-600/20 transition-all">+ Baru</button>
          </div>
          <div className="grid grid-cols-1 gap-2">

            {/* Linked Consumption Row (Baris Satu) */}
            <div className="bg-slate-900/60 border border-indigo-500/30 rounded-xl p-3 flex justify-between items-center animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold text-white">Total Makan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">Rp</span>
                <span className="text-sm font-bold text-indigo-400 tracking-tight">{formatRp(totalConsumptionCost).replace('Rp ', '')}</span>
                <span className="text-[8px] text-indigo-500/50 font-bold ml-1">LINKED</span>
              </div>
            </div>

            {additionalCosts.map(c => (
              <div key={c.id} className="bg-slate-900/40 border border-slate-800/30 rounded-xl p-3 flex justify-between items-center animate-in slide-in-from-left-4">
                <input
                  value={c.name}
                  onChange={e => setAdditionalCosts(prev => prev.map(x => x.id === c.id ? { ...x, name: e.target.value } : x))}
                  className="flex-1 bg-transparent border-none p-0 text-xs text-slate-300 font-medium focus:ring-0"
                  placeholder="Nama biaya..."
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-600 font-semibold">Rp</span>
                  <input
                    type="text"
                    value={formatInput(c.amount)}
                    onChange={e => setAdditionalCosts(prev => prev.map(x => x.id === c.id ? { ...x, amount: parseInput(e.target.value) } : x))}
                    className="w-24 bg-transparent border-none p-0 text-sm font-semibold text-indigo-400 text-right focus:ring-0"
                  />
                  <button onClick={() => setAdditionalCosts(prev => prev.filter(x => x.id !== c.id))} className="text-slate-600 ml-1">×</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consumption Tables (Split into 4 categories) */}
        <div className="space-y-8 font-sans pb-4">

          {([
            { id: 'makan', title: 'Makan Berat', color: 'emerald' },
            { id: 'minuman', title: 'Minuman', color: 'blue' },
            { id: 'snack', title: 'Snack / Cemilan', color: 'amber' },
            { id: 'bumbu', title: 'Bumbu & Bahan', color: 'rose' }
          ] as const).map((cat) => {
            const items = consumptionItems.filter(i => i.category === cat.id);
            const catTotal = items.reduce((sum, i) => sum + (i.quantity * i.price), 0);

            return (
              <div key={cat.id} className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className={`text-[9px] font-bold uppercase tracking-[0.2em] text-${cat.color}-500/80`}>{cat.title}</label>
                  <button
                    onClick={() => addConsumptionItem(cat.id)}
                    className={`text-${cat.color}-400 text-[9px] font-bold tracking-tight bg-${cat.color}-400/10 px-2 py-1 rounded-md border border-${cat.color}-400/20 active:scale-95 transition-all`}
                  >
                    + {cat.title}
                  </button>
                </div>

                <div className="bg-slate-900/40 border border-slate-800/20 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[300px]">
                      <thead>
                        <tr className="bg-slate-800/40 text-[7px] text-slate-500 uppercase tracking-widest border-b border-white/5">
                          <th className="py-2 px-2 font-medium">Item</th>
                          <th className="py-2 px-1 font-medium text-center w-8">Qty</th>
                          <th className="py-2 px-1 font-medium w-10">Sat</th>
                          <th className="py-2 px-2 font-medium text-right w-16">Harga</th>
                          <th className="py-2 px-2 font-medium text-right">Total</th>
                          <th className="py-2 px-1 w-6"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 italic">
                        {items.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-3 px-2 text-[8px] text-slate-600 text-center uppercase tracking-widest">Belum ada item</td>
                          </tr>
                        ) : items.map((item) => (
                          <tr key={item.id} className="hover:bg-white/[0.01]">
                            <td className="py-1.5 px-2 align-top">
                              <textarea
                                value={item.name}
                                onChange={e => setConsumptionItems(prev => prev.map(x => x.id === item.id ? { ...x, name: e.target.value } : x))}
                                placeholder="Label..."
                                rows={item.name.length > 18 ? 2 : 1}
                                className="w-full bg-transparent border-none p-0 text-[10px] text-white focus:ring-0 placeholder-slate-800 font-medium resize-none leading-tight overflow-hidden whitespace-pre-wrap"
                              />
                            </td>
                            <td className="py-1.5 px-1">
                              <input
                                type="number"
                                value={item.quantity || ''}
                                onChange={e => setConsumptionItems(prev => prev.map(x => x.id === item.id ? { ...x, quantity: parseInput(e.target.value) } : x))}
                                className="w-full bg-transparent border-none p-0 text-[10px] text-white text-center focus:ring-0 font-bold"
                              />
                            </td>
                            <td className="py-1.5 px-1 text-center">
                              <input
                                value={item.unit}
                                onChange={e => setConsumptionItems(prev => prev.map(x => x.id === item.id ? { ...x, unit: e.target.value } : x))}
                                placeholder="Sat..."
                                className="w-full bg-transparent border-none p-0 text-[9px] text-slate-400 focus:ring-0 placeholder-slate-800"
                              />
                            </td>
                            <td className="py-1.5 px-2 text-right">
                              <input
                                type="text"
                                value={formatInput(item.price)}
                                onChange={e => setConsumptionItems(prev => prev.map(x => x.id === item.id ? { ...x, price: parseInput(e.target.value) } : x))}
                                className="w-full bg-transparent border-none p-0 text-[10px] text-indigo-400 text-right focus:ring-0 font-medium"
                              />
                            </td>
                            <td className="py-1.5 px-2 text-right">
                              <span className="text-[10px] font-bold text-emerald-400">{formatRp(item.quantity * item.price).replace('Rp ', '')}</span>
                            </td>
                            <td className="py-1.5 px-1 text-center">
                              <button onClick={() => setConsumptionItems(prev => prev.filter(x => x.id !== item.id))} className="text-slate-700 hover:text-red-500 transition-colors text-xs">×</button>
                            </td>
                          </tr>
                        ))}
                        {items.length > 0 && (
                          <tr className="bg-white/[0.02] border-t border-white/5">
                            <td colSpan={4} className={`py-2 px-2 text-[7px] font-bold text-${cat.color}-500/60 uppercase text-right tracking-widest`}>Subtotal {cat.title}:</td>
                            <td className="py-2 px-2 text-right">
                              <span className="text-[10px] font-black text-white">{formatRp(catTotal).replace('Rp ', '')}</span>
                            </td>
                            <td></td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-2 border-t border-white/10 space-y-3">
            <div className="flex justify-between items-center bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
              <div>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] block mb-1">Total Dana Konsumsi:</span>
                <span className="text-lg font-black text-emerald-400 underline decoration-indigo-500/50 underline-offset-4">{formatRp(totalConsumptionCost)}</span>
              </div>
              <button
                onClick={handleShareConsumption}
                className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                Bagikan List Belanja
              </button>
            </div>
            <p className="text-[9px] text-slate-600 text-center italic tracking-tight">*Rincian konsumsi akan dikirim terpisah dari budget trip</p>
          </div>
        </div>

      </div>

      {/* Footer Button triggering Popup */}
      <div className="p-6 pb-8 shrink-0 bg-[#070b14]">
        <button
          onClick={() => setShowSharePopup(true)}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/10 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
        >
          Lihat & Bagikan Rincian Trip
        </button>
      </div>

      {/* Sharing Popup (Bottom Sheet) */}
      {showSharePopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="p-6 pb-2 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Rincian Teks WhatsApp</h3>
              <button
                onClick={() => setShowSharePopup(false)}
                className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-full text-slate-400"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-4">
              <div className="bg-black/40 border border-slate-800/50 rounded-2xl p-4 max-h-[40vh] overflow-y-auto no-scrollbar">
                <pre className="text-[10px] leading-relaxed font-mono whitespace-pre-wrap text-slate-300">
                  {generateWSMessage()}
                </pre>
              </div>
              <p className="text-[9px] text-slate-500 text-center mt-3 italic">Teks ini akan otomatis terisi saat pesan WhatsApp terbuka.</p>
            </div>

            <div className="p-6 pt-2 space-y-3">
              <button
                onClick={handleWhatsAppShare}
                className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                Bagikan Sekarang
              </button>
              <button
                onClick={() => setShowSharePopup(false)}
                className="w-full bg-slate-800 text-slate-400 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all"
              >
                Kembali Edit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
