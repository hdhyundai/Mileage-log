import React, { useState, useMemo } from 'react';
import { Download, Search, Trash2, Printer, FileSpreadsheet, Car, Calendar, FileText } from 'lucide-react';
import { VehicleLog } from '../types';
import { 
  exportMonthlyReportExcel, 
  getAvailableMonths, 
  getMonthlyLogsWithSeq,
  normalizeDateStr,
  getLogMonth
} from '../utils/storage';

interface HistorySectionProps {
  logs: VehicleLog[];
  onDeleteLog: (id: string) => void;
  onOpenOfficialSheet: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  logs,
  onDeleteLog,
  onOpenOfficialSheet
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const availableMonths = useMemo(() => getAvailableMonths(logs), [logs]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Filter logs by month and search
  const filtered = useMemo(() => {
    let list = logs;
    if (selectedMonth !== 'all') {
      list = list.filter((l) => getLogMonth(l.date) === selectedMonth);
    }
    if (!searchTerm.trim()) return list;

    const term = searchTerm.toLowerCase();
    return list.filter((l) =>
      l.userName.toLowerCase().includes(term) ||
      l.destination.toLowerCase().includes(term) ||
      l.purpose.toLowerCase().includes(term) ||
      (l.parkingSpot && l.parkingSpot.toLowerCase().includes(term)) ||
      (l.date && l.date.includes(term))
    );
  }, [logs, selectedMonth, searchTerm]);

  // Pre-calculate monthly sequences for display
  const monthlySeqMap = useMemo(() => {
    const map = new Map<string, number>();
    availableMonths.forEach((m) => {
      const seqLogs = getMonthlyLogsWithSeq(logs, m.key, 'asc');
      seqLogs.forEach((l) => {
        map.set(l.id, l.monthlySeq);
      });
    });
    return map;
  }, [logs, availableMonths]);

  const targetExportMonth = selectedMonth !== 'all' ? selectedMonth : (availableMonths[0]?.key || '2026-09');
  const [exportYear, exportMonth] = targetExportMonth.split('-');

  return (
    <div className="space-y-4">
      
      {/* Top Controls & Prominent Official Report Banner */}
      <div className="flex flex-col gap-2.5">
        
        {/* Main Official Form & Monthly Report Action Banner */}
        <div className="p-3 sm:p-3.5 bg-neutral-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
              <span>공용차량 운행 실적 보고서</span>
              <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                {exportMonth}월
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenOfficialSheet}
              className="h-8.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>양식 출력</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar: Month Selection & Search */}
        <div className="flex flex-col sm:flex-row gap-2">
          
          {/* Month Selector Buttons */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl overflow-x-auto shrink-0 text-xs">
            <button
              type="button"
              onClick={() => setSelectedMonth('all')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                selectedMonth === 'all'
                  ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              전체 ({logs.length})
            </button>
            {availableMonths.map((m) => (
              <button
                type="button"
                key={m.key}
                onClick={() => setSelectedMonth(m.key)}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  selectedMonth === m.key
                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {m.label.replace(' (당월)', '')} ({m.count})
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="운전자, 일자, 목적지, 주차구역 검색..."
              className="w-full h-10 bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 text-xs font-medium outline-none focus:bg-white focus:border-emerald-600 transition-all placeholder:text-neutral-400"
            />
          </div>

        </div>

      </div>

      {/* Logs List matching official items */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-400 bg-neutral-50 rounded-2xl border border-neutral-200">
          선택한 기간의 운행 기록이 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => {
            const monthlySeq = monthlySeqMap.get(log.id) || log.seq;
            const rawDate = log.date ? normalizeDateStr(log.date) : '';
            const formattedDate = rawDate ? rawDate.slice(5).replace('-', '/') : '09/16';
            const logMonthStr = rawDate ? rawDate.slice(5, 7) : '09';

            return (
              <div
                key={log.id}
                className="bg-neutral-50 hover:bg-neutral-100/80 rounded-xl p-3.5 border border-neutral-200/80 transition-colors flex items-center justify-between gap-3"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  
                  {/* Top row: 순번 badge (한달 기준 순번), 일자, 운전자, 목적 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span 
                      className="text-[10px] font-mono bg-emerald-100/80 text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-300"
                      title={`${logMonthStr}월 순번 ${monthlySeq}호`}
                    >
                      {logMonthStr}월 #{monthlySeq}
                    </span>
                    <span className="text-xs font-mono text-neutral-600">
                      {formattedDate}
                    </span>
                    <span className="text-xs font-bold text-neutral-900">
                      {log.userName}
                    </span>
                    <span className="text-[11px] text-neutral-400">·</span>
                    <span className="text-xs text-neutral-800 font-medium truncate">
                      {log.destination}
                    </span>
                    <span className="text-[10px] bg-neutral-200/70 text-neutral-700 px-1.5 py-0.5 rounded font-medium">
                      {log.purpose}
                    </span>
                  </div>

                  {/* Middle row: 당일 주행거리, 총계, 운행시간 */}
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 flex-wrap">
                    <span className="text-emerald-700 font-bold font-mono">
                      당일: +{log.drivenDistance}km
                    </span>
                    <span className="text-neutral-400">/</span>
                    <span className="font-mono text-neutral-600">
                      총계: {log.endMileage?.toLocaleString()}km
                    </span>
                    {(log.startTime || log.endTime) && (
                      <>
                        <span className="text-neutral-400">·</span>
                        <span className="font-mono text-neutral-600">
                          {log.startTime || '--:--'} ~ {log.endTime || '--:--'}
                        </span>
                      </>
                    )}
                    {log.parkingSpot && (
                      <>
                        <span className="text-neutral-400">·</span>
                        <span className="text-neutral-800 font-semibold inline-flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-neutral-200/80 text-[10px]">
                          <Car className="w-3 h-3 text-emerald-600" />
                          <span>{log.parkingSpot}</span>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Bottom row: 주유량 / 정비 / 메모 */}
                  {(log.fuelAmount || log.maintenance || log.notes) && (
                    <div className="text-[11px] text-neutral-500 flex items-center gap-2 flex-wrap pt-0.5 border-t border-neutral-200/60 mt-1">
                      {log.fuelAmount && (
                        <span className="text-amber-700 font-medium">
                          주유: {log.fuelAmount}
                        </span>
                      )}
                      {log.maintenance && (
                        <span className="text-blue-700 font-medium">
                          정비: {log.maintenance}
                        </span>
                      )}
                      {(() => {
                        if (!log.notes) return null;
                        const cleanNote = log.notes
                          .replace(new RegExp(`주차[:\\s]*${log.parkingSpot || ''}`, 'g'), '')
                          .replace(new RegExp(log.parkingSpot || 'NON_EXISTENT', 'g'), '')
                          .replace(/^[/\s,·-]+|[/\s,·-]+$/g, '')
                          .trim();
                        return cleanNote ? (
                          <span className="text-neutral-600 truncate">
                            비고: {cleanNote}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  )}

                </div>

                {/* Delete Log Button */}
                <button
                  type="button"
                  onClick={() => onDeleteLog(log.id)}
                  className="w-8 h-8 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                  title="기록 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
