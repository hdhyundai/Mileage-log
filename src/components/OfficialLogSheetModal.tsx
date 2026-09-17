import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Printer, Download, X, FileSpreadsheet, FileText, Calendar, ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
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

  // Zoom / Scale state (100% or fit to screen)
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFitToScreen, setIsFitToScreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Adjust zoom for "fit to screen" mode
  useEffect(() => {
    if (isFitToScreen && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 24; // padding allowance
      const sheetWidth = 880; // base sheet width
      const calculatedScale = Math.min(1, Math.max(0.35, containerWidth / sheetWidth));
      setZoomLevel(calculatedScale);
    }
  }, [isFitToScreen]);

  const toggleFitToScreen = () => {
    if (isFitToScreen) {
      setIsFitToScreen(false);
      setZoomLevel(1);
    } else {
      setIsFitToScreen(true);
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 24;
        const sheetWidth = 880;
        const calculatedScale = Math.min(1, Math.max(0.35, containerWidth / sheetWidth));
        setZoomLevel(calculatedScale);
      }
    }
  };

  const handleZoomIn = () => {
    setIsFitToScreen(false);
    setZoomLevel((prev) => Math.min(1.5, Number((prev + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    setIsFitToScreen(false);
    setZoomLevel((prev) => Math.max(0.4, Number((prev - 0.15).toFixed(2))));
  };

  const handleResetZoom = () => {
    setIsFitToScreen(false);
    setZoomLevel(1);
  };

  const sheetBaseWidth = 880;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4">
      
      {/* Modal Container */}
      <div className="bg-white sm:rounded-3xl shadow-2xl border-0 sm:border-2 sm:border-neutral-300 w-full max-w-6xl h-full sm:h-auto sm:max-h-[96vh] flex flex-col overflow-hidden">
        
        {/* Modal Header & Action Toolbar (Hidden during print) */}
        <div className="px-3.5 sm:px-5 py-3 bg-neutral-950 text-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 print:hidden border-b-2 border-neutral-800">
          
          {/* Top Bar: Title, Month Selector & Close Button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
                공용차량 운행 실적 보고서
              </h3>
            </div>

            {/* Month Filter Selector */}
            <div className="flex items-center gap-1 shrink-0">
              <div className="flex items-center gap-1 bg-neutral-900 px-2 py-1 rounded-xl border border-neutral-700">
                <Calendar className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-white text-xs sm:text-sm font-bold outline-none cursor-pointer"
                >
                  {availableMonths.map((m) => (
                    <option key={m.key} value={m.key} className="bg-neutral-900 text-white">
                      {m.label} ({m.count}건)
                    </option>
                  ))}
                </select>
              </div>

              {/* Close Button for mobile header */}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer sm:hidden shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Buttons & Zoom Toolbar */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 flex-wrap">
            
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-neutral-900 px-1.5 py-1 rounded-xl border border-neutral-800 text-xs">
              <button
                type="button"
                onClick={toggleFitToScreen}
                className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                  isFitToScreen
                    ? 'bg-emerald-600 text-white'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
                title="화면 너비에 맞춰 전체 한눈에 보기"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{isFitToScreen ? '원본 크기' : '화면 맞춤'}</span>
              </button>
              
              <div className="w-px h-4 bg-neutral-700 mx-0.5 hidden sm:block" />

              <button
                type="button"
                onClick={handleZoomOut}
                className="w-7 h-7 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center justify-center cursor-pointer"
                title="축소"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              
              <span className="font-mono text-[11px] font-bold text-neutral-300 px-1 min-w-[36px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>

              <button
                type="button"
                onClick={handleZoomIn}
                className="w-7 h-7 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center justify-center cursor-pointer"
                title="확대"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              {zoomLevel !== 1 && !isFitToScreen && (
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="w-7 h-7 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center cursor-pointer"
                  title="100% 리셋"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Print and Excel Actions */}
            <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
              <button
                type="button"
                onClick={handlePrint}
                className="h-8.5 sm:h-9 px-3 sm:px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>인쇄 / PDF</span>
              </button>

              <button
                type="button"
                onClick={() => exportMonthlyReportExcel(logs, selectedMonth)}
                className="h-8.5 sm:h-9 px-3 sm:px-3.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-600 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
                title="해당 월의 실적 보고서 및 결재란이 포함된 정식 엑셀 파일 다운로드"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                <span>{monthStr}월 엑셀</span>
              </button>

              <button
                type="button"
                onClick={() => exportMonthlyReportCSV(logs, selectedMonth)}
                className="h-9 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs sm:text-sm font-bold hidden md:flex items-center gap-1 transition-colors cursor-pointer border border-neutral-600"
                title="CSV 데이터 파일 다운로드"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 hidden sm:flex items-center justify-center transition-colors ml-1 cursor-pointer"
                title="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>

        {/* Paper Sheet Preview Area - Fully scrollable in both X and Y */}
        <div 
          ref={containerRef}
          className="p-2 sm:p-6 overflow-auto bg-neutral-200 flex-1 touch-pan-x touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Scaled Wrapper to maintain proper scroll footprint */}
          <div 
            className="mx-auto transition-transform duration-150 origin-top"
            style={{
              width: `${sheetBaseWidth * zoomLevel}px`,
              minHeight: `${zoomLevel * 1050}px`
            }}
          >
            <div 
              id="official-log-print-sheet" 
              className="bg-white p-4 sm:p-7 shadow-md border-2 border-neutral-400 w-[880px] text-neutral-950 font-sans rounded-xl origin-top-left"
              style={{ 
                fontFamily: "'Malgun Gothic', 'Dotum', 'Pretendard', sans-serif",
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top left'
              }}
            >
              
              {/* Top Report Header with Approval Box */}
              <div className="mb-3.5">
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
                <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-900 font-bold border-b-2 border-neutral-300 pb-2 mt-2.5">
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
                <div className="grid grid-cols-4 gap-2 my-2.5 p-2.5 bg-neutral-100 border-2 border-neutral-300 rounded-xl text-center text-xs sm:text-sm">
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
                  <tr className="bg-neutral-100 text-neutral-950 font-bold border-b-2 border-neutral-950 h-8 text-center">
                    <th rowSpan={2} className="border border-neutral-950 w-10 px-1 font-black">순</th>
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
                  <tr className="bg-neutral-100 text-neutral-950 font-bold border-b-2 border-neutral-950 h-7 text-center">
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
                      <tr key={r.seq} className="h-7.5 hover:bg-neutral-100/70 transition-colors">
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
              <div className="flex items-center justify-between text-xs text-neutral-700 font-mono mt-3 px-1 font-bold">
                <span>{printTimestamp}</span>
                <span className="font-black text-neutral-950 text-sm">{pageLabel} (1/1)</span>
              </div>

            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Bar */}
        <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-neutral-100 border-t-2 border-neutral-300 flex items-center justify-between text-xs sm:text-sm text-neutral-800 font-bold shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">{yearStr}년 {monthStr}월 실적 보고서</span>
            <span className="text-xs text-neutral-500 font-normal sm:hidden">
              💡 손가락으로 상하좌우를 밀거나 '화면 맞춤'을 터치하세요
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8.5 sm:h-9 px-5 rounded-xl bg-neutral-950 hover:bg-black text-white font-bold transition-colors cursor-pointer ml-auto"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
