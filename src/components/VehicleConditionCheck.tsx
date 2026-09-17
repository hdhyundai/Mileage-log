import React from 'react';
import { Fuel, ShieldCheck, Check, Clock } from 'lucide-react';

interface VehicleConditionCheckProps {
  fuelLevel: string;
  onFuelLevelChange: (val: string) => void;
  isClean: boolean;
  onIsCleanChange: (val: boolean) => void;
}

export const VehicleConditionCheck: React.FC<VehicleConditionCheckProps> = ({
  fuelLevel,
  onFuelLevelChange,
  isClean,
  onIsCleanChange
}) => {
  const fuelOptions = [
    { label: '1/4 이하', warning: true },
    { label: '절반 (1/2)', warning: false },
    { label: '3/4', warning: false },
    { label: '가득 (Full)', warning: false },
  ];

  const now = new Date();
  const timeString = `${now.getMonth() + 1}월 ${now.getDate()}일 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} 복귀`;

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(10); } catch (e) { /* ignore */ }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
            <Fuel className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
              차량 복귀 점검
            </h4>
            <p className="text-[11px] text-slate-500">연료 잔량 및 기본 상태 점검</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{timeString}</span>
        </div>
      </div>

      {/* Fuel Level Selector */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-2">
          현재 연료 게이지 (잔량)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {fuelOptions.map(({ label, warning }) => {
            const isSelected = fuelLevel === label;
            return (
              <button
                type="button"
                key={label}
                onClick={() => {
                  triggerHaptic();
                  onFuelLevelChange(label);
                }}
                className={`min-h-[44px] px-2 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 border transition-all active:scale-95 ${
                  isSelected
                    ? warning
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/90'
                }`}
              >
                <span>{warning ? '⚠️' : '⛽'}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vehicle Condition Checkbox */}
      <div
        onClick={() => {
          triggerHaptic();
          onIsCleanChange(!isClean);
        }}
        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-100/60 cursor-pointer select-none transition-colors"
      >
        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
            isClean
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'bg-white border-slate-300 text-transparent'
          }`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </div>
        <div className="text-xs text-slate-700 leading-tight">
          <span className="font-bold text-slate-900 block sm:inline">
            차량 청결 상태 이상 없음 및 차량 키 반납
          </span>
          <span className="text-[11px] text-slate-500 sm:ml-1 block sm:inline">
            (쓰레기 수거 및 창문 닫힘 완료)
          </span>
        </div>
      </div>
    </div>
  );
};
