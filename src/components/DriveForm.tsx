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

  const handleStartTimeChange = (newStart: string) => {
    onStartTimeChange(newStart);
    onEndTimeChange(newStart);
  };

  const durationLabel = formatDuration(startTime, endTime);

  return (
    <div className="space-y-3.5">
      
      {/* 1. 일자 & 2. 운전자 (슬레이트 톤) */}
      <div className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border-2 border-slate-300 space-y-3 shadow-2xs">
        <div className="grid grid-cols-2 gap-3 items-start">
          
          {/* 1. 일자 */}
          <div className="space-y-1.5">
            <div className="h-6 flex items-center justify-between">
              <label className="text-sm font-extrabold text-slate-950 tracking-tight flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-800" />
                <span>1. 일자</span>
              </label>
              <button
                type="button"
                onClick={() => onDateChange(getTodayISO())}
                className="text-xs font-bold text-slate-900 hover:text-black bg-white px-2 py-0.5 rounded-md border-2 border-slate-300 hover:border-slate-500 cursor-pointer shadow-2xs"
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
              className="w-full h-11 sm:h-12 bg-white border-2 border-slate-300 hover:border-slate-500 text-slate-950 rounded-xl px-3 text-sm sm:text-base font-bold outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-300 transition-all cursor-pointer shadow-2xs"
            />
          </div>

          {/* 2. 운전자 */}
          <div className="space-y-1.5">
            <div className="h-6 flex items-center justify-between">
              <label className="text-sm font-extrabold text-slate-950 tracking-tight flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-800" />
                <span>2. 운전자</span>
              </label>
              <span className="w-2 h-2 rounded-full bg-slate-700" />
            </div>
            <div className="relative">
              <select
                value={userName}
                onChange={(e) => onUserNameChange(e.target.value)}
                required
                className="w-full h-11 sm:h-12 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-500 text-slate-950 rounded-xl px-3 pr-8 text-sm sm:text-base font-bold appearance-none outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-300 transition-all cursor-pointer shadow-2xs"
              >
                <option value="" disabled>운전자 선택 (18명)</option>
                {USERS.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 text-slate-700 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

        </div>
      </div>

      {/* 3. 운행시간 (에메랄드 톤) */}
      <div className="bg-emerald-50/70 rounded-2xl p-3.5 sm:p-4 border-2 border-emerald-300 space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-extrabold text-emerald-950 tracking-tight flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-800" />
              <span>3. 운행시간</span>
            </label>
            <span className="text-xs text-emerald-900 font-bold bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
              08:00 ~ 18:00
            </span>
          </div>
          {durationLabel && (
            <span className="text-xs text-emerald-950 bg-white px-2.5 py-0.5 rounded-lg font-extrabold border-2 border-emerald-400 font-mono shadow-2xs">
              소요 {durationLabel}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
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
      <div className="bg-indigo-50/70 rounded-2xl p-3.5 sm:p-4 border-2 border-indigo-300 space-y-2.5 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-extrabold text-indigo-950 tracking-tight flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-indigo-800 shrink-0" />
            <span>5. 운행목적</span>
          </label>
          <span className="w-2 h-2 rounded-full bg-indigo-700" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {PURPOSES.map((p) => {
            const isSelected = purpose === p;
            return (
              <button
                type="button"
                key={p}
                onClick={() => onPurposeChange(p)}
                className={`h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-extrabold transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center justify-center px-1 ${
                  isSelected
                    ? 'bg-indigo-900 text-white shadow-md border-2 border-indigo-950 ring-2 ring-indigo-300'
                    : 'bg-white text-indigo-950 border-2 border-indigo-200 hover:bg-indigo-100/80 hover:border-indigo-400'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. 행선지 (앰버 톤) */}
      <div className="bg-amber-50/70 rounded-2xl p-3.5 sm:p-4 border-2 border-amber-300 space-y-2.5 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-extrabold text-amber-950 tracking-tight flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-800" />
            <span>6. 행선지</span>
          </label>
          <span className="w-2 h-2 rounded-full bg-amber-700" />
        </div>
        
        <div className="relative">
          <select
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            required
            className="w-full h-11 sm:h-12 bg-white hover:bg-amber-50/70 border-2 border-amber-300 hover:border-amber-500 text-neutral-950 rounded-xl px-3.5 pr-9 text-sm sm:text-base font-bold appearance-none outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-300 transition-all cursor-pointer shadow-2xs"
          >
            <option value="" disabled>행선지를 선택하세요</option>
            {DEFAULT_DESTINATIONS.map((d) => (
              <option key={d} value={d}>
                {d === 'custom' ? '직접 입력...' : d}
              </option>
            ))}
          </select>
          <ChevronDown className="w-5 h-5 text-amber-700 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {destination === 'custom' && (
          <input
            type="text"
            value={customDestination}
            onChange={(e) => onCustomDestinationChange(e.target.value)}
            placeholder="상세 행선지 입력 (예: 영암군청, 협력사 정문)"
            required
            className="w-full h-11 bg-white border-2 border-amber-400 text-neutral-950 placeholder:text-neutral-500 rounded-xl px-3.5 text-sm sm:text-base font-bold outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-300 transition-all shadow-2xs"
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
      <div className="bg-neutral-100 rounded-2xl border-2 border-neutral-300 p-3 sm:p-3.5">
        <button
          type="button"
          onClick={() => setShowOptionalFields(!showOptionalFields)}
          className="w-full flex items-center justify-between text-sm font-bold text-neutral-900 hover:text-black transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${showOptionalFields ? 'rotate-90 text-neutral-900' : 'text-neutral-600'}`} />
            <span>추가 항목 (주유량, 정비/수리, 비고 메모)</span>
            {(fuelAmount || maintenance || notes) && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            )}
          </div>
          <span className="text-xs text-neutral-600 font-semibold bg-white px-2 py-0.5 rounded border border-neutral-300">
            {showOptionalFields ? '접기' : '선택 입력'}
          </span>
        </button>

        {showOptionalFields && (
          <div className="pt-3 space-y-3 animate-in fade-in-50 duration-200 border-t-2 border-neutral-200 mt-2.5">
            {/* 주유량 & 수리/점검 */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-amber-700" />
                  <span>주유량</span>
                </label>
                <input
                  type="text"
                  value={fuelAmount}
                  onChange={(e) => onFuelAmountChange(e.target.value)}
                  placeholder="예: 35L"
                  className="w-full h-10 bg-white border-2 border-neutral-300 placeholder:text-neutral-500 text-neutral-950 rounded-xl px-3 text-sm font-bold outline-none focus:border-neutral-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-blue-700" />
                  <span>수리/점검 내역</span>
                </label>
                <input
                  type="text"
                  value={maintenance}
                  onChange={(e) => onMaintenanceChange(e.target.value)}
                  placeholder="예: 엔진오일 교환"
                  className="w-full h-10 bg-white border-2 border-neutral-300 placeholder:text-neutral-500 text-neutral-950 rounded-xl px-3 text-sm font-bold outline-none focus:border-neutral-700"
                />
              </div>
            </div>

            {/* 비고란 메모 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-neutral-700" />
                <span>비고 메모</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="특이사항 메모 입력"
                className="w-full h-10 bg-white border-2 border-neutral-300 placeholder:text-neutral-500 text-neutral-950 rounded-xl px-3 text-sm font-bold outline-none focus:border-neutral-700"
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
