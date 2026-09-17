import React from 'react';
import { Car, Building2 } from 'lucide-react';
import {
  PARKING_MAIN_BLDG_TOP,
  PARKING_MAIN_BLDG_BOTTOM,
  PARKING_HEALTH_CTR_TOP,
  PARKING_HEALTH_CTR_BOTTOM
} from '../types';

interface ParkingPickerProps {
  selectedSpot: string;
  onSelectSpot: (spot: string) => void;
  currentCarSpot?: string;
}

export const ParkingPicker: React.FC<ParkingPickerProps> = ({
  selectedSpot,
  onSelectSpot,
  currentCarSpot
}) => {
  // 본관: 지원관 기준 1~5이므로 왼쪽에서 오른쪽으로 5, 4, 3, 2, 1 (오른쪽 지원관 쪽으로 갈수록 1)
  const mainBldgTopReversed = [
    { spot: PARKING_MAIN_BLDG_TOP[4], label: '본5' },
    { spot: PARKING_MAIN_BLDG_TOP[3], label: '본4' },
    { spot: PARKING_MAIN_BLDG_TOP[2], label: '본3' },
    { spot: PARKING_MAIN_BLDG_TOP[1], label: '본2' },
    { spot: PARKING_MAIN_BLDG_TOP[0], label: '본1' }
  ];

  const mainBldgBottomReversed = [
    { spot: PARKING_MAIN_BLDG_BOTTOM[4], label: '본5' },
    { spot: PARKING_MAIN_BLDG_BOTTOM[3], label: '본4' },
    { spot: PARKING_MAIN_BLDG_BOTTOM[2], label: '본3' },
    { spot: PARKING_MAIN_BLDG_BOTTOM[1], label: '본2' },
    { spot: PARKING_MAIN_BLDG_BOTTOM[0], label: '본1' }
  ];

  // 건강센터: 지원관 기준 1~5이므로 왼쪽(지원관 쪽)에서 오른쪽으로 1, 2, 3, 4, 5
  const healthCtrTop = [
    { spot: PARKING_HEALTH_CTR_TOP[0], label: '건1' },
    { spot: PARKING_HEALTH_CTR_TOP[1], label: '건2' },
    { spot: PARKING_HEALTH_CTR_TOP[2], label: '건3' },
    { spot: PARKING_HEALTH_CTR_TOP[3], label: '건4' },
    { spot: PARKING_HEALTH_CTR_TOP[4], label: '건5' }
  ];

  const healthCtrBottom = [
    { spot: PARKING_HEALTH_CTR_BOTTOM[0], label: '건1' },
    { spot: PARKING_HEALTH_CTR_BOTTOM[1], label: '건2' },
    { spot: PARKING_HEALTH_CTR_BOTTOM[2], label: '건3' },
    { spot: PARKING_HEALTH_CTR_BOTTOM[3], label: '건4' },
    { spot: PARKING_HEALTH_CTR_BOTTOM[4], label: '건5' }
  ];

  const renderSpotBtn = (item: { spot: string; label: string }) => {
    const isSelected = selectedSpot === item.spot;
    const isCurrent = currentCarSpot === item.spot;

    return (
      <button
        type="button"
        key={item.spot}
        onClick={() => onSelectSpot(item.spot)}
        title={item.spot}
        className={`h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer relative whitespace-nowrap flex items-center justify-center ${
          isSelected
            ? 'bg-teal-900 text-white shadow-md border-2 border-teal-950 ring-2 ring-teal-400 scale-[1.03]'
            : 'bg-white text-slate-900 border-2 border-teal-200 hover:bg-teal-100/70 hover:border-teal-400 active:scale-95'
        }`}
      >
        <span>{item.label}</span>
        {isCurrent && !isSelected && (
          <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1 right-1" title="현재 차량 위치" />
        )}
      </button>
    );
  };

  return (
    <div className="bg-teal-50/70 rounded-2xl p-3.5 sm:p-4 border-2 border-teal-300 space-y-3 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-extrabold text-teal-950 tracking-tight flex items-center gap-1.5">
            <Car className="w-4 h-4 text-teal-800 shrink-0" />
            <span>7. 주차 위치</span>
          </label>
          <span className="w-2 h-2 rounded-full bg-teal-700" />
        </div>

        {selectedSpot ? (
          <span className="text-xs sm:text-sm font-black text-teal-950 bg-white px-2.5 py-1 rounded-lg border-2 border-teal-400 shadow-2xs font-mono whitespace-nowrap">
            선택: {selectedSpot}
          </span>
        ) : (
          <span className="text-xs text-teal-900 font-bold bg-teal-100 px-2 py-0.5 rounded border border-teal-300 whitespace-nowrap">
            주차 구역 터치
          </span>
        )}
      </div>

      {/* 주차 구역 (상단 / 하단 10면) */}
      <div className="space-y-2.5">
        
        {/* 상단/하단 영역 상단 라벨 */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center text-center text-[11px] sm:text-xs font-black text-teal-950 px-1 gap-1">
          <span className="whitespace-nowrap">◀ 본관 방향 (5~1)</span>
          <span className="w-3 text-center text-teal-400">|</span>
          <span className="whitespace-nowrap">건강센터 방향 (1~5) ▶</span>
        </div>

        {/* 상단 10면: [본5 본4 본3 본2 본1] | [건1 건2 건3 건4 건5] */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-teal-900 px-0.5">
            <span>상단 주차선</span>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
            {/* 본관 (5 -> 1) */}
            <div className="grid grid-cols-5 gap-1">
              {mainBldgTopReversed.map(renderSpotBtn)}
            </div>

            {/* 중앙 구분선 */}
            <div className="w-0.5 h-7 bg-teal-300" />

            {/* 건강센터 (1 -> 5) */}
            <div className="grid grid-cols-5 gap-1">
              {healthCtrTop.map(renderSpotBtn)}
            </div>
          </div>
        </div>

        {/* 하단 10면: [본5 본4 본3 본2 본1] | [건1 건2 건3 건4 건5] */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-teal-900 px-0.5">
            <span>하단 주차선</span>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
            {/* 본관 (5 -> 1) */}
            <div className="grid grid-cols-5 gap-1">
              {mainBldgBottomReversed.map(renderSpotBtn)}
            </div>

            {/* 중앙 구분선 */}
            <div className="w-0.5 h-7 bg-teal-300" />

            {/* 건강센터 (1 -> 5) */}
            <div className="grid grid-cols-5 gap-1">
              {healthCtrBottom.map(renderSpotBtn)}
            </div>
          </div>
        </div>

        {/* 지원관: 가운데 제일 밑 위치 */}
        <div className="pt-1.5 flex justify-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white border-2 border-teal-300 text-teal-950 rounded-xl text-xs sm:text-sm font-black shadow-2xs">
            <Building2 className="w-4 h-4 text-teal-800" />
            <span>지원관</span>
            <span className="text-xs font-bold text-teal-700">(중앙 기준)</span>
          </div>
        </div>

      </div>
    </div>
  );
};
