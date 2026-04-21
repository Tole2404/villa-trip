'use client';

import { useState } from 'react';
import { MemberWithStatus, Payment } from '@/types';
import { MemberForm } from './MemberForm';
import { PaymentForm } from './PaymentForm';
import { PaymentHistory } from './PaymentHistory';
import { PasswordModal, verifyPassword } from './PasswordModal';

interface MemberCardProps {
  member: MemberWithStatus;
  onUpdate: (id: string, updates: { name: string; phone?: string; targetAmount: number; dpAmount: number }) => void;
  onDelete: (id: string) => void;
  onAddPayment: (memberId: string, payment: { type: 'dp' | 'savings' | 'full'; amount: number; date: string; note?: string }) => void;
  onDeletePayment: (memberId: string, paymentId: string) => Promise<boolean>;
  getPayments: (memberId: string) => Promise<Payment[]>;
}

const statusLabels = {
  pending: { text: 'Belum DP', color: 'bg-red-100 text-red-700 border-red-200' },
  dp: { text: 'Sudah DP', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  savings: { text: 'Nabung', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  completed: { text: 'Lunas', color: 'bg-green-100 text-green-700 border-green-200' },
};

export function MemberCard({ member, onUpdate, onDelete, onAddPayment, onDeletePayment, getPayments }: MemberCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [pendingEditData, setPendingEditData] = useState<null | { name: string; phone?: string; target_amount: number; dp_amount: number }>(null);

  const progress = Math.min(100, (member.total_paid / member.target_amount) * 100);
  const status = statusLabels[member.status];

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 relative">
        {isUpdating && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
            <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium text-gray-700">Menyimpan...</span>
            </div>
          </div>
        )}
        <MemberForm
          initialData={{
            name: member.name,
            phone: member.phone,
            target_amount: member.target_amount,
            dp_amount: member.dp_amount,
          }}
          onSubmit={async (data: { name: string; phone?: string; target_amount: number; dp_amount: number }) => {
            setPendingEditData(data);
            setShowPasswordModal(true);
          }}
          onCancel={() => setIsEditing(false)}
          disabled={isUpdating}
        />

        {/* Password Modal for Edit */}
        <PasswordModal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setPasswordError('');
            setPendingEditData(null);
          }}
          onSubmit={(password) => {
            if (!verifyPassword(password)) {
              setPasswordError('Password salah!');
              return;
            }
            setPasswordError('');
            setShowPasswordModal(false);

            if (pendingEditData) {
              setIsUpdating(true);
              try {
                onUpdate(member.id, {
                  name: pendingEditData.name,
                  phone: pendingEditData.phone,
                  targetAmount: pendingEditData.target_amount,
                  dpAmount: pendingEditData.dp_amount,
                });
                setIsEditing(false);
              } catch (error) {
                console.error('Error updating member:', error);
                alert('Gagal menyimpan perubahan. Coba lagi ya.');
              } finally {
                setIsUpdating(false);
              }
              setPendingEditData(null);
            }
          }}
          title="Verifikasi Password"
          error={passwordError}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{member.name}</h3>
          {member.phone && (
            <p className="text-sm text-gray-500">{member.phone}</p>
          )}
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
          {status.text}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Target:</span>
          <span className="font-medium">Rp {member.target_amount.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Terbayar:</span>
          <span className="font-medium text-green-600">Rp {member.total_paid.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Sisa:</span>
          <span className="font-medium text-red-600">Rp {member.remaining.toLocaleString('id-ID')}</span>
        </div>
        {member.dp_amount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">DP:</span>
            <span className="font-medium">Rp {member.dp_amount.toLocaleString('id-ID')} {member.dp_paid && '✓'}</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setShowPaymentForm(true)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Bayar
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          Riwayat
        </button>
        <button
          onClick={() => setIsEditing(true)}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => {
            setShowPasswordModal(true);
          }}
          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
        >
          Hapus
        </button>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              e.stopPropagation();
              setShowPaymentForm(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-auto relative shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Tambah Pembayaran - {member.name}</h3>
            <PaymentForm
              member={member}
              onSubmit={(payment: { type: 'dp' | 'savings' | 'full'; amount: number; date: string; note?: string }) => {
                onAddPayment(member.id, payment);
                setShowPaymentForm(false);
              }}
              onCancel={() => setShowPaymentForm(false)}
            />
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showHistory && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHistory(false);
          }}
        >
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md md:max-w-2xl max-h-[85vh] overflow-auto relative shadow-2xl animate-in zoom-in-95 duration-200">
            <PaymentHistory
              member={member}
              onClose={() => setShowHistory(false)}
              onDeletePayment={onDeletePayment}
              getPayments={getPayments}
            />
          </div>
        </div>
      )}

      {/* Password Modal for Delete */}
      <PasswordModal
        isOpen={showPasswordModal && !pendingEditData}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordError('');
        }}
        onSubmit={(password) => {
          if (!verifyPassword(password)) {
            setPasswordError('Password salah!');
            return;
          }
          setPasswordError('');
          setShowPasswordModal(false);
          // Delete action
          if (confirm('Yakin mau hapus anggota ini?')) {
            onDelete(member.id);
          }
        }}
        title="Verifikasi Password"
        error={passwordError}
      />
    </div>
  );
}
