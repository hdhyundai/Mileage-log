import React, { useState } from 'react';
import { History, Download, Trash2, Search, Car, Calendar, Filter, FileSpreadsheet } from 'lucide-react';
import { VehicleLog } from '../types';
import { exportLogsToCSV } from '../utils/storage';

interface HistoryListProps {
  logs: VehicleLog[];
  onDeleteLog: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ logs, onDeleteLog }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.userName.includes(searchTerm) ||
      log.purpose.includes(searchTerm) ||
      log.destination.includes(searchTerm) ||
      log.parkingSpot.includes(searchTerm);

    const matchesUser = selectedUserFilter ? log.userName === selectedUserFilter : true;
    return matchesSearch && matchesUser;
  });

  const uniqueDrivers = Array.from(new Set(logs.map(l => l.userName)));

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const now = new Date();
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    if (isToday) {
      return `오늘 ${timeStr}`;
    }
    return `${d.getMonth() + 1}/${d.getDate()} ${timeStr}`;
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
              최근 운행 기록
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {logs.length}건
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">동반성장부 공용차량 운행 이력</p>
          </div>
        </div>

        {/* CSV Export Button */}
        {logs.length > 0 && (
          <button
            type="button"
            onClick={() => exportLogsToCSV(logs)}
            className="self-start sm:self-auto h-9 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors active:scale-95"
            title="CSV 파일로 엑셀 다운로드"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            엑셀 다운로드 (CSV)
          </button>
        )}
      </div>

      {/* Filter and Search on Mobile */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="운전자, 목적, 장소, 주차위치 검색..."
            className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {uniqueDrivers.length > 1 && (
          <div className="relative shrink-0">
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">전체 운전자</option>
              {uniqueDrivers.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Log Items List */}
      <div className="space-y-2.5">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
            {searchTerm || selectedUserFilter
              ? '검색 조건에 맞는 운행 기록이 없습니다.'
              : '등록된 운행 기록이 없습니다. 새로운 운행을 기록해보세요.'}
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all hover:shadow-xs flex flex-col gap-2 relative group"
            >
              {/* Row 1: User & Time & Delete */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm sm:text-base">
                    {log.userName}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5 text-slate-400" />
                    {formatDate(log.timestamp)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-emerald-800 font-mono">
                    +{log.drivenDistance} km
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`[${log.userName}] 님의 운행 기록을 삭제하시겠습니까?`)) {
                        onDeleteLog(log.id);
                      }
                    }}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                    title="기록 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Row 2: Purpose & Destination */}
              <div className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100/60 text-emerald-800 font-semibold text-[11px]">
                    {log.purpose}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="font-medium text-slate-800">
                    {log.destination}
                  </span>
                </div>

                {/* Mileage Breakdown */}
                <div className="text-[11px] text-slate-500 font-mono">
                  {log.startMileage.toLocaleString()} → <strong className="text-slate-700">{log.endMileage.toLocaleString()}</strong> km
                </div>
              </div>

              {/* Row 3: Parking Spot, Fuel, Clean & Notes */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-[11px] flex-wrap gap-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1 text-slate-700 font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
                    <Car className="w-3 h-3 text-emerald-700" />
                    <span>주차: {log.parkingSpot}</span>
                  </div>

                  {log.fuelLevel && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                      ⛽ {log.fuelLevel}
                    </span>
                  )}

                  {log.isClean && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
                      ✓ 청결양호
                    </span>
                  )}
                </div>

                {log.notes && (
                  <div className="text-slate-500 truncate max-w-[180px]" title={log.notes}>
                    {log.notes}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
