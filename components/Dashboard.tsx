
import React from 'react';
import { Vehicle, VehicleStatus } from '../types';
import { STATUS_COLORS, YARD_ZONES } from '../constants';
// Added PlusCircle and ChevronRight to imports
import { ArrowRight, Car, MapPin, Package, FileCheck, TrendingUp, Zap, Clock, PlusCircle, ChevronRight } from 'lucide-react';

interface DashboardProps {
  vehicles: Vehicle[];
  onViewAll: () => void;
  onViewMap: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ vehicles, onViewAll, onViewMap }) => {
  const stats = [
    { label: '総車両在庫', value: vehicles.length, icon: Car, color: 'text-blue-600', bg: 'bg-blue-50', glow: 'shadow-blue-200' },
    { label: 'バンニング待ち', value: vehicles.filter(v => v.status === VehicleStatus.BANNING_WAIT).length, icon: Package, color: 'text-rose-600', bg: 'bg-rose-50', glow: 'shadow-rose-200' },
    { label: '出庫予定', value: vehicles.filter(v => v.status === VehicleStatus.OUTBOUND_SCHEDULED).length, icon: MapPin, color: 'text-amber-600', bg: 'bg-amber-50', glow: 'shadow-amber-200' },
    { label: '書類完了', value: vehicles.filter(v => v.status === VehicleStatus.DOCS_COMPLETE).length, icon: FileCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', glow: 'shadow-emerald-200' },
  ];

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-200">System Live</div>
            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-slate-900 mb-3">Inventory Insights</h2>
          <p className="text-slate-400 text-lg font-medium">ヤードオペレーションの統合モニタリングパネル</p>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onViewMap} className="px-8 py-5 bg-white border border-slate-100 rounded-[28px] text-slate-600 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200/50 hover:bg-slate-50 transition-all flex items-center space-x-3 active:scale-95">
            <Zap size={16} className="text-blue-500" />
            <span>Interactive Map</span>
          </button>
          <button onClick={onViewAll} className="px-10 py-5 bg-slate-900 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-300 hover:bg-black transition-all flex items-center space-x-3 btn-glow active:scale-95">
            <span>Manage All Units</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="group relative bg-white p-8 rounded-[44px] border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:shadow-slate-200 hover:translate-y-[-4px] transition-all duration-700 overflow-hidden">
            <div className={`absolute -right-8 -bottom-8 w-40 h-40 ${stat.bg} rounded-full opacity-0 group-hover:opacity-40 transition-opacity blur-3xl`}></div>
            <div className="flex items-start justify-between relative z-10">
              <div className={`p-5 rounded-[24px] ${stat.bg} ${stat.color} shadow-lg ${stat.glow} group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon size={28} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-5xl font-black tracking-tighter text-slate-900">{stat.value}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{stat.label}</span>
              </div>
            </div>
            <div className="mt-8 flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">
              <Clock size={12} className="mr-2" />
              <span>Real-time update</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Distribution Map */}
        <div className="xl:col-span-8 bg-slate-50 rounded-[60px] p-10 lg:p-14 border border-slate-100/50">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Zone Utilization</h3>
              <p className="text-slate-400 font-bold text-sm mt-1">ヤード収容能力の可視化</p>
            </div>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="w-10 h-10 rounded-full bg-white border-4 border-slate-50 flex items-center justify-center font-black text-[10px] text-slate-400 shadow-sm">{n}</div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {YARD_ZONES.map((zone) => {
              const count = vehicles.filter(v => {
                if (zone.id === '1') return v.locationCode.startsWith('A');
                if (zone.id === '2') return v.locationCode.startsWith('B') || v.locationCode.startsWith('C');
                if (zone.id === '3') return v.status === VehicleStatus.BANNING_WAIT;
                if (zone.id === '4') return v.remarks.toLowerCase().includes('修理') || v.remarks.toLowerCase().includes('不動');
                return false;
              }).length;
              const percentage = Math.min(100, Math.round((count / (vehicles.length || 1)) * 100 * 1.5)); // Exaggerate for visual
              
              return (
                <div key={zone.id} className="group bg-white p-8 rounded-[40px] border border-slate-100/50 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-700">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ring-8 ring-${zone.color}-50 bg-${zone.color}-500 group-hover:animate-ping`} />
                      <span className="font-black text-slate-900 tracking-tight">{zone.name}</span>
                    </div>
                    <span className="text-2xl font-black text-slate-900">{count} <span className="text-xs text-slate-300">units</span></span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Live Capacity</span>
                      <span className={`text-${zone.color}-500`}>{percentage}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden p-0.5">
                      <div 
                        className={`h-full bg-${zone.color}-500 rounded-full transition-all duration-1000 ease-out`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Panel */}
        <div className="xl:col-span-4 space-y-8">
          <div className="bg-slate-900 rounded-[56px] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 blur-[80px]"></div>
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6">Quick Actions</h4>
            <div className="space-y-5">
              {[
                { label: 'Register New Batch', icon: PlusCircle },
                { label: 'Export Logistics Report', icon: FileCheck },
                { label: 'Real-time Yard Sync', icon: Zap }
              ].map((action, i) => (
                <button key={i} className="w-full flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all group">
                  <div className="flex items-center space-x-4">
                    <action.icon size={20} className="text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold tracking-tight">{action.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-600 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[56px] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
             <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-rose-50 rounded-full blur-3xl opacity-50"></div>
             <div className="relative z-10">
               <div className="flex items-center justify-between mb-8">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Critical Tasks</h4>
                 <TrendingUp size={16} className="text-blue-500" />
               </div>
               <div className="space-y-4">
                 {vehicles.slice(0, 3).map(v => (
                   <div key={v.id} className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 transition-all cursor-default">
                     <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-[10px] text-blue-600">{v.controlNumber.split('-')[1]}</div>
                     <div className="flex-1 min-w-0">
                       <p className="text-xs font-black text-slate-900 truncate">{v.carName}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{v.status}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
