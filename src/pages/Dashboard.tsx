
import React, { useRef, useState } from 'react';
import { Vehicle } from '../types';
import { Car, Truck as TruckIcon, FileWarning, ChevronRight, Search, PlusCircle, QrCode, FileUp, Loader2, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { documentLabel, documentToneClass } from '../utils';

interface DashboardProps {
  vehicles: Vehicle[];
  onNavigateToStock: () => void;
  onNavigateToTodayOutbound: () => void;
  onNavigateToInbound: () => void;
  onNavigateToScanner: () => void;
  onImportVehicles: (data: Vehicle[]) => void;
  onViewDetail: (id: string) => void;
  onSearch: (query: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  vehicles,
  onNavigateToStock,
  onNavigateToTodayOutbound,
  onNavigateToInbound,
  onNavigateToScanner,
  onImportVehicles,
  onViewDetail,
  onSearch,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const outboundToday = vehicles.filter(v => v.ShippingDate === today);
  const needsAttention = vehicles.filter(v => v.Document !== 'OK').slice(0, 5);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');

  const formatDate = (val: any) => {
    if (!val) return '';
    if (val instanceof Date) return val.toISOString().split('T')[0];
    if (typeof val === 'number') {
      const date = new Date((val - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    return String(val);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) onSearch(searchValue.trim());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus('ファイルを解析しています...');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const dataBuffer = evt.target?.result;
        const wb = XLSX.read(dataBuffer, { type: 'array', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as any[][];

        if (rows.length === 0) throw new Error('Sheet is empty');

        let headerRowIndex = 0;
        const keywords = ['vin', 'chassis', 'maker', 'automaker', 'model', 'modelofcar'];

        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const rowValues = rows[i].map(v => String(v).toLowerCase());
          if (keywords.some(k => rowValues.some(rv => rv.includes(k)))) {
            headerRowIndex = i;
            break;
          }
        }

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
        setImportStatus(`${filtered.length}台を取り込みました。`);
        setTimeout(() => setImportStatus(null), 3000);
      } catch (err) {
        console.error(err);
        alert('Excelの読み込みに失敗しました。見出し行の名称を確認してください。');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-ink">ダッシュボード</h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={18} aria-hidden="true" />
          <label htmlFor="dashboard-search" className="sr-only">車体番号・車名・ナンバーで検索</label>
          <input
            id="dashboard-search"
            type="text"
            placeholder="車体番号・車名・ナンバーで検索"
            className="w-full pl-11 pr-4 py-3 bg-surface border border-line rounded-control focus:border-primary outline-none transition-colors text-sm text-ink"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </form>
        <button
          onClick={onNavigateToInbound}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-control text-sm font-medium hover:bg-primary-hover transition-colors whitespace-nowrap"
        >
          <PlusCircle size={16} /> 車両を登録
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-section border border-line p-5 flex items-center gap-4">
          <div className="p-3 bg-selected rounded-control"><Car className="text-primary" size={22} /></div>
          <div>
            <p className="text-xs text-ink-muted">在庫</p>
            <p className="text-2xl font-bold text-ink">{vehicles.length}台</p>
          </div>
        </div>
        <div className="bg-surface rounded-section border border-line p-5 flex items-center gap-4">
          <div className="p-3 bg-selected rounded-control"><TruckIcon className="text-primary" size={22} /></div>
          <div>
            <p className="text-xs text-ink-muted">本日出荷</p>
            <p className="text-2xl font-bold text-ink">{outboundToday.length}台</p>
          </div>
        </div>
        <div className="bg-surface rounded-section border border-line p-5 flex items-center gap-4">
          <div className="p-3 bg-warning-bg rounded-control"><FileWarning className="text-warning-text" size={22} /></div>
          <div>
            <p className="text-xs text-ink-muted">書類未完了</p>
            <p className="text-2xl font-bold text-ink">{vehicles.filter(v => v.Document !== 'OK').length}台</p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-section border border-line overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h3 className="font-bold text-ink">本日の出荷</h3>
          <button onClick={onNavigateToTodayOutbound} className="flex items-center gap-1 text-sm text-primary hover:text-primary-hover font-medium">
            すべて見る <ChevronRight size={14} />
          </button>
        </div>
        {outboundToday.length === 0 ? (
          <p className="px-5 py-8 text-sm text-ink-muted text-center">本日の出荷予定はありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-ink-muted text-xs">
                  <th className="px-5 py-2 font-medium">車名</th>
                  <th className="px-5 py-2 font-medium">車体番号</th>
                  <th className="px-5 py-2 font-medium">保管場所</th>
                  <th className="px-5 py-2 font-medium">仕向け先</th>
                  <th className="px-5 py-2 font-medium">書類</th>
                  <th className="px-5 py-2 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {outboundToday.map(v => (
                  <tr key={v.id} className="hover:bg-page">
                    <td className="px-5 py-3 font-medium text-ink whitespace-nowrap">{v.Automaker} {v.ModelOfCar}</td>
                    <td className="px-5 py-3 font-mono text-ink-muted whitespace-nowrap">{v.VIN}</td>
                    <td className="px-5 py-3 text-ink whitespace-nowrap">{v.Zone || '未配置'}</td>
                    <td className="px-5 py-3 text-ink whitespace-nowrap">{v.Destination}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${documentToneClass(v.Document)}`}>
                        {documentLabel(v.Document)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => onViewDetail(v.id)} className="px-3 py-1.5 bg-page border border-line rounded-control text-xs font-medium text-ink hover:bg-selected">詳細</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-surface rounded-section border border-line overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h3 className="font-bold text-ink">要確認</h3>
          <button onClick={onNavigateToStock} className="flex items-center gap-1 text-sm text-primary hover:text-primary-hover font-medium">
            すべて見る <ChevronRight size={14} />
          </button>
        </div>
        {needsAttention.length === 0 ? (
          <p className="px-5 py-8 text-sm text-ink-muted text-center">確認が必要な車両はありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-ink-muted text-xs">
                  <th className="px-5 py-2 font-medium">車名</th>
                  <th className="px-5 py-2 font-medium">車体番号</th>
                  <th className="px-5 py-2 font-medium">保管場所</th>
                  <th className="px-5 py-2 font-medium">書類</th>
                  <th className="px-5 py-2 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {needsAttention.map(v => (
                  <tr key={v.id} className="hover:bg-page">
                    <td className="px-5 py-3 font-medium text-ink whitespace-nowrap">{v.Automaker} {v.ModelOfCar}</td>
                    <td className="px-5 py-3 font-mono text-ink-muted whitespace-nowrap">{v.VIN}</td>
                    <td className="px-5 py-3 text-ink whitespace-nowrap">{v.Zone || '未配置'}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${documentToneClass(v.Document)}`}>
                        {documentLabel(v.Document)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => onViewDetail(v.id)} className="px-3 py-1.5 bg-page border border-line rounded-control text-xs font-medium text-ink hover:bg-selected">詳細</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={onNavigateToStock} className="flex items-center gap-3 p-5 bg-surface border border-line rounded-section hover:bg-page transition-colors text-left">
          <Car className="text-primary" size={20} />
          <span className="text-sm font-medium text-ink">在庫一覧</span>
        </button>
        <button onClick={onNavigateToScanner} className="flex items-center gap-3 p-5 bg-surface border border-line rounded-section hover:bg-page transition-colors text-left">
          <QrCode className="text-primary" size={20} />
          <span className="text-sm font-medium text-ink">QRスキャン</span>
        </button>
        <div className="relative">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls,.csv" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full flex items-center gap-3 p-5 bg-surface border border-line rounded-section hover:bg-page transition-colors text-left disabled:opacity-60"
          >
            {isImporting ? <Loader2 className="text-primary animate-spin" size={20} /> : <FileUp className="text-primary" size={20} />}
            <span className="text-sm font-medium text-ink">Excel取込</span>
          </button>
          {importStatus && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-success-bg border border-success-text/20 rounded-control px-4 py-2 flex items-center gap-2 text-xs font-medium text-success-text z-10">
              <CheckCircle2 size={14} /> {importStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
