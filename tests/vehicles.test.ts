import { test } from 'node:test';
import assert from 'node:assert/strict';
import { upsertVehicle } from '../src/utils.ts';
import type { Vehicle } from '../src/types.ts';

const vehicle = (id: string, Zone = ''): Vehicle => ({
  id, Zone, DateOfReceipt: '', CompanyName: 'Owner', Automaker: 'Toyota',
  ModelOfCar: 'Prius', VIN: `VIN-${id}`, Year: '2020', Color: 'White',
  NumberPlate: '', Destination: '', Document: 'Pending', ShippingDate: '', Note: '',
});

test('assigning an existing vehicle updates its zone without increasing inventory', () => {
  const original = [vehicle('existing'), vehicle('other', 'B-2')];
  const assigned = { ...original[0], Zone: 'A-4' };
  const result = upsertVehicle(original, assigned);
  assert.equal(result.length, 2);
  assert.deepEqual(result, [assigned, original[1]]);
  assert.equal(original[0].Zone, '');
});

test('new registration adds a vehicle before existing inventory', () => {
  const original = [vehicle('existing', 'A-4')];
  const registered = vehicle('new', 'C-3');
  assert.deepEqual(upsertVehicle(original, registered), [registered, ...original]);
  assert.equal(original.length, 1);
});
