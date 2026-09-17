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
    <div className="bg-sky-50/70 rounded-2xl p-3.5 sm:p-4 border-2 border-sky-300 space-y-3 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-extrabold text-sky-950 tracking-tight flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-sky-800 shrink-0" />
            <span>4. 주행거리</span>
          </label>
          <span className="w-2 h-2 rounded-full bg-sky-700" />
        </div>
        <div>
          {isNegative ? (
            <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-1 rounded-md border border-rose-300 whitespace-nowrap">
              도착 거리를 확인하세요
            </span>
          ) : (
            <span className="text-xs sm:text-sm font-black text-sky-950 bg-white px-2.5 py-1 rounded-lg border-2 border-sky-400 font-mono shadow-2xs whitespace-nowrap">
              당일 주행: +{drivenDistance} km
            </span>
          )}
        </div>
      </div>

      {/* Mileage Inputs (Side-by-side) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Start Mileage */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-sky-950 font-bold px-0.5">
            <span>운행 전 (시작)</span>
            {!isEditingStart ? (
              <button
                type="button"
                onClick={() => {
                  setTempStart(startMileage.toString());
                  setIsEditingStart(true);
                }}
                className="text-xs text-sky-800 hover:text-sky-950 underline font-bold cursor-pointer"
              >
                수정
              </button>
            ) : (
              <button
                type="button"
                onClick={saveStartMileage}
                className="text-xs font-extrabold text-emerald-800 flex items-center gap-0.5 cursor-pointer bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300"
              >
                <Check className="w-3.5 h-3.5" />
                <span>완료</span>
              </button>
            )}
          </div>

          {isEditingStart ? (
            <input
              type="number"
              inputMode="numeric"
              value={tempStart}
              onChange={(e) => setTempStart(e.target.value)}
              className="w-full h-11 sm:h-12 bg-white border-2 border-sky-500 rounded-xl px-3 font-mono text-base sm:text-lg font-black text-right outline-none focus:ring-2 focus:ring-sky-300 text-slate-950 shadow-2xs"
              autoFocus
            />
          ) : (
            <div className="h-11 sm:h-12 bg-white border-2 border-sky-200 rounded-xl px-3 flex items-center justify-end font-mono text-base sm:text-lg font-black text-slate-800 shadow-2xs">
              {startMileage.toLocaleString()} <span className="text-xs sm:text-sm ml-1 text-slate-500 font-sans font-bold">km</span>
            </div>
          )}
        </div>

        {/* End Mileage */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-sky-950 font-bold px-0.5">
            <span>운행 후 (도착)</span>
            <span className="text-xs text-sky-800 font-bold">누적 계기판</span>
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
              placeholder="도착 거리"
              className="w-full h-11 sm:h-12 bg-white border-2 border-sky-400 hover:border-sky-600 rounded-xl px-3 pr-9 font-mono text-base sm:text-lg font-black text-right text-slate-950 outline-none focus:border-sky-800 focus:ring-2 focus:ring-sky-300 transition-all shadow-2xs"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-slate-500 font-bold pointer-events-none">
              km
            </span>
          </div>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="flex items-center gap-1.5 pt-0.5">
        <span className="text-xs text-sky-950 font-extrabold shrink-0 mr-0.5 whitespace-nowrap">
          간편추가:
        </span>
        {quickIncrements.map((km) => (
          <button
            type="button"
            key={km}
            onClick={() => handleQuickAdd(km)}
            className="flex-1 h-8.5 sm:h-9.5 rounded-xl bg-white border-2 border-sky-300 hover:bg-sky-100 hover:border-sky-500 text-sky-950 text-sm font-black active:scale-95 transition-all font-mono cursor-pointer shadow-2xs whitespace-nowrap flex items-center justify-center"
          >
            +{km}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onEndMileageChange(startMileage)}
          className="h-8.5 sm:h-9.5 px-2.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-950 text-xs font-black transition-colors cursor-pointer border border-sky-300 whitespace-nowrap flex items-center justify-center"
        >
          초기화
        </button>
      </div>
    </div>
  );
};
