import type { Vehicle } from './types';
import { YARD_COLS, YARD_ROWS } from './constants.ts';

/**
 * ヤードのゾーン表記（例: "A-4"）が正しい形式かつ実在する範囲内かを判定する。
 * 列は YARD_COLS、行は YARD_ROWS の範囲に収まっている必要がある。
 */
export const isValidZone = (zone: string | undefined | null): boolean => {
  const match = /^([A-J])-(\d+)$/.exec(zone || '');
  if (!match) return false;
  const [, col, rowStr] = match;
  const row = Number(rowStr);
  return YARD_COLS.includes(col) && YARD_ROWS.includes(row);
};

/** 車両がヤードに未配置（ゾーン未設定または不正な形式）かを判定する */
export const isUnassigned = (vehicle: Pick<Vehicle, 'Zone'>): boolean =>
  !isValidZone(vehicle.Zone);

/**
 * 車両リストへの upsert。
 * id が既存なら置換（配置割り当て・更新）、なければ先頭に追加（新規登録）する。
 */
export const upsertVehicle = (vehicles: Vehicle[], vehicle: Vehicle): Vehicle[] => {
  const exists = vehicles.some(v => v.id === vehicle.id);
  return exists
    ? vehicles.map(v => (v.id === vehicle.id ? vehicle : v))
    : [vehicle, ...vehicles];
};

const DOCUMENT_LABELS: Record<string, string> = {
  OK: '準備済み',
  Pending: '確認待ち',
  Missing: '不足',
};

/** 書類ステータスの保存値（OK/Pending/Missing等）を日本語表示ラベルへ変換する */
export const documentLabel = (status: string): string => DOCUMENT_LABELS[status] || status;

/** 書類ステータスを「書類：〜」形式のラベルに変換する（詳細画面など見出し併記向け） */
export const documentLabelWithPrefix = (status: string): string => `書類：${documentLabel(status)}`;

const DOCUMENT_TONE_CLASSES: Record<string, string> = {
  OK: 'bg-success-bg text-success-text',
  Pending: 'bg-warning-bg text-warning-text',
  Missing: 'bg-danger-bg text-danger-text',
};

/** 書類ステータスに応じた配色クラス（Tailwind）を返す。未知の値は注意色扱い */
export const documentToneClass = (status: string): string => DOCUMENT_TONE_CLASSES[status] || DOCUMENT_TONE_CLASSES.Missing;
