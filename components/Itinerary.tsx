'use client';

import { useRef, useState } from 'react';
import { useRundown, RundownItem } from '@/hooks/useRundown';

interface ItineraryProps {
  onClose: () => void;
  isAdmin?: boolean;
}

export function Itinerary({ onClose, isAdmin = false }: ItineraryProps) {
  const [activeDay, setActiveDay] = useState<1 | 2>(1);
  const { items, addItem, deleteItem, loading } = useRundown();
  const scheduleRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Form states
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [activity, setActivity] = useState('');
  const [note, setNote] = useState('');

  const dayItems = items.filter(i => i.day === activeDay).sort((a, b) => a.time.localeCompare(b.time));
  const nextOrder = dayItems.length > 0 ? Math.max(...dayItems.map((i) => i.order ?? 0)) + 1 : 0;

  // Helper to convert time string (HH:MM) to minutes
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Check if two time ranges overlap
  const isTimeOverlapping = (start1: string, end1: string, start2: string, end2: string) => {
    const s1 = timeToMinutes(start1);
    const e1 = timeToMinutes(end1);
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);
    // Overlap occurs when one range starts before the other ends
    return s1 < e2 && e1 > s2;
  };

  const handleSave = async () => {
    if (!activity.trim()) return;

    // Check if end time is after start time
    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      alert('Jam selesai harus lebih besar dari jam mulai!');
      return;
    }

    // Check for time overlap with existing items
    const overlappingItem = dayItems.find(item => {
      if (!item.time.includes(' - ')) return false;
      const [existingStart, existingEnd] = item.time.split(' - ');
      return isTimeOverlapping(startTime, endTime, existingStart, existingEnd);
    });

    if (overlappingItem) {
      alert(`Jam ${startTime} - ${endTime} bentrok dengan kegiatan "${overlappingItem.activity}" (${overlappingItem.time}). Pilih waktu lain yaa!`);
      return;
    }

    const timeString = `${startTime} - ${endTime}`;
    await addItem({
      day: activeDay,
      time: timeString,
      activity: activity.trim(),
      note: note.trim() || undefined,
      icon: '🗓️',
      order: nextOrder,
    });
    setActivity('');
    setNote('');
  };

  const handleExportPDF = () => {
    const exportPdf = async () => {
      if (isExporting) return;

      setIsExporting(true);
      try {
        const jsPDFModule = await import('jspdf');
        const { jsPDF } = jsPDFModule;

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const marginX = 14;
        const marginTop = 18;
        const marginBottom = 14;
        const maxY = pageHeight - marginBottom;

        const now = new Date();
        const generatedAt = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

        const day1 = items.filter((i) => i.day === 1).sort((a, b) => a.time.localeCompare(b.time));
        const day2 = items.filter((i) => i.day === 2).sort((a, b) => a.time.localeCompare(b.time));

        const renderDocHeader = () => {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(16);
          pdf.text('TRIP RUNDOWN', marginX, marginTop);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(90);
          pdf.text(`Generated: ${generatedAt}`, marginX, marginTop + 6);
          pdf.setTextColor(0);

          pdf.setDrawColor(180);
          pdf.line(marginX, marginTop + 10, pageWidth - marginX, marginTop + 10);
        };

        const renderFooter = (pageNumber: number, totalPages: number) => {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(120);
          pdf.text(`Page ${pageNumber} / ${totalPages}`, pageWidth - marginX, pageHeight - 8, { align: 'right' });
          pdf.setTextColor(0);
        };

        const colTimeX = marginX;
        const colActivityX = marginX + 40;
        const colNoteX = marginX + 105;
        const noteColWidth = pageWidth - marginX - colNoteX;

        const renderTableHeader = (y: number) => {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.text('Waktu', colTimeX, y);
          pdf.text('Kegiatan', colActivityX, y);
          pdf.text('Catatan', colNoteX, y);
          pdf.setDrawColor(180);
          pdf.line(marginX, y + 2, pageWidth - marginX, y + 2);
        };

        const renderSection = (title: string, sectionItems: RundownItem[], startY: number) => {
          let y = startY;

          if (y + 12 > maxY) {
            pdf.addPage();
            renderDocHeader();
            y = marginTop + 18;
          }

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(12);
          pdf.text(title, marginX, y);
          y += 7;

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(90);
          pdf.text(`Total: ${sectionItems.length} slot`, marginX, y);
          pdf.setTextColor(0);
          y += 8;

          renderTableHeader(y);
          y += 8;

          for (const item of sectionItems) {
            const timeText = item.time;
            const activityText = item.activity;
            const noteText = item.note ?? '-';

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);

            const timeLines = pdf.splitTextToSize(timeText, colActivityX - colTimeX - 2);
            const activityLines = pdf.splitTextToSize(activityText, colNoteX - colActivityX - 2);
            const noteLines = pdf.splitTextToSize(noteText, noteColWidth);

            const rowHeight = Math.max(timeLines.length, activityLines.length, noteLines.length) * 5;
            if (y + rowHeight > maxY) {
              pdf.addPage();
              renderDocHeader();
              y = marginTop + 18;
              renderTableHeader(y);
              y += 8;
            }

            pdf.text(timeLines, colTimeX, y);
            pdf.text(activityLines, colActivityX, y);
            pdf.text(noteLines, colNoteX, y);
            y += rowHeight;

            pdf.setDrawColor(230);
            pdf.line(marginX, y, pageWidth - marginX, y);
            y += 5;
          }

          return y + 2;
        };

        renderDocHeader();
        let y = marginTop + 18;
        y = renderSection('DAY 01', day1, y);
        y = renderSection('DAY 02', day2, y);

        const totalPages = pdf.getNumberOfPages();
        for (let page = 1; page <= totalPages; page++) {
          pdf.setPage(page);
          renderFooter(page, totalPages);
        }

        pdf.save('trip-rundown.pdf');
      } catch (err) {
        console.error('Export PDF error:', err);
        alert('Gagal export PDF. Coba lagi ya.');
      } finally {
        setIsExporting(false);
      }
    };

    void exportPdf();
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="w-full max-w-6xl bg-[#1e293b] rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] sm:max-h-none flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-8 py-4 sm:py-5 border-b border-gray-700">
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            <h2 className="text-white font-bold tracking-wider text-sm">TRIP RUNDOWN</h2>
            <div className="flex rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveDay(1)}
                className={`px-4 py-2 text-xs font-semibold transition-colors ${
                  activeDay === 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                DAY 01
              </button>
              <button
                onClick={() => setActiveDay(2)}
                className={`px-4 py-2 text-xs font-semibold transition-colors ${
                  activeDay === 2 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                DAY 02
              </button>
            </div>
            <span className="text-xs text-gray-500">{dayItems.length} events</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-900 disabled:text-emerald-200/60 text-white text-xs font-medium rounded-lg transition-colors"
            >
              {isExporting ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              )}
              {isExporting ? 'EXPORTING…' : 'PDF'}
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 text-xs font-medium rounded-lg transition-colors"
            >
              CLOSE
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left Side - Add Form */}
          <div className="w-full lg:w-80 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-gray-700 overflow-y-auto">
            <h3 className="text-xs font-bold text-gray-400 tracking-wider mb-6">ADD NEW SLOT</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs text-gray-500 mb-2">TIME</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-gray-800 text-white px-2 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-[10px] uppercase font-bold tracking-wider"
                    />
                  </div>
                  <span className="text-gray-500 font-bold">-</span>
                  <div className="relative flex-1">
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-gray-800 text-white px-2 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-[10px] uppercase font-bold tracking-wider"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2">ACTIVITY</label>
                <input
                  type="text"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="e.g. Check-in Villa"
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2">NOTE (optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Detail lokasi, estimasi biaya, dll..."
                  rows={4}
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm placeholder-gray-500 resize-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={!activity.trim() || loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold text-xs tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                SAVE TO SCHEDULE
              </button>
            </div>

            {/* Must Bring Section */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4">MUST BRING</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                <li>— BAJU GANTI (2 SET)</li>
                <li>— JAKET DINGIN</li>
                <li>— ALAT MANDI</li>
                <li>— OBAT PRIBADI</li>
              </ul>
            </div>
          </div>

          {/* Right Side - Schedule Table */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto" ref={scheduleRef}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-400 tracking-wider">
                SCHEDULE — HARI {activeDay === 1 ? '01' : '02'}
              </h3>
              <span className="text-xs text-gray-500">{dayItems.length} slot</span>
            </div>

            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-800/50 rounded-t-lg text-xs font-medium text-gray-400">
              <div className="col-span-2">WAKTU</div>
              <div className="col-span-4">KEGIATAN</div>
              <div className="col-span-5">CATATAN</div>
              <div className="col-span-1"></div>
            </div>

            {/* Table Body */}
            <div className="space-y-2 sm:space-y-1">
              {dayItems.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  Belum ada kegiatan. Tambahkan slot baru di sebelah kiri.
                </div>
              ) : (
                dayItems.map((item, index) => (
                  <div key={item.id}>
                    {/* Mobile card */}
                    <div className="sm:hidden bg-gray-800/30 hover:bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-blue-400 font-semibold text-sm">
                            {item.time.includes(' - ') ? item.time.split(' - ')[0] : item.time}
                          </div>
                          {item.time.includes(' - ') && (
                            <div className="text-[11px] text-gray-500 font-medium">s/d {item.time.split(' - ')[1]}</div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin hapus \"${item.activity}\"?`)) {
                              deleteItem(item.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-400 text-xs font-medium transition-colors px-2 py-1 rounded hover:bg-red-500/10 flex-shrink-0"
                          title="Hapus kegiatan"
                        >
                          DEL
                        </button>
                      </div>

                      <div className="mt-3">
                        <div className="text-white font-medium text-sm break-words">{item.activity}</div>
                        <div className="text-gray-400 text-xs mt-1 break-words">{item.note || '-'}</div>
                      </div>
                    </div>

                    {/* Desktop/table row */}
                    <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg items-center text-sm">
                      <div className="col-span-2 text-blue-400 font-semibold flex flex-col gap-0.5">
                        {item.time.includes(' - ') ? (
                          <>
                            <span>{item.time.split(' - ')[0]}</span>
                            <span className="text-[10px] text-gray-500 font-medium">s/d {item.time.split(' - ')[1]}</span>
                          </>
                        ) : (
                          <span>{item.time}</span>
                        )}
                      </div>
                      <div className="col-span-4 text-white font-medium break-words">{item.activity}</div>
                      <div className="col-span-5 text-gray-400 text-xs break-words">{item.note || '-'}</div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => {
                            if (confirm(`Yakin hapus "${item.activity}"?`)) {
                              deleteItem(item.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-400 text-xs font-medium transition-colors px-2 py-1 rounded hover:bg-red-500/10"
                          title="Hapus kegiatan"
                        >
                          DEL
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {dayItems.length > 0 && (
              <p className="mt-3 text-xs text-gray-500 italic">
                {dayItems.length} agenda · tersimpan ke database otomatis
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
