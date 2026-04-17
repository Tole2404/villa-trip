'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { VillaPolling } from '@/types';

export default function PollingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [polling, setPolling] = useState<VillaPolling | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchPolling = async () => {
      try {
        const response = await fetch('/api/pollings');
        if (response.ok) {
          const data = await response.json();
          const found = data.find((p: VillaPolling) => p.id === params.id);
          if (found) {
            setPolling(found);
          }
        }
      } catch (error) {
        console.error('Error fetching polling:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolling();
  }, [params.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <img src="/img/biel.jpeg" alt="Loading" className="w-32 h-32 rounded-full object-cover animate-bounce shadow-xl border-4 border-blue-500 mb-4" />
        <p className="text-xl font-bold text-blue-600 dark:text-blue-400 animate-pulse">loading cik😹😹😹</p>
      </div>
    );
  }

  if (!polling) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">Villa tidak ditemukan</p>
          <button
            onClick={() => router.push('/?tab=polling')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <a
            href="/vote"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Kembali</span>
          </a>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Detail Villa</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {/* Image Gallery */}
        <div className="mb-6">
          <div className="relative h-64 md:h-96 bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden">
            {polling.imageUrls && polling.imageUrls.length > 0 ? (
              <img
                src={polling.imageUrls[Math.min(activeImageIndex, polling.imageUrls.length - 1)]}
                alt={polling.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {polling.imageUrls && polling.imageUrls.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {polling.imageUrls.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-16 rounded-lg overflow-hidden border transition-colors flex-shrink-0 ${idx === activeImageIndex
                      ? 'border-blue-500'
                      : 'border-gray-200 dark:border-gray-700'
                    }`}
                >
                  <img src={url} alt={`${polling.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Name & Price */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {polling.name}
            </h1>
            <p className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(polling.price)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">per malam</p>
          </div>

          {/* Status */}
          <div className="mb-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${polling.isActive
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
              }`}>
              {polling.isActive ? '🟢 Tersedia' : '⚪ Tidak Tersedia'}
            </span>
          </div>

          {/* Capacity */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Kapasitas</p>
              <p className="text-gray-600 dark:text-gray-400">{polling.capacity} orang</p>
            </div>
          </div>

          {/* Facilities */}
          {polling.facilities && polling.facilities.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Fasilitas</h3>
              <div className="flex flex-wrap gap-2">
                {polling.facilities.map((facility, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {polling.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Deskripsi</h3>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {polling.description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            {polling.link && (
              <a
                href={polling.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Lihat di Traveloka
              </a>
            )}
            {polling.locationLink && (
              <a
                href={polling.locationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Buka di Maps
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
