
import { VehicleStatus, YardZone, Vehicle } from './types';

export const STATUS_COLORS: Record<VehicleStatus, string> = {
  [VehicleStatus.INVENTORY]: 'bg-white border-slate-300 text-slate-700',
  [VehicleStatus.OUTBOUND_SCHEDULED]: 'bg-yellow-400 border-yellow-500 text-yellow-900',
  [VehicleStatus.BANNING_WAIT]: 'bg-red-500 border-red-600 text-white',
  [VehicleStatus.DOCS_COMPLETE]: 'bg-green-500 border-green-600 text-white',
};

export const YARD_ZONES: YardZone[] = [
  { id: '1', name: '入庫ゾーン', description: '新規入庫車両の一時置き場', color: 'blue' },
  { id: '2', name: '在庫保管ゾーン', description: 'メインの保管場所（心臓部）', color: 'emerald' },
  { id: '3', name: '出庫準備ゾーン', description: '書類OK・バンニング待ち', color: 'amber' },
  { id: '4', name: '不動・要整備ゾーン', description: '故障車・修理待ち', color: 'rose' },
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: '1',
    controlNumber: 'MGT-001',
    carName: 'トヨタ プリウス',
    vin: 'ZVW50-1234567',
    locationCode: 'A-03-12',
    destination: 'ニュージーランド',
    status: VehicleStatus.INVENTORY,
    arrivalDate: '2025-02-10',
    color: '白',
    companyName: 'AAジャパン',
    remarks: 'バッテリー良好'
  },
  {
    id: '2',
    controlNumber: 'MGT-002',
    carName: '日産 リーフ',
    vin: 'ZE1-9876543',
    locationCode: 'B-01-05',
    destination: 'ドバイ',
    status: VehicleStatus.BANNING_WAIT,
    arrivalDate: '2025-02-12',
    color: '青',
    companyName: '自社在庫',
    remarks: '左ドア傷あり'
  },
  {
    id: '3',
    controlNumber: 'MGT-003',
    carName: 'ホンダ フィット',
    vin: 'GK3-1122334',
    locationCode: 'C-05-20',
    destination: 'ケニア',
    status: VehicleStatus.OUTBOUND_SCHEDULED,
    arrivalDate: '2025-02-14',
    color: '赤',
    companyName: '他社委託',
    remarks: 'タイヤ交換済み'
  },
  {
    id: '4',
    controlNumber: 'MGT-004',
    carName: 'トヨタ アルファード',
    vin: 'ANH20-5566778',
    locationCode: 'A-01-01',
    destination: 'タイ',
    status: VehicleStatus.DOCS_COMPLETE,
    arrivalDate: '2025-02-15',
    color: 'パール',
    companyName: '自社在庫',
    remarks: '高級グレード'
  }
];
