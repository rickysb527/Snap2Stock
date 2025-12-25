
import React, { useState, useMemo } from 'react';
import { Vehicle } from '../types';
import { MapPin, Printer, Search, List, Map as MapIcon, QrCode, X as CloseIcon, ChevronRight, Trash2 } from 'lucide-react';
import YardMap from './YardMap';

interface StockViewProps {
  vehicles: Vehicle[];
  onViewDetail: (id: string) => void;
  onDeleteVehicle: (id: string) => void;
}

const StockView: React.FC<StockViewProps> = ({ vehicles, onViewDetail, onDeleteVehicle }) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState({ company: '', automaker: '', model: '', vin: '', query: '' });
  const [highlightedVin, setHighlightedVin] = useState<string | undefined>();
  const [selectedQrVehicle, setSelectedQrVehicle] = useState<Vehicle | null>(null);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchQuery = !filters.query || `${v.Automaker} ${v.ModelOfCar} ${v.VIN}`.toLowerCase().includes(filters.query.toLowerCase());
      const matchCompany = !filters.company || v.CompanyName.toLowerCase().includes(filters.company.toLowerCase());
      const matchAuto = !filters.automaker || v.Automaker.toLowerCase().includes(filters.automaker.toLowerCase());
      const matchModel = !filters.model || v.ModelOfCar.toLowerCase().includes(filters.model.toLowerCase());
      const matchVin = !filters.vin || v.VIN.toLowerCase().includes(filters.vin.toLowerCase());
      return matchQuery && matchCompany && matchAuto && matchModel && matchVin;
    });
  }, [vehicles, filters]);

  const handleZoneClick = (e: React.MouseEvent, vin: string) => {
    e.stopPropagation();
    setHighlightedVin(vin);
    setViewMode('map');
  };

  const openQrModal = (e: React.MouseEvent, vehicle: Vehicle) => {
    e.stopPropagation();
    setSelectedQrVehicle(vehicle);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteVehicle(id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">Stock List / Yard Map</h2>
          <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-xs">Precision Inventory Management</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-[22px] shadow-inner ml-auto self-start lg:self-center">
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-6 py-3 rounded-[18px] font-black text-[10px] tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <List size={14} /> LIST VIEW
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-6 py-3 rounded-[18px] font-black text-[10px] tracking-widest transition-all ${viewMode === 'map' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <MapIcon size={14} /> INTERACTIVE MAP
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl shadow-slate-200/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type="text" 
                  placeholder="VIN, モデル名, ナンバープレート..."
                  className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-blue-500/20 outline-none transition-all font-bold text-slate-700"
                  onChange={(e) => setFilters({...filters, query: e.target.value})}
                  value={filters.query}
                />
              </div>
              <input 
                type="text" 
                placeholder="会社名"
                className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-blue-500/20 outline-none transition-all font-bold text-slate-700"
                onChange={(e) => setFilters({...filters, company: e.target.value})}
                value={filters.company}
              />
              <input 
                type="text" 
                placeholder="メーカー"
                className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-blue-500/20 outline-none transition-all font-bold text-slate-700"
                onChange={(e) => setFilters({...filters, automaker: e.target.value})}
                value={filters.automaker}
              />
              <div className="flex items-center gap-3 text-slate-400 font-black text-[10px] uppercase px-4 tracking-[0.2em]">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                {filteredVehicles.length} Units
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-slate-100">
                    <th className="px-12 py-10">Asset Details</th>
                    <th className="px-12 py-10">VIN / Plate</th>
                    <th className="px-12 py-10 text-center">Zone</th>
                    <th className="px-12 py-10">Documents</th>
                    <th className="px-12 py-10 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVehicles.map(v => (
                    <tr 
                      key={v.id} 
                      className="hover:bg-slate-50/50 transition-all group cursor-pointer"
                      onClick={() => onViewDetail(v.id)}
                    >
                      <td className="px-12 py-10">
                        <div className="flex flex-col">
                          <span className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">{v.Automaker} {v.ModelOfCar}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{v.Color} | {v.Year}</span>
                        </div>
                      </td>
                      <td className="px-12 py-10">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-slate-700 text-base">{v.VIN}</span>
                          <span className="text-[11px] font-black text-blue-500 uppercase mt-1 tracking-wider">{v.NumberPlate}</span>
                        </div>
                      </td>
                      <td className="px-12 py-10 text-center">
                        <button 
                          onClick={(e) => handleZoneClick(e, v.VIN)}
                          className="inline-flex items-center gap-3 px-6 py-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-[10px] hover:bg-blue-600 hover:text-white transition-all shadow-sm group/btn"
                        >
                          <MapPin size={16} />
                          {v.Zone}
                        </button>
                      </td>
                      <td className="px-12 py-10">
                         <span className={`px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] border shadow-sm ${v.Document === 'OK' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                           Docs: {v.Document}
                         </span>
                      </td>
                      <td className="px-12 py-10 text-right">
                        <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={(e) => openQrModal(e, v)}
                            className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-inner group/qr"
                          >
                            <QrCode size={18} />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(e, v.id)}
                            className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-inner group/trash"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button 
                            onClick={() => onViewDetail(v.id)} 
                            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
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
        </div>
      ) : (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <YardMap vehicles={filteredVehicles} highlightedVin={highlightedVin} />
        </div>
      )}

      {/* Quick QR View Modal */}
      {selectedQrVehicle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setSelectedQrVehicle(null)}></div>
          <div className="relative bg-white rounded-[60px] p-16 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <button 
              onClick={() => setSelectedQrVehicle(null)}
              className="absolute top-10 right-10 p-2 text-slate-300 hover:text-slate-900 transition-colors"
            >
              <CloseIcon size={28} />
            </button>
            
            <div className="text-center">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Vehicle Asset Label</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-12 italic">
                {selectedQrVehicle.Automaker} {selectedQrVehicle.ModelOfCar}
              </h3>
              
              <div className="bg-slate-50 p-10 rounded-[48px] border-2 border-dashed border-slate-200 mb-12">
                <div className="bg-white p-6 rounded-[32px] shadow-2xl inline-block mb-8 rotate-[-2deg]">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`yard-v2:${selectedQrVehicle.id}|${selectedQrVehicle.VIN}|${selectedQrVehicle.Automaker}|${selectedQrVehicle.ModelOfCar}`)}`} 
                    alt="QR"
                    className="w-48 h-48"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">VIN / Chassis</p>
                  <p className="text-base font-bold text-slate-900 font-mono tracking-tight">{selectedQrVehicle.VIN}</p>
                </div>
              </div>

              <button 
                onClick={() => window.print()}
                className="w-full py-6 bg-slate-900 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl hover:bg-blue-600 transition-all active:scale-95"
              >
                <Printer size={20} /> Print Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockView;