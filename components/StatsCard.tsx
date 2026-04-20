'use client';

interface StatsCardProps {
  stats: {
    totalMembers: number;
    totalTarget: number;
    totalCollected: number;
    dpCompleted: number;
    fullyPaid: number;
    totalSpent?: number;
  };
  onShowExpenses?: () => void;
}

export function StatsCard({ stats, onShowExpenses }: StatsCardProps) {
  const totalSpent = stats.totalSpent || 0;
  const balance = stats.totalCollected - totalSpent;

  const progress = stats.totalTarget > 0 
    ? Math.round((stats.totalCollected / stats.totalTarget) * 100) 
    : 0;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 rounded-2xl p-4 sm:p-6 text-white shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
      </div>
      
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>📊</span> Ringkasan Villa Trip
      </h2>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/5">
          <p className="text-blue-200 text-[10px] uppercase font-bold tracking-wider mb-1">Target Total</p>
          <p className="text-sm sm:text-base font-black italic">Rp {stats.totalTarget.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/5">
          <p className="text-blue-200 text-[10px] uppercase font-bold tracking-wider mb-1">Terkumpul</p>
          <p className="text-sm sm:text-base font-black italic text-emerald-300">Rp {stats.totalCollected.toLocaleString('id-ID')}</p>
        </div>
        <div 
          onClick={onShowExpenses}
          className="bg-rose-500/20 rounded-xl p-3 backdrop-blur-sm border border-rose-500/10 cursor-pointer active:scale-95 transition-all"
        >
          <p className="text-rose-200 text-[10px] uppercase font-bold tracking-wider mb-1">Dana Keluar</p>
          <p className="text-sm sm:text-base font-black italic text-rose-300">Rp {totalSpent.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-emerald-500/20 rounded-xl p-3 backdrop-blur-sm border border-emerald-500/10">
          <p className="text-emerald-200 text-[10px] uppercase font-bold tracking-wider mb-1">Sisa Kas</p>
          <p className="text-sm sm:text-base font-black italic text-emerald-400">Rp {balance.toLocaleString('id-ID')}</p>
        </div>
      </div>

      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/5">
        <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest mb-2 text-blue-100">
          <span>Progress Patungan</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-blue-900/50 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-3 text-[10px] font-bold text-blue-200/70">
          <span>👥 {stats.totalMembers} Peserta</span>
          <span>✅ {stats.fullyPaid} Lunas</span>
        </div>
      </div>
    </div>
  );
}
