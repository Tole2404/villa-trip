'use client';

import { MemberWithStatus } from '@/types';
import { useMemo } from 'react';

interface DetailedStatsProps {
  members: MemberWithStatus[];
  stats: {
    totalMembers: number;
    totalTarget: number;
    totalCollected: number;
    dpCompleted: number;
    fullyPaid: number;
  };
}

export function DetailedStats({ members, stats }: DetailedStatsProps) {
  const formatRp = (v: number) => `Rp ${v.toLocaleString('id-ID')}`;

  // Calculate Leaderboard
  const leaderboard = useMemo(() => {
    return [...members]
      .sort((a, b) => b.total_paid - a.total_paid)
      .slice(0, 5);
  }, [members]);

  const collectionRate = (stats.totalCollected / stats.totalTarget) * 100;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Epic Hero Section (Progress Ring Style) */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-8 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] -ml-32 -mb-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Circular Progress */}
          <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="rgba(255,255,255,0.05)" 
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="url(#gradient)" 
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * collectionRate) / 100}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{collectionRate.toFixed(0)}%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Terkumpul</span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Powering Our Trip! 🚀</h1>
            <p className="text-slate-400 text-sm max-w-sm">Dana terkumpul dari iuran seluruh panitia Maganghub. Sedikit lagi menuju target!</p>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Total Kas</p>
                <p className="text-xl font-black text-white">{formatRp(stats.totalCollected)}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Target</p>
                <p className="text-xl font-black text-white text-blue-400">{formatRp(stats.totalTarget)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Awesome Leaderboard (Sultan Villa) */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Leaderboard Sultan 👑</h2>
            <p className="text-xs text-gray-500 mt-1 italic">Top 5 penyumbang dana tercepat & terbanyak.</p>
          </div>
          <div className="w-10 h-10 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/20">
            <span className="text-xl">🏆</span>
          </div>
        </div>

        <div className="space-y-4">
          {leaderboard.map((member, index) => (
            <div 
              key={member.id} 
              className={`flex items-center gap-4 p-4 rounded-3xl transition-all ${
                index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border border-yellow-500/20' : 'bg-gray-50 dark:bg-white/[0.02] border border-transparent hover:border-gray-100 dark:hover:border-white/5'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                index === 0 ? 'bg-yellow-500 text-white' : 
                index === 1 ? 'bg-slate-300 text-slate-700' :
                index === 2 ? 'bg-amber-600/30 text-amber-700' : 'bg-gray-200 dark:bg-slate-800 text-gray-500'
              }`}>
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {member.name} {index === 0 && '🔥'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${(member.total_paid / member.target_amount) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-slate-500">{((member.total_paid / member.target_amount) * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-black text-gray-900 dark:text-white">{formatRp(member.total_paid)}</p>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">
                  {member.status === 'completed' ? 'LUNAS ✨' : 'ON PROGRESS'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Stat Grid Achievement */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-5 text-center">
          <span className="text-2xl mb-2 block">👥</span>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black uppercase tracking-widest">Anggota</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalMembers}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-5 text-center">
          <span className="text-2xl mb-2 block">✔️</span>
          <p className="text-[10px] text-blue-700 dark:text-blue-400 font-black uppercase tracking-widest">Sudah DP</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.dpCompleted}</p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-5 text-center">
          <span className="text-2xl mb-2 block">✨</span>
          <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-black uppercase tracking-widest">Lunas</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.fullyPaid}</p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-5 text-center">
          <span className="text-2xl mb-2 block">⏳</span>
          <p className="text-[10px] text-rose-700 dark:text-rose-400 font-black uppercase tracking-widest">Tunggakan</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalMembers - stats.fullyPaid}</p>
        </div>
      </div>

      <div className="pb-10 text-center">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Update Terakhir: {new Date().toLocaleTimeString('id-ID')}</p>
      </div>

    </div>
  );
}
