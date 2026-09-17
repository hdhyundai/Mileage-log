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
        className={`h-8.5 sm:h-9 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
          isSelected
            ? 'bg-teal-700 text-white shadow-xs ring-2 ring-teal-500 scale-[1.03]'
            : 'bg-white text-neutral-800 border border-teal-100 hover:bg-teal-50/60 hover:border-teal-300 active:scale-95'
        }`}
      >
        {item.label}
        {isCurrent && !isSelected && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-0.5 right-0.5" />
        )}
      </button>
    );
  };

  return (
    <div className="bg-teal-50/40 rounded-2xl p-3 sm:p-3.5 border border-teal-200/70 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-bold text-teal-950 tracking-tight flex items-center gap-1">
            <Car className="w-3.5 h-3.5 text-teal-700" />
            <span>7. 주차 위치</span>
          </label>
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
        </div>

        {selectedSpot ? (
          <span className="text-xs font-bold text-teal-900 bg-white px-2 py-0.5 rounded-md border border-teal-300 shadow-2xs font-mono">
            {selectedSpot}
          </span>
        ) : (
          <span className="text-[11px] text-teal-700 font-medium">
            주차 구역 선택
          </span>
        )}
      </div>

      {/* 주차 구역 (상단 / 하단 10면) */}
      <div className="space-y-2">
        
        {/* 상단/하단 영역 상단 라벨 */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center text-center text-[11px] font-bold text-teal-900 px-1">
          <span>◀ 본관 (5 ~ 1)</span>
          <span className="w-4 text-center text-teal-300">|</span>
          <span>건강센터 (1 ~ 5) ▶</span>
        </div>

        {/* 상단 10면: [본5 본4 본3 본2 본1] | [건1 건2 건3 건4 건5] */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-semibold text-teal-800 px-0.5">
            <span>상단</span>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-1.5 items-center">
            {/* 본관 (5 -> 1) */}
            <div className="grid grid-cols-5 gap-1">
              {mainBldgTopReversed.map(renderSpotBtn)}
            </div>

            {/* 중앙 구분선 */}
            <div className="w-px h-6 bg-teal-200" />

            {/* 건강센터 (1 -> 5) */}
            <div className="grid grid-cols-5 gap-1">
              {healthCtrTop.map(renderSpotBtn)}
            </div>
          </div>
        </div>

        {/* 하단 10면: [본5 본4 본3 본2 본1] | [건1 건2 건3 건4 건5] */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-semibold text-teal-800 px-0.5">
            <span>하단</span>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-1.5 items-center">
            {/* 본관 (5 -> 1) */}
            <div className="grid grid-cols-5 gap-1">
              {mainBldgBottomReversed.map(renderSpotBtn)}
            </div>

            {/* 중앙 구분선 */}
            <div className="w-px h-6 bg-teal-200" />

            {/* 건강센터 (1 -> 5) */}
            <div className="grid grid-cols-5 gap-1">
              {healthCtrBottom.map(renderSpotBtn)}
            </div>
          </div>
        </div>

        {/* 지원관: 가운데 제일 밑 위치 */}
        <div className="pt-1 flex justify-center">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white border border-teal-200 text-teal-900 rounded-xl text-xs font-bold shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-teal-700" />
            <span>지원관</span>
            <span className="text-[10px] font-normal text-teal-600">(중앙 기준)</span>
          </div>
        </div>

      </div>
    </div>
  );
};
