
import React from 'react';
import { Vehicle } from '../types';
import { YARD_COLS, YARD_ROWS } from '../constants';
import { MapPin, Info } from 'lucide-react';

interface YardMapProps {
  vehicles: Vehicle[];
  highlightedVin?: string;
}

const YardMap: React.FC<YardMapProps> = ({ vehicles, highlightedVin }) => {
  const highlightedVehicle = vehicles.find(v => v.VIN === highlightedVin);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900">Interactive Map</h2>
          <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-xs">Yard Visualization</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-200 border border-slate-300 rounded-full"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-rose-500 uppercase">Target Unit</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Grid Map */}
        <div className="lg:col-span-8 bg-slate-900 p-8 md:p-12 rounded-[60px] shadow-2xl relative">
          <div className="grid grid-cols-11 gap-2 md:gap-4">
            {/* Corner label */}
            <div className="h-10"></div>
            {/* Column labels A-J */}
            {YARD_COLS.map(col => (
              <div key={col} className="h-10 flex items-center justify-center text-slate-500 font-black text-xs">{col}</div>
            ))}

            {YARD_ROWS.map(row => (
              <React.Fragment key={row}>
                {/* Row label 1-10 */}
                <div className="flex items-center justify-center text-slate-500 font-black text-xs w-8">{row}</div>
                {YARD_COLS.map(col => {
                  const zoneCode = `${col}-${row}`;
                  const vehicleInSlot = vehicles.find(v => v.Zone === zoneCode);
                  const isHighlighted = highlightedVehicle?.Zone === zoneCode;
                  
                  return (
                    <div 
                      key={zoneCode}
                      className={`
                        aspect-square rounded-lg md:rounded-xl border transition-all duration-500 relative flex items-center justify-center group
                        ${isHighlighted ? 'bg-rose-500 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)] z-10 scale-110' : 
                          vehicleInSlot ? 'bg-blue-600/20 border-blue-500/30 hover:bg-blue-600/40' : 'bg-white/5 border-white/10 hover:border-white/20'}
                      `}
                    >
                      {isHighlighted ? (
                        <MapPin className="text-white animate-bounce" size={16} />
                      ) : vehicleInSlot ? (
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      ) : null}
                      
                      {/* Tooltip on hover */}
                      {vehicleInSlot && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-white text-slate-900 rounded-xl shadow-2xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 pointer-events-none">
                          {vehicleInSlot.ModelOfCar} ({vehicleInSlot.VIN.slice(-4)})
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Selected Unit Details / Guide */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-50 rounded-2xl"><Info className="text-blue-600" size={20} /></div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Search Result</h3>
            </div>

            {highlightedVehicle ? (
              <div className="flex-1 space-y-6 animate-in slide-in-from-right duration-500">
                <div className="bg-slate-50 rounded-[32px] p-8">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Target Location</span>
                  <h4 className="text-6xl font-black text-slate-900 tracking-tighter mt-2">Zone {highlightedVehicle.Zone}</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model / Name</p>
                    <p className="text-lg font-black text-slate-900">{highlightedVehicle.Automaker} {highlightedVehicle.ModelOfCar}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full VIN</p>
                      <p className="font-mono font-bold text-slate-700">{highlightedVehicle.VIN}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company</p>
                      <p className="font-bold text-slate-700">{highlightedVehicle.CompanyName}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                    "最後にこのゾーンで確認されました。探す前に、まずこのグリッド周辺を重点的に確認してください。"
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                <MapPin size={64} strokeWidth={1} className="text-slate-300 mb-6" />
                <p className="text-sm font-bold text-slate-500">
                  検索窓から車両を選択すると、<br/>ヤード内の位置がマップ上に表示されます。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YardMap;