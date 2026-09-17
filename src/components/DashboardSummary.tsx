import React from 'react';
import { Gauge, MapPin, CalendarDays, UserCheck } from 'lucide-react';
import { VehicleLog } from '../types';

interface DashboardSummaryProps {
  logs: VehicleLog[];
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ logs }) => {
  const latestLog = logs[0];
  const currentOdometer = latestLog ? latestLog.endMileage : 42168;
  const currentSpot = latestLog ? latestLog.parkingSpot : '상단-4';

  const today = new Date();
  const todayLogs = logs.filter(l => {
    const d = new Date(l.timestamp);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  });

  const todayDriven = todayLogs.reduce((acc, curr) => acc + curr.drivenDistance, 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {/* 1. 현재 계기판 */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-semibold">현재 계기판</span>
          <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Gauge className="w-3 h-3" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg sm:text-xl font-black font-mono text-slate-800 tracking-tight">
            {currentOdometer.toLocaleString()}
          </span>
          <span className="text-[11px] font-bold text-slate-400">km</span>
        </div>
      </div>

      {/* 2. 현재 주차 위치 */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-semibold">현재 주차 위치</span>
          <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <MapPin className="w-3 h-3" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-base sm:text-lg font-black text-emerald-700">
            {currentSpot}
          </span>
          <span className="text-[11px] font-medium text-slate-400">구역</span>
        </div>
      </div>

      {/* 3. 오늘 운행 실적 */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-semibold">오늘 주행 합계</span>
          <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CalendarDays className="w-3 h-3" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg sm:text-xl font-black font-mono text-slate-800">
            +{todayDriven}
          </span>
          <span className="text-[11px] font-bold text-slate-400">km</span>
          <span className="text-[10px] text-slate-400 ml-auto">({todayLogs.length}회)</span>
        </div>
      </div>

      {/* 4. 직전 운행자 */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-semibold">직전 운행자</span>
          <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <UserCheck className="w-3 h-3" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm sm:text-base font-bold text-slate-800 truncate">
            {latestLog ? latestLog.userName : '-'}
          </span>
          <span className="text-[10px] text-slate-400 truncate max-w-[60px]">
            {latestLog ? latestLog.destination : ''}
          </span>
        </div>
      </div>
    </div>
  );
};
