
import React, { useRef, useState } from 'react';
import { Vehicle } from '../types';
import { Car, Calendar, ArrowRight, Database, ChevronRight, PlusCircle, QrCode, FileUp, Loader2, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface DashboardProps {
  vehicles: Vehicle[];
  onNavigateToStock: () => void;
  onNavigateToTodayOutbound: () => void;
  onNavigateToInbound: () => void;
  onNavigateToScanner: () => void;
  onImportVehicles: (data: Vehicle[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  vehicles, 
  onNavigateToStock,
  onNavigateToTodayOutbound,
  onNavigateToInbound,
  onNavigateToScanner,
  onImportVehicles
}) => {
  const today = new Date().toISOString().split('T')[0];
  const todayOutbound = vehicles.filter(v => v.ShippingDate === today).length;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const formatDate = (val: any) => {
    if (!val) return '';
    if (val instanceof Date) return val.toISOString().split('T')[0];
    if (typeof val === 'number') {
      const date = new Date((val - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    return String(val);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus('Analyzing spreadsheet structure...');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const dataBuffer = evt.target?.result;
        const wb = XLSX.read(dataBuffer, { type: 'array', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        
        // 1. まず全ての行を配列の配列として読み込む (header: 1)
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as any[][];
        
        if (rows.length === 0) throw new Error("Sheet is empty");

        // 2. ヘッダー行を探す (VIN, Maker, Modelなどが含まれる最初の行)
        let headerRowIndex = 0;
        const keywords = ['vin', 'chassis', 'maker', 'automaker', 'model', 'modelofcar'];
        
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const rowValues = rows[i].map(v => String(v).toLowerCase());
          if (keywords.some(k => rowValues.some(rv => rv.includes(k)))) {
            headerRowIndex = i;
            break;
          }
        }

        // 3. ヘッダー行以降をオブジェクトとしてパースする
        const data = XLSX.utils.sheet_to_json(ws, { range: headerRowIndex, defval: '' }) as any[];

        const normalize = (s: string) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
        const findVal = (item: any, ...keys: string[]) => {
          const itemKeys = Object.keys(item);
          for (const k of keys) {
            const nk = normalize(k);
            const foundKey = itemKeys.find(ik => normalize(ik) === nk);
            if (foundKey && item[foundKey] !== '') return item[foundKey];
          }
          return '';
        };

        const importedVehicles: Vehicle[] = data.map((item) => {
          const zoneVal = String(findVal(item, 'Zone', 'Yard Slot', 'Slot', 'ヤード位置') || '');
          const isValidZone = /^[A-J]-\d+$/.test(zoneVal);

          return {
            id: Math.random().toString(36).substr(2, 9),
            Zone: isValidZone ? zoneVal : '',
            DateOfReceipt: formatDate(findVal(item, 'Date of Receipt', 'DateOfReceipt', '入庫日', 'Receipt')),
            CompanyName: String(findVal(item, 'Company Name', 'CompanyName', '会社名', 'Owner', 'Client') || 'Unknown'),
            Automaker: String(findVal(item, 'Automaker', 'Maker', 'メーカー', 'Brand') || ''),
            ModelOfCar: String(findVal(item, 'Model of car', 'ModelOfCar', 'モデル', 'Model', 'CarName') || ''),
            VIN: String(findVal(item, 'VIN', 'Vehicle Identification Number', '車体番号', 'Chassis') || ''),
            Year: String(findVal(item, 'Year', '年式', 'YearModel') || ''),
            Color: String(findVal(item, 'Color', 'カラー', 'Exterior') || ''),
            NumberPlate: String(findVal(item, 'Number Plate', 'NumberPlate', 'ナンバー', 'Plate') || ''),
            Destination: String(findVal(item, 'Destination', '仕向地', 'Port') || ''),
            Document: String(findVal(item, 'Document', '書類状態', 'Docs') || 'Pending'),
            ShippingDate: formatDate(findVal(item, 'Shipping Date', 'ShippingDate', '出荷予定日', 'ETD')),
            Note: String(findVal(item, 'Note', '備考', 'Remarks') || '')
          };
        });

        const filtered = importedVehicles.filter(v => v.Automaker || v.VIN || v.ModelOfCar);
        onImportVehicles(filtered);
        setImportStatus(`${filtered.length} units imported correctly.`);
        setTimeout(() => setImportStatus(null), 3000);
      } catch (err) {
        console.error(err);
        alert("Excel parse error. Please check the spreadsheet header names.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button onClick={onNavigateToStock} className="group flex flex-col justify-between p-8 bg-blue-600 rounded-[32px] text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all hover:scale-[1.02] text-left">
          <div className="p-4 bg-white/10 rounded-2xl self-start"><Database size={28} strokeWidth={2.5} /></div>
          <div className="mt-8 flex items-end justify-between w-full">
            <div><h4 className="text-xl font-black tracking-tighter uppercase italic">在庫管理システム</h4><p className="text-blue-100 text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Registry / Map</p></div>
            <ArrowRight className="opacity-40 group-hover:opacity-100 transition-opacity" size={24} />
          </div>
        </button>

        <button onClick={onNavigateToInbound} className="group flex flex-col justify-between p-8 bg-emerald-600 rounded-[32px] text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all hover:scale-[1.02] text-left">
          <div className="p-4 bg-white/10 rounded-2xl self-start"><PlusCircle size={28} strokeWidth={2.5} /></div>
          <div className="mt-8 flex items-end justify-between w-full">
            <div><h4 className="text-xl font-black tracking-tighter uppercase italic">新規車両登録</h4><p className="text-emerald-100 text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Map Entry</p></div>
            <ArrowRight className="opacity-40 group-hover:opacity-100 transition-opacity" size={24} />
          </div>
        </button>

        <button onClick={onNavigateToScanner} className="group flex flex-col justify-between p-8 bg-slate-900 rounded-[32px] text-white shadow-xl shadow-slate-500/20 hover:bg-black transition-all hover:scale-[1.02] text-left">
          <div className="p-4 bg-white/10 rounded-2xl self-start"><QrCode size={28} strokeWidth={2.5} /></div>
          <div className="mt-8 flex items-end justify-between w-full">
            <div><h4 className="text-xl font-black tracking-tighter uppercase italic">QR スキャナー</h4><p className="text-slate-400 text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">QR / VIN Search</p></div>
            <ArrowRight className="opacity-40 group-hover:opacity-100 transition-opacity" size={24} />
          </div>
        </button>

        <div className="relative group">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls,.csv" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} className={`group flex flex-col justify-between p-8 w-full h-full bg-indigo-600 rounded-[32px] text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all hover:scale-[1.02] text-left ${isImporting ? 'animate-pulse cursor-wait' : ''}`}>
            <div className="p-4 bg-white/10 rounded-2xl self-start">{isImporting ? <Loader2 size={28} className="animate-spin" /> : <FileUp size={28} strokeWidth={2.5} />}</div>
            <div className="mt-8 flex items-end justify-between w-full">
              <div><h4 className="text-xl font-black tracking-tighter uppercase italic">エクセルからインポート</h4><p className="text-indigo-100 text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">Excel / CSV</p></div>
              <ArrowRight className="opacity-40 group-hover:opacity-100 transition-opacity" size={24} />
            </div>
          </button>
          {importStatus && (
            <div className="absolute -bottom-16 left-0 right-0 animate-in slide-in-from-top-2">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
                <CheckCircle2 size={18} className="text-emerald-500" /><span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">{importStatus}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total Units in Yard</p>
          <div className="flex items-center justify-between">
            <h3 className="text-6xl font-black tracking-tighter text-slate-900">{vehicles.length}</h3>
            <div className="p-6 bg-blue-50 rounded-3xl"><Car className="text-blue-500" size={32} /></div>
          </div>
        </div>
        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Today's Outbound</p>
            <div className="flex items-center justify-between">
              <h3 className="text-6xl font-black tracking-tighter text-slate-900">{todayOutbound}</h3>
              <div className="p-6 bg-amber-50 rounded-3xl"><Calendar className="text-amber-500" size={32} /></div>
            </div>
          </div>
          <button onClick={onNavigateToTodayOutbound} className="mt-8 flex items-center justify-center gap-3 w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-600 hover:text-white transition-all group">
            VIEW OUTBOUND SCHEDULE<ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;