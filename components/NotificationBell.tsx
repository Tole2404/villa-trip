'use client';

import { useState, useEffect, useRef } from 'react';

interface Activity {
  id: string;
  amount: number;
  type: string;
  createdAt: string;
  member: {
    name: string;
  };
}

export function NotificationBell() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  const lastSeenKey = 'villa_trip_last_seen_payment';
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    }
  };

  const subscribeToPush = async () => {
    try {
      setIsSubscribing(true);
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      if (res.ok) {
        setIsSubscribed(true);
        alert('Notifikasi HP berhasil diaktifkan! 😼🔥');
      } else {
        throw new Error('Gagal menyimpan subscription');
      }
    } catch (error) {
      console.error('Push subscription failed:', error);
      alert('Gagal mengaktifkan notifikasi. Pastikan kamu sudah mengizinkan notifikasi di browser.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activities');
      if (!res.ok) return;
      const data = await res.json();
      
      const lastSeen = localStorage.getItem(lastSeenKey) || '0';
      const newest = data.length > 0 ? new Date(data[0].createdAt).getTime() : 0;
      
      if (newest > parseInt(lastSeen)) {
        setHasNew(true);
      }
      
      setActivities(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && activities.length > 0) {
      setHasNew(false);
      localStorage.setItem(lastSeenKey, new Date(activities[0].createdAt).getTime().toString());
    }
  };

  const formatRp = (v: number) => `Rp ${v.toLocaleString('id-ID')}`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleOpen}
        className="relative w-10 h-10 bg-white/10 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all active:scale-90"
      >
        <span className="text-xl">🔔</span>
        {hasNew && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full animate-bounce"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-2xl z-[1000] overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="px-5 py-4 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Aktivitas Terbaru 😼</h3>
            <span className="text-[10px] text-slate-500 font-bold">{activities.length} Aktif</span>
          </div>

          {!isSubscribed && (
            <div className="p-4 bg-indigo-500/5 border-b border-indigo-500/10">
              <button 
                onClick={subscribeToPush}
                disabled={isSubscribing}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                {isSubscribing ? 'Sedang Memproses...' : '🔔 Aktifkan Notifikasi HP'}
              </button>
              <p className="text-[8px] text-slate-500 text-center mt-2 font-bold leading-tight">
                *Dapatkan notifikasi di layar HP saat ada yang bayar iuran
              </p>
            </div>
          )}
          
          <div className="max-h-[350px] overflow-y-auto no-scrollbar">
            {activities.length === 0 ? (
              <div className="py-10 text-center opacity-50 italic text-sm">
                Belum ada aktivitas...
              </div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="px-5 py-4 border-b border-gray-50 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-xs">
                      💰
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight truncate">
                        {act.member.name}
                      </p>
                      <p className="text-[10px] text-emerald-500 font-black mt-0.5">
                        Bayar {formatRp(act.amount)}
                      </p>
                      <p className="text-[8px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">
                        {new Date(act.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-white/[0.01]">
            <p className="text-[8px] text-slate-500 text-center uppercase font-black tracking-widest">Villa Trip Manager v1.0</p>
          </div>
        </div>
      )}
    </div>
  );
}
