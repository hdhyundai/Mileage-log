import React, { useState } from 'react';
import { 
  Calendar, 
  User, 
  Clock, 
  Compass, 
  MapPin, 
  ChevronDown, 
  ChevronRight, 
  Fuel, 
  Wrench, 
  FileText 
} from 'lucide-react';
import { USERS, PURPOSES, DEFAULT_DESTINATIONS } from '../types';
import { 
  timeToMinutes, 
  minutesToTimeStr, 
  formatDuration 
} from '../utils/time';
import { InteractiveTimePicker } from './InteractiveTimePicker';
import { MileageSection } from './MileageSection';
import { ParkingPicker } from './ParkingPicker';

interface DriveFormProps {
  // 1. 일자 & 2. 운전자
  date: string;
  onDateChange: (val: string) => void;
  userName: string;
  onUserNameChange: (val: string) => void;

  // 3. 운행시간
  startTime: string;
  onStartTimeChange: (val: string) => void;
  endTime: string;
  onEndTimeChange: (val: string) => void;

  // 4. 주행거리
  startMileage: number;
  endMileage: number;
  onStartMileageChange: (val: number) => void;
  onEndMileageChange: (val: number) => void;

  // 5. 운행목적
  purpose: string;
  onPurposeChange: (val: string) => void;

  // 6. 행선지
  destination: string;
  onDestinationChange: (val: string) => void;
  customDestination: string;
  onCustomDestinationChange: (val: string) => void;

  // 7. 주차 위치
  parkingSpot: string;
  onParkingSpotChange: (val: string) => void;
  currentCarSpot?: string;

  // 추가 항목
  fuelAmount: string;
  onFuelAmountChange: (val: string) => void;
  maintenance: string;
  onMaintenanceChange: (val: string) => void;
  notes: string;
  onNotesChange: (val: string) => void;
}

export const DriveForm: React.FC<DriveFormProps> = ({
  date,
  onDateChange,
  userName,
  onUserNameChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  startMileage,
  endMileage,
  onStartMileageChange,
  onEndMileageChange,
  purpose,
  onPurposeChange,
  destination,
  onDestinationChange,
  customDestination,
  onCustomDestinationChange,
  parkingSpot,
  onParkingSpotChange,
  currentCarSpot,
  fuelAmount,
  onFuelAmountChange,
  maintenance,
  onMaintenanceChange,
  notes,
  onNotesChange
}) => {
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const getTodayISO = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // When start time changes, default end time to that same start time, allowing immediate editing
  const handleStartTimeChange = (newStart: string) => {
    onStartTimeChange(newStart);
    onEndTimeChange(newStart);
  };

  const durationLabel = formatDuration(startTime, endTime);

  return (
    <div className="space-y-3">
      
      {/* 1. 일자 & 2. 운전자 (슬레이트 톤) */}
      <div className="bg-slate-50/70 rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5 items-start">
          
          {/* 1. 일자 */}
          <div className="space-y-1">
            <div className="h-5 flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                <span>1. 일자</span>
              </label>
              <button
                type="button"
                onClick={() => onDateChange(getTodayISO())}
                className="text-[10px] font-bold text-slate-700 hover:text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200 cursor-pointer shadow-2xs leading-none"
                title="오늘 날짜로 재설정"
              >
                오늘
              </button>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              required
              className="w-full h-10 bg-white border border-slate-300 text-neutral-900 rounded-xl px-2.5 text-xs sm:text-sm font-medium outline-none focus:border-slate-600 focus:ring-2 focus:ring-slate-200 transition-all cursor-pointer shadow-2xs"
            />
          </div>

          {/* 2. 운전자 */}
          <div className="space-y-1">
            <div className="h-5 flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>2. 운전자</span>
              </label>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            </div>
            <div className="relative">
              <select
                value={userName}
                onChange={(e) => onUserNameChange(e.target.value)}
                required
                className="w-full h-10 bg-white hover:bg-slate-50/60 border border-slate-300 text-neutral-900 rounded-xl px-2.5 pr-8 text-xs sm:text-sm font-medium appearance-none outline-none focus:border-slate-600 focus:ring-2 focus:ring-slate-200 transition-all cursor-pointer shadow-2xs"
              >
                <option value="" disabled>운전자 선택 (18명)</option>
                {USERS.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

        </div>
      </div>

      {/* 3. 운행시간 (에메랄드 톤) */}
      <div className="bg-emerald-50/40 rounded-2xl p-3 sm:p-3.5 border border-emerald-200/70 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-emerald-950 tracking-tight flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>3. 운행시간</span>
            </label>
            <span className="text-[10px] text-emerald-700 font-medium">
              (08:00 ~ 18:00)
            </span>
          </div>
          {durationLabel && (
            <span className="text-[10px] text-emerald-900 bg-white px-2 py-0.5 rounded-md font-bold border border-emerald-300 font-mono shadow-2xs">
              소요 {durationLabel}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <InteractiveTimePicker
            label="시작 시간"
            value={startTime}
            onChange={handleStartTimeChange}
          />
          <InteractiveTimePicker
            label="종료 시간 (복귀)"
            value={endTime}
            onChange={onEndTimeChange}
            minTime={startTime}
            isEnd={true}
          />
        </div>
      </div>

      {/* 4. 주행거리 (스카이 톤) */}
      <MileageSection
        startMileage={startMileage}
        endMileage={endMileage}
        onStartMileageChange={onStartMileageChange}
        onEndMileageChange={onEndMileageChange}
      />

      {/* 5. 운행목적 (인디고 톤) */}
      <div className="bg-indigo-50/40 rounded-2xl p-3 sm:p-3.5 border border-indigo-200/60 space-y-2">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-bold text-indigo-950 tracking-tight flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-indigo-700" />
            <span>5. 운행목적</span>
          </label>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
          {PURPOSES.map((p) => {
            const isSelected = purpose === p;
            return (
              <button
                type="button"
                key={p}
                onClick={() => onPurposeChange(p)}
                className={`h-8.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-800 text-white shadow-xs'
                    : 'bg-white text-indigo-950 border border-indigo-100 hover:bg-indigo-100/70'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. 행선지 (앰버 톤) */}
      <div className="bg-amber-50/40 rounded-2xl p-3 sm:p-3.5 border border-amber-200/70 space-y-2">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-bold text-amber-950 tracking-tight flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-700" />
            <span>6. 행선지</span>
          </label>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
        </div>
        
        <div className="relative">
          <select
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            required
            className="w-full h-10 bg-white hover:bg-amber-50/50 border border-amber-300 text-neutral-900 rounded-xl px-3 pr-8 text-xs sm:text-sm font-medium appearance-none outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200 transition-all cursor-pointer shadow-2xs"
          >
            <option value="" disabled>행선지를 선택하세요</option>
            {DEFAULT_DESTINATIONS.map((d) => (
              <option key={d} value={d}>
                {d === 'custom' ? '직접 입력...' : d}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-amber-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {destination === 'custom' && (
          <input
            type="text"
            value={customDestination}
            onChange={(e) => onCustomDestinationChange(e.target.value)}
            placeholder="상세 행선지 입력 (예: 영암군청, 협력사 정문)"
            required
            className="w-full h-9.5 bg-white border border-amber-400 text-neutral-900 rounded-xl px-3 text-xs sm:text-sm font-medium outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200 transition-all shadow-2xs"
            autoFocus
          />
        )}
      </div>

      {/* 7. 주차 위치 (틸 톤 - 상단 10면 / 하단 10면 / 아래 중앙 지원관) */}
      <ParkingPicker
        selectedSpot={parkingSpot}
        onSelectSpot={onParkingSpotChange}
        currentCarSpot={currentCarSpot}
      />

      {/* 8. 추가 항목 (주유량, 수리/점검, 비고 - 접이식) */}
      <div className="bg-neutral-50/80 rounded-2xl border border-neutral-200/80 p-2.5 sm:p-3">
        <button
          type="button"
          onClick={() => setShowOptionalFields(!showOptionalFields)}
          className="w-full flex items-center justify-between text-xs font-semibold text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${showOptionalFields ? 'rotate-90 text-neutral-700' : 'text-neutral-400'}`} />
            <span>추가 항목 (주유량, 정비/수리, 비고 메모)</span>
            {(fuelAmount || maintenance || notes) && (
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
            )}
          </div>
          <span className="text-[11px] text-neutral-400 font-normal">
            {showOptionalFields ? '접기' : '선택 입력'}
          </span>
        </button>

        {showOptionalFields && (
          <div className="pt-2.5 space-y-2.5 animate-in fade-in-50 duration-200 border-t border-neutral-200/60 mt-2">
            {/* 주유량 & 수리/점검 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-700 flex items-center gap-1">
                  <Fuel className="w-3 h-3 text-amber-600" />
                  <span>주유량</span>
                </label>
                <input
                  type="text"
                  value={fuelAmount}
                  onChange={(e) => onFuelAmountChange(e.target.value)}
                  placeholder="예: 35L"
                  className="w-full h-8.5 bg-white border border-neutral-300 text-neutral-900 rounded-lg px-2.5 text-xs outline-none focus:border-neutral-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-700 flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-blue-600" />
                  <span>수리/점검 내역</span>
                </label>
                <input
                  type="text"
                  value={maintenance}
                  onChange={(e) => onMaintenanceChange(e.target.value)}
                  placeholder="예: 엔진오일 교환"
                  className="w-full h-8.5 bg-white border border-neutral-300 text-neutral-900 rounded-lg px-2.5 text-xs outline-none focus:border-neutral-500"
                />
              </div>
            </div>

            {/* 비고란 메모 */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-700 flex items-center gap-1">
                <FileText className="w-3 h-3 text-neutral-500" />
                <span>비고 메모</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="특이사항 메모 입력"
                className="w-full h-8.5 bg-white border border-neutral-300 text-neutral-900 rounded-lg px-2.5 text-xs outline-none focus:border-neutral-500"
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
