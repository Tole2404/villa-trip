'use client';

import { useState, useEffect } from 'react';
import { MemberWithStatus, Payment } from '@/types';

interface PaymentHistoryProps {
  member: MemberWithStatus;
  onClose: () => void;
  onDeletePayment: (memberId: string, paymentId: string) => void;
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
    return url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || 
           url.includes('blob.vercel-storage.com') ||
           url.includes('images.unsplash') ||
           url.includes('imgur');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Riwayat Pembayaran</h3>
          <p className="text-sm text-gray-500">{member.name}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Target</p>
            <p className="font-semibold">Rp {member.target_amount.toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Terbayar</p>
            <p className="font-semibold text-green-600">Rp {member.total_paid.toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Sisa</p>
            <p className="font-semibold text-red-600">Rp {member.remaining.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-8">Loading...</p>
      ) : payments.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Belum ada pembayaran</p>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => {
            const typeLabel = paymentTypeLabels[payment.type] || { text: payment.type, color: 'bg-gray-100 text-gray-700' };
            const hasImageProof = payment.proof && isImageUrl(payment.proof);
            
            return (
              <div key={payment.id} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeLabel.color}`}>
                        {typeLabel.text}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(payment.date).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <p className="font-semibold">Rp {payment.amount.toLocaleString('id-ID')}</p>
                    {payment.note && (
                      <p className="text-xs text-gray-500">{payment.note}</p>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      if (confirm('Yakin mau hapus pembayaran ini?')) {
                        setDeletingId(payment.id);
                        try {
                          await onDeletePayment(member.id, payment.id);
                        } finally {
                          setDeletingId(null);
                        }
                      }
                    }}
                    disabled={deletingId === payment.id}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === payment.id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Bukti Pembayaran */}
                {payment.proof && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    {hasImageProof ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedImage(payment.proof!)}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <img
                            src={payment.proof}
                            alt="Bukti"
                            className="w-12 h-12 object-cover rounded border hover:opacity-80 transition-opacity"
                          />
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Lihat Bukti
                          </span>
                        </button>
                      </div>
                    ) : (
                      <a
                        href={payment.proof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        Lihat Bukti Pembayaran
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[200]"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Bukti Pembayaran"
              className="max-w-full max-h-[85vh] rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <a
              href={selectedImage}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute -top-10 right-12 text-white hover:text-gray-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
