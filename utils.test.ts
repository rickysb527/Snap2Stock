import { describe, it, expect } from 'vitest';
import { Vehicle } from './types';
import { isValidZone, isUnassigned, upsertVehicle } from './utils';

const makeVehicle = (overrides: Partial<Vehicle> = {}): Vehicle => ({
  id: 'v1',
  Zone: 'A-1',
  DateOfReceipt: '2025-01-01',
  CompanyName: 'ACME',
  Automaker: 'Toyota',
  ModelOfCar: 'Prius',
  VIN: 'ZVW50-0000001',
  Year: '2020',
  Color: 'White',
  NumberPlate: '品川 300 あ 1234',
  Destination: 'Kenya',
  Document: 'OK',
  ShippingDate: '2025-02-01',
  Note: '',
  ...overrides,
});

describe('isValidZone', () => {
  it('正しいゾーン表記を許可する', () => {
    expect(isValidZone('A-1')).toBe(true);
    expect(isValidZone('J-10')).toBe(true);
  });

  it('不正なゾーン表記を弾く', () => {
    expect(isValidZone('')).toBe(false);
    expect(isValidZone(undefined)).toBe(false);
    expect(isValidZone(null)).toBe(false);
    expect(isValidZone('K-1')).toBe(false); // 範囲外の列
    expect(isValidZone('A1')).toBe(false); // ハイフンなし
    expect(isValidZone('a-1')).toBe(false); // 小文字
  });

  it('行番号がヤードの範囲(1-10)外なら弾く', () => {
    expect(isValidZone('A-0')).toBe(false);
    expect(isValidZone('A-11')).toBe(false);
    expect(isValidZone('A-99')).toBe(false);
  });
});

describe('isUnassigned', () => {
  it('ゾーンが未設定・不正なら未配置とみなす', () => {
    expect(isUnassigned({ Zone: '' })).toBe(true);
    expect(isUnassigned({ Zone: 'invalid' })).toBe(true);
  });

  it('正しいゾーンなら配置済みとみなす', () => {
    expect(isUnassigned({ Zone: 'B-3' })).toBe(false);
  });
});

describe('upsertVehicle', () => {
  it('新規車両は先頭に追加する', () => {
    const existing = [makeVehicle({ id: 'v1' })];
    const added = makeVehicle({ id: 'v2', Zone: 'B-2' });
    const result = upsertVehicle(existing, added);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('v2');
    expect(result[1].id).toBe('v1');
  });

  it('既存 id の車両は置換する（配置割り当て・更新）', () => {
    const existing = [
      makeVehicle({ id: 'v1', Zone: '' }), // 未配置
      makeVehicle({ id: 'v2', Zone: 'C-3' }),
    ];
    const assigned = makeVehicle({ id: 'v1', Zone: 'D-4' }); // ゾーンを割り当て
    const result = upsertVehicle(existing, assigned);

    expect(result).toHaveLength(2); // 件数は増えない
    expect(result.find(v => v.id === 'v1')?.Zone).toBe('D-4');
    expect(result.find(v => v.id === 'v2')?.Zone).toBe('C-3'); // 他は不変
  });

  it('元の配列を破壊しない', () => {
    const existing = [makeVehicle({ id: 'v1' })];
    upsertVehicle(existing, makeVehicle({ id: 'v2' }));
    expect(existing).toHaveLength(1);
  });
});
