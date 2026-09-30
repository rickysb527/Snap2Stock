
import React from 'react';
import { Vehicle } from '../types';
import { isUnassigned as isVehicleUnassigned } from '../utils';
import { 
  ArrowLeft, MapPin, Calendar, Printer, 
  FileCheck, Tag, Info, Building2, 
  Hash, Ship, Clock, Trash2, MapIcon
} from 'lucide-react';

interface VehicleDetailProps {
  vehicle: Vehicle;
  onBack: () => void;
  onDelete: (id: string) => void;
  onStartAssignment: (vehicle: Vehicle) => void;
}

const VehicleDetail: React.FC<VehicleDetailProps> = ({ vehicle, onBack, onDelete, onStartAssignment }) => {
  const isUnassigned = isVehicleUnassigned(vehicle);

  const DataRow = ({ icon: Icon, label, value, subValue }: { icon: any, label: string, value: string, subValue?: string }) => (
    <div className="flex items-start gap-6 p-8 rounded-[40px] bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group">
      <div className="p-5 bg-white rounded-2xl shadow-sm text-slate-400 group-hover:text-blue-600 transition-all group-hover:scale-110">
        <Icon size={22} strokeWidth={2.5} />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{label}</p>
        <p className="text-xl font-black text-slate-900 tracking-tight">{value}</p>
        {subValue && <p className="text-[11px] font-bold text-blue-500 mt-2 uppercase tracking-wider">{subValue}</p>}
      </div>
    </div>
  );

  const qrData = `yard-v2:${vehicle.id}|${vehicle.VIN}|${vehicle.Automaker}|${vehicle.ModelOfCar}`;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-right duration-700">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="group flex items-center gap-3 px-8 py-5 bg-white border border-slate-100 rounded-[28px] text-slate-500 font-black text-[11px] uppercase tracking-widest hover:text-slate-900 hover:shadow-2xl transition-all active:scale-95 shadow-sm"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Inventory
        </button>
        <div className="flex gap-4">
          <button 
            onClick={() => onDelete(vehicle.id)}
            className="flex items-center gap-4 px-8 py-5 bg-rose-50 text-rose-500 border border-rose-100 rounded-[28px] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all"
          >
            <Trash2 size={18} />
            Delete Asset
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-4 px-10 py-5 bg-slate-900 text-white rounded-[28px] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all"
          >
            <Printer size={18} />
            Print Label
          </button>
        </div>
      </div>

      {isUnassigned && (
        <div className="bg-amber-50 border border-amber-200 rounded-[40px] p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-amber-500/5 animate-bounce-subtle">
          <div className="flex items-center gap-6">
            <div className="p-6 bg-amber-500 text-white rounded-3xl shadow-lg shadow-amber-500/20">
              <MapIcon size={32} />
            </div>
            <div>
              <h4 className="text-2xl font-black text-amber-900 tracking-tight">ヤード未配置の車両です</h4>
              <p className="text-amber-700/70 font-bold text-sm mt-1">この車両はインポートされましたが、まだマップ上の位置が確定していません。</p>
            </div>
          </div>
          <button 
            onClick={() => onStartAssignment(vehicle)}
            className="w-full md:w-auto px-12 py-6 bg-amber-500 text-white rounded-[24px] font-black uppercase text-[12px] tracking-widest shadow-xl shadow-amber-500/30 hover:bg-amber-600 hover:scale-[1.05] transition-all flex items-center justify-center gap-3"
          >
            <MapPin size={20} />
            ヤードの場所を選択して配置する
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-slate-900 rounded-[60px] p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-60 h-60 bg-blue-500/10 blur-[100px]"></div>
            <div className="relative z-10 text-center">
              <div className="w-56 h-56 bg-white p-5 rounded-[40px] mx-auto mb-12 shadow-2xl rotate-[-3deg]">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrData)}`} 
                  alt="Vehicle QR" 
                  className="w-full h-full"
                />
              </div>
              <h2 className="text-5xl font-black tracking-tighter mb-3 italic">{vehicle.Automaker}</h2>
              <p className="text-blue-400 font-black text-2xl uppercase tracking-[0.2em] mb-10">{vehicle.ModelOfCar}</p>
              <div className="mt-8 pt-10 border-t border-white/10 flex justify-between items-center px-6">
                 <div className="text-left">
                   <p className="text-xs text-slate-400 uppercase font-black tracking-widest">Yard Area</p>
                   <p className="text-4xl font-black text-white tracking-tighter">
                     {isUnassigned ? 'UNASSIGNED' : `Zone ${vehicle.Zone}`}
                   </p>
                 </div>
                 <div className={`p-5 rounded-[24px] shadow-lg ${isUnassigned ? 'bg-slate-700 text-slate-500' : 'bg-blue-600 text-white shadow-blue-500/20'}`}>
                   <MapPin size={32} />
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-[50px] p-10 border border-blue-100/50 shadow-inner">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20"><Info size={20} /></div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight">Status Insight</h4>
            </div>
            <p className="text-base font-bold text-slate-600 leading-relaxed italic">
              "この車両は{vehicle.DateOfReceipt}に入庫されました。現在、{vehicle.Destination}への出荷に向けて{vehicle.Document === 'OK' ? '書類準備が完了しています' : '書類確認中です'}。"
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white rounded-[64px] border border-slate-100 shadow-2xl p-14 lg:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px]"></div>
            <div className="flex items-center gap-5 mb-16">
              <div className="w-3 h-12 bg-blue-600 rounded-full"></div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Technical Passport</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DataRow icon={Hash} label="Full VIN / Chassis ID" value={vehicle.VIN} />
              <DataRow icon={Calendar} label="Manufacture Year" value={vehicle.Year} />
              <DataRow icon={Tag} label="Exterior Color" value={vehicle.Color} />
              <DataRow icon={Clock} label="Date Of Receipt" value={vehicle.DateOfReceipt} />
              <DataRow icon={Building2} label="Contracted Company" value={vehicle.CompanyName} />
              <DataRow icon={Ship} label="Export Destination" value={vehicle.Destination} />
              <DataRow icon={FileCheck} label="Document Status" value={vehicle.Document} subValue="Registry Verified" />
              <DataRow icon={Calendar} label="Shipping Deadline" value={vehicle.ShippingDate} subValue="Estimated Vessel Load" />
            </div>

            <div className="mt-14 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6 mb-4 block">Internal Diagnostics & Notes</label>
              <div className="p-12 bg-slate-50 rounded-[48px] border border-slate-100 min-h-[180px] relative shadow-inner">
                 <p className="text-slate-600 font-bold text-lg leading-relaxed">
                   {vehicle.Note || "車両に関する特記事項はありません。ヤード内での移動履歴はデジタルツインマップで確認可能です。"}
                 </p>
                 <div className="absolute bottom-10 right-10 text-slate-200">
                   <FileCheck size={56} strokeWidth={1} />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;