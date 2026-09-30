
import React from 'react';
import { Vehicle } from '../types';
import { ArrowLeft, Clock, MapPin, ArrowRight, CheckCircle } from 'lucide-react';

interface TodayOutboundListProps {
  vehicles: Vehicle[];
  onViewDetail: (id: string) => void;
  onBack: () => void;
  onDeleteVehicle: (id: string) => void;
}

const TodayOutboundList: React.FC<TodayOutboundListProps> = ({ vehicles, onViewDetail, onBack, onDeleteVehicle }) => {
  const today = new Date().toISOString().split('T')[0];
  const outboundToday = vehicles.filter(v => v.ShippingDate === today);

  const handleCompleteShipment = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteVehicle(id);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-left duration-700">
      <div className="flex items-center justify-between">
        <div>
          <button 
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={12} /> Dashboard
          </button>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-4">
            Today's Outbound Schedule
            <span className="text-sm bg-amber-100 text-amber-600 px-4 py-1 rounded-full uppercase tracking-widest">{today}</span>
          </h2>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-xs">Total {outboundToday.length} units flagged for shipping today</p>
        </div>
      </div>

      {outboundToday.length === 0 ? (
        <div className="bg-slate-50 rounded-[48px] p-20 text-center border-2 border-dashed border-slate-200">
          <Clock className="mx-auto text-slate-300 mb-6" size={64} />
          <h3 className="text-xl font-black text-slate-900">本日出荷予定の車両はありません</h3>
          <p className="text-slate-400 font-medium mt-2">すべての出荷予定車両が処理済みか、スケジュールがありません。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {outboundToday.map(v => (
            <div key={v.id} className="bg-white rounded-[40px] border border-slate-100 shadow-xl p-8 hover:scale-[1.02] transition-all group cursor-pointer" onClick={() => onViewDetail(v.id)}>
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-xs flex items-center gap-2">
                  <MapPin size={14} />
                  Zone {v.Zone}
                </div>
                <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                  <Clock size={18} />
                </div>
              </div>
              
              <div className="space-y-1 mb-8">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">{v.Automaker} {v.ModelOfCar}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{v.VIN}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Destination</span>
                  <span className="text-sm font-black text-slate-900">{v.Destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Owner</span>
                  <span className="text-sm font-black text-slate-900">{v.CompanyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Documents</span>
                  <span className={`text-sm font-black ${v.Document === 'OK' ? 'text-emerald-500' : 'text-rose-500'}`}>{v.Document}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={(e) => handleCompleteShipment(e, v.id)}
                  className="flex-1 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                >
                  <CheckCircle size={14} /> Complete
                </button>
                <button 
                  onClick={() => onViewDetail(v.id)}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 group-hover:bg-blue-600 transition-colors"
                >
                  View <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayOutboundList;