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
      // If same hour, must have at least one minute >= minTotalMinutes
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
      // 18:00 is end of standard workday, set directly and close
      onChange('18:00');
      setIsOpen(false);
      setSelectedHour(null);
      return;
    }

    // Check valid minutes for this hour
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
      <span className="text-[11px] text-neutral-600 font-medium block h-4">
        {label}
      </span>

      {/* Main trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        className={`w-full h-10 bg-white hover:bg-emerald-50/50 border text-neutral-900 rounded-xl px-2.5 flex items-center justify-between text-xs sm:text-sm font-bold font-mono transition-all cursor-pointer shadow-2xs ${
          isOpen
            ? 'border-emerald-600 ring-2 ring-emerald-100'
            : 'border-emerald-200'
        }`}
      >
        <span className="text-emerald-950">{value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-emerald-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div 
          className={`absolute top-full mt-1 z-40 w-56 sm:w-60 bg-white border border-neutral-200 rounded-xl shadow-lg p-2 space-y-1.5 animate-in fade-in-50 duration-100 ${
            isEnd ? 'right-0' : 'left-0'
          }`}
        >
          {selectedHour === null ? (
            /* STEP 1: 시간 선택 */
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-700 border-b border-neutral-100 pb-1 px-0.5">
                <span>시간(시) 선택</span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1 py-0.2 rounded">
                  08~18시
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-1 pt-0.5">
                {availableHours.map((h) => {
                  const isCurrentH = parsed.hour === h;
                  return (
                    <button
                      type="button"
                      key={`hour-${h}`}
                      onClick={() => handleSelectHour(h)}
                      className={`h-7.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                        isCurrentH
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-neutral-100 text-neutral-800 hover:bg-emerald-50 hover:text-emerald-800 active:scale-95'
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
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-800 border-b border-neutral-100 pb-1 px-0.5">
                <span className="text-emerald-800 font-bold">{parseInt(selectedHour, 10)}시</span>
                <button
                  type="button"
                  onClick={() => setSelectedHour(null)}
                  className="text-[10px] text-neutral-500 hover:text-neutral-900 font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  <ArrowLeft className="w-2.5 h-2.5" />
                  <span>시간 변경</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1 pt-0.5">
                {availableMinutes.map((m) => {
                  const isCurrent = parsed.hour === selectedHour && parsed.minute === m;
                  return (
                    <button
                      type="button"
                      key={`min-${m}`}
                      onClick={() => handleSelectMinute(m)}
                      className={`h-7.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-600 hover:text-white active:scale-95'
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
