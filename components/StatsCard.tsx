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
  const progressWidth = Math.min(100, Math.max(0, progress));
  const balanceTone = balance >= 0
    ? 'text-emerald-700 dark:text-emerald-300'
    : 'text-rose-700 dark:text-rose-300';
  const formatCurrency = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Keuangan</p>
          <h2 className="mt-1 text-lg font-black text-slate-950 dark:text-white">Ringkasan Villa Trip</h2>
        </div>
        <div className="rounded-xl bg-blue-50 px-3 py-2 text-right dark:bg-blue-500/10">
          <p className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300">Progress</p>
          <p className="text-lg font-black text-blue-700 dark:text-blue-300">{progress}%</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-gray-800/70">
          <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-gray-400">Target</p>
          <p className="text-sm font-black text-slate-950 dark:text-white sm:text-base">{formatCurrency(stats.totalTarget)}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
          <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Terkumpul</p>
          <p className="text-sm font-black text-emerald-700 dark:text-emerald-300 sm:text-base">{formatCurrency(stats.totalCollected)}</p>
        </div>
        <button 
          type="button"
          onClick={onShowExpenses}
          className="rounded-xl bg-rose-50 p-3 text-left transition-all hover:bg-rose-100 active:scale-[0.99] dark:bg-rose-500/10 dark:hover:bg-rose-500/15"
        >
          <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">Keluar</p>
          <p className="text-sm font-black text-rose-700 dark:text-rose-300 sm:text-base">{formatCurrency(totalSpent)}</p>
        </button>
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-gray-800/70">
          <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-gray-400">Sisa Kas</p>
          <p className={`text-sm font-black sm:text-base ${balanceTone}`}>{formatCurrency(balance)}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-gray-800/70">
        <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-gray-400">
          <span>Progress Patungan</span>
          <span>{stats.fullyPaid}/{stats.totalMembers} lunas</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-1000"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}
