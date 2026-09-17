import React, { useState, useMemo } from 'react';
import { Printer, Download, X, FileSpreadsheet, FileText, Calendar } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      
      {/* Modal Container */}
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-neutral-300 w-full max-w-5xl my-auto overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Modal Header & Action Toolbar (Hidden during print) */}
        <div className="px-5 py-3.5 bg-neutral-950 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden border-b-2 border-neutral-800">
          
          {/* Title & Month Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-emerald-400 shrink-0" />
              <h3 className="text-base font-extrabold text-white tracking-tight">
                공용차량 운행 실적 보고서
              </h3>
            </div>

            {/* Month Filter Selector */}
            <div className="flex items-center gap-1.5 ml-2 pl-3 border-l-2 border-neutral-700">
              <Calendar className="w-4 h-4 text-neutral-300 shrink-0" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-9 bg-neutral-800 hover:bg-neutral-700 border-2 border-neutral-600 text-white rounded-xl px-2.5 text-xs sm:text-sm font-bold outline-none cursor-pointer"
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
              className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>인쇄 / PDF</span>
            </button>

            <button
              type="button"
              onClick={() => exportMonthlyReportExcel(logs, selectedMonth)}
              className="h-9 px-3.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-600 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95"
              title="해당 월의 실적 보고서 및 결재란이 포함된 정식 엑셀 파일 다운로드"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{monthStr}월 엑셀</span>
            </button>

            <button
              type="button"
              onClick={() => exportMonthlyReportCSV(logs, selectedMonth)}
              className="h-9 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs sm:text-sm font-bold hidden sm:flex items-center gap-1 transition-colors cursor-pointer border border-neutral-600"
              title="CSV 데이터 파일 다운로드"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Sheet Preview Area */}
        <div className="p-3 sm:p-6 overflow-x-auto bg-neutral-200 flex-1 flex justify-center">
          <div 
            id="official-log-print-sheet" 
            className="bg-white p-5 sm:p-8 shadow-md border-2 border-neutral-400 min-w-[860px] max-w-[980px] w-full text-neutral-950 font-sans rounded-xl"
            style={{ fontFamily: "'Malgun Gothic', 'Dotum', 'Pretendard', sans-serif" }}
          >
            
            {/* Top Report Header with Approval Box */}
            <div className="mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black text-neutral-950 tracking-tight">
                    {yearStr}년 {monthStr}월 공용차량 운행 실적 보고서
                  </h2>
                  <p className="text-xs text-neutral-600 font-bold mt-0.5">
                    (서식: 공용차량 운행일지)
                  </p>
                </div>

                {/* Corporate Approval Box (결재란) */}
                <div className="border-2 border-neutral-950 text-center">
                  <table className="border-collapse text-xs w-52">
                    <tbody>
                      <tr className="border-b-2 border-neutral-950 bg-neutral-100 font-bold">
                        <td rowSpan={2} className="w-7 border-r-2 border-neutral-950 bg-neutral-200 px-1 py-1 font-black">
                          결<br/>재
                        </td>
                        <td className="w-15 border-r border-neutral-950 py-1">담 당</td>
                        <td className="w-15 border-r border-neutral-950 py-1">팀 장</td>
                        <td className="w-15 py-1">부서장</td>
                      </tr>
                      <tr className="h-11">
                        <td className="border-r border-neutral-950"></td>
                        <td className="border-r border-neutral-950"></td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Management Meta Row */}
              <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-900 font-bold border-b-2 border-neutral-300 pb-2 mt-3">
                <div className="flex items-center gap-3">
                  <span><strong>소속 부서:</strong> 동반성장부</span>
                  <span className="text-neutral-400">|</span>
                  <span><strong>차량 정보:</strong> 336호 (84러 4531)</span>
                </div>
                <div>
                  <span><strong>대상 기간:</strong> {yearStr}년 {monthStr}월 01일 ~ {monthStr}월 말일</span>
                </div>
              </div>

              {/* Monthly KPI Summary Box */}
              <div className="grid grid-cols-4 gap-2 my-3 p-2.5 bg-neutral-100 border-2 border-neutral-300 rounded-xl text-center text-xs sm:text-sm">
                <div>
                  <span className="text-neutral-600 block text-xs font-bold">월간 총 운행</span>
                  <strong className="text-neutral-950 text-sm sm:text-base font-black font-mono">{stats.totalCount} 건</strong>
                </div>
                <div>
                  <span className="text-neutral-600 block text-xs font-bold">월간 총 주행거리</span>
                  <strong className="text-emerald-800 text-sm sm:text-base font-black font-mono">{stats.totalDrivenKm.toLocaleString()} km</strong>
                </div>
                <div>
                  <span className="text-neutral-600 block text-xs font-bold">월말 최종 누적거리</span>
                  <strong className="text-neutral-950 text-sm sm:text-base font-black font-mono">{stats.endMileage.toLocaleString()} km</strong>
                </div>
                <div>
                  <span className="text-neutral-600 block text-xs font-bold">월간 총 주유량</span>
                  <strong className="text-amber-800 text-sm sm:text-base font-black font-mono">
                    {stats.totalFuelLiters > 0 ? `${stats.totalFuelLiters} L` : '-'}
                  </strong>
                </div>
              </div>
            </div>

            {/* The Official Grid Table (Starts at 1 for the month) */}
            <table className="w-full border-collapse border-2 border-neutral-950 text-xs sm:text-sm">
              <thead>
                <tr className="bg-neutral-100 text-neutral-950 font-bold border-b-2 border-neutral-950 h-9 text-center">
                  <th rowSpan={2} className="border border-neutral-950 w-11 px-1 font-black">순</th>
                  <th rowSpan={2} className="border border-neutral-950 w-16 px-1 font-black">일자</th>
                  <th rowSpan={2} className="border border-neutral-950 w-16 px-1 font-black">운전자</th>
                  <th rowSpan={2} className="border border-neutral-950 w-36 px-2 font-black">운행 목적</th>
                  <th rowSpan={2} className="border border-neutral-950 w-24 px-1 font-black">행선지</th>
                  <th colSpan={2} className="border border-neutral-950 px-2 font-black">주행거리</th>
                  <th colSpan={2} className="border border-neutral-950 px-2 font-black">운행시간 (08~18시)</th>
                  <th rowSpan={2} className="border border-neutral-950 w-14 px-1 font-black">주유량</th>
                  <th rowSpan={2} className="border border-neutral-950 w-36 px-2 font-black">수리/점검 내역</th>
                  <th rowSpan={2} className="border border-neutral-950 w-32 px-2 font-black">비고 (주차구역)</th>
                </tr>
                <tr className="bg-neutral-100 text-neutral-950 font-bold border-b-2 border-neutral-950 h-8 text-center">
                  <th className="border border-neutral-950 w-16 font-extrabold">당일</th>
                  <th className="border border-neutral-950 w-16 font-extrabold">총계</th>
                  <th className="border border-neutral-950 w-14 font-extrabold">시작</th>
                  <th className="border border-neutral-950 w-14 font-extrabold">종료</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const rawDate = r.date ? normalizeDateStr(r.date) : '';
                  const formattedDate = rawDate ? rawDate.slice(5).replace('-', '/') : '';

                  return (
                    <tr key={r.seq} className="h-8 hover:bg-neutral-100/70 transition-colors">
                      <td className="border border-neutral-950 text-center font-mono font-black text-neutral-800">
                        {r.seq}
                      </td>
                      <td className="border border-neutral-950 text-center font-mono font-bold">{formattedDate}</td>
                      <td className="border border-neutral-950 text-center font-black">{r.userName}</td>
                      <td className="border border-neutral-950 px-2 text-left font-bold truncate">{r.purpose}</td>
                      <td className="border border-neutral-950 px-1 text-center font-bold truncate">{r.destination}</td>
                      <td className="border border-neutral-950 px-2 text-right font-mono font-black text-emerald-900">
                        {r.dailyKm !== '' ? Number(r.dailyKm).toLocaleString() : ''}
                      </td>
                      <td className="border border-neutral-950 px-2 text-right font-mono font-bold text-neutral-900">
                        {r.totalKm !== '' ? Number(r.totalKm).toLocaleString() : ''}
                      </td>
                      <td className="border border-neutral-950 text-center font-mono text-xs font-bold">{r.startTime}</td>
                      <td className="border border-neutral-950 text-center font-mono text-xs font-bold">{r.endTime}</td>
                      <td className="border border-neutral-950 text-center font-mono font-bold">{r.fuelAmount}</td>
                      <td className="border border-neutral-950 px-2 text-left text-xs font-semibold truncate">{r.maintenance}</td>
                      <td className="border border-neutral-950 px-2 text-left text-xs font-semibold truncate">{r.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Bottom Footer */}
            <div className="flex items-center justify-between text-xs text-neutral-700 font-mono mt-3.5 px-1 font-bold">
              <span>{printTimestamp}</span>
              <span className="font-black text-neutral-950 text-sm">{pageLabel} (1/1)</span>
            </div>

          </div>
        </div>

        {/* Modal Bottom Footer Bar */}
        <div className="px-5 py-3 bg-neutral-100 border-t-2 border-neutral-300 flex items-center justify-between text-xs sm:text-sm text-neutral-800 font-bold shrink-0 print:hidden">
          <span>{yearStr}년 {monthStr}월 실적 (순번 1번부터 시작, 사내 정식 보고서 규격)</span>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
