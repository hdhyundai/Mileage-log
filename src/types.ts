export interface VehicleLog {
  id: string;
  seq?: number;
  date: string; // 일자 (YYYY-MM-DD 또는 MM/DD)
  userName: string; // 운전자
  purpose: string; // 운행 목적
  destination: string; // 행선지
  startMileage: number; // 운행 전 계기판
  endMileage: number; // 총계 (도착 계기판)
  drivenDistance: number; // 당일 주행거리
  startTime: string; // 운행시간 시작 (HH:mm)
  endTime: string; // 운행시간 종료 (HH:mm)
  fuelAmount?: string; // 주유량 (L 또는 금액)
  maintenance?: string; // 수리/점검 내역
  parkingSpot: string; // 주차 위치
  notes?: string; // 비고
  timestamp: number;
  fuelLevel?: string;
  isClean?: boolean;
}

// HD현대삼호 동반성장부 사용자 명단 (총 18명 - ㄱㄴㄷ 가나다순 정렬)
export const USERS = [
  '구희준',
  '김만수',
  '노정현',
  '박도은',
  '박상민',
  '박상수',
  '박희성',
  '백세정',
  '송지애',
  '안태일',
  '이은정',
  '이현아',
  '이호민',
  '이흥수',
  '정재근',
  '정정헌',
  '정현문',
  '하다윤'
];

export const PURPOSES = [
  '회의 참석',
  '현장 점검',
  '외근/출장',
  '물품 수령',
  '기타'
];

export const DEFAULT_DESTINATIONS = [
  '생산관',
  '본관',
  '경영지원관',
  '도크관',
  '기술교육원',
  '선각공장',
  '의장공장',
  'custom'
];

// 지원관 기준 주차 구역 (본관 방향 1~5, 건강센터 방향 1~5)
export const PARKING_MAIN_BLDG_TOP = [
  '본관방향 상단1',
  '본관방향 상단2',
  '본관방향 상단3',
  '본관방향 상단4',
  '본관방향 상단5'
];

export const PARKING_MAIN_BLDG_BOTTOM = [
  '본관방향 하단1',
  '본관방향 하단2',
  '본관방향 하단3',
  '본관방향 하단4',
  '본관방향 하단5'
];

export const PARKING_HEALTH_CTR_TOP = [
  '건강센터방향 상단1',
  '건강센터방향 상단2',
  '건강센터방향 상단3',
  '건강센터방향 상단4',
  '건강센터방향 상단5'
];

export const PARKING_HEALTH_CTR_BOTTOM = [
  '건강센터방향 하단1',
  '건강센터방향 하단2',
  '건강센터방향 하단3',
  '건강센터방향 하단4',
  '건강센터방향 하단5'
];

// 통합 단일 뷰용 주차 구역 전체 목록 (상단 10면 / 하단 10면)
export const ALL_PARKING_SPOTS = [
  ...PARKING_MAIN_BLDG_TOP,
  ...PARKING_HEALTH_CTR_TOP,
  ...PARKING_MAIN_BLDG_BOTTOM,
  ...PARKING_HEALTH_CTR_BOTTOM
];

// 하위 호환용
export const PARKING_TOP_SPOTS = [...PARKING_MAIN_BLDG_TOP, ...PARKING_HEALTH_CTR_TOP];
export const PARKING_BOTTOM_SPOTS = [...PARKING_MAIN_BLDG_BOTTOM, ...PARKING_HEALTH_CTR_BOTTOM];
