import React, { useState, useMemo } from 'react';
import { Search, Trash2, FileSpreadsheet, Car } from 'lucide-react';
import { VehicleLog } from '../types';
import { 
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
  const [, exportMonth] = targetExportMonth.split('-');

  return (
    <div className="space-y-4">
      
      {/* Top Controls & Prominent Official Report Banner */}
      <div className="flex flex-col gap-3">
        
        {/* Main Official Form & Monthly Report Action Banner */}
        <div className="p-3.5 sm:p-4 bg-neutral-950 text-white rounded-2xl flex items-center justify-between gap-3 shadow-md border-2 border-neutral-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="text-sm sm:text-base font-extrabold flex items-center gap-2">
              <span>운행 실적 보고서</span>
              <span className="text-xs font-black text-emerald-950 bg-emerald-300 px-2 py-0.5 rounded-md border border-emerald-400">
                {exportMonth}월
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenOfficialSheet}
              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>양식 출력</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar: Month Selection & Search */}
        <div className="flex flex-col gap-2.5">
          
          {/* Month Selector Buttons */}
          <div className="flex items-center gap-1.5 p-1.5 bg-neutral-200 rounded-xl overflow-x-auto shrink-0 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setSelectedMonth('all')}
              className={`px-3 py-2 rounded-lg font-black transition-all ${
                selectedMonth === 'all'
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'text-neutral-800 hover:text-black hover:bg-neutral-300'
              }`}
            >
              전체 ({logs.length})
            </button>
            {availableMonths.map((m) => (
              <button
                type="button"
                key={m.key}
                onClick={() => setSelectedMonth(m.key)}
                className={`px-3 py-2 rounded-lg font-black transition-all whitespace-nowrap ${
                  selectedMonth === m.key
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-neutral-800 hover:text-black hover:bg-neutral-300'
                }`}
              >
                {m.label.replace(' (당월)', '')} ({m.count})
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative">
            <Search className="w-5 h-5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="운전자 이름, 목적지, 주차구역 검색..."
              className="w-full h-11 bg-white border-2 border-neutral-300 rounded-xl pl-10 pr-3 text-sm sm:text-base font-bold text-neutral-950 outline-none focus:border-neutral-900 transition-all placeholder:text-neutral-400 shadow-2xs"
            />
          </div>

        </div>

      </div>

      {/* Logs List matching official items */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm font-bold text-neutral-500 bg-neutral-100 rounded-2xl border-2 border-neutral-300">
          선택한 조건의 운행 기록이 없습니다.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((log) => {
            const monthlySeq = monthlySeqMap.get(log.id) || log.seq;
            const rawDate = log.date ? normalizeDateStr(log.date) : '';
            const formattedDate = rawDate ? rawDate.slice(5).replace('-', '/') : '09/16';
            const logMonthStr = rawDate ? rawDate.slice(5, 7) : '09';

            return (
              <div
                key={log.id}
                className="bg-white hover:bg-neutral-50 rounded-2xl p-3.5 sm:p-4 border-2 border-neutral-200/90 shadow-2xs transition-colors flex items-center justify-between gap-3"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  
                  {/* Top row: 순번 badge (한달 기준 순번), 일자, 운전자, 목적 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span 
                      className="text-xs font-mono bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-md font-extrabold border border-emerald-400 whitespace-nowrap"
                      title={`${logMonthStr}월 순번 ${monthlySeq}호`}
                    >
                      {logMonthStr}월 #{monthlySeq}
                    </span>
                    <span className="text-sm font-mono font-bold text-neutral-700 whitespace-nowrap">
                      {formattedDate}
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-950 whitespace-nowrap">
                      {log.userName}
                    </span>
                    <span className="text-sm text-neutral-400">·</span>
                    <span className="text-sm font-extrabold text-slate-900 truncate">
                      {log.destination}
                    </span>
                    <span className="text-xs font-extrabold bg-indigo-100 text-indigo-950 px-2 py-0.5 rounded-md border border-indigo-300 whitespace-nowrap">
                      {log.purpose}
                    </span>
                  </div>

                  {/* Middle row: 당일 주행거리, 총계, 운행시간 */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-700 flex-wrap font-bold">
                    <span className="text-emerald-800 font-black font-mono text-sm sm:text-base whitespace-nowrap">
                      +{log.drivenDistance}km
                    </span>
                    <span className="text-neutral-400">/</span>
                    <span className="font-mono text-slate-700 font-extrabold whitespace-nowrap">
                      누적: {log.endMileage?.toLocaleString()}km
                    </span>
                    {(log.startTime || log.endTime) && (
                      <>
                        <span className="text-neutral-400">·</span>
                        <span className="font-mono text-slate-700 font-extrabold bg-neutral-100 px-1.5 py-0.2 rounded border border-neutral-200 whitespace-nowrap">
                          {log.startTime || '--:--'} ~ {log.endTime || '--:--'}
                        </span>
                      </>
                    )}
                    {log.parkingSpot && (
                      <>
                        <span className="text-neutral-400">·</span>
                        <span className="text-teal-950 font-black inline-flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-300 text-xs whitespace-nowrap">
                          <Car className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          <span>{log.parkingSpot}</span>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Bottom row: 주유량 / 정비 / 메모 */}
                  {(log.fuelAmount || log.maintenance || log.notes) && (
                    <div className="text-xs sm:text-sm text-neutral-700 flex items-center gap-2 flex-wrap pt-1.5 border-t border-neutral-200 mt-1 font-semibold">
                      {log.fuelAmount && (
                        <span className="text-amber-900 font-extrabold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-300 whitespace-nowrap">
                          주유: {log.fuelAmount}
                        </span>
                      )}
                      {log.maintenance && (
                        <span className="text-blue-900 font-extrabold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-300 whitespace-nowrap">
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
                          <span className="text-neutral-800 truncate">
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
                  className="w-9 h-9 rounded-xl text-neutral-400 hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0 cursor-pointer border border-transparent hover:border-red-200"
                  title="기록 삭제"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
