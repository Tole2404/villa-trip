'use client';

interface StatsCardProps {
  stats: {
    totalMembers: number;
    totalTarget: number;
    totalCollected: number;
    dpCompleted: number;
    fullyPaid: number;
  };
}

export function StatsCard({ stats }: StatsCardProps) {
  const progress = stats.totalTarget > 0 
    ? Math.round((stats.totalCollected / stats.totalTarget) * 100) 
    : 0;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
      <h2 className="text-xl font-bold mb-4">Ringkasan Villa Trip</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-blue-200 text-sm">Total Anggota</p>
          <p className="text-2xl font-bold">{stats.totalMembers}</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-blue-200 text-sm">Target Total</p>
          <p className="text-lg font-bold">Rp {(stats.totalTarget / 1000000).toFixed(1)}M</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-blue-200 text-sm">Terkumpul</p>
          <p className="text-lg font-bold">Rp {(stats.totalCollected / 1000000).toFixed(1)}M</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-blue-200 text-sm">Sudah Lunas</p>
          <p className="text-2xl font-bold">{stats.fullyPaid}</p>
        </div>
      </div>

      <div className="bg-white/10 rounded-xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Progress Pengumpulan</span>
          <span className="font-bold">{progress}%</span>
        </div>
        <div className="w-full bg-blue-900/50 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-blue-200">
          <span>DP Selesai: {stats.dpCompleted} orang</span>
          <span>Lunas: {stats.fullyPaid} orang</span>
        </div>
      </div>
    </div>
  );
}
