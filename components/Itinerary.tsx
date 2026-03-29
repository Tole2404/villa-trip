'use client';

import { useState } from 'react';

interface ItineraryProps {
  onClose: () => void;
}

const dayOneSchedule = [
  { time: '07:00', activity: 'Berangkat dari Jakarta', note: 'Kumpul di titik meeting (opsional)' },
  { time: '09:00', activity: 'Sarap di perjalanan', note: 'Rest area Cipularang atau Puncak Pass' },
  { time: '10:00', activity: 'Check-in Villa', note: 'Istirahat, briefing, assign kamar' },
  { time: '12:00', activity: 'Makan Siang', note: 'Masak bersama atau catering (Rp 35-50K/org)' },
  { time: '14:00', activity: 'Free time / Games', note: 'Kompetisi antar kelompok, foto-foto' },
  { time: '17:00', activity: 'BBQ / Grill time', note: 'Persiapan bakaran' },
  { time: '19:00', activity: 'Makan Malam BBQ', note: 'Daging, sosis, sayuran, jagung bakar' },
  { time: '21:00', activity: 'Api unggun & Games malam', note: 'Story telling, musik, karaoke' },
  { time: '23:00', activity: 'Rest', note: 'Tidur, jaga kesehatan buat besok' },
];

const dayTwoSchedule = [
  { time: '07:00', activity: 'Bangun & Sarapan', note: 'Nasi goreng/toast, kopi/teh' },
  { time: '09:00', activity: 'Check-out Villa', note: 'Packing, bersih-bersih' },
  { time: '10:00', activity: 'Wisata Opsional', note: 'Taman Safari / Taman Bunga / Air Terjun (optional)' },
  { time: '13:00', activity: 'Makan Siang di resto', note: 'Sunda/steak/warung lokal' },
  { time: '15:00', activity: 'Pulang ke Jakarta', note: 'Drop off di meeting point' },
];

const costBreakdown = [
  { item: 'Villa (1 malam)', price: 'Rp 200K–350K', note: 'Sharing 4–6 org/kamar' },
  { item: 'Transportasi', price: 'Rp 50K–100K', note: 'Patungan bensin/tol' },
  { item: 'Makan (2 siang + 1 malam + sarap)', price: 'Rp 100K–150K', note: 'Termasuk BBQ' },
  { item: 'BBQ stuff', price: 'Rp 40K–60K', note: 'Daging, sosis, sayur' },
  { item: 'Snack & minum', price: 'Rp 30K–50K', note: 'Seharian' },
  { item: 'Wisata opsional', price: 'Rp 0–200K', note: 'Taman Safari/dll (optional)' },
];

export function Itinerary({ onClose }: ItineraryProps) {
  const [activeTab, setActiveTab] = useState<'day1' | 'day2' | 'costs' | 'notes'>('day1');

  const totalMin = 420000;
  const totalMax = 910000;
  const targetTabungan = 300000;
  const sisaMin = totalMin - targetTabungan;
  const sisaMax = totalMax - targetTabungan;

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-3xl max-h-[90vh] overflow-auto relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">🚗 Itinerary Villa Puncak</h2>
          <p className="text-sm text-gray-500 mt-1">2 Hari 1 Malam • 14 Anggota</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-600">Target Tabungan</p>
          <p className="text-lg font-bold text-blue-800">Rp 300K</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs text-green-600">Total Trip</p>
          <p className="text-sm font-bold text-green-800">Rp 420K–910K</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <p className="text-xs text-orange-600">Sisa Bayar</p>
          <p className="text-sm font-bold text-orange-800">Rp {sisaMin/1000}K–{sisaMax/1000}K</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <p className="text-xs text-purple-600">Durasi</p>
          <p className="text-lg font-bold text-purple-800">2D1N</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-2">
        {[
          { key: 'day1', label: 'Hari 1', icon: '🌅' },
          { key: 'day2', label: 'Hari 2', icon: '🌄' },
          { key: 'costs', label: 'Rincian Biaya', icon: '💰' },
          { key: 'notes', label: 'Catatan', icon: '📝' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Day 1 */}
        {activeTab === 'day1' && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-xl">🌅</span> Sabtu - Hari Pertama
            </h3>
            {dayOneSchedule.map((item, idx) => (
              <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-14 text-sm font-semibold text-blue-600">
                  {item.time}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.activity}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Day 2 */}
        {activeTab === 'day2' && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-xl">🌄</span> Minggu - Hari Kedua
            </h3>
            {dayTwoSchedule.map((item, idx) => (
              <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-14 text-sm font-semibold text-blue-600">
                  {item.time}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.activity}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>
                </div>
              </div>
            ))}
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">🎯 Opsi Wisata (pilih salah satu):</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Taman Safari Indonesia: Rp 200.000/orang</li>
                <li>• Taman Bunga Nusantara: Rp 50.000/orang</li>
                <li>• Curug Cibeureum: Rp 10.000/orang + trekking</li>
                <li>• Little Venice Kota Bunga: Rp 25.000/orang</li>
                <li>• Skip wisata, langsung pulang: Gratis</li>
              </ul>
            </div>
          </div>
        )}

        {/* Costs */}
        {activeTab === 'costs' && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-xl">💰</span> Rincian Biaya per Orang
            </h3>
            
            <div className="space-y-2">
              {costBreakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.item}</p>
                    <p className="text-xs text-gray-500">{item.note}</p>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{item.price}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900">Total Estimasi:</span>
                <span className="font-bold text-lg text-blue-800">Rp 420K–910K</span>
              </div>
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="text-gray-600">Sudah ditabung:</span>
                <span className="font-semibold text-green-600">Rp 300K</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Sisa yang harus dibayar:</span>
                <span className="font-bold text-orange-600">Rp 120K–610K</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-xl">📝</span> Catatan Penting
            </h3>

            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="font-medium text-yellow-800 mb-2">🎒 Yang Harus Dibawa:</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Jaket/tebal (dingin di malam hari)</li>
                <li>• Obat-obatan pribadi (paracetamol, obat maag, plester)</li>
                <li>• Power bank & charger</li>
                <li>• Change clothes (2 set)</li>
                <li>• Alat mandi & handuk</li>
                <li>• Kamera/HP dengan memori kosong buat foto</li>
                <li>• Uang tunai cadangan (jaga-jaga)</li>
              </ul>
            </div>

            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="font-medium text-red-800 mb-2">⚠️ Peraturan & Tanggung Jawab:</p>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Konfirmasi booking villa H-3 sebelum berangkat</li>
                <li>• Cek kondisi mobil sebelum berangkat (ban, oli, bensin)</li>
                <li>• Jaga kebersihan villa, buang sampah pada tempatnya</li>
                <li>• Tidak boleh membawa narkoba/minuman keras berlebihan</li>
                <li>• Saling jaga satu sama lain, jangan wander sendirian</li>
                <li>• Yang punya SIM dan bisa nyetir lapor ke koordinator</li>
              </ul>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="font-medium text-green-800 mb-2">📞 Kontak Penting:</p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Koordinator Trip: [Isi nama & nomor]</li>
                <li>• Villa [Nama]: [Nomor telepon villa]</li>
                <li>• Darurat: 112 (Polisi/PMI)</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500">Selamat berlibur! 🎉 Jangan lupa bayar sisa kekurangan sebelum H-7.</p>
      </div>
    </div>
  );
}
