'use client';

import Link from 'next/link';
import { VillaPolling, Vote } from '@/types';

interface PollingCardProps {
  polling: VillaPolling;
  votes?: Vote[];
  onManageVotes?: (polling: VillaPolling) => void;
  onEdit: (polling: VillaPolling) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  disabled?: boolean;
}

export function PollingCard({ polling, votes = [], onManageVotes, onEdit, onDelete, onToggleActive, disabled = false }: PollingCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const coverImageUrl = polling.imageUrls?.[0];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden transition-all ${
      polling.isActive ? 'border-gray-200 dark:border-gray-700' : 'border-gray-300 dark:border-gray-600 opacity-60'
    }`}>
      {/* Image */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={polling.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
          polling.isActive 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-500 text-white'
        }`}>
          {polling.isActive ? 'Aktif' : 'Nonaktif'}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
          {polling.name}
        </h3>

        {/* Price */}
        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
          {formatPrice(polling.price)}
        </p>

        {/* Capacity */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Kapasitas: {polling.capacity} orang</span>
        </div>

        {/* Facilities */}
        {polling.facilities && polling.facilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {polling.facilities.map((facility, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
              >
                {facility}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {polling.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {polling.description}
          </p>
        )}

        {/* Links */}
        <div className="flex flex-col gap-2 pt-2">
          {polling.link && (
            <a
              href={polling.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Link Villa
            </a>
          )}
          {polling.locationLink && (
            <a
              href={polling.locationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Lokasi Maps
            </a>
          )}
        </div>

        {/* Actions & Votes */}
    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {/* Vote Info & Main Action */}
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {votes.length > 0 ? (
                <>
                  <div className="flex items-center">
                    {votes.slice(0, 3).map((vote, i) => (
                      <div key={i} title={vote.member?.name || 'Anggota'} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-gray-800 z-10" style={{ zIndex: 10 - i }}>
                        {vote.member?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    ))}
                    {votes.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-medium ring-2 ring-white dark:ring-gray-800 z-0">
                        +{votes.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="ml-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {votes.length} Suara
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">Belum ada suara</span>
              )}
            </div>

            {onManageVotes && (
              <button 
                onClick={() => onManageVotes(polling)}
                disabled={disabled}
                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors border border-blue-200 dark:border-blue-800"
              >
                Kelola Suara
              </button>
            )}
          </div>

          {/* Admin Tools Grid */}
          <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-700/50">
          <Link
            href={`/polling/${polling.id}`}
            className={`flex-1 py-2 px-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors text-center ${
              disabled ? 'opacity-60 pointer-events-none' : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
          >
            Lihat Detail
          </Link>
          <button
            onClick={() => onEdit(polling)}
            disabled={disabled}
            className="flex-1 py-2 px-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onToggleActive(polling.id, !polling.isActive)}
            disabled={disabled}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              polling.isActive
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
            } ${disabled ? 'opacity-60 cursor-not-allowed hover:bg-yellow-100 dark:hover:bg-yellow-900/30 hover:bg-green-100 dark:hover:bg-green-900/30' : ''}`}
          >
            {polling.isActive ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
          <button
            onClick={() => {
              if (disabled) return;
              if (confirm('Yakin ingin menghapus villa ini?')) {
                onDelete(polling.id);
              }
            }}
            disabled={disabled}
              className="py-2 px-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
