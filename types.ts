
export enum VehicleStatus {
  INVENTORY = '在庫',
  OUTBOUND_SCHEDULED = '出庫予定',
  BANNING_WAIT = 'バンニング待ち',
  DOCS_COMPLETE = '書類完了'
}

export interface Vehicle {
  id: string;
  controlNumber: string;
  carName: string;
  vin: string;
  locationCode: string; // e.g., A-03-12
  destination: string;
  status: VehicleStatus;
  containerNumber?: string;
  arrivalDate: string;
  color: string;
  companyName: string;
  remarks: string;
}

export interface YardZone {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface LocationParts {
  area: string;
  row: string;
  number: string;
}
