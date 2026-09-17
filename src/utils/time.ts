/**
 * Time utility functions for 10-minute intervals and duration calculations
 * Restricted to working hours: 08:00 ~ 18:00 (8시 ~ 18시)
 */

export const WORK_HOURS = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18'] as const;
export const WORK_MINUTES = ['00', '10', '20', '30', '40', '50'] as const;

export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 8 * 60;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 8;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
};

export const minutesToTimeStr = (totalMins: number): string => {
  // Clamp between 08:00 (480 mins) and 18:00 (1080 mins)
  const clamped = Math.max(8 * 60, Math.min(18 * 60, totalMins));
  const h = Math.floor(clamped / 60);
  const m = Math.floor((clamped % 60) / 10) * 10;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const parseTime = (timeStr: string): { hour: string; minute: string } => {
  if (!timeStr || !timeStr.includes(':')) {
    return { hour: '08', minute: '00' };
  }
  const [h, m] = timeStr.split(':');
  const hour = String(h).padStart(2, '0');
  const minute = String(m).padStart(2, '0');
  return { hour, minute };
};

export const formatDuration = (startStr: string, endStr: string): string => {
  const startM = timeToMinutes(startStr);
  const endM = timeToMinutes(endStr);
  if (endM <= startM) return '';
  const diff = endM - startM;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}시간 ${mins}분`;
  }
  if (hours > 0) {
    return `${hours}시간`;
  }
  return `${mins}분`;
};

/**
 * Returns current time clamped between 08:00 and 18:00,
 * rounded to the nearest 10 minutes.
 */
export const getNowRounded10Min = (offsetMinutes = 0): string => {
  const d = new Date(Date.now() + offsetMinutes * 60000);
  let h = d.getHours();
  let m = Math.floor(d.getMinutes() / 10) * 10;

  if (h < 8) {
    h = 8;
    m = 0;
  } else if (h > 18 || (h === 18 && m > 0)) {
    h = 18;
    m = 0;
  }

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Available hours for end time (must be >= start hour and <= 18)
 */
export const getAvailableEndHours = (startHour: string): string[] => {
  const sH = parseInt(startHour, 10) || 8;
  return WORK_HOURS.filter((h) => parseInt(h, 10) >= sH);
};

/**
 * Available 10-minute intervals for end time (10분 단위 6개 중 시작시간 이후)
 */
export const getAvailableEndMinutes = (
  startHour: string,
  startMinute: string,
  endHour: string
): string[] => {
  if (endHour === '18') {
    return ['00'];
  }
  if (endHour === startHour) {
    const sM = parseInt(startMinute, 10) || 0;
    return WORK_MINUTES.filter((m) => parseInt(m, 10) > sM);
  }
  return [...WORK_MINUTES];
};
