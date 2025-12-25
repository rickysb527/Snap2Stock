
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Map as MapIcon, PlusCircle, QrCode, Database, ChevronRight, LogOut, Bell, Settings, Search } from 'lucide-react';
import Dashboard from './components/Dashboard';
import StockView from './components/StockView';
import InboundMapFlow from './components/InboundMapFlow';
import MobileScanner from './components/MobileScanner';
import VehicleDetail from './components/VehicleDetail';
import TodayOutboundList from './components/TodayOutboundList';
import { Vehicle } from './types';
import { INITIAL_VEHICLES } from './constants';

type Tab = 'dashboard' | 'stock' | 'inbound' | 'scanner' | 'detail' | 'today-outbound';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('yard_manager_vehicles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_VEHICLES;
      }
    }
    return INITIAL_VEHICLES;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('yard_manager_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  const addVehicle = (vehicle: Vehicle) => {
    setVehicles(prev => [vehicle, ...prev]);
  };

  const importVehicles = (newVehicles: Vehicle[]) => {
    // IDが重複しないように既存のデータとマージ
    setVehicles(prev => [...newVehicles, ...prev]);
  };

  const updateZone = (id: string, newZone: string) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, Zone: newZone } : v));
  };

  const deleteVehicle = (id: string) => {
    if (confirm("この車両データを削除（出庫処理）しますか？この操作は取り消せません。")) {
      setVehicles(prev => prev.filter(v => v.id !== id));
      if (selectedVehicleId === id) {
        setSelectedVehicleId(null);
        setActiveTab('stock');
      }
      return true;
    }
    return false;
  };

  const handleViewDetail = (id: string) => {
    setSelectedVehicleId(id);
    setActiveTab('detail');
  };

  const NavItem = ({ id, icon: Icon, label }: { id: Tab, icon: any, label: string }) => {
    const isActive = activeTab === id;
    if (id === 'detail' || id === 'today-outbound') return null;

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
        {isActive && <ChevronRight size={14} className="opacity-40" />}
      </button>
    );
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  return (
    <div className="min-h-screen flex bg-slate-50/50 overflow-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 lg:hidden transition-all duration-500" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[300px] bg-white transform transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] lg:relative lg:translate-x-0 p-8 flex flex-col border-r border-slate-100/80
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center space-x-4 mb-14 px-2">
          <div className="w-12 h-12 rounded-[18px] overflow-hidden shadow-2xl bg-white">
            <img
              src="/images/S2S_logo.png"
              alt="Snap2Stock Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none">Snap2Stock</h1>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">Vihecle Stock Management System</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="stock" icon={Database} label="Stock List / Yard Map" />
          <NavItem id="inbound" icon={PlusCircle} label="Vehicle Registeration" />
          <NavItem id="scanner" icon={QrCode} label="QR Scanner" />
        </nav>

        <div className="mt-auto p-6 bg-slate-50 rounded-[32px] border border-slate-100">
          <div className="flex items-center space-x-3 mb-4">
             <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-xs font-black text-white">AD</div>
             <div>
               <p className="text-xs font-black">Admin</p>
               <p className="text-[10px] text-slate-400 font-bold">Office Terminal</p>
             </div>
          </div>
          <button 
            onClick={() => {
              if (confirm("全てのデータをリセットして初期状態に戻しますか？")) {
                localStorage.removeItem('yard_manager_vehicles');
                window.location.reload();
              }
            }}
            className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase text-rose-500 tracking-widest hover:text-rose-600 transition-colors"
          >
            <LogOut size={12} /> Reset System
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden lg:rounded-l-[60px] lg:ml-[-20px] shadow-2xl bg-white border-l border-white relative z-10">
        <header className="h-24 flex items-center justify-between px-8 lg:px-16 shrink-0 z-20">
          <div className="flex items-center flex-1 max-w-2xl">
            <button onClick={() => setIsSidebarOpen(true)} className="p-3 mr-6 text-slate-900 lg:hidden bg-slate-50 rounded-[18px]">
              <Search size={22} />
            </button>
            <div className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              Current Session: <span className="text-slate-900 ml-2">Main Yard A</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 ml-10">
            <button className="p-3 text-slate-400 hover:text-slate-900 transition-colors"><Bell size={20} /></button>
            <button className="p-3 text-slate-400 hover:text-slate-900 transition-colors"><Settings size={20} /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-8 lg:px-16 lg:py-12 bg-white">
          <div className="max-w-[1400px] mx-auto pb-20">
            {activeTab === 'dashboard' && (
              <Dashboard 
                vehicles={vehicles} 
                onNavigateToStock={() => setActiveTab('stock')}
                onNavigateToTodayOutbound={() => setActiveTab('today-outbound')}
                onNavigateToInbound={() => setActiveTab('inbound')}
                onNavigateToScanner={() => setActiveTab('scanner')}
                onImportVehicles={importVehicles}
              />
            )}
            {activeTab === 'stock' && (
              <StockView 
                vehicles={vehicles} 
                onViewDetail={handleViewDetail}
                onDeleteVehicle={deleteVehicle}
              />
            )}
            {activeTab === 'inbound' && (
              <InboundMapFlow 
                vehicles={vehicles}
                onInboundComplete={addVehicle}
              />
            )}
            {activeTab === 'scanner' && (
              <MobileScanner 
                vehicles={vehicles} 
                onUpdateZone={updateZone}
                onViewDetail={handleViewDetail}
              />
            )}
            {activeTab === 'detail' && selectedVehicle && (
              <VehicleDetail 
                vehicle={selectedVehicle} 
                onBack={() => setActiveTab('stock')} 
                onDelete={deleteVehicle}
              />
            )}
            {activeTab === 'today-outbound' && (
              <TodayOutboundList 
                vehicles={vehicles} 
                onViewDetail={handleViewDetail} 
                onBack={() => setActiveTab('dashboard')} 
                onDeleteVehicle={deleteVehicle}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;