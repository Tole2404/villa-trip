'use client';

import { useState, useEffect } from 'react';
import { MemberWithStatus, Payment } from '@/types';
import { PasswordModal, verifyPassword } from './PasswordModal';

interface PaymentHistoryProps {
  member: MemberWithStatus;
  onClose: () => void;
  onDeletePayment: (memberId: string, paymentId: string) => Promise<boolean>;
  getPayments: (memberId: string) => Promise<Payment[]>;
}

const paymentTypeLabels: Record<string, { text: string; color: string }> = {
  dp: { text: 'DP', color: 'bg-yellow-100 text-yellow-700' },
  savings: { text: 'Nabung', color: 'bg-blue-100 text-blue-700' },
  full: { text: 'Pelunasan', color: 'bg-green-100 text-green-700' },
};

export function PaymentHistory({ member, onClose, onDeletePayment, getPayments }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await getPayments(member.id);
      setPayments(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    };
    load();
  }, [member.id, getPayments]);

  // Check if proof is an image URL
  const isImageUrl = (url: string) => {
    return url.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i) || 
           url.includes('blob.vercel-storage.com') ||
           url.includes('images.unsplash') ||
           url.includes('imgur');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Riwayat Pembayaran</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{member.name}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all active:scale-95"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Summary Box */}
      <div className="mb-6 p-1 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-1 bg-white dark:bg-gray-800 rounded-[14px] overflow-hidden shadow-sm">
          <div className="py-4 px-2 text-center border-r border-gray-50 dark:border-gray-700">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 mb-1">Target</p>
            <p className="font-extrabold text-gray-900 dark:text-gray-100 text-sm">Rp{member.target_amount.toLocaleString('id-ID')}</p>
          </div>
          <div className="py-4 px-2 text-center border-r border-gray-50 dark:border-gray-700">
            <p className="text-[10px] uppercase tracking-wider font-bold text-green-500/80 dark:text-green-400 mb-1">Terbayar</p>
            <p className="font-extrabold text-green-600 dark:text-green-400 text-sm">Rp{member.total_paid.toLocaleString('id-ID')}</p>
          </div>
          <div className="py-4 px-2 text-center">
            <p className="text-[10px] uppercase tracking-wider font-bold text-red-500/80 dark:text-red-400 mb-1">Sisa</p>
            <p className="font-extrabold text-red-600 dark:text-red-400 text-sm">Rp{member.remaining.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Memuat riwayat...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📭</span>
            </div>
            <p className="text-gray-900 dark:text-white font-bold text-lg">Belum ada pembayaran</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Pembayaran yang ditambahkan akan muncul di sini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => {
              const typeLabel = paymentTypeLabels[payment.type] || { text: payment.type, color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' };
              const hasImageProof = payment.proof && isImageUrl(payment.proof);
              
              return (
                <div key={payment.id} className="relative group animate-fade-in">
                  <div className="p-4 bg-white dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                            payment.type === 'dp' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                            payment.type === 'savings' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          }`}>
                            {typeLabel.text}
                          </span>
                          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                            {new Date(payment.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-bold text-gray-400 dark:text-gray-500">Rp</span>
                          <p className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                            {payment.amount.toLocaleString('id-ID')}
                          </p>
                        </div>

                        {payment.note && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-900/30 p-2 rounded-lg italic border-l-2 border-gray-200 dark:border-gray-600">
                            "{payment.note}"
                          </p>
                        )}
                      </div>

                      <button
                        onClick={async () => {
                          if (deletingId) return;
                          if (!confirm(`Hapus pembayaran senilai Rp${payment.amount.toLocaleString('id-ID')}?`)) return;
                          setPendingDeleteId(payment.id);
                          setShowPasswordModal(true);
                        }}
                        disabled={deletingId === payment.id}
                        className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all active:scale-90 disabled:opacity-50"
                        title="Hapus"
                      >
                        {deletingId === payment.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Proof Section */}
                    {payment.proof && (
                      <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700/60">
                        {hasImageProof ? (
                          <div className="flex items-center justify-between bg-blue-50/50 dark:bg-blue-900/20 p-2 rounded-xl border border-blue-100/50 dark:border-blue-900/30">
                            <div className="flex items-center gap-3">
                              <img
                                src={payment.proof}
                                alt="Bukti"
                                className="w-12 h-12 object-cover rounded-lg border-2 border-white dark:border-gray-700 shadow-sm"
                              />
                              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">Bukti Transfer</span>
                            </div>
                            <button
                              onClick={() => setSelectedImage(payment.proof!)}
                              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors active:scale-95 flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Open
                            </button>
                          </div>
                        ) : (
                          <a
                            href={payment.proof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg transition-colors border border-blue-100 dark:border-blue-900/30"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            Lihat Dokumen Bukti
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-[200] animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full max-w-4xl flex flex-col items-center">
            <div className="absolute top-[-50px] right-0 flex gap-4">
              <a
                href={selectedImage}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-white/70 hover:text-white transition-colors"
                title="Buka di tab baru"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 text-white/70 hover:text-white transition-colors"
                title="Tutup"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <img
              src={selectedImage}
              alt="Bukti Pembayaran"
              className="max-w-full max-h-[80vh] rounded-xl shadow-2xl border-2 border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white/60 text-sm mt-6 font-medium">Klik di mana saja untuk menutup</p>
          </div>
        </div>
      )}

      {/* Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordError('');
          setPendingDeleteId(null);
        }}
        onSubmit={async (password) => {
          if (!verifyPassword(password)) {
            setPasswordError('Password salah!');
            return;
          }

          const id = pendingDeleteId;
          if (!id) return;

          setPasswordError('');
          setShowPasswordModal(false);
          setDeletingId(id);
          try {
            const ok = await onDeletePayment(member.id, id);
            if (ok) {
              setPayments((prev) => prev.filter((p) => p.id !== id));
            } else {
              alert('Gagal hapus pembayaran. Coba lagi ya.');
            }
          } catch (error) {
            console.error('Error deleting payment:', error);
            alert('Gagal hapus pembayaran. Coba lagi ya.');
          } finally {
            setDeletingId(null);
            setPendingDeleteId(null);
          }
        }}
        title="Verifikasi Password"
        error={passwordError}
      />
    </div>

  );
}
