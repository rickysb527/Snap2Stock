
import React, { useState } from 'react';
import { Vehicle } from '../types';
import { MapPin, ArrowRight, Printer, FileText, QrCode, X as CloseIcon, ChevronRight } from 'lucide-react';

interface InventoryListProps {
  vehicles: Vehicle[];
  onSelectForMap: (vin: string) => void;
  onViewDetail: (id: string) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ vehicles, onSelectForMap, onViewDetail }) => {
  const [selectedQrVehicle, setSelectedQrVehicle] = useState<Vehicle | null>(null);

  const handleOpenQr = (e: React.MouseEvent, v: Vehicle) => {
    e.stopPropagation();
    setSelectedQrVehicle(v);
  };

  const handleSelectMap = (e: React.MouseEvent, vin: string) => {
    e.stopPropagation();
    onSelectForMap(vin);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900">Inventory Registry</h2>
          <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-xs">Full asset list with hybrid identification</p>
        </div>
      </div>

      <div className="bg-white rounded-[48px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-slate-100">
                <th className="px-10 py-8">Model Identifier</th>
                <th className="px-10 py-8">VIN / Year</th>
                <th className="px-10 py-8 text-center">Zone</th>
                <th className="px-10 py-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {vehicles.map(v => (
                <tr 
                  key={v.id} 
                  className="hover:bg-slate-50/50 transition-all group cursor-pointer"
                  onClick={() => onViewDetail(v.id)}
                >
                  <td className="px-10 py-10">
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">{v.Automaker} {v.ModelOfCar}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{v.Color}</span>
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-slate-700">{v.VIN}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">MFG: {v.Year}</span>
                    </div>
                  </td>
                  <td className="px-10 py-10 text-center">
                    <button 
                      onClick={(e) => handleSelectMap(e, v.VIN)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <MapPin size={14} />
                      {v.Zone}
                    </button>
                  </td>
                  <td className="px-10 py-10 text-right">
                    <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={(e) => handleOpenQr(e, v)}
                        className="p-3 text-slate-400 hover:text-blue-600 transition-colors" 
                        title="Show QR Label"
                      >
                        <QrCode size={18} />
                      </button>
                      <button 
                        onClick={() => onViewDetail(v.id)}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl"
                      >
                        Details
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Modal Overlay */}
      {selectedQrVehicle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setSelectedQrVehicle(null)}></div>
          <div className="relative bg-white rounded-[48px] p-12 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <button 
              onClick={() => setSelectedQrVehicle(null)}
              className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <CloseIcon size={24} />
            </button>
            <div className="text-center">
              <h3 className="text-2xl font-black text-slate-900 mb-10">Asset QR Label</h3>
              <div className="bg-slate-50 p-8 rounded-[40px] border-2 border-dashed border-slate-200 mb-10">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`yard-v2:${selectedQrVehicle.id}|${selectedQrVehicle.VIN}|${selectedQrVehicle.Automaker}|${selectedQrVehicle.ModelOfCar}`)}`} 
                  alt="QR"
                  className="mx-auto mb-4 bg-white p-4 shadow-xl rounded-2xl"
                />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedQrVehicle.VIN}</p>
              </div>
              <button onClick={() => window.print()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                <Printer size={16} /> Print Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryList;