
import React, { useState } from 'react';
import { Vehicle, VehicleStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { MoreHorizontal, Filter, MapPin, Search, Download, ChevronRight, Hash } from 'lucide-react';

interface InventoryListProps {
  vehicles: Vehicle[];
  onUpdateStatus: (vehicle: Vehicle) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ vehicles, onUpdateStatus }) => {
  const [filterStatus, setFilterStatus] = useState<VehicleStatus | 'ALL'>('ALL');

  const filtered = vehicles.filter(v => filterStatus === 'ALL' || v.status === filterStatus);

  const StatusBadge = ({ status }: { status: VehicleStatus }) => {
    const colorClasses = STATUS_COLORS[status];
    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm ${colorClasses}`}>
        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-30 mr-2" />
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-5xl font-black tracking-tighter text-slate-900">Vehicle Assets</h2>
          <p className="text-slate-400 text-lg font-medium mt-2">詳細な在庫管理とリアルタイムステータス追跡</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2 bg-white p-2.5 rounded-[24px] border border-slate-100 shadow-xl shadow-slate-100/50">
            <Filter size={16} className="text-slate-400 ml-3" />
            <select 
              className="bg-transparent text-[11px] font-black text-slate-900 uppercase tracking-widest outline-none appearance-none cursor-pointer pr-8 pl-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="ALL">Status: All</option>
              {Object.values(VehicleStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button className="px-6 py-4 bg-slate-900 text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 flex items-center space-x-2 btn-glow active:scale-95 transition-all">
            <Download size={16} />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[60px] border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-slate-100">
                <th className="px-10 py-8">Model Identifier</th>
                <th className="px-10 py-8">Technical ID</th>
                <th className="px-10 py-8">Allocation</th>
                <th className="px-10 py-8">Port Target</th>
                <th className="px-10 py-8">Workflow Status</th>
                <th className="px-10 py-8 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                  <td className="px-10 py-10">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">{v.controlNumber}</span>
                      <span className="text-lg font-black text-slate-900 tracking-tight group-hover:translate-x-1 transition-transform">{v.carName}</span>
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl w-fit">
                      <Hash size={12} className="text-slate-300" />
                      <span className="font-mono text-[11px] font-black text-slate-500 uppercase tracking-wider">{v.vin}</span>
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <div className="flex items-center text-slate-900 font-black text-sm">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mr-3 shadow-sm">
                        <MapPin size={14} />
                      </div>
                      {v.locationCode}
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <span className="text-slate-400 font-bold tracking-tight">{v.destination}</span>
                  </td>
                  <td className="px-10 py-10">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="px-10 py-10 text-right">
                    <button className="p-4 text-slate-300 hover:text-slate-900 hover:bg-white rounded-2xl transition-all shadow-sm opacity-0 group-hover:opacity-100 border border-transparent hover:border-slate-100">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-10 py-32 text-center">
                     <div className="flex flex-col items-center opacity-20">
                       <Search size={80} className="mb-6 text-slate-300" strokeWidth={1} />
                       <p className="text-xl font-black text-slate-500 tracking-tight">No Matching Assets</p>
                       <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Refine your search parameters</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Total Registry: {filtered.length} Units</span>
          <div className="flex space-x-2">
            {[1, 2, 3].map(n => (
              <button key={n} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${n === 1 ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 hover:bg-slate-100'}`}>
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryList;
