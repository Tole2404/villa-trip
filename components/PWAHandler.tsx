'use client';

import { useEffect, useState } from 'react';

export function PWAHandler() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (reg) => console.log('SW Registered', reg.scope),
        (err) => console.log('SW Failed', err)
      );
    }

    // Listen for install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  if (!showInstallBtn) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-indigo-600 p-4 rounded-3xl shadow-2xl flex items-center justify-between border border-indigo-400">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
            📲
          </div>
          <div>
            <p className="text-white text-xs font-black uppercase tracking-widest">Pasang Aplikasi</p>
            <p className="text-indigo-100 text-[10px] font-medium leading-tight">Dapatkan fitur notifikasi & akses cepat!</p>
          </div>
        </div>
        <button 
          onClick={handleInstall}
          className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          Pasang
        </button>
      </div>
    </div>
  );
}
