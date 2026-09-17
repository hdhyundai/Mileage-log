import React, { useState } from 'react';
import { Gauge, Plus, Minus, AlertCircle, Edit3, Check, RotateCcw, Zap } from 'lucide-react';

interface MileageInputProps {
  startMileage: number;
  endMileage: number;
  onStartMileageChange: (val: number) => void;
  onEndMileageChange: (val: number) => void;
}

export const MileageInput: React.FC<MileageInputProps> = ({
  startMileage,
  endMileage,
  onStartMileageChange,
  onEndMileageChange
}) => {
  const [isEditingStart, setIsEditingStart] = useState(false);
  const [tempStart, setTempStart] = useState(startMileage.toString());

  const drivenDistance = endMileage - startMileage;
  const isNegative = drivenDistance < 0;
  const isZero = drivenDistance === 0;

  const quickIncrements = [1, 2, 5, 10, 20, 50];

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(10); } catch (e) { /* ignore */ }
    }
  };

  const handleQuickAdd = (km: number) => {
    triggerHaptic();
    const nextVal = (endMileage || startMileage) + km;
    onEndMileageChange(nextVal);
  };

  const handleResetToStart = () => {
    triggerHaptic();
    onEndMileageChange(startMileage);
  };

  const saveStartMileageEdit = () => {
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
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              주행거리 기록
              <span className="text-rose-500 font-bold">*</span>
            </h4>
            <p className="text-[11px] text-slate-500">도착 시 차량 계기판 수치 입력</p>
          </div>
        </div>

        {/* Realtime Distance Pill */}
        <div className={`px-3 py-1.5 rounded-xl text-right transition-all shadow-xs ${
          isNegative
            ? 'bg-rose-50 text-rose-700 border border-rose-200'
            : isZero
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">주행 거리</div>
          <div className="text-base sm:text-lg font-black font-mono leading-none">
            {isNegative ? '수치 오류' : `+${drivenDistance.toLocaleString()} km`}
          </div>
        </div>
      </div>

      {/* Inputs Grid (Mobile Stacked, Desktop 2 Cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* 1. 운행 전 (시작 킬로수) */}
        <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-600">
              운행 전 (출차 계기판)
            </label>
            {!isEditingStart ? (
              <button
                type="button"
                onClick={() => {
                  setTempStart(startMileage.toString());
                  setIsEditingStart(true);
                }}
                className="text-[11px] text-slate-500 hover:text-emerald-700 font-semibold flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-slate-200 transition-colors"
                title="직전 주행거리 보정"
              >
                <Edit3 className="w-3 h-3" />
                수정
              </button>
            ) : (
              <button
                type="button"
                onClick={saveStartMileageEdit}
                className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 py-1 px-2.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 transition-colors"
              >
                <Check className="w-3 h-3" />
                저장
              </button>
            )}
          </div>

          {isEditingStart ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={tempStart}
                onChange={(e) => setTempStart(e.target.value)}
                className="w-full h-12 bg-white border-2 border-emerald-500 text-slate-900 rounded-xl px-3 font-mono text-lg text-right font-black focus:outline-none"
                autoFocus
              />
              <span className="text-xs font-bold text-slate-500">km</span>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-slate-200/80 rounded-xl px-3.5 h-12 text-slate-700 font-mono text-base font-bold shadow-inner">
              <span className="text-xs font-sans font-medium text-slate-500">출차시</span>
              <div>
                <span className="text-lg">{startMileage.toLocaleString()}</span>
                <span className="text-xs ml-1 text-slate-500 font-sans font-semibold">km</span>
              </div>
            </div>
          )}
          <p className="text-[10px] text-slate-400 mt-1.5">
            * 이전 운행자의 도착 킬로수가 자동 설정되어 있습니다.
          </p>
        </div>

        {/* 2. 운행 후 (도착 킬로수) */}
        <div className="bg-emerald-50/50 rounded-2xl p-3.5 border-2 border-emerald-400/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-black text-emerald-950 flex items-center gap-1">
              운행 후 (도착 계기판)
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <button
              type="button"
              onClick={handleResetToStart}
              className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-slate-200/80 transition-colors"
              title="운행 전 거리로 초기화"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              리셋
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Step Minus */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                onEndMileageChange(Math.max(startMileage, endMileage - 1));
              }}
              className="w-11 h-12 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-300 rounded-xl flex items-center justify-center text-slate-700 shrink-0 shadow-xs active:scale-95 transition-all"
              title="-1 km"
            >
              <Minus className="w-4 h-4" />
            </button>

            {/* Direct Numeric Input with inputMode="numeric" */}
            <div className="flex-1 relative">
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
                placeholder="도착 계기판"
                required
                className="w-full h-12 bg-white border border-emerald-400 text-slate-900 rounded-xl px-3 font-mono text-xl font-black text-right focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all shadow-inner"
              />
            </div>

            {/* Step Plus */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                onEndMileageChange(endMileage + 1);
              }}
              className="w-11 h-12 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm active:scale-95 transition-all"
              title="+1 km"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-emerald-800 mt-1.5 font-medium">
            * 숫자를 직접 입력하거나 아래 단축 버튼을 누르세요.
          </p>
        </div>
      </div>

      {/* Quick Add Increment Pills (Mobile Optimization) */}
      <div className="pt-1">
        <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            원터치 거리 가산 (+km):
          </span>
          <span className="text-[10px] text-slate-400 font-normal">누르면 즉시 반영</span>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {quickIncrements.map((km) => (
            <button
              type="button"
              key={km}
              onClick={() => handleQuickAdd(km)}
              className="h-11 sm:h-12 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 active:bg-emerald-100 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-black text-slate-700 flex flex-col items-center justify-center leading-none active:scale-95 transition-all shadow-2xs"
            >
              <span>+{km}</span>
              <span className="text-[9px] font-medium text-slate-400 mt-0.5">km</span>
            </button>
          ))}
        </div>
      </div>

      {/* Negative or Zero Warning */}
      {isNegative && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs animate-in shake duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>도착 킬로수가 운행 전 ({startMileage.toLocaleString()} km)보다 작습니다. 계기판을 확인하세요.</span>
        </div>
      )}

      {isZero && (
        <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center gap-2.5 text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>주행 거리가 0km입니다. 도착 계기판 킬로수를 입력해주세요.</span>
        </div>
      )}
    </div>
  );
};
