import React, { useState, useMemo } from 'react';
import { Printer, Download, X, FileSpreadsheet, FileText, Calendar, Building2, Car } from 'lucide-react';
import { VehicleLog } from '../types';
import { 
  getAvailableMonths, 
  getMonthlyLogsWithSeq, 
  getMonthlyStats, 
  exportMonthlyReportExcel, 
  exportMonthlyReportCSV, 
  formatLogSheetNotes,
  normalizeDateStr
} from '../utils/storage';

interface OfficialLogSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: VehicleLog[];
}

export const OfficialLogSheetModal: React.FC<OfficialLogSheetModalProps> = ({
  isOpen,
  onClose,
  logs
}) => {
  if (!isOpen) return null;

  // Available months
  const availableMonths = useMemo(() => getAvailableMonths(logs), [logs]);
  const defaultMonth = availableMonths[0]?.key || '2026-09';
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);

  // Parse Year and Month
  const [yearStr, monthStr] = selectedMonth.split('-');

  // Filter logs for selected month, sorted chronologically ascending with seq starting from 1
  const monthlyLogs = useMemo(() => {
    return getMonthlyLogsWithSeq(logs, selectedMonth, 'asc');
  }, [logs, selectedMonth]);

  // Monthly KPI Summary stats
  const stats = useMemo(() => {
    return getMonthlyStats(monthlyLogs);
  }, [monthlyLogs]);

  const now = new Date();
  const printTimestamp = `PRINT ${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}/동반성장부/***`;
  const pageLabel = `${yearStr} / ${monthStr}`;

  // Fill up to 22 rows like the official paper log sheet in the photo
  const TOTAL_ROWS = Math.max(22, monthlyLogs.length);
  const rows = Array.from({ length: TOTAL_ROWS }, (_, i) => {
    const log = monthlyLogs[i];
    const seq = i + 1; // Strict monthly sequence starting from 1
    return {
      seq,
      date: log?.date || '',
      userName: log?.userName || '',
      purpose: log?.purpose || '',
      destination: log?.destination || '',
      dailyKm: log ? log.drivenDistance : '',
      totalKm: log ? log.endMileage : '',
      startTime: log?.startTime || '',
      endTime: log?.endTime || '',
      fuelAmount: log?.fuelAmount || '',
      maintenance: log?.maintenance || '',
      notes: formatLogSheetNotes(log?.parkingSpot, log?.notes)
    };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-5xl my-auto overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Modal Header & Action Toolbar (Hidden during print) */}
        <div className="px-4 py-3 bg-neutral-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          
          {/* Title & Month Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                공용차량 운행 실적 보고서
              </h3>
            </div>

            {/* Month Filter Selector */}
            <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-neutral-700">
              <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-8 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white rounded-lg px-2 text-xs font-bold outline-none cursor-pointer"
              >
                {availableMonths.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label} ({m.count}건)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>인쇄 / PDF</span>
            </button>

            <button
              type="button"
              onClick={() => exportMonthlyReportExcel(logs, selectedMonth)}
              className="h-8 px-3 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="해당 월의 실적 보고서 및 결재란이 포함된 정식 엑셀 파일 다운로드"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{monthStr}월 엑셀 보고서</span>
            </button>

            <button
              type="button"
              onClick={() => exportMonthlyReportCSV(logs, selectedMonth)}
              className="h-8 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 text-xs font-medium hidden sm:flex items-center gap-1 transition-colors cursor-pointer"
              title="CSV 데이터 파일 다운로드"
            >
              <FileText className="w-3 h-3" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors ml-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Sheet Preview Area */}
        <div className="p-3 sm:p-6 overflow-x-auto bg-neutral-100 flex-1 flex justify-center">
          <div 
            id="official-log-print-sheet" 
            className="bg-white p-5 sm:p-8 shadow-md border border-neutral-300 min-w-[860px] max-w-[980px] w-full text-neutral-900 font-sans"
            style={{ fontFamily: "'Malgun Gothic', 'Dotum', 'Pretendard', sans-serif" }}
          >
            
            {/* Top Report Header with Approval Box */}
            <div className="mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black text-neutral-900 tracking-tight">
                    {yearStr}년 {monthStr}월 공용차량 운행 실적 보고서
                  </h2>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">
                    (서식: 공용차량 운행일지)
                  </p>
                </div>

                {/* Corporate Approval Box (결재란) */}
                <div className="border border-neutral-900 text-center">
                  <table className="border-collapse text-[11px] w-48">
                    <tbody>
                      <tr className="border-b border-neutral-900 bg-neutral-100/90 font-bold">
                        <td rowSpan={2} className="w-6 border-r border-neutral-900 bg-neutral-200/80 px-1 py-1">
                          결<br/>재
                        </td>
                        <td className="w-14 border-r border-neutral-900 py-0.5">담 당</td>
                        <td className="w-14 border-r border-neutral-900 py-0.5">팀 장</td>
                        <td className="w-14 py-0.5">부서장</td>
                      </tr>
                      <tr className="h-10">
                        <td className="border-r border-neutral-900"></td>
                        <td className="border-r border-neutral-900"></td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Management Meta Row */}
              <div className="flex items-center justify-between text-xs text-neutral-700 font-medium border-b border-neutral-200 pb-2 mt-2">
                <div className="flex items-center gap-3">
                  <span><strong>소속 부서:</strong> 동반성장부</span>
                  <span className="text-neutral-300">|</span>
                  <span><strong>차량 정보:</strong> 336호 (84러 4531)</span>
                </div>
                <div>
                  <span><strong>대상 기간:</strong> {yearStr}년 {monthStr}월 01일 ~ {monthStr}월 말일</span>
                </div>
              </div>

              {/* Monthly KPI Summary Box */}
              <div className="grid grid-cols-4 gap-2 my-2.5 p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-center text-xs">
                <div>
                  <span className="text-neutral-500 block text-[11px]">월간 총 운행</span>
                  <strong className="text-neutral-900 text-sm font-mono">{stats.totalCount} 건</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">월간 총 주행거리</span>
                  <strong className="text-emerald-700 text-sm font-mono">{stats.totalDrivenKm.toLocaleString()} km</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">월말 최종 누적거리</span>
                  <strong className="text-neutral-900 text-sm font-mono">{stats.endMileage.toLocaleString()} km</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">월간 총 주유량</span>
                  <strong className="text-amber-700 text-sm font-mono">
                    {stats.totalFuelLiters > 0 ? `${stats.totalFuelLiters} L` : '-'}
                  </strong>
                </div>
              </div>
            </div>

            {/* The Official Grid Table (Starts at 1 for the month) */}
            <table className="w-full border-collapse border border-neutral-800 text-xs">
              <thead>
                <tr className="bg-neutral-100/90 text-neutral-900 font-bold border-b border-neutral-800 h-8 text-center">
                  <th rowSpan={2} className="border border-neutral-800 w-11 px-1 font-bold">순</th>
                  <th rowSpan={2} className="border border-neutral-800 w-16 px-1 font-bold">일자</th>
                  <th rowSpan={2} className="border border-neutral-800 w-16 px-1 font-bold">운전자</th>
                  <th rowSpan={2} className="border border-neutral-800 w-36 px-2 font-bold">운행 목적</th>
                  <th rowSpan={2} className="border border-neutral-800 w-24 px-1 font-bold">행선지</th>
                  <th colSpan={2} className="border border-neutral-800 px-2 font-bold">주행거리</th>
                  <th colSpan={2} className="border border-neutral-800 px-2 font-bold">운행시간 (08~18시)</th>
                  <th rowSpan={2} className="border border-neutral-800 w-14 px-1 font-bold">주유량</th>
                  <th rowSpan={2} className="border border-neutral-800 w-36 px-2 font-bold">수리/점검 내역</th>
                  <th rowSpan={2} className="border border-neutral-800 w-32 px-2 font-bold">비고 (주차구역)</th>
                </tr>
                <tr className="bg-neutral-100/90 text-neutral-900 font-bold border-b border-neutral-800 h-7 text-center">
                  <th className="border border-neutral-800 w-16 font-semibold">당일</th>
                  <th className="border border-neutral-800 w-16 font-semibold">총계</th>
                  <th className="border border-neutral-800 w-14 font-semibold">시작</th>
                  <th className="border border-neutral-800 w-14 font-semibold">종료</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const rawDate = r.date ? normalizeDateStr(r.date) : '';
                  const formattedDate = rawDate ? rawDate.slice(5).replace('-', '/') : '';

                  return (
                    <tr key={r.seq} className="h-7 hover:bg-neutral-50/80 transition-colors">
                      <td className="border border-neutral-800 text-center font-mono font-bold text-neutral-700">
                        {r.seq}
                      </td>
                      <td className="border border-neutral-800 text-center font-mono">{formattedDate}</td>
                      <td className="border border-neutral-800 text-center font-medium">{r.userName}</td>
                      <td className="border border-neutral-800 px-2 text-left truncate">{r.purpose}</td>
                      <td className="border border-neutral-800 px-1 text-center truncate">{r.destination}</td>
                      <td className="border border-neutral-800 px-1 text-right font-mono font-semibold">
                        {r.dailyKm !== '' ? Number(r.dailyKm).toLocaleString() : ''}
                      </td>
                      <td className="border border-neutral-800 px-1 text-right font-mono">
                        {r.totalKm !== '' ? Number(r.totalKm).toLocaleString() : ''}
                      </td>
                      <td className="border border-neutral-800 text-center font-mono text-[11px]">{r.startTime}</td>
                      <td className="border border-neutral-800 text-center font-mono text-[11px]">{r.endTime}</td>
                      <td className="border border-neutral-800 text-center font-mono">{r.fuelAmount}</td>
                      <td className="border border-neutral-800 px-2 text-left text-[11px] truncate">{r.maintenance}</td>
                      <td className="border border-neutral-800 px-2 text-left text-[11px] truncate">{r.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Bottom Footer */}
            <div className="flex items-center justify-between text-[11px] text-neutral-600 font-mono mt-3 px-1">
              <span>{printTimestamp}</span>
              <span className="font-semibold text-neutral-800 text-xs">{pageLabel} (1/1)</span>
            </div>

          </div>
        </div>

        {/* Modal Bottom Footer Bar */}
        <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500 shrink-0 print:hidden">
          <span>{yearStr}년 {monthStr}월 실적 (순번 1번부터 시작, 사내 정식 보고서 규격)</span>
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-semibold transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
