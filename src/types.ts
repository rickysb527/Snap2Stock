
export enum VehicleStatus {
  INVENTORY = 'Inventory',
  SHIPPED = 'Shipped',
  MAINTENANCE = 'Maintenance',
  PENDING = 'Pending'
}

export interface Vehicle {
  id: string;
  Zone: string; // e.g., "A-4"
  DateOfReceipt: string;
  CompanyName: string;
  Automaker: string;
  ModelOfCar: string;
  VIN: string;
  Year: string;
  Color: string;
  NumberPlate: string;
  Destination: string;
  Document: string;
  ShippingDate: string;
  Note: string;
}

export interface MasterDataState {
  isInitialized: boolean;
  lastSync: string;
}