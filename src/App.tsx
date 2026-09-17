/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, FileSpreadsheet, Download, Car, PenLine, ClipboardList, Cloud, CloudCheck } from 'lucide-react';
import { VehicleLog } from './types';
import { 
  getStoredLogs, 
  saveLogs, 
  subscribeToCloudLogs, 
  saveLogToCloud, 
  deleteLogFromCloud, 
  exportLogsToExactExcel, 
  getLogMonth 
} from './utils/storage';
import { getNowRounded10Min, timeToMinutes, minutesToTimeStr } from './utils/time';
import { DriveForm } from './components/DriveForm';
import { HistorySection } from './components/HistorySection';
import { OfficialLogSheetModal } from './components/OfficialLogSheetModal';

export default function App() {
  const [logs, setLogs] = useState<VehicleLog[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [showOfficialSheet, setShowOfficialSheet] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(true);

  // Form State matching the official company logbook photo - strictly defaults to today's date
  const getTodayDateStr = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [date, setDate] = useState(getTodayDateStr());
  const [userName, setUserName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [destination, setDestination] = useState('');
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

    if (!purpose) {
      showToast('운행 목적을 선택해주세요.', 'error');
      return;
    }

    let finalDest = destination;
    if (destination === 'custom') {
      finalDest = customDestination.trim();
      if (!finalDest) {
        showToast('상세 행선지를 입력해주세요.', 'error');
        return;
      }
    } else if (!destination) {
      showToast('행선지를 선택해주세요.', 'error');
      return;
    }

    if (endMileage < startMileage) {
      showToast('도착 거리가 시작 거리보다 작습니다.', 'error');
      return;
    }

    const startM = timeToMinutes(startTime);
    const endM = timeToMinutes(endTime);
    if (startM < 8 * 60 || endM > 18 * 60) {
      showToast('근무시간(08:00 ~ 18:00) 내의 시간만 작성 가능합니다.', 'error');
      return;
    }

    if (endM < startM) {
      showToast('종료 시간은 시작 시간 이후여야 합니다.', 'error');
      return;
    }

    if (!parkingSpot) {
      showToast('복귀 후 주차하신 구역을 선택해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const driven = endMileage - startMileage;
      const targetDate = date || getTodayDateStr();
      const targetMonth = getLogMonth(targetDate);
      const monthlyLogs = logs.filter(l => getLogMonth(l.date) === targetMonth);
      const nextSeq = monthlyLogs.length + 1; // Strict monthly sequence starting from 1

      const newEntry: VehicleLog = {
        id: `log-${Date.now()}`,
        seq: nextSeq,
        date: targetDate,
        userName,
        purpose,
        destination: finalDest,
        startMileage,
        endMileage,
        drivenDistance: driven,
        startTime,
        endTime,
        fuelAmount: fuelAmount.trim() || undefined,
        maintenance: maintenance.trim() || undefined,
        parkingSpot,
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
      setPurpose('');
      setDestination('');
      setCustomDestination('');
      setNotes('');
      setFuelAmount('');
      setMaintenance('');
      setStartMileage(endMileage);
      setEndMileage(endMileage);
      const nextStart = getNowRounded10Min(0);
      setStartTime(nextStart);
      setEndTime(nextStart);
      setParkingSpot('');
      setIsSubmitting(false);

      showToast(`[순번 #${nextSeq}] ${userName} 님의 운행 기록이 클라우드에 저장되었습니다 (+${driven}km)`);
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
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-start sm:py-8 font-sans antialiased text-neutral-900 selection:bg-emerald-100">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 z-50 px-4 w-full max-w-md pointer-events-none animate-in fade-in slide-in-from-top duration-200">
          <div
            className={`py-2.5 px-4 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 pointer-events-auto ${
              toast.type === 'success'
                ? 'bg-neutral-900 text-white border-neutral-800'
                : 'bg-rose-600 text-white border-rose-700'
            }`}
          >
            {toast.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-white stroke-[2.5]" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-md bg-white min-h-screen sm:min-h-0 sm:rounded-3xl sm:border sm:border-neutral-200/80 sm:shadow-sm flex flex-col overflow-hidden">
        
        {/* Modern Header with Prominent Download Button */}
        <header className="px-5 pt-4 pb-3 border-b border-neutral-100">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                  HD현대삼호 동반성장부
                </span>
                <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  <Cloud className="w-2.5 h-2.5 text-emerald-600" />
                  <span>실시간 DB</span>
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900 mt-0.5">
                차량운행일지
              </h1>
            </div>

            {/* Unified Single Form View / Print / Export Button */}
            <button
              type="button"
              onClick={() => setShowOfficialSheet(true)}
              className="h-8.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
              title="사내 정식 양식 및 월별 실적 보고서 출력/다운로드"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>양식 출력</span>
            </button>
          </div>

          {/* Current Car Spot Bar with Car Icon */}
          <div className="mt-2.5 flex items-center justify-between px-3 py-1.5 bg-neutral-50 rounded-xl border border-neutral-200/60 text-xs">
            <span className="text-neutral-500 font-medium flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-emerald-600" />
              <span>현재 차량 주차 위치</span>
            </span>
            <span className="font-bold text-neutral-900 font-mono bg-white px-2 py-0.5 rounded-md border border-neutral-200 text-[11px] flex items-center gap-1 shadow-2xs">
              <Car className="w-3 h-3 text-emerald-700" />
              <span>{currentCarSpot} 구역</span>
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-5 flex-1 pb-6">
          {activeTab === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              
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

              {/* Submit Action Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 sm:h-12 bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
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
        <div className="px-5 py-2 border-t border-neutral-100 flex items-center justify-between text-[10px] sm:text-[11px] text-neutral-400 font-medium bg-neutral-50/50">
          <span>누적 주행 {currentMileage.toLocaleString()} km</span>
          <span>HD현대삼호 336호 (84러 4531)</span>
        </div>

        {/* Bottom Navigation Bar */}
        <nav className="p-2 sm:p-2.5 bg-white border-t border-neutral-200 grid grid-cols-2 gap-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`h-11 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'form'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900'
            }`}
          >
            <PenLine className="w-4 h-4" />
            <span>일지 작성</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`h-11 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>운행 목록</span>
            <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${
              activeTab === 'history'
                ? 'bg-white/20 text-white'
                : 'bg-neutral-200 text-neutral-700'
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
