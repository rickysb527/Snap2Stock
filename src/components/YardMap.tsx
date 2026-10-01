
import React from 'react';
import { Vehicle } from '../types';
import { YARD_COLS, YARD_ROWS } from '../constants';

interface YardMapProps {
  vehicles: Vehicle[];
  selectedZone?: string;
  onZoneSelect?: (zone: string) => void;
}

const YardMap: React.FC<YardMapProps> = ({ vehicles, selectedZone, onZoneSelect }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-5 flex-wrap text-xs text-ink-muted">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-page border border-line rounded-sm" aria-hidden="true"></span>
          空き
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-selected border border-primary/30 rounded-sm" aria-hidden="true"></span>
          使用中
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-primary rounded-sm" aria-hidden="true"></span>
          選択中
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-grid grid-cols-[32px_repeat(10,minmax(56px,1fr))] gap-1.5 min-w-[640px]">
          <div></div>
          {YARD_COLS.map(col => (
            <div key={col} className="h-6 flex items-center justify-center text-ink-muted text-xs font-medium">{col}</div>
          ))}

          {YARD_ROWS.map(row => (
            <React.Fragment key={row}>
              <div className="flex items-center justify-center text-ink-muted text-xs font-medium">{row}</div>
              {YARD_COLS.map(col => {
                const zoneCode = `${col}-${row}`;
                const vehicleInSlot = vehicles.find(v => v.Zone === zoneCode);
                const isSelected = selectedZone === zoneCode;
                const label = vehicleInSlot
                  ? `${zoneCode}、${vehicleInSlot.Automaker} ${vehicleInSlot.ModelOfCar}、使用中`
                  : `${zoneCode}、空き`;

                return (
                  <button
                    key={zoneCode}
                    type="button"
                    onClick={() => onZoneSelect?.(zoneCode)}
                    aria-pressed={isSelected}
                    aria-label={label}
                    className={`aspect-square rounded-control border text-[10px] font-medium flex flex-col items-center justify-center leading-tight p-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary
                      ${isSelected
                        ? 'bg-primary border-primary text-white'
                        : vehicleInSlot
                          ? 'bg-selected border-primary/30 text-primary hover:bg-primary/20'
                          : 'bg-page border-line text-ink-muted hover:border-ink-muted'}
                    `}
                  >
                    {vehicleInSlot ? (
                      <>
                        <span className="truncate w-full text-center">{vehicleInSlot.ModelOfCar}</span>
                        <span className="truncate w-full text-center opacity-80">{vehicleInSlot.VIN.slice(-4)}</span>
                      </>
                    ) : null}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YardMap;
