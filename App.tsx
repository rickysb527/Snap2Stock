
import React, { useState, useMemo } from 'react';
import { LayoutDashboard, Car, Map as MapIcon, ClipboardList, PlusCircle, Search, Menu, Settings, Bell, ChevronRight, LogOut } from 'lucide-react';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import YardMap from './components/YardMap';
import VehicleForm from './components/VehicleForm';
import { Vehicle } from './types';
import { INITIAL_VEHICLES } from './constants';

type Tab = 'dashboard' | 'inventory' | 'map' | 'inbound';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => 
      v.carName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.controlNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.locationCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vehicles, searchQuery]);

  const addVehicle = (newVehicle: Omit<Vehicle, 'id'>) => {
    const vehicleWithId = { ...newVehicle, id: Math.random().toString(36).substr(2, 9) };
    setVehicles(prev => [vehicleWithId, ...prev]);
    setActiveTab('inventory');
  };

  const updateVehicle = (updatedVehicle: Vehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
  };

  const NavItem = ({ id, icon: Icon, label }: { id: Tab, icon: any, label: string }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
        className={`group relative flex items-center justify-between w-full px-5 py-4 rounded-[24px] transition-all duration-500 ease-out ${
          isActive 
            ? 'bg-slate-900 text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)] scale-[1.02]' 
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-blue-600' : 'bg-transparent group-hover:bg-white'}`}>
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
          </div>
          <span className={`font-bold tracking-tight text-sm ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
            {label}
          </span>
        </div>
        {isActive && (
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse mr-2" />
            <ChevronRight size={14} className="opacity-40" />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-50/50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 lg:hidden transition-all duration-500" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[300px] bg-white transform transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] lg:relative lg:translate-x-0 p-8 flex flex-col border-r border-slate-100/80
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center space-x-4 mb-14 px-2">
          <div className="w-12 h-12 bg-slate-900 rounded-[18px] flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-slate-200">
            Y
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none">
              YardManager
            </h1>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">Professional</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Main Navigation</p>
          <NavItem id="dashboard" icon={LayoutDashboard} label="ダッシュボード" />
          <NavItem id="inventory" icon={ClipboardList} label="在庫車両" />
          <NavItem id="map" icon={MapIcon} label="ヤードマップ" />
          <NavItem id="inbound" icon={PlusCircle} label="新規入庫" />
        </nav>

        <div className="mt-auto pt-8">
          <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center font-black text-slate-900">AD</div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-900">Admin User</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Super User</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 p-2 bg-white hover:bg-slate-900 hover:text-white rounded-xl transition-all flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                <Settings size={16} />
              </button>
              <button className="flex-1 p-2 bg-white hover:bg-rose-500 hover:text-white rounded-xl transition-all flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-white/40 backdrop-blur-3xl lg:rounded-l-[60px] lg:ml-[-20px] shadow-[0_0_100px_-20px_rgba(0,0,0,0.1)] relative z-10 border-l border-white/80">
        {/* Header */}
        <header className="h-24 flex items-center justify-between px-8 lg:px-16 shrink-0 z-20">
          <div className="flex items-center flex-1 max-w-2xl">
            <button onClick={() => setIsSidebarOpen(true)} className="p-3 mr-6 text-slate-900 lg:hidden bg-white shadow-sm border border-slate-100 rounded-[18px] transition-all active:scale-95">
              <Menu size={22} />
            </button>
            <div className="relative w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="車両をクイック検索..."
                className="w-full pl-14 pr-6 py-4 bg-white/50 backdrop-blur-md border border-slate-100 rounded-3xl focus:bg-white focus:border-blue-500/20 focus:ring-[12px] focus:ring-blue-500/5 outline-none transition-all text-sm font-bold shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-6 ml-10">
            <button className="relative p-3.5 text-slate-400 hover:text-slate-900 bg-white shadow-sm border border-slate-100 rounded-2xl transition-all hover:scale-105 active:scale-95">
              <Bell size={20} />
              <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white ring-2 ring-rose-100"></span>
            </button>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-black text-slate-900 tracking-tight">Feb 15, 2025</span>
              <span className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em]">Tokyo Terminal</span>
            </div>
          </div>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto px-8 py-8 lg:px-16 lg:py-12">
          <div className="max-w-[1400px] mx-auto">
            {activeTab === 'dashboard' && <Dashboard vehicles={vehicles} onViewAll={() => setActiveTab('inventory')} onViewMap={() => setActiveTab('map')} />}
            {activeTab === 'inventory' && <InventoryList vehicles={filteredVehicles} onUpdateStatus={updateVehicle} />}
            {activeTab === 'map' && <YardMap vehicles={vehicles} />}
            {activeTab === 'inbound' && <VehicleForm onSubmit={addVehicle} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
