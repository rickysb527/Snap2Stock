import type { Vehicle } from './types';

/** 配置済みの更新では同じIDを置換し、新規登録では先頭に追加する。 */
export function upsertVehicle(vehicles: Vehicle[], vehicle: Vehicle): Vehicle[] {
  return vehicles.some(existing => existing.id === vehicle.id)
    ? vehicles.map(existing => existing.id === vehicle.id ? vehicle : existing)
    : [vehicle, ...vehicles];
}
