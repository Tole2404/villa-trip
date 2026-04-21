'use client';

import { useState } from 'react';
import { RundownItem } from '@/hooks/useRundown';

interface RundownEditorProps {
  day: number;
  items: RundownItem[];
  onAdd: (item: Omit<RundownItem, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, updates: Partial<RundownItem>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function RundownEditor({ day, items, onAdd, onUpdate, onDelete }: RundownEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [formData, setFormData] = useState({
    activity: '',
    note: '',
    order: items.length
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const timeString = `${startTime} - ${endTime}`;
    const success = await onAdd({ ...formData, time: timeString, icon: '', day });
    if (success) {
      setIsAdding(false);
      setStartTime('08:00');
      setEndTime('09:00');
      setFormData({ activity: '', note: '', order: items.length + 1 });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
        <h4 className="text-xs font-bold text-gray-900 dark:text-white">Kelola Hari {day}</h4>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
        >
          {isAdding ? 'Batal' : '+ Tambah'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl space-y-4 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Mulai</label>
              <input 
                type="time" 
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Selesai</label>
              <input 
                type="time" 
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Kegiatan</label>
            <input 
              type="text" 
              required
              value={formData.activity}
              onChange={e => setFormData({...formData, activity: e.target.value})}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 text-gray-900 dark:text-white text-sm font-medium"
              placeholder="Contoh: Makan Siang Bareng"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Catatan (Optional)</label>
            <textarea 
              value={formData.note}
              onChange={e => setFormData({...formData, note: e.target.value})}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 text-gray-900 dark:text-white text-xs min-h-[60px]"
              placeholder="Contoh: Di resto deket villa"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors"
          >
            Simpan ke Jadwal
          </button>
        </form>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg group relative border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              {item.activity.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1 min-w-0 pr-8">
              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{item.activity}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {item.note || 'Tidak ada catatan'}
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {item.time}
              </p>
            </div>

            <button 
              onClick={() => { if(confirm('Hapus item ini?')) onDelete(item.id) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 hover:text-red-600 dark:hover:text-red-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        {items.length === 0 && !isAdding && (
          <p className="text-center text-gray-500 dark:text-gray-400 text-xs py-4">Belum ada jadwal hari ini</p>
        )}
      </div>
    </div>
  );
}
