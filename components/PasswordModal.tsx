'use client';

import { useState } from 'react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  title?: string;
  error?: string;
}

const CORRECT_PASSWORD = 'toleganteng'; // Simple password - can be moved to env later

export function PasswordModal({ isOpen, onClose, onSubmit, title = 'Masukkan Password', error }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (password !== CORRECT_PASSWORD) {
      setLocalError('Password salah!');
      return;
    }
    
    onSubmit(password);
    setPassword('');
  };

  const handleClose = () => {
    setPassword('');
    setLocalError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[10000]">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
            <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password..."
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700"
            />
          </div>

          {(localError || error) && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {localError || error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
            >
              Verifikasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function verifyPassword(input: string): boolean {
  return input === CORRECT_PASSWORD;
}
