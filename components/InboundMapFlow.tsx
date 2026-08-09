
import React, { useState } from 'react';
import { Vehicle } from '../types';
import { YARD_COLS, YARD_ROWS } from '../constants';
import { Plus, CheckCircle2, X as CloseIcon } from 'lucide-react';
import VehicleForm from './VehicleForm';

interface InboundMapFlowProps {
  vehicles: Vehicle[];
  onInboundComplete: (v: Vehicle) => void;
  // 既存の未配置車両にゾーンを割り当てる場合に渡される
  presetVehicle?: Vehicle;
}

const InboundMapFlow: React.FC<InboundMapFlowProps> = ({ vehicles, onInboundComplete, presetVehicle }) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSlotClick = (zone: string) => {
    const existing = vehicles.find(v => v.Zone === zone);
    if (existing) {
      alert(`${zone} は既に使用されています。`);
      return;
    }
    setSelectedSlot(zone);
  };

  const handleFinalClose = () => {
    setShowForm(false);
    setSelectedSlot(null);
  };

  if (showForm && selectedSlot) {
    return (
      <div className="animate-in slide-in-from-bottom-10 duration-700">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={handleFinalClose}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
          >
            <CloseIcon size={14} /> Cancel and Back to Map
          </button>
          <div className="bg-blue-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase shadow-lg shadow-blue-500/20">
            Target Slot: {selectedSlot}
          </div>
        </div>
        <VehicleForm
          initialZone={selectedSlot}
          vehicles={vehicles}
          presetVehicle={presetVehicle}
          onSubmit={(v) => {
            onInboundComplete(v);
          }}
          onClose={handleFinalClose}
        />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-4xl mx-auto">
        <div className="text-left space-y-2">
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">
            {presetVehicle ? 'Assign Yard Slot' : 'Vehicle Registration'}
          </h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
            {presetVehicle
              ? `Select a slot for ${presetVehicle.Automaker} ${presetVehicle.ModelOfCar}`
              : 'Select an available slot to register a new vehicle'}
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-100 border border-slate-200 rounded-full"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-rose-500/40 border border-rose-500/50 rounded-full flex items-center justify-center">
              <div className="w-2 h-0.5 bg-rose-600 rotate-45 scale-50"></div>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-blue-600 uppercase">Selected</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-8 md:p-12 rounded-[60px] shadow-2xl relative max-w-4xl mx-auto border-8 border-white">
        <div className="grid grid-cols-11 gap-2 md:gap-4">
          <div className="h-10"></div>
          {YARD_COLS.map(col => (
            <div key={col} className="h-10 flex items-center justify-center text-slate-500 font-black text-xs">{col}</div>
          ))}

          {YARD_ROWS.map(row => (
            <React.Fragment key={row}>
              <div className="flex items-center justify-center text-slate-500 font-black text-xs w-8">{row}</div>
              {YARD_COLS.map(col => {
                const zoneCode = `${col}-${row}`;
                const occupied = vehicles.find(v => v.Zone === zoneCode);
                const isSelected = selectedSlot === zoneCode;
                
                return (
                  <button 
                    key={zoneCode}
                    onClick={() => handleSlotClick(zoneCode)}
                    className={`
                      aspect-square rounded-lg md:rounded-xl border transition-all duration-300 relative flex items-center justify-center group
                      ${isSelected ? 'bg-blue-600 border-blue-400 z-10 scale-110 shadow-[0_0_20px_rgba(37,99,235,0.6)]' : 
                        occupied ? 'bg-rose-500/20 border-rose-500/30 cursor-not-allowed' : 
                        'bg-white/5 border-white/10 hover:bg-white/20 hover:border-white/30'}
                    `}
                  >
                    {isSelected ? (
                      <CheckCircle2 className="text-white" size={16} />
                    ) : occupied ? (
                      <CloseIcon className="text-rose-500/60" size={14} strokeWidth={3} />
                    ) : (
                      <Plus className="text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-slate-400 font-bold text-sm">
          停車させるヤードのスロットをクリックして、新規登録を開始してください。
        </p>
      </div>

      {selectedSlot && !showForm && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-4 animate-in slide-in-from-bottom-5 duration-500 z-50">
          <div className="bg-white rounded-[32px] p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col items-center gap-6">
            <div className="text-center">
              <h4 className="text-xl font-black text-slate-900">
                {presetVehicle ? `「${selectedSlot}」に配置しますか？` : `「${selectedSlot}」に新規登録しますか？`}
              </h4>
              <p className="text-slate-400 font-bold text-xs mt-1 tracking-widest uppercase">Target slot confirmed</p>
            </div>
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setSelectedSlot(null)}
                className="flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
              >
                No, Back
              </button>
              <button 
                onClick={() => setShowForm(true)}
                className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
              >
                {presetVehicle ? 'Yes, Assign Here' : 'Yes, Start Photo Scan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InboundMapFlow;