
import React, { useState } from 'react';
import { Vehicle } from '../types';
import { Info, Map as MapIcon, ChevronRight, CornerDownRight, Layers } from 'lucide-react';
import { STATUS_COLORS } from '../constants';

interface YardMapProps {
  vehicles: Vehicle[];
}

const YardMap: React.FC<YardMapProps> = ({ vehicles }) => {
  const areas = ['A', 'B', 'C', 'D', 'E', 'F'];
  const [selectedCell, setSelectedCell] = useState<{ area: string; row: number } | null>(null);

  const getVehiclesInCell = (area: string, row: number) => {
    return vehicles.filter(v => v.locationCode.startsWith(`${area}-${row.toString().padStart(2, '0')}`));
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div>
          <h2 className="text-5xl font-black tracking-tighter text-slate-900">Spatial Topology</h2>
          <p className="text-slate-400 text-lg font-medium mt-2">ヤード内の密度と車両分布のデジタルツイン</p>
        </div>
        <div className="bg-white p-3 rounded-[32px] border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-4 py-2 bg-slate-50 rounded-[18px]">
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-[18px]">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Lot</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <div className="xl:col-span-8 bg-white p-12 lg:p-16 rounded-[60px] border border-slate-100 shadow-2xl shadow-slate-200/50">
          <div className="grid grid-cols-6 gap-8">
            {areas.map(area => (
              <div key={area} className="space-y-8">
                <div className="text-center group">
                  <span className="text-3xl font-black text-slate-200 group-hover:text-slate-900 transition-colors duration-500">
                    {area}
                  </span>
                  <div className="h-1 w-8 bg-blue-500 mx-auto mt-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(row => {
                    const cellVehicles = getVehiclesInCell(area, row);
                    const isSelected = selectedCell?.area === area && selectedCell?.row === row;
                    const occupancyColor = cellVehicles.length > 2 ? 'bg-slate-900 text-white shadow-2xl' : cellVehicles.length > 0 ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300';
                    
                    return (
                      <button
                        key={`${area}-${row}`}
                        onClick={() => setSelectedCell({ area, row })}
                        className={`
                          group w-full aspect-[4/5] rounded-[28px] border-2 transition-all duration-700 p-4 flex flex-col justify-between relative overflow-hidden
                          ${isSelected ? 'border-blue-500 scale-110 z-20 shadow-2xl' : 'border-transparent hover:border-slate-100 hover:scale-[1.05]'}
                          ${occupancyColor}
                        `}
                      >
                        <span className={`text-[10px] font-black opacity-30 uppercase tracking-[0.2em]`}>{row.toString().padStart(2, '0')}</span>
                        <div className="flex-1 flex items-center justify-center">
                           <span className="text-3xl font-black tracking-tighter">
                            {cellVehicles.length > 0 ? cellVehicles.length : ''}
                          </span>
                        </div>
                        <div className="flex gap-1 justify-center">
                          {cellVehicles.slice(0, 3).map(v => (
                            <div key={v.id} className="w-1 h-1 rounded-full bg-white opacity-40" />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel Detail */}
        <div className="xl:col-span-4">
          <div className="bg-slate-900 rounded-[60px] p-12 text-white h-full relative overflow-hidden shadow-2xl shadow-slate-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32"></div>
            {selectedCell ? (
              <div className="animate-in fade-in slide-in-from-right-10 duration-700 ease-out h-full flex flex-col">
                <div className="mb-14">
                  <div className="flex items-center space-x-2 mb-4 text-blue-500">
                    <Layers size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sector Metadata</span>
                  </div>
                  <h3 className="text-6xl font-black tracking-tighter leading-none">{selectedCell.area}<span className="text-blue-500">.</span>{selectedCell.row.toString().padStart(2, '0')}</h3>
                  <div className="mt-6 flex items-center space-x-4">
                    <div className="px-4 py-2 bg-white/10 rounded-2xl text-xs font-black">{getVehiclesInCell(selectedCell.area, selectedCell.row).length} Assets</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Slot</div>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4 overflow-y-auto pr-4 custom-scrollbar">
                  {getVehiclesInCell(selectedCell.area, selectedCell.row).map(v => (
                    <div key={v.id} className="group p-6 rounded-[32px] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-black text-[10px] text-blue-400 tracking-[0.2em] uppercase">{v.controlNumber}</span>
                        <CornerDownRight size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <div className="text-xl font-black tracking-tight line-clamp-1">{v.carName}</div>
                      <div className="mt-4 flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span>{v.destination}</span>
                        <div className={`px-2 py-1 rounded-lg bg-white/5 ${STATUS_COLORS[v.status].split(' ')[2]}`}>
                           {v.status}
                        </div>
                      </div>
                    </div>
                  ))}
                  {getVehiclesInCell(selectedCell.area, selectedCell.row).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-600 text-center">
                       <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                         <Info size={24} />
                       </div>
                       <p className="text-xs font-black uppercase tracking-widest">Empty Grid Section</p>
                    </div>
                  )}
                </div>
                
                <button className="mt-10 w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[28px] font-black uppercase text-[11px] tracking-[0.3em] transition-all shadow-2xl shadow-blue-900/40 hover:scale-[1.02] active:scale-95">
                  Launch Asset Inspector
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <div className="w-32 h-32 bg-white/5 rounded-[48px] flex items-center justify-center mb-10 border border-white/10">
                  <MapIcon size={48} className="text-slate-700" strokeWidth={1} />
                </div>
                <h3 className="text-2xl font-black tracking-tighter mb-4">Select Grid Section</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed uppercase tracking-widest">
                  Tap any yard lot to inspect real-time unit distributions and technical specifications.
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
