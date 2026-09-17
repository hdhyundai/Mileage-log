import { VehicleLog } from '../types';
import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc 
} from '../firebase';

const STORAGE_KEY = 'hd_hyundai_vehicle_logs_v4';

export const INITIAL_LOGS: VehicleLog[] = [
  {
    id: 'log-1',
    seq: 1,
    date: '2026-09-16',
    userName: '김만수',
    purpose: '현장 점검',
    destination: '도크관',
    startMileage: 42150,
    endMileage: 42168,
    drivenDistance: 18,
    startTime: '14:00',
    endTime: '15:20',
    fuelAmount: '',
    maintenance: '',
    parkingSpot: '본관방향 상단1',
    timestamp: Date.now() - 1000 * 60 * 85,
    notes: ''
  },
  {
    id: 'log-2',
    seq: 2,
    date: '2026-09-16',
    userName: '박도은',
    purpose: '회의 참석',
    destination: '본관',
    startMileage: 42135,
    endMileage: 42150,
    drivenDistance: 15,
    startTime: '09:30',
    endTime: '11:00',
    fuelAmount: '35L',
    maintenance: '',
    parkingSpot: '건강센터방향 상단2',
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    notes: '주유 완료'
  },
  {
    id: 'log-3',
    seq: 3,
    date: '2026-09-15',
    userName: '안태일',
    purpose: '물품 수령',
    destination: '기술교육원',
    startMileage: 42110,
    endMileage: 42135,
    drivenDistance: 25,
    startTime: '13:10',
    endTime: '14:40',
    fuelAmount: '',
    maintenance: '워셔액 보충',
    parkingSpot: '본관방향 상단3',
    timestamp: Date.now() - 1000 * 60 * 60 * 26,
    notes: '워셔액 보충'
  },
  {
    id: 'log-4',
    seq: 4,
    date: '2026-09-14',
    userName: '이은정',
    purpose: '외근/출장',
    destination: '경영지원관',
    startMileage: 42080,
    endMileage: 42110,
    drivenDistance: 30,
    startTime: '10:00',
    endTime: '12:30',
    fuelAmount: '',
    maintenance: '',
    parkingSpot: '건강센터방향 하단1',
    timestamp: Date.now() - 1000 * 60 * 60 * 32,
    notes: ''
  },
  {
    id: 'log-prev-1',
    seq: 1,
    date: '2026-08-31',
    userName: '이호민',
    purpose: '자재 검수',
    destination: '협력관',
    startMileage: 42050,
    endMileage: 42080,
    drivenDistance: 30,
    startTime: '14:00',
    endTime: '16:00',
    fuelAmount: '40L',
    maintenance: '엔진오일 점검',
    parkingSpot: '본관방향 상단2',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 17,
    notes: '정기 점검 완료'
  }
];

/**
 * Normalizes date strings to YYYY-MM-DD
 */
export function normalizeDateStr(dateStr?: string): string {
  if (!dateStr) return '2026-09-16';
  const clean = dateStr.trim();
  if (clean.length === 10 && clean.includes('-')) return clean;
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 2) {
      return `2026-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
  }
  return clean;
}

/**
 * Extracts YYYY-MM month key
 */
export function getLogMonth(dateStr?: string): string {
  const norm = normalizeDateStr(dateStr);
  return norm.slice(0, 7); // '2026-09'
}

/**
 * Cleanly format parking spot and notes for official log sheet and exports
 */
export function formatLogSheetNotes(parkingSpot?: string, rawNotes?: string): string {
  const spot = parkingSpot?.trim() || '';
  const note = rawNotes?.trim() || '';

  if (!spot && !note) return '';

  if (!note) {
    return spot ? `주차: ${spot}` : '';
  }

  if (!spot) {
    return note;
  }

  const escapedSpot = spot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const cleanedNote = note
    .replace(new RegExp(`주차\\s*[:：]?\\s*${escapedSpot}`, 'gi'), '')
    .replace(new RegExp(escapedSpot, 'gi'), '')
    .replace(/^[\s/,\-·]+|[\s/,\-·]+$/g, '')
    .trim();

  if (!cleanedNote) {
    return `주차: ${spot}`;
  }

  return `주차: ${spot} / ${cleanedNote}`;
}

export function getStoredLogs(): VehicleLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return INITIAL_LOGS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_LOGS;
  } catch (e) {
    console.error('Failed to read logs from storage:', e);
    return INITIAL_LOGS;
  }
}

export function saveLogs(logs: VehicleLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save logs to storage:', e);
  }
}

// -------------------------------------------------------------
// FIREBASE FIRESTORE CLOUD REAL-TIME SYNCHRONIZATION
// -------------------------------------------------------------

/**
 * Sanitizes log object to prevent Firestore "Unsupported field value: undefined" errors
 */
export function cleanLogForFirestore(log: VehicleLog): Record<string, any> {
  return {
    id: log.id,
    seq: typeof log.seq === 'number' ? log.seq : 1,
    date: normalizeDateStr(log.date),
    userName: log.userName || '',
    purpose: log.purpose || '',
    destination: log.destination || '',
    startMileage: Number(log.startMileage) || 0,
    endMileage: Number(log.endMileage) || 0,
    drivenDistance: Number(log.drivenDistance) || 0,
    startTime: log.startTime || '',
    endTime: log.endTime || '',
    fuelAmount: log.fuelAmount || '',
    maintenance: log.maintenance || '',
    parkingSpot: log.parkingSpot || '',
    notes: log.notes || '',
    timestamp: typeof log.timestamp === 'number' ? log.timestamp : Date.now()
  };
}

/**
 * Real-time subscription to Cloud Firestore vehicle_logs collection.
 * Automatically synchronizes across all mobile phones and web browsers.
 */
export function subscribeToCloudLogs(
  onUpdate: (logs: VehicleLog[], isCloudConnected: boolean) => void
): () => void {
  try {
    const logsCol = collection(db, 'vehicle_logs');
    const q = query(logsCol, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudLogs: VehicleLog[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            cloudLogs.push({
              id: docSnap.id,
              seq: data.seq || 1,
              date: normalizeDateStr(data.date),
              userName: data.userName || '',
              purpose: data.purpose || '',
              destination: data.destination || '',
              startMileage: Number(data.startMileage) || 0,
              endMileage: Number(data.endMileage) || 0,
              drivenDistance: Number(data.drivenDistance) || 0,
              startTime: data.startTime || '',
              endTime: data.endTime || '',
              fuelAmount: data.fuelAmount || '',
              maintenance: data.maintenance || '',
              parkingSpot: data.parkingSpot || '',
              timestamp: Number(data.timestamp) || Date.now(),
              notes: data.notes || ''
            });
          });
          saveLogs(cloudLogs);
          onUpdate(cloudLogs, true);
        } else {
          // If Firestore is empty initially, seed existing local/initial logs
          const local = getStoredLogs();
          seedInitialLogsToCloud(local);
          onUpdate(local, true);
        }
      },
      (error) => {
        console.warn('Firestore subscription fallback to local:', error);
        onUpdate(getStoredLogs(), false);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Firebase setup fallback:', err);
    onUpdate(getStoredLogs(), false);
    return () => {};
  }
}

/**
 * Seeds initial logs to Cloud Firestore on first setup
 */
async function seedInitialLogsToCloud(logs: VehicleLog[]): Promise<void> {
  try {
    for (const log of logs) {
      const docRef = doc(db, 'vehicle_logs', log.id);
      await setDoc(docRef, cleanLogForFirestore(log), { merge: true });
    }
  } catch (e) {
    console.warn('Seed logs error:', e);
  }
}

/**
 * Adds or updates a log in Cloud Firestore
 */
export async function saveLogToCloud(log: VehicleLog): Promise<void> {
  const docRef = doc(db, 'vehicle_logs', log.id);
  const cleaned = cleanLogForFirestore(log);
  await setDoc(docRef, cleaned, { merge: true });
}

/**
 * Deletes a log from Cloud Firestore
 */
export async function deleteLogFromCloud(logId: string): Promise<void> {
  const docRef = doc(db, 'vehicle_logs', logId);
  await deleteDoc(docRef);
}

/**
 * Get distinct available months with formatted label and record count
 */
export function getAvailableMonths(logs: VehicleLog[]): { key: string; label: string; count: number }[] {
  const monthMap = new Map<string, number>();

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  monthMap.set(currentMonthKey, 0);

  logs.forEach((log) => {
    const m = getLogMonth(log.date);
    monthMap.set(m, (monthMap.get(m) || 0) + 1);
  });

  const keys = Array.from(monthMap.keys()).sort((a, b) => b.localeCompare(a));

  return keys.map((key) => {
    const [y, m] = key.split('-');
    const isCurrent = key === currentMonthKey;
    const label = `${y}년 ${m}월${isCurrent ? ' (당월)' : ''}`;
    return {
      key,
      label,
      count: monthMap.get(key) || 0
    };
  });
}

/**
 * Filters logs for a specific month with sequence starting from 1
 */
export function getMonthlyLogsWithSeq(
  logs: VehicleLog[],
  targetMonth: string,
  sortDirection: 'asc' | 'desc' = 'asc'
): (VehicleLog & { monthlySeq: number })[] {
  const filtered = logs.filter((l) => getLogMonth(l.date) === targetMonth);

  filtered.sort((a, b) => {
    const dateComp = normalizeDateStr(a.date).localeCompare(normalizeDateStr(b.date));
    if (dateComp !== 0) return dateComp;
    const timeComp = (a.startTime || '').localeCompare(b.startTime || '');
    if (timeComp !== 0) return timeComp;
    return (a.timestamp || 0) - (b.timestamp || 0);
  });

  const mapped = filtered.map((log, index) => ({
    ...log,
    monthlySeq: index + 1
  }));

  if (sortDirection === 'desc') {
    return mapped.reverse();
  }

  return mapped;
}

/**
 * Calculates monthly report statistics
 */
export function getMonthlyStats(monthlyLogs: VehicleLog[]) {
  const count = monthlyLogs.length;
  let totalDrivenKm = 0;
  let totalFuelLiters = 0;
  let maxMileage = 0;
  let minMileage = Infinity;

  monthlyLogs.forEach((l) => {
    totalDrivenKm += l.drivenDistance || 0;
    if (l.endMileage) {
      maxMileage = Math.max(maxMileage, l.endMileage);
    }
    if (l.startMileage) {
      minMileage = Math.min(minMileage, l.startMileage);
    }
    if (l.fuelAmount) {
      const match = l.fuelAmount.match(/\d+(\.\d+)?/);
      if (match) {
        totalFuelLiters += parseFloat(match[0]);
      }
    }
  });

  return {
    totalCount: count,
    totalDrivenKm,
    totalFuelLiters,
    endMileage: maxMileage || (monthlyLogs[0]?.endMileage ?? 42168),
    startMileage: minMileage === Infinity ? (monthlyLogs[0]?.startMileage ?? 42080) : minMileage
  };
}

/**
 * Export official monthly report to Excel (.xls)
 */
export function exportMonthlyReportExcel(
  allLogs: VehicleLog[],
  targetMonth: string,
  department = '동반성장부',
  vehicleNumber = '336호 (84러 4531)'
): void {
  const [yearStr, monthStr] = targetMonth.split('-');
  const monthlyLogs = getMonthlyLogsWithSeq(allLogs, targetMonth, 'asc');
  const stats = getMonthlyStats(monthlyLogs);
  const now = new Date();

  const printTimestamp = `PRINT ${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}/${department}/***`;
  const reportTitle = `${yearStr}년 ${monthStr}월 공용차량 운행 실적 보고서`;

  const TOTAL_ROWS = Math.max(22, monthlyLogs.length);
  const tableRows: string[] = [];

  for (let i = 0; i < TOTAL_ROWS; i++) {
    const log = monthlyLogs[i];
    const seq = i + 1;
    const rawDate = log?.date ? normalizeDateStr(log.date) : '';
    const dateFormatted = rawDate ? `${rawDate.slice(5).replace('-', '/')}` : '';
    const user = log?.userName || '';
    const purpose = log?.purpose || '';
    const dest = log?.destination || '';
    const daily = log ? log.drivenDistance : '';
    const total = log ? log.endMileage : '';
    const startT = log?.startTime || '';
    const endT = log?.endTime || '';
    const fuel = log?.fuelAmount || '';
    const repair = log?.maintenance || '';
    const notes = formatLogSheetNotes(log?.parkingSpot, log?.notes);

    tableRows.push(`
      <tr style="height: 28px;">
        <td style="border: 1px solid #000; text-align: center; font-size: 10.5pt; font-family: 'Malgun Gothic';">${seq}</td>
        <td style="border: 1px solid #000; text-align: center; font-size: 10.5pt; font-family: 'Malgun Gothic';">${dateFormatted}</td>
        <td style="border: 1px solid #000; text-align: center; font-size: 10.5pt; font-family: 'Malgun Gothic'; font-weight: bold;">${user}</td>
        <td style="border: 1px solid #000; text-align: left; padding-left: 6px; font-size: 10.5pt; font-family: 'Malgun Gothic';">${purpose}</td>
        <td style="border: 1px solid #000; text-align: center; font-size: 10.5pt; font-family: 'Malgun Gothic';">${dest}</td>
        <td style="border: 1px solid #000; text-align: right; padding-right: 6px; font-size: 10.5pt; font-family: 'Malgun Gothic'; font-weight: bold;">${daily}</td>
        <td style="border: 1px solid #000; text-align: right; padding-right: 6px; font-size: 10.5pt; font-family: 'Malgun Gothic';">${total}</td>
        <td style="border: 1px solid #000; text-align: center; font-size: 10.5pt; font-family: 'Malgun Gothic';">${startT}</td>
        <td style="border: 1px solid #000; text-align: center; font-size: 10.5pt; font-family: 'Malgun Gothic';">${endT}</td>
        <td style="border: 1px solid #000; text-align: center; font-size: 10.5pt; font-family: 'Malgun Gothic';">${fuel}</td>
        <td style="border: 1px solid #000; text-align: left; padding-left: 6px; font-size: 10.5pt; font-family: 'Malgun Gothic';">${repair}</td>
        <td style="border: 1px solid #000; text-align: left; padding-left: 6px; font-size: 10.5pt; font-family: 'Malgun Gothic';">${notes}</td>
      </tr>
    `);
  }

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      <style>
        table { border-collapse: collapse; width: 100%; font-family: 'Malgun Gothic', '맑은 고딕', Dotum, sans-serif; }
        .title { font-size: 18pt; font-weight: bold; text-align: center; padding: 12px 0; border: none; }
        .meta-label { font-size: 10pt; color: #333; font-weight: bold; }
        .meta-val { font-size: 10pt; color: #111; }
        .appr-table th { border: 1px solid #000; background-color: #f2f2f2; font-size: 9pt; text-align: center; padding: 4px; }
        .appr-table td { border: 1px solid #000; height: 44px; text-align: center; }
        .summary-th { border: 1px solid #000; background-color: #eaf1fb; font-size: 10pt; font-weight: bold; text-align: center; padding: 6px; }
        .summary-td { border: 1px solid #000; font-size: 10pt; font-weight: bold; text-align: center; padding: 6px; }
        .grid-th { border: 1px solid #000; background-color: #f2f2f2; font-weight: bold; text-align: center; font-size: 10pt; padding: 5px; }
      </style>
    </head>
    <body>
      <!-- Report Header -->
      <table style="margin-bottom: 8px;">
        <tr>
          <td colspan="8" class="title">${reportTitle}</td>
          <td colspan="4" style="vertical-align: top; text-align: right;">
            <!-- Approval Box -->
            <table class="appr-table" style="width: 220px; float: right; border-collapse: collapse;">
              <tr>
                <th rowspan="2" style="width: 28px; background: #e9ecef;">결<br/>재</th>
                <th style="width: 64px;">담 당</th>
                <th style="width: 64px;">팀 장</th>
                <th style="width: 64px;">부서장</th>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td colspan="6" style="padding-top: 6px;">
            <span class="meta-label">소속 부서: </span><span class="meta-val">${department}</span>&nbsp;&nbsp;|&nbsp;&nbsp;
            <span class="meta-label">차량 정보: </span><span class="meta-val">${vehicleNumber}</span>
          </td>
          <td colspan="6" style="text-align: right; padding-top: 6px;">
            <span class="meta-label">대상 기간: </span><span class="meta-val">${yearStr}년 ${monthStr}월 01일 ~ ${monthStr}월 말일</span>
          </td>
        </tr>
      </table>

      <!-- Monthly Summary KPI Block -->
      <table style="margin-bottom: 12px;">
        <tr>
          <td class="summary-th" style="width: 25%;">월간 총 운행 횟수</td>
          <td class="summary-th" style="width: 25%;">월간 총 주행거리</td>
          <td class="summary-th" style="width: 25%;">월말 최종 누적거리</td>
          <td class="summary-th" style="width: 25%;">월간 총 주유량</td>
        </tr>
        <tr>
          <td class="summary-td" style="color: #0b57d0;">${stats.totalCount} 건</td>
          <td class="summary-td" style="color: #0b57d0;">${stats.totalDrivenKm.toLocaleString()} km</td>
          <td class="summary-td">${stats.endMileage.toLocaleString()} km</td>
          <td class="summary-td">${stats.totalFuelLiters > 0 ? stats.totalFuelLiters + ' L' : '-'}</td>
        </tr>
      </table>

      <!-- Detailed Operation Log (starts at 1) -->
      <table>
        <thead>
          <tr style="height: 28px;">
            <th rowspan="2" class="grid-th" style="width: 40px;">순</th>
            <th rowspan="2" class="grid-th" style="width: 65px;">일자</th>
            <th rowspan="2" class="grid-th" style="width: 70px;">운전자</th>
            <th rowspan="2" class="grid-th" style="width: 140px;">운행 목적</th>
            <th rowspan="2" class="grid-th" style="width: 90px;">행선지</th>
            <th colspan="2" class="grid-th" style="width: 130px;">주행거리</th>
            <th colspan="2" class="grid-th" style="width: 110px;">운행시간 (근무 08~18시)</th>
            <th rowspan="2" class="grid-th" style="width: 65px;">주유량</th>
            <th rowspan="2" class="grid-th" style="width: 130px;">수리/점검 내역</th>
            <th rowspan="2" class="grid-th" style="width: 140px;">비고 (주차구역)</th>
          </tr>
          <tr style="height: 24px;">
            <th class="grid-th" style="width: 65px;">당일</th>
            <th class="grid-th" style="width: 65px;">총계</th>
            <th class="grid-th" style="width: 55px;">시작</th>
            <th class="grid-th" style="width: 55px;">종료</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows.join('')}
        </tbody>
      </table>

      <!-- Footer -->
      <div style="margin-top: 10px; font-size: 9.5pt; font-family: 'Malgun Gothic'; color: #555;">
        <span style="float: left;">${printTimestamp}</span>
        <span style="float: right; margin-right: 20px; font-weight: bold;">${yearStr} / ${monthStr} (1/1)</span>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${yearStr}년${monthStr}월_공용차량운행실적보고서_${department}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export official monthly report to CSV
 */
export function exportMonthlyReportCSV(allLogs: VehicleLog[], targetMonth: string, department = '동반성장부'): void {
  const [yearStr, monthStr] = targetMonth.split('-');
  const monthlyLogs = getMonthlyLogsWithSeq(allLogs, targetMonth, 'asc');

  const headers = [
    '순번',
    '일자',
    '운전자',
    '운행목적',
    '행선지',
    '출발km',
    '도착km',
    '주행거리(km)',
    '시작시간',
    '종료시간',
    '주유량',
    '수리점검내역',
    '비고(주차위치)'
  ];

  const rows = monthlyLogs.map((l) => {
    return [
      l.monthlySeq,
      `"${l.date || ''}"`,
      `"${l.userName || ''}"`,
      `"${l.purpose || ''}"`,
      `"${l.destination || ''}"`,
      l.startMileage,
      l.endMileage,
      l.drivenDistance,
      `"${l.startTime || ''}"`,
      `"${l.endTime || ''}"`,
      `"${l.fuelAmount || ''}"`,
      `"${l.maintenance || ''}"`,
      `"${formatLogSheetNotes(l.parkingSpot, l.notes)}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${yearStr}년${monthStr}월_공용차량운행실적_${department}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportLogsToExactExcel(logs: VehicleLog[]): void {
  const targetMonth = getLogMonth(logs[0]?.date);
  exportMonthlyReportExcel(logs, targetMonth);
}

export function exportLogsToCSV(logs: VehicleLog[]): void {
  const targetMonth = getLogMonth(logs[0]?.date);
  exportMonthlyReportCSV(logs, targetMonth);
}
