
import { Vehicle } from './types';

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: '1',
    Zone: 'A-4',
    DateOfReceipt: '2025-02-10',
    CompanyName: 'AA Japan',
    Automaker: 'Toyota',
    ModelOfCar: 'Prius',
    VIN: 'ZVW50-1234567',
    Year: '2018',
    Color: 'White',
    NumberPlate: '品川 300 あ 1234',
    Destination: 'Kenya',
    Document: 'OK',
    ShippingDate: new Date().toISOString().split('T')[0], // Set to today for demo
    Note: 'Battery Check required'
  },
  {
    id: '2',
    Zone: 'C-2',
    DateOfReceipt: '2025-02-12',
    CompanyName: 'Self Stock',
    Automaker: 'Nissan',
    ModelOfCar: 'Leaf',
    VIN: 'ZE1-9876543',
    Year: '2020',
    Color: 'Blue',
    NumberPlate: '横浜 500 い 5678',
    Destination: 'Dubai',
    Document: 'Pending',
    ShippingDate: '2025-03-15',
    Note: 'Left door scratch'
  }
];

export const YARD_COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const YARD_ROWS = Array.from({ length: 10 }, (_, i) => i + 1);