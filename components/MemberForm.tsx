'use client';

import { useState } from 'react';

interface MemberFormProps {
  initialData?: {
    name?: string;
    phone?: string;
    target_amount?: number;
    dp_amount?: number;
  };
  onSubmit: (data: { name: string; phone?: string; target_amount: number; dp_amount: number }) => void;
  onCancel: () => void;
}

export function MemberForm({ initialData, onSubmit, onCancel }: MemberFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [target_amount, setTargetAmount] = useState(initialData?.target_amount?.toString() || '');
  const [dp_amount, setDpAmount] = useState(initialData?.dp_amount?.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      phone: phone.trim() || undefined,
      target_amount: parseInt(target_amount) || 0,
      dp_amount: parseInt(dp_amount) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Anggota *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08xxxxxxxxxx"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Total (Rp) *</label>
          <input
            type="number"
            value={target_amount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="500000"
            required
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nominal DP (Rp)</label>
          <input
            type="number"
            value={dp_amount}
            onChange={(e) => setDpAmount(e.target.value)}
            placeholder="100000"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          {initialData?.name ? 'Simpan' : 'Tambah'}
        </button>
      </div>
    </form>
  );
}
