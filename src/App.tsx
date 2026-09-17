/**
 * HD현대삼호 공용차량 운행일지 웹앱
 * 고대비 & 고시인성 UI (60대 부서원도 편하게 입력 가능한 큰 글씨와 명확한 버튼)
 */

import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, FileSpreadsheet, Car, PenLine, ClipboardList } from 'lucide-react';
import { VehicleLog } from './types';
import { 
  getStoredLogs, 
  saveLogs, 
  subscribeToCloudLogs, 
  saveLogToCloud, 
  deleteLogFromCloud, 
  getLogMonth 
} from './utils/storage';
import { getNowRounded10Min } from './utils/time';
import { DriveForm } from './components/DriveForm';
import { HistorySection } from './components/HistorySection';
import { OfficialLogSheetModal } from './components/OfficialLogSheetModal';

export function App() {
  const [logs, setLogs] = useState<VehicleLog[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [showOfficialSheet, setShowOfficialSheet] = useState(false);
  const [, setIsCloudSyncing] = useState(true);

  // Form State matching the official company logbook photo - strictly defaults to today's date
  const getTodayDateStr = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [date, setDate] = useState(getTodayDateStr);
  const [userName, setUserName] = useState('');
  const [purpose, setPurpose] = useState('현장 점검');
  const [destination, setDestination] = useState('도크관');
  const [customDestination, setCustomDestination] = useState('');
  const [startMileage, setStartMileage] = useState(42168);
  const [endMileage, setEndMileage] = useState(42168);
  const [startTime, setStartTime] = useState(() => getNowRounded10Min(0));
  const [endTime, setEndTime] = useState(() => {
    const s = getNowRounded10Min(0);
    return s;
  });
  const [fuelAmount, setFuelAmount] = useState('');
  const [maintenance, setMaintenance] = useState('');
  const [parkingSpot, setParkingSpot] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Subscribe to Cloud Firestore in real-time
  useEffect(() => {
    const unsubscribe = subscribeToCloudLogs((cloudLogs, connected) => {
      setLogs(cloudLogs);
      setIsCloudSyncing(!connected);
      if (cloudLogs.length > 0) {
        const latest = cloudLogs[0];
        setStartMileage(latest.endMileage);
        setEndMileage(latest.endMileage);
      }
    });

    return () => unsubscribe();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const currentCarSpot = logs[0]?.parkingSpot || '본관방향 상단1';
  const currentMileage = logs[0]?.endMileage || 42168;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName) {
      showToast('운전자를 선택해주세요.', 'error');
      return;
    }

    if (!parkingSpot) {
      showToast('주차 위치를 선택해주세요.', 'error');
      return;
    }

    const finalDestination = destination === 'custom' ? customDestination.trim() : destination;
    if (!finalDestination) {
      showToast('행선지를 입력해주세요.', 'error');
      return;
    }

    if (endMileage < startMileage) {
      showToast('운행 후 도착 거리는 시작 거리보다 작을 수 없습니다.', 'error');
      return;
    }

    // Time validation (startTime and endTime)
    const [sH, sM] = (startTime || '09:00').split(':').map(Number);
    const [eH, eM] = (endTime || '09:00').split(':').map(Number);
    const startM = sH * 60 + sM;
    const endM = eH * 60 + eM;

    if (startM < 8 * 60 || endM > 18 * 60) {
      showToast('운행 시간은 근무 시간인 08:00 ~ 18:00 범위 내여야 합니다.', 'error');
      return;
    }

    if (endM < startM) {
      showToast('종료 시간은 시작 시간 이후여야 합니다.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const driven = endMileage - startMileage;
      const targetDate = date || getTodayDateStr();
      const targetMonth = getLogMonth(targetDate);
      
      const sameMonthLogs = logs.filter(l => getLogMonth(l.date) === targetMonth);
      const nextSeq = sameMonthLogs.length + 1;

      const newEntry: VehicleLog = {
        id: `log-${Date.now()}`,
        seq: nextSeq,
        date: targetDate,
        userName,
        purpose,
        destination: finalDestination,
        startMileage,
        endMileage,
        drivenDistance: driven,
        startTime,
        endTime,
        fuelAmount: fuelAmount.trim() ? fuelAmount.trim() : undefined,
        maintenance: maintenance.trim() ? maintenance.trim() : undefined,
        parkingSpot: parkingSpot.trim() ? parkingSpot.trim() : undefined,
        timestamp: Date.now(),
        notes: notes.trim() ? notes.trim() : undefined
      };

      // Realtime Cloud Save (Firestore) + Local
      await saveLogToCloud(newEntry);
      const updated = [newEntry, ...logs];
      setLogs(updated);
      saveLogs(updated);

      // Reset form
      setDate(getTodayDateStr());
      setUserName('');
      setPurpose('현장 점검');
      setDestination('도크관');
      setCustomDestination('');
      setFuelAmount('');
      setMaintenance('');
      setNotes('');
      setStartMileage(endMileage);
      setEndMileage(endMileage);
      const nextStart = getNowRounded10Min(0);
      setStartTime(nextStart);
      setEndTime(nextStart);
      setParkingSpot('');
      setIsSubmitting(false);

      showToast(`[순번 #${nextSeq}] ${userName} 님의 운행 기록이 저장되었습니다 (+${driven}km)`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      showToast('기록 저장 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      await deleteLogFromCloud(id);
      const updated = logs.filter(l => l.id !== id);
      setLogs(updated);
      saveLogs(updated);
      if (updated.length > 0) {
        setStartMileage(updated[0].endMileage);
        setEndMileage(updated[0].endMileage);
      }
      showToast('운행 기록이 삭제되었습니다.');
    } catch (e) {
      console.error(e);
      showToast('기록 삭제 실패', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-200 flex flex-col items-center justify-start sm:py-6 font-sans antialiased text-neutral-950 selection:bg-emerald-200 overscroll-none">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 z-50 px-4 w-full max-w-lg pointer-events-none animate-in fade-in slide-in-from-top duration-200">
          <div
            className={`py-3 px-4 rounded-2xl shadow-xl border-2 text-sm sm:text-base font-extrabold flex items-center gap-2.5 pointer-events-auto ${
              toast.type === 'success'
                ? 'bg-neutral-950 text-white border-neutral-800'
                : 'bg-rose-700 text-white border-rose-900'
            }`}
          >
            {toast.type === 'success' ? (
              <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
            ) : (
              <AlertCircle className="w-5 h-5 text-white stroke-[3]" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-lg bg-white min-h-screen sm:min-h-0 sm:rounded-3xl sm:border-2 sm:border-neutral-300 sm:shadow-lg flex flex-col overflow-hidden overscroll-none">
        
        {/* Modern Header with Prominent Download Button */}
        <header className="px-5 pt-4 pb-3.5 border-b-2 border-neutral-200 bg-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                  HD현대삼호 동반성장부
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-neutral-950 mt-0.5">
                차량운행일지
              </h1>
            </div>

            {/* Unified Single Form View / Print / Export Button */}
            <button
              type="button"
              onClick={() => setShowOfficialSheet(true)}
              className="h-10 px-3.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
              title="사내 정식 양식 및 월별 실적 보고서 출력/다운로드"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>양식 출력</span>
            </button>
          </div>

          {/* Current Car Spot Bar with Car Icon */}
          <div className="mt-3 flex items-center justify-between px-3.5 py-2.5 bg-slate-100 rounded-xl border-2 border-slate-200 text-sm font-bold">
            <span className="text-slate-900 flex items-center gap-2 whitespace-nowrap">
              <Car className="w-4 h-4 text-emerald-700 stroke-[2.5] shrink-0" />
              <span>현재 차량 주차 위치</span>
            </span>
            <span className="font-black text-emerald-950 font-mono bg-white px-2.5 py-1 rounded-lg border-2 border-emerald-300 text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
              <Car className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>{currentCarSpot}</span>
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-5 flex-1 pb-6 bg-white">
          {activeTab === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* 시스템 순서: 1. 일자, 2. 운전자, 3. 운행시간, 4. 주행거리, 5. 운행목적, 6. 행선지, 7. 주차 위치 */}
              <DriveForm
                date={date}
                onDateChange={setDate}
                userName={userName}
                onUserNameChange={setUserName}
                startTime={startTime}
                onStartTimeChange={setStartTime}
                endTime={endTime}
                onEndTimeChange={setEndTime}
                startMileage={startMileage}
                endMileage={endMileage}
                onStartMileageChange={setStartMileage}
                onEndMileageChange={setEndMileage}
                purpose={purpose}
                onPurposeChange={setPurpose}
                destination={destination}
                onDestinationChange={setDestination}
                customDestination={customDestination}
                onCustomDestinationChange={setCustomDestination}
                parkingSpot={parkingSpot}
                onParkingSpotChange={setParkingSpot}
                currentCarSpot={currentCarSpot}
                fuelAmount={fuelAmount}
                onFuelAmountChange={setFuelAmount}
                maintenance={maintenance}
                onMaintenanceChange={setMaintenance}
                notes={notes}
                onNotesChange={setNotes}
              />

              {/* Submit Action Button - Very large & easy to tap */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-13 sm:h-14 bg-neutral-950 hover:bg-neutral-800 active:scale-[0.99] disabled:opacity-50 text-white rounded-2xl text-base sm:text-lg font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-3 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>일지 저장하기</span>
                  )}
                </button>
              </div>

            </form>
          ) : (
            <HistorySection
              logs={logs}
              onDeleteLog={handleDeleteLog}
              onOpenOfficialSheet={() => setShowOfficialSheet(true)}
            />
          )}
        </main>

        {/* Footer Info */}
        <div className="px-5 py-2.5 border-t-2 border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-600 bg-neutral-100">
          <span>누적 {currentMileage.toLocaleString()} km</span>
          <span>HD현대삼호 336호 (84러 4531)</span>
        </div>

        {/* Bottom Navigation Bar */}
        <nav className="p-2 sm:p-3 bg-white border-t-2 border-neutral-200 grid grid-cols-2 gap-2 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`h-12 rounded-xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'form'
                ? 'bg-neutral-950 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 hover:text-black'
            }`}
          >
            <PenLine className="w-5 h-5" />
            <span>일지 작성</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`h-12 rounded-xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-neutral-950 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 hover:text-black'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span>운행 목록</span>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'history'
                ? 'bg-white/30 text-white'
                : 'bg-neutral-300 text-neutral-900'
            }`}>
              {logs.length}
            </span>
          </button>
        </nav>

      </div>

      {/* Official Company Ledger Sheet Modal */}
      <OfficialLogSheetModal
        isOpen={showOfficialSheet}
        onClose={() => setShowOfficialSheet(false)}
        logs={logs}
      />

    </div>
  );
}
export default App;
