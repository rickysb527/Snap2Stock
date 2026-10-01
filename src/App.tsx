
import logoUrl from './assets/S2S_logo.png';

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, QrCode, List, Map as MapIcon, Truck, Menu, X as CloseIcon, Settings } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import StockView from './pages/StockView';
import YardMapPage from './pages/YardMapPage';
import InboundMapFlow from './pages/InboundMapFlow';
import MobileScanner from './pages/MobileScanner';
import VehicleDetail from './pages/VehicleDetail';
import TodayOutboundList from './pages/TodayOutboundList';
import { Vehicle } from './types';
import { INITIAL_VEHICLES } from './constants';
import { upsertVehicle } from './utils';

type Tab = 'dashboard' | 'stock' | 'yard-map' | 'inbound' | 'scanner' | 'detail' | 'today-outbound';

export interface StockFilters {
  query: string;
  company: string;
  automaker: string;
  document: string;
}

const EMPTY_FILTERS: StockFilters = { query: '', company: '', automaker: '', document: '' };

const NAV_ITEMS: { id: Tab; icon: any; label: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'ダッシュボード' },
  { id: 'stock', icon: List, label: '在庫一覧' },
  { id: 'yard-map', icon: MapIcon, label: 'ヤードマップ' },
  { id: 'inbound', icon: PlusCircle, label: '車両登録' },
  { id: 'scanner', icon: QrCode, label: 'QRスキャン' },
  { id: 'today-outbound', icon: Truck, label: '出荷予定' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('yard_manager_vehicles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_VEHICLES;
      }
    }
    return INITIAL_VEHICLES;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [assignmentVehicleId, setAssignmentVehicleId] = useState<string | null>(null);
  const [stockFilters, setStockFilters] = useState<StockFilters>(EMPTY_FILTERS);
  const [highlightedVin, setHighlightedVin] = useState<string | undefined>();

  useEffect(() => {
    localStorage.setItem('yard_manager_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  const addVehicle = (vehicle: Vehicle) => {
    setVehicles(prev => upsertVehicle(prev, vehicle));
  };

  const importVehicles = (newVehicles: Vehicle[]) => {
    setVehicles(prev => [...newVehicles, ...prev]);
  };

  const updateZone = (id: string, newZone: string) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, Zone: newZone } : v));
  };

  const deleteVehicle = (id: string) => {
    if (confirm('この車両データを削除（出荷完了）しますか？この操作は取り消せません。')) {
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

  const handleStartAssignment = (vehicle: Vehicle) => {
    setAssignmentVehicleId(vehicle.id);
    setActiveTab('inbound');
  };

  const handleNewInbound = () => {
    setAssignmentVehicleId(null);
    setActiveTab('inbound');
  };

  const handleShowOnMap = (vin: string) => {
    setHighlightedVin(vin);
    setActiveTab('yard-map');
  };

  const navigate = (id: Tab) => {
    setAssignmentVehicleId(null);
    setActiveTab(id);
    setIsSidebarOpen(false);
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  return (
    <div className="min-h-screen flex bg-page">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-ink/40 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[220px] bg-surface border-r border-line transform transition-transform duration-200 lg:relative lg:translate-x-0 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between px-6 h-16 border-b border-line">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 bg-surface flex items-center justify-center">
              <img src={logoUrl} alt="Snap2Stock" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-ink truncate">Snap2Stock</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 text-ink-muted lg:hidden"
            aria-label="メニューを閉じる"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => navigate(id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-control text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-selected text-primary'
                    : 'text-ink-muted hover:bg-page hover:text-ink'
                }`}
              >
                <Icon size={18} strokeWidth={2} />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-line">
          <button
            onClick={() => {
              if (confirm('全ての車両データをリセットして初期状態に戻しますか？この操作は取り消せません。')) {
                localStorage.removeItem('yard_manager_vehicles');
                window.location.reload();
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-control text-xs font-medium text-ink-muted hover:bg-danger-bg hover:text-danger-text transition-colors"
          >
            <Settings size={14} />
            システムをリセット
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 shrink-0 bg-surface border-b border-line">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-ink lg:hidden rounded-control hover:bg-page"
              aria-label="メニューを開く"
            >
              <Menu size={22} />
            </button>
            <span className="text-sm text-ink-muted truncate">
              <span className="font-medium text-ink">メインヤード A</span>
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-8">
          <div className="max-w-[1400px] mx-auto pb-12">
            {activeTab === 'dashboard' && (
              <Dashboard
                vehicles={vehicles}
                onNavigateToStock={() => navigate('stock')}
                onNavigateToTodayOutbound={() => navigate('today-outbound')}
                onNavigateToInbound={handleNewInbound}
                onNavigateToScanner={() => navigate('scanner')}
                onImportVehicles={importVehicles}
                onViewDetail={handleViewDetail}
                onSearch={(query) => {
                  setStockFilters({ ...EMPTY_FILTERS, query });
                  navigate('stock');
                }}
              />
            )}
            {activeTab === 'stock' && (
              <StockView
                vehicles={vehicles}
                filters={stockFilters}
                onFiltersChange={setStockFilters}
                onViewDetail={handleViewDetail}
                onDeleteVehicle={deleteVehicle}
                onShowOnMap={handleShowOnMap}
              />
            )}
            {activeTab === 'yard-map' && (
              <YardMapPage
                vehicles={vehicles}
                filters={stockFilters}
                onFiltersChange={setStockFilters}
                highlightedVin={highlightedVin}
                onHighlightVin={setHighlightedVin}
                onViewDetail={handleViewDetail}
              />
            )}
            {activeTab === 'inbound' && (
              <InboundMapFlow
                vehicles={vehicles}
                presetVehicle={vehicles.find(v => v.id === assignmentVehicleId)}
                onInboundComplete={(vehicle) => {
                  addVehicle(vehicle);
                  if (assignmentVehicleId !== null) {
                    setAssignmentVehicleId(null);
                    handleViewDetail(vehicle.id);
                  }
                }}
              />
            )}
            {activeTab === 'scanner' && (
              <MobileScanner
                vehicles={vehicles}
                onUpdateZone={updateZone}
              />
            )}
            {activeTab === 'detail' && selectedVehicle && (
              <VehicleDetail
                vehicle={selectedVehicle}
                onBack={() => navigate('stock')}
                onDelete={deleteVehicle}
                onStartAssignment={handleStartAssignment}
                onShowOnMap={handleShowOnMap}
              />
            )}
            {activeTab === 'today-outbound' && (
              <TodayOutboundList
                vehicles={vehicles}
                onViewDetail={handleViewDetail}
                onBack={() => navigate('dashboard')}
                onDeleteVehicle={deleteVehicle}
                onShowOnMap={handleShowOnMap}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
