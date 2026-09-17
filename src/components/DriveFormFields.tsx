import React, { useState } from 'react';
import { User, Target, MapPin, FileText, ChevronDown, Search, Check, Sparkles, Building2 } from 'lucide-react';
import { USERS, PURPOSES, DEFAULT_DESTINATIONS } from '../types';

interface DriveFormFieldsProps {
  userName: string;
  onUserNameChange: (val: string) => void;
  purpose: string;
  onPurposeChange: (val: string) => void;
  destination: string;
  onDestinationChange: (val: string) => void;
  customDestination: string;
  onCustomDestinationChange: (val: string) => void;
  notes: string;
  onNotesChange: (val: string) => void;
  recentUsers?: string[];
}

export const DriveFormFields: React.FC<DriveFormFieldsProps> = ({
  userName,
  onUserNameChange,
  purpose,
  onPurposeChange,
  destination,
  onDestinationChange,
  customDestination,
  onCustomDestinationChange,
  notes,
  onNotesChange,
  recentUsers = []
}) => {
  const [userSearch, setUserSearch] = useState('');
  const [showUserPicker, setShowUserPicker] = useState(false);

  // Purpose icons map
  const purposeIcons: Record<string, string> = {
    '회의 참석': '🤝',
    '현장 점검': '🔍',
    '외근/출장': '🚗',
    '물품 수령': '📦',
    '기타': '📝'
  };

  const filteredUsers = USERS.filter(u => u.includes(userSearch.trim()));

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(12); } catch (e) { /* ignore */ }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-5">
      
      {/* 1. 사용자 성명 선택 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <User className="w-4 h-4 text-emerald-700" />
            운전자 성명
            <span className="text-rose-500 font-bold">*</span>
          </label>
          <span className="text-[11px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            동반성장부
          </span>
        </div>

        {/* Quick Recent User Chips */}
        {recentUsers.length > 0 && (
          <div className="mb-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
              <span className="text-[11px] font-semibold text-slate-400 shrink-0">최근 운행:</span>
              {recentUsers.slice(0, 5).map(u => (
                <button
                  type="button"
                  key={u}
                  onClick={() => {
                    triggerHaptic();
                    onUserNameChange(u);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all shrink-0 font-medium active:scale-95 ${
                    userName === u
                      ? 'bg-emerald-700 text-white border-emerald-700 font-bold shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {userName === u && <Check className="w-3 h-3 inline mr-1" />}
                  {u}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Select with Quick-Search Toggle */}
        <div className="space-y-2">
          <div className="relative">
            <select
              value={userName}
              onChange={(e) => {
                triggerHaptic();
                onUserNameChange(e.target.value);
              }}
              required
              className="w-full h-12 bg-slate-50/80 border border-slate-300 hover:border-slate-400 text-slate-900 rounded-xl px-3.5 pr-10 text-sm sm:text-base font-semibold appearance-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all"
            >
              <option value="" disabled>운전자를 선택하세요 (총 20명)</option>
              {USERS.map((user) => (
                <option key={user} value={user}>
                  {user} (동반성장부)
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick-Search Filter for Large Lists */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <button
              type="button"
              onClick={() => setShowUserPicker(!showUserPicker)}
              className="text-slate-500 hover:text-emerald-700 text-[11px] font-medium flex items-center gap-1 transition-colors"
            >
              <Search className="w-3 h-3" />
              {showUserPicker ? '이름 검색창 닫기' : '이름으로 빠른 검색'}
            </button>
            {userName && (
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                <Check className="w-3 h-3" />
                선택됨: <strong>{userName}</strong>
              </span>
            )}
          </div>

          {showUserPicker && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-in fade-in duration-150">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="성명 검색 (예: 김, 박, 은지...)"
                  className="w-full h-9 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {filteredUsers.map(u => (
                  <button
                    type="button"
                    key={u}
                    onClick={() => {
                      triggerHaptic();
                      onUserNameChange(u);
                      setShowUserPicker(false);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      userName === u
                        ? 'bg-emerald-600 text-white font-bold border-emerald-600'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. 사용 목적 (모바일 1터치 칩 선택 지원) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-700" />
            사용 목적
            <span className="text-rose-500 font-bold">*</span>
          </label>
          <span className="text-[11px] text-slate-400">터치하여 즉시 선택</span>
        </div>

        {/* Mobile Fast-Tap Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {PURPOSES.map((p) => {
            const isSelected = purpose === p;
            return (
              <button
                type="button"
                key={p}
                onClick={() => {
                  triggerHaptic();
                  onPurposeChange(p);
                }}
                className={`min-h-[46px] px-2.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm shadow-emerald-700/30'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/90'
                }`}
              >
                <span className="text-sm">{purposeIcons[p] || '🎯'}</span>
                <span>{p}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 도착 목적지 장소 (모바일 1터치 칩 + 직접 입력) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-700" />
            도착 목적지
            <span className="text-rose-500 font-bold">*</span>
          </label>
          <span className="text-[11px] text-slate-400">사내/사외 주요 거점</span>
        </div>

        {/* Quick Destination Chips */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 mb-2.5">
          {DEFAULT_DESTINATIONS.map((d) => {
            const isSelected = destination === d;
            const label = d === 'custom' ? '직접 입력' : d;
            const icon = d === 'custom' ? '✏️' : '📍';
            return (
              <button
                type="button"
                key={d}
                onClick={() => {
                  triggerHaptic();
                  onDestinationChange(d);
                }}
                className={`min-h-[44px] px-2 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 border transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm shadow-emerald-700/30'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/90'
                }`}
              >
                <span>{icon}</span>
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>

        {/* 직접 입력 (custom destination) */}
        {destination === 'custom' && (
          <div className="p-3 bg-emerald-50/50 border border-emerald-300 rounded-xl space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <label className="text-xs font-bold text-emerald-950 block">
              상세 목적지 작성 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={customDestination}
              onChange={(e) => onCustomDestinationChange(e.target.value)}
              placeholder="예: 영암군청, 삼호물류단지 협력사, 목포역 등"
              required
              autoFocus
              className="w-full h-11 bg-white border border-emerald-400 text-slate-900 rounded-lg px-3.5 text-sm font-medium focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all shadow-inner"
            />
          </div>
        )}
      </div>

      {/* 4. 비고 / 메모 (선택) */}
      <div>
        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          특이사항 및 메모 (선택사항)
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="예: 동승자 성명, 주유 내역, 차량 이상 유무 등"
          className="w-full h-11 bg-slate-50/80 border border-slate-200 text-slate-800 rounded-xl px-3.5 text-xs sm:text-sm focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
        />
      </div>
    </div>
  );
};
