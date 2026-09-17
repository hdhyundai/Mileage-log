import React, { useState } from 'react';
import { Gauge, Check } from 'lucide-react';

interface MileageSectionProps {
  startMileage: number;
  endMileage: number;
  onStartMileageChange: (val: number) => void;
  onEndMileageChange: (val: number) => void;
}

export const MileageSection: React.FC<MileageSectionProps> = ({
  startMileage,
  endMileage,
  onStartMileageChange,
  onEndMileageChange
}) => {
  const [isEditingStart, setIsEditingStart] = useState(false);
  const [tempStart, setTempStart] = useState(startMileage.toString());

  const drivenDistance = endMileage - startMileage;
  const isNegative = drivenDistance < 0;

  const quickIncrements = [5, 10, 20, 50];

  const handleQuickAdd = (km: number) => {
    const nextVal = (endMileage || startMileage) + km;
    onEndMileageChange(nextVal);
  };

  const saveStartMileage = () => {
    const parsed = parseInt(tempStart, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onStartMileageChange(parsed);
      if (endMileage < parsed) {
        onEndMileageChange(parsed);
      }
    }
    setIsEditingStart(false);
  };

  return (
    <div className="bg-sky-50/40 rounded-2xl p-3 sm:p-3.5 border border-sky-200/70 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-bold text-sky-950 tracking-tight flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-sky-700" />
            <span>4. 주행거리</span>
          </label>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
        </div>
        <div>
          {isNegative ? (
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              도착 거리를 확인하세요
            </span>
          ) : (
            <span className="text-[11px] font-bold text-sky-900 bg-white px-2 py-0.5 rounded border border-sky-200 font-mono shadow-2xs">
              당일 주행: +{drivenDistance} km
            </span>
          )}
        </div>
      </div>

      {/* Mileage Inputs (Side-by-side) */}
      <div className="grid grid-cols-2 gap-2">
        {/* Start Mileage */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-sky-900 font-semibold px-0.5">
            <span>운행 전 (시작)</span>
            {!isEditingStart ? (
              <button
                type="button"
                onClick={() => {
                  setTempStart(startMileage.toString());
                  setIsEditingStart(true);
                }}
                className="text-[10px] text-sky-700 hover:text-sky-900 underline font-medium cursor-pointer"
              >
                수정
              </button>
            ) : (
              <button
                type="button"
                onClick={saveStartMileage}
                className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>저장</span>
              </button>
            )}
          </div>

          {isEditingStart ? (
            <input
              type="number"
              inputMode="numeric"
              value={tempStart}
              onChange={(e) => setTempStart(e.target.value)}
              className="w-full h-10 bg-white border border-sky-400 rounded-xl px-2.5 font-mono text-sm font-bold text-right outline-none focus:ring-2 focus:ring-sky-200 text-neutral-900"
              autoFocus
            />
          ) : (
            <div className="h-10 bg-white/80 border border-sky-100 rounded-xl px-2.5 flex items-center justify-end font-mono text-sm font-bold text-neutral-700">
              {startMileage.toLocaleString()} <span className="text-xs ml-1 text-neutral-400 font-sans font-normal">km</span>
            </div>
          )}
        </div>

        {/* End Mileage */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-sky-900 font-semibold px-0.5">
            <span>운행 후 (도착)</span>
            <span className="text-[10px] text-sky-600 font-normal">누적</span>
          </div>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={endMileage === 0 ? '' : endMileage}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                if (!isNaN(val)) onEndMileageChange(val);
              }}
              onFocus={(e) => e.target.select()}
              placeholder="도착 총계"
              className="w-full h-10 bg-white border border-sky-300 rounded-xl px-2.5 pr-8 font-mono text-sm font-bold text-right text-neutral-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-200 transition-all shadow-2xs"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-medium pointer-events-none">
              km
            </span>
          </div>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="flex items-center gap-1 pt-0.5">
        <span className="text-[10px] text-sky-800 font-semibold shrink-0 mr-0.5">
          간편추가:
        </span>
        {quickIncrements.map((km) => (
          <button
            type="button"
            key={km}
            onClick={() => handleQuickAdd(km)}
            className="flex-1 h-7 rounded-lg bg-white border border-sky-200 hover:bg-sky-100/70 hover:border-sky-300 text-sky-950 text-xs font-bold active:scale-95 transition-all font-mono cursor-pointer"
          >
            +{km}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onEndMileageChange(startMileage)}
          className="h-7 px-2 rounded-lg bg-sky-100/70 hover:bg-sky-200 text-sky-800 text-[10px] font-semibold transition-colors cursor-pointer"
        >
          초기화
        </button>
      </div>
    </div>
  );
};
