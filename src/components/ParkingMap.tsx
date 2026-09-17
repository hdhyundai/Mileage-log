import React, { useState } from 'react';
import { Car, MapPin, CheckCircle2, LayoutGrid, Compass, Info } from 'lucide-react';
import { PARKING_TOP_SPOTS, PARKING_BOTTOM_SPOTS } from '../types';

interface ParkingMapProps {
  selectedSpot: string;
  onSelectSpot: (spot: string) => void;
  currentCarSpot?: string;
}

export const ParkingMap: React.FC<ParkingMapProps> = ({
  selectedSpot,
  onSelectSpot,
  currentCarSpot
}) => {
  const [viewMode, setViewMode] = useState<'diagram' | 'grid'>('diagram');
  const [selectedRow, setSelectedRow] = useState<'all' | 'top' | 'bottom'>('all');

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(12); } catch (e) { /* ignore */ }
    }
  };

  const handleSpotClick = (spot: string) => {
    triggerHaptic();
    onSelectSpot(spot);
  };

  return (
    <div className="w-full bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 space-y-3.5">
      
      {/* Top Header & View Mode Switcher */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-xs">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              주차 위치 지정
              <span className="text-rose-400 font-bold">*</span>
            </h4>
            <p className="text-[11px] text-slate-400">복귀 후 주차 구역 선택</p>
          </div>
        </div>

        {/* View Mode Toggle Button for Mobile */}
        <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('diagram')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all ${
              viewMode === 'diagram'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>도면</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all ${
              viewMode === 'grid'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3 h-3" />
            <span>간편</span>
          </button>
        </div>
      </div>

      {/* Selected Spot Status Banner */}
      <div className="flex items-center justify-between p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">선택된 위치:</span>
          {selectedSpot ? (
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-white font-bold flex items-center gap-1 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {selectedSpot} 구역
            </span>
          ) : (
            <span className="text-rose-400 font-semibold">구역을 터치하세요</span>
          )}
        </div>

        {currentCarSpot && (
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Car className="w-3.5 h-3.5 text-amber-400" />
            <span>직전 위치: <strong className="text-amber-300">{currentCarSpot}</strong></span>
          </div>
        )}
      </div>

      {/* MODE 1: Interactive Blueprint Diagram with horizontal swipe */}
      {viewMode === 'diagram' ? (
        <div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1.5 px-1">
            <span>좌우 스크롤로 1~10 구역 확인</span>
            <span className="text-[10px] text-emerald-400 font-mono">가로 스크롤 가능 ⇄</span>
          </div>

          <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
            <div className="min-w-[550px] relative p-3 sm:p-4 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
              
              {/* Top compass landmark */}
              <div className="text-center text-[10px] font-semibold text-slate-500 tracking-wider mb-2">
                ▲ 북측 야외 주차장 구역
              </div>

              <div className="flex items-stretch gap-2.5">
                {/* Left: 본관 */}
                <div className="w-10 bg-slate-800/90 border border-slate-700 rounded-lg flex flex-col items-center justify-center py-2 px-1 text-slate-300 shadow-inner shrink-0">
                  <span className="text-[11px] font-bold tracking-widest [writing-mode:vertical-rl] text-center">
                    본 관
                  </span>
                  <span className="text-[9px] text-emerald-400 mt-1">서측</span>
                </div>

                {/* Center: Parking Rows */}
                <div className="flex-1 flex flex-col gap-2">
                  {/* Top Row */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 mb-1 px-1">
                      <span>상단 주차열 (1 ~ 10)</span>
                      <span className="text-[9px] text-slate-500 font-normal">후면 주차</span>
                    </div>
                    <div className="grid grid-cols-10 gap-1.5">
                      {PARKING_TOP_SPOTS.map((spot, idx) => {
                        const isSelected = selectedSpot === spot;
                        const isCurrent = currentCarSpot === spot;
                        return (
                          <button
                            type="button"
                            key={spot}
                            onClick={() => handleSpotClick(spot)}
                            className={`h-14 rounded-lg flex flex-col items-center justify-between py-1.5 px-1 transition-all border relative select-none ${
                              isSelected
                                ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/40 scale-105 z-10'
                                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800 active:scale-95'
                            }`}
                          >
                            <span className={`text-[10px] font-mono font-bold leading-none ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                              {idx + 1}
                            </span>
                            <div className="flex items-center justify-center">
                              {isSelected ? (
                                <Car className="w-4 h-4 text-white animate-bounce" />
                              ) : isCurrent ? (
                                <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-400/40" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border border-slate-600/70" />
                              )}
                            </div>
                            <span className={`text-[9px] leading-none ${isSelected ? 'text-emerald-100 font-semibold' : 'text-slate-500'}`}>
                              상단
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Driveway */}
                  <div className="h-7 bg-slate-900/60 rounded-md border border-dashed border-slate-700/80 flex items-center justify-between px-3 text-slate-500 text-[10px] font-mono">
                    <span>◀ 진입로</span>
                    <span className="text-slate-600 font-sans">차량 통행로 (서행)</span>
                    <span>출차로 ▶</span>
                  </div>

                  {/* Bottom Row */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-sky-400 mb-1 px-1">
                      <span>하단 주차열 (1 ~ 10)</span>
                      <span className="text-[9px] text-slate-500 font-normal">보행자 주의</span>
                    </div>
                    <div className="grid grid-cols-10 gap-1.5">
                      {PARKING_BOTTOM_SPOTS.map((spot, idx) => {
                        const isSelected = selectedSpot === spot;
                        const isCurrent = currentCarSpot === spot;
                        return (
                          <button
                            type="button"
                            key={spot}
                            onClick={() => handleSpotClick(spot)}
                            className={`h-14 rounded-lg flex flex-col items-center justify-between py-1.5 px-1 transition-all border relative select-none ${
                              isSelected
                                ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/40 scale-105 z-10'
                                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800 active:scale-95'
                            }`}
                          >
                            <span className={`text-[10px] font-mono font-bold leading-none ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                              {idx + 1}
                            </span>
                            <div className="flex items-center justify-center">
                              {isSelected ? (
                                <Car className="w-4 h-4 text-white animate-bounce" />
                              ) : isCurrent ? (
                                <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-400/40" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border border-slate-600/70" />
                              )}
                            </div>
                            <span className={`text-[9px] leading-none ${isSelected ? 'text-emerald-100 font-semibold' : 'text-slate-500'}`}>
                              하단
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right: 건강증진센터 */}
                <div className="w-10 bg-slate-800/90 border border-slate-700 rounded-lg flex flex-col items-center justify-center py-2 px-1 text-slate-300 shadow-inner shrink-0">
                  <span className="text-[10px] font-bold tracking-widest [writing-mode:vertical-rl] text-center">
                    건강증진센터
                  </span>
                  <span className="text-[9px] text-sky-400 mt-1">동측</span>
                </div>
              </div>

              {/* Bottom Landmark: 지원관 */}
              <div className="mt-2.5 mx-auto max-w-[180px] bg-slate-800/90 border border-slate-700 py-1 px-3 rounded-lg text-center shadow-inner">
                <span className="text-xs font-bold text-slate-200">
                  지 원 관 (남측 방면)
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: Mobile Zero-Scroll Grid Mode (한 손 간편 모드) */
        <div className="space-y-3 p-1">
          {/* Row Filter Toggle */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-800/80 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedRow('all')}
              className={`py-1.5 rounded-lg transition-colors ${
                selectedRow === 'all' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'
              }`}
            >
              전체 20구역
            </button>
            <button
              type="button"
              onClick={() => setSelectedRow('top')}
              className={`py-1.5 rounded-lg transition-colors ${
                selectedRow === 'top' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              상단 1~10
            </button>
            <button
              type="button"
              onClick={() => setSelectedRow('bottom')}
              className={`py-1.5 rounded-lg transition-colors ${
                selectedRow === 'bottom' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              하단 1~10
            </button>
          </div>

          {/* Top Row Grid */}
          {(selectedRow === 'all' || selectedRow === 'top') && (
            <div>
              <div className="text-[11px] font-bold text-emerald-400 mb-1.5 flex items-center justify-between">
                <span>상단 구역 (본관 측 북열)</span>
                <span className="text-[10px] text-slate-500">1~10번</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {PARKING_TOP_SPOTS.map((spot, idx) => {
                  const isSelected = selectedSpot === spot;
                  return (
                    <button
                      type="button"
                      key={spot}
                      onClick={() => handleSpotClick(spot)}
                      className={`h-12 rounded-xl border flex items-center justify-center gap-1.5 font-bold text-xs transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30'
                          : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {isSelected && <Car className="w-3.5 h-3.5" />}
                      <span>상단 {idx + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Row Grid */}
          {(selectedRow === 'all' || selectedRow === 'bottom') && (
            <div>
              <div className="text-[11px] font-bold text-sky-400 mb-1.5 flex items-center justify-between">
                <span>하단 구역 (지원관 측 남열)</span>
                <span className="text-[10px] text-slate-500">1~10번</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {PARKING_BOTTOM_SPOTS.map((spot, idx) => {
                  const isSelected = selectedSpot === spot;
                  return (
                    <button
                      type="button"
                      key={spot}
                      onClick={() => handleSpotClick(spot)}
                      className={`h-12 rounded-xl border flex items-center justify-center gap-1.5 font-bold text-xs transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30'
                          : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {isSelected && <Car className="w-3.5 h-3.5" />}
                      <span>하단 {idx + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Preset Strip */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 flex items-center gap-1 text-[11px]">
          <Info className="w-3 h-3 text-slate-400" />
          자주 찾는 구역:
        </span>
        <div className="flex gap-1.5">
          {['상단-1', '상단-5', '하단-1', '하단-5'].map(spot => (
            <button
              type="button"
              key={spot}
              onClick={() => handleSpotClick(spot)}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                selectedSpot === spot
                  ? 'bg-emerald-500 text-white font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {spot}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
