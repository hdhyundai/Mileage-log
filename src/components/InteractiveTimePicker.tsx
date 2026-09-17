import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { WORK_HOURS, WORK_MINUTES, timeToMinutes, parseTime } from '../utils/time';

interface InteractiveTimePickerProps {
  label: string;
  value: string;
  onChange: (time: string) => void;
  minTime?: string; // If set (for end time), must be >= minTime
  isEnd?: boolean;
}

export const InteractiveTimePicker: React.FC<InteractiveTimePickerProps> = ({
  label,
  value,
  onChange,
  minTime,
  isEnd = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsed = parseTime(value || (isEnd ? '09:00' : '09:00'));

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectedHour(null);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Calculate available hours
  const minParsed = minTime ? parseTime(minTime) : null;
  const minTotalMinutes = minTime ? timeToMinutes(minTime) : 0;

  const availableHours = WORK_HOURS.filter((h) => {
    const hourNum = parseInt(h, 10);
    if (!isEnd && hourNum >= 18) return false; // Start time is typically before 18:00
    if (isEnd && minParsed) {
      const minH = parseInt(minParsed.hour, 10);
      if (hourNum < minH) return false;
      if (hourNum === minH) {
        const hasValidMin = WORK_MINUTES.some((m) => {
          return timeToMinutes(`${h}:${m}`) >= minTotalMinutes;
        });
        if (!hasValidMin) return false;
      }
    }
    return true;
  });

  // Calculate available minutes for the chosen hour
  const currentHour = selectedHour || parsed.hour;
  const availableMinutes = WORK_MINUTES.filter((m) => {
    const timeStr = `${currentHour}:${m}`;
    const totalM = timeToMinutes(timeStr);
    if (isEnd && minTime) {
      return totalM >= minTotalMinutes && totalM <= 18 * 60;
    }
    return totalM <= 18 * 60;
  });

  const handleOpen = () => {
    setSelectedHour(null);
    setIsOpen(!isOpen);
  };

  const handleSelectHour = (h: string) => {
    if (h === '18') {
      onChange('18:00');
      setIsOpen(false);
      setSelectedHour(null);
      return;
    }

    const validMins = WORK_MINUTES.filter((m) => {
      const totalM = timeToMinutes(`${h}:${m}`);
      if (isEnd && minTime) {
        return totalM >= minTotalMinutes && totalM <= 18 * 60;
      }
      return totalM <= 18 * 60;
    });

    if (validMins.length === 0) return;

    setSelectedHour(h);
  };

  const handleSelectMinute = (m: string) => {
    const h = selectedHour || parsed.hour;
    onChange(`${h}:${m}`);
    setIsOpen(false);
    setSelectedHour(null);
  };

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <span className="text-xs font-bold text-emerald-950 block h-4.5">
        {label}
      </span>

      {/* Main trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        className={`w-full h-11 sm:h-12 bg-white hover:bg-emerald-50 border-2 text-slate-950 rounded-xl px-3 flex items-center justify-between text-sm sm:text-base font-extrabold font-mono transition-all cursor-pointer shadow-2xs ${
          isOpen
            ? 'border-emerald-700 ring-2 ring-emerald-300'
            : 'border-emerald-300 hover:border-emerald-500'
        }`}
      >
        <span className="text-emerald-950 text-base font-extrabold">{value}</span>
        <ChevronDown className={`w-4 h-4 text-emerald-800 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div 
          className={`absolute top-full mt-1.5 z-40 w-60 sm:w-64 bg-white border-2 border-neutral-300 rounded-2xl shadow-xl p-2.5 space-y-2 animate-in fade-in-50 duration-100 ${
            isEnd ? 'right-0' : 'left-0'
          }`}
        >
          {selectedHour === null ? (
            /* STEP 1: 시간 선택 */
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-extrabold text-neutral-900 border-b border-neutral-200 pb-1.5 px-1">
                <span>시간(시) 선택</span>
                <span className="text-xs text-emerald-900 font-bold bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                  08~18시
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                {availableHours.map((h) => {
                  const isCurrentH = parsed.hour === h;
                  return (
                    <button
                      type="button"
                      key={`hour-${h}`}
                      onClick={() => handleSelectHour(h)}
                      className={`h-9 rounded-xl text-sm font-extrabold font-mono transition-all cursor-pointer ${
                        isCurrentH
                          ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-400'
                          : 'bg-neutral-100 text-neutral-900 hover:bg-emerald-100 hover:text-emerald-950 border border-neutral-200 active:scale-95'
                      }`}
                    >
                      {parseInt(h, 10)}시
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* STEP 2: 분 선택 */
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-extrabold text-neutral-950 border-b border-neutral-200 pb-1.5 px-1">
                <span className="text-emerald-950 font-black text-sm">{parseInt(selectedHour, 10)}시</span>
                <button
                  type="button"
                  onClick={() => setSelectedHour(null)}
                  className="text-xs text-neutral-700 hover:text-black font-bold flex items-center gap-1 cursor-pointer bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>시간 다시 선택</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                {availableMinutes.map((m) => {
                  const isCurrent = parsed.hour === selectedHour && parsed.minute === m;
                  return (
                    <button
                      type="button"
                      key={`min-${m}`}
                      onClick={() => handleSelectMinute(m)}
                      className={`h-9 rounded-xl text-sm font-extrabold font-mono transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-400'
                          : 'bg-emerald-50 text-emerald-950 border-2 border-emerald-300 hover:bg-emerald-600 hover:text-white active:scale-95'
                      }`}
                    >
                      {m}분
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
