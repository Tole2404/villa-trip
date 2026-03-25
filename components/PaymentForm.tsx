'use client';

import { useState, useRef } from 'react';
import { MemberWithStatus } from '@/types';

interface PaymentFormProps {
  member: MemberWithStatus;
  onSubmit: (payment: { type: 'dp' | 'savings' | 'full'; amount: number; date: string; note?: string; proof?: string }) => void;
  onCancel: () => void;
}

export function PaymentForm({ member, onSubmit, onCancel }: PaymentFormProps) {
  const [type, setType] = useState<'dp' | 'savings' | 'full'>('savings');
  const [amount, setAmount] = useState(member.remaining.toString());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [proof, setProof] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (JPG, PNG, GIF)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProof('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setUploading(true);
    let imageUrl = proof;

    try {
      // Upload image if selected
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      onSubmit({
        type,
        amount: parseInt(amount) || 0,
        date,
        note: note.trim() || undefined,
        proof: imageUrl.trim() || undefined,
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Gagal upload gambar. Coba lagi atau gunakan link saja.');
    } finally {
      setUploading(false);
    }
  };

  const quickAmounts = [
    { label: 'Sisa', value: member.remaining },
    { label: 'DP', value: member.dp_amount },
    { label: '50K', value: 50000 },
    { label: '100K', value: 100000 },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Pembayaran</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setType('dp')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === 'dp'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            DP
          </button>
          <button
            type="button"
            onClick={() => setType('savings')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === 'savings'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Nabung
          </button>
          <button
            type="button"
            onClick={() => setType('full')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === 'full'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pelunasan
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp) *</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
        <div className="flex gap-2 mt-2 flex-wrap">
          {quickAmounts.map((quick) => (
            <button
              key={quick.label}
              type="button"
              onClick={() => quick.value && setAmount(quick.value.toString())}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs font-medium transition-colors"
            >
              {quick.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal *</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Contoh: Transfer via BCA"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
      </div>

      {/* Upload Gambar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bukti Pembayaran (opsional)</label>
        
        {/* File Input */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {!previewUrl ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-3 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <svg className="w-6 h-6 mx-auto mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-600">Click untuk upload screenshot bukti transfer</span>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF (max 5MB)</p>
            </button>
          ) : (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-32 object-contain border rounded-lg"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Atau pakai Link */}
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Atau paste link:</p>
          <input
            type="url"
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            placeholder="https://drive.google.com/..."
            disabled={!!previewUrl}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={uploading}
          className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={uploading}
          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Uploading...
            </>
          ) : (
            'Simpan'
          )}
        </button>
      </div>
    </form>
  );
}
