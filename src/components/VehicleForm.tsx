
import React, { useState, useRef, useEffect } from 'react';
import { Vehicle } from '../types';
import { Camera, Loader2, ClipboardCheck, ListFilter, Search } from 'lucide-react';
import { analyzeImage } from '../services/imageAnalysis';
import { isUnassigned } from '../utils';

interface VehicleFormProps {
  initialZone?: string;
  vehicles: Vehicle[];
  presetVehicle?: Vehicle;
  onSubmit: (vehicle: Vehicle) => void;
  onClose?: () => void;
}

type FieldDef = {
  id: keyof Vehicle;
  label: string;
  type: 'text' | 'date' | 'select';
  required?: boolean;
  options?: string[];
  readOnly?: boolean;
};

const VehicleForm: React.FC<VehicleFormProps> = ({ initialZone, vehicles, presetVehicle, onSubmit, onClose }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => (currentYear - i).toString());

  const [formData, setFormData] = useState<Partial<Vehicle>>({
    id: presetVehicle?.id || '',
    DateOfReceipt: presetVehicle?.DateOfReceipt || new Date().toISOString().split('T')[0],
    Zone: initialZone || presetVehicle?.Zone || '',
    CompanyName: presetVehicle?.CompanyName || '',
    Automaker: presetVehicle?.Automaker || '',
    ModelOfCar: presetVehicle?.ModelOfCar || '',
    VIN: presetVehicle?.VIN || '',
    Year: presetVehicle?.Year || '',
    Color: presetVehicle?.Color || '',
    NumberPlate: presetVehicle?.NumberPlate || '',
    Destination: presetVehicle?.Destination || '',
    Document: presetVehicle?.Document || 'Pending',
    Note: presetVehicle?.Note || '',
    ShippingDate: presetVehicle?.ShippingDate || ''
  });

  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [unassignedSearch, setUnassignedSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const unassignedVehicles = vehicles.filter(v => {
    if (v.id === presetVehicle?.id) return false;
    return isUnassigned(v);
  });

  const filteredUnassigned = unassignedVehicles.filter(v => {
    const searchStr = `${v.Automaker || ''} ${v.ModelOfCar || ''} ${v.VIN || ''}`.toLowerCase();
    return searchStr.includes(unassignedSearch.toLowerCase());
  });

  useEffect(() => {
    if (initialZone) setFormData(prev => ({ ...prev, Zone: initialZone }));
  }, [initialZone]);

  const selectUnassigned = (v: Vehicle) => {
    setFormData({ ...v, Zone: initialZone || '' });
  };

  const handleAIAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const { vehicle: result } = await analyzeImage(file, 'vehicle');
      setFormData(prev => ({ ...prev, ...result }));
    } catch (error) {
      console.error('AI Analysis Error:', error);
      alert(error instanceof Error ? error.message : '画像解析に失敗しました。');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const finalId = formData.id || Math.random().toString(36).substr(2, 9);
    onSubmit({ ...formData, id: finalId } as Vehicle);
    setIsSubmitted(true);
  };

  const basicFields: FieldDef[] = [
    { id: 'Automaker', label: 'メーカー', type: 'select', required: true, options: ['Toyota', 'Nissan', 'Honda', 'Mazda', 'Mitsubishi', 'Subaru', 'Suzuki', 'Daihatsu', 'Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen', 'Other'] },
    { id: 'ModelOfCar', label: '車名', type: 'text', required: true },
    { id: 'VIN', label: '車体番号', type: 'text', required: true },
    { id: 'NumberPlate', label: 'ナンバー', type: 'text' },
    { id: 'Year', label: '年式', type: 'select', options: years },
    { id: 'Color', label: '色', type: 'select', options: ['White', 'Black', 'Silver', 'Pearl', 'Grey', 'Blue', 'Red', 'Green', 'Gold', 'Brown', 'Other'] },
  ];

  const managementFields: FieldDef[] = [
    { id: 'DateOfReceipt', label: '入庫日', type: 'date' },
    { id: 'CompanyName', label: '会社', type: 'text' },
    { id: 'Destination', label: '輸出先', type: 'select', options: ['Kenya', 'Dubai', 'Tanzania', 'Pakistan', 'Uganda', 'Zambia', 'Mongolia', 'Other'] },
    { id: 'Document', label: '書類状況', type: 'select', options: ['OK', 'Pending', 'Missing'] },
    { id: 'ShippingDate', label: '出荷予定日', type: 'date' },
  ];

  const renderField = (field: FieldDef) => (
    <div key={field.id} className="space-y-1.5">
      <label htmlFor={field.id} className="text-xs font-medium text-ink-muted">
        {field.label}{field.required && <span className="text-danger-text ml-0.5">必須</span>}
      </label>
      {field.type === 'select' ? (
        <select
          id={field.id}
          required={field.required}
          value={(formData as any)[field.id] || ''}
          className="w-full px-3 py-2.5 bg-page border border-line rounded-control focus:bg-surface focus:border-primary outline-none text-sm text-ink"
          onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
        >
          <option value="">選択してください</option>
          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          id={field.id}
          type={field.type}
          required={field.required}
          value={(formData as any)[field.id] || ''}
          readOnly={field.readOnly}
          className={`w-full px-3 py-2.5 bg-page border border-line rounded-control focus:bg-surface focus:border-primary outline-none text-sm text-ink ${field.readOnly ? 'opacity-60' : ''}`}
          onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
        />
      )}
    </div>
  );

  return (
    <div className="relative pb-6">
      <div className={`space-y-6 transition-opacity ${isSubmitted ? 'opacity-20 pointer-events-none' : ''}`}>
        {unassignedVehicles.length > 0 && (
          <div className="bg-selected border border-primary/20 rounded-section p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <ListFilter size={18} className="text-primary" />
                <h4 className="text-sm font-bold text-ink">未配置の車両から選択</h4>
              </div>
              <div className="relative w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={14} />
                <label htmlFor="unassigned-search" className="sr-only">未配置車両を検索</label>
                <input
                  id="unassigned-search"
                  type="text"
                  placeholder="検索"
                  className="w-full bg-surface border border-line rounded-control py-1.5 pl-8 text-xs text-ink outline-none focus:border-primary"
                  value={unassignedSearch}
                  onChange={(e) => setUnassignedSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {filteredUnassigned.map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => selectUnassigned(v)}
                  className={`flex-shrink-0 w-56 border rounded-control p-4 text-left transition-colors ${formData.id === v.id ? 'bg-primary border-primary text-white' : 'bg-surface border-line hover:border-primary/50'}`}
                >
                  <p className={`text-xs font-medium mb-1 ${formData.id === v.id ? 'text-white/80' : 'text-ink-muted'}`}>{v.Automaker || '不明'}</p>
                  <p className={`font-semibold text-sm truncate ${formData.id === v.id ? 'text-white' : 'text-ink'}`}>{v.ModelOfCar || '車名未入力'}</p>
                  <p className={`text-xs font-mono mt-1 truncate ${formData.id === v.id ? 'text-white/70' : 'text-ink-muted'}`}>{v.VIN || '車体番号未入力'}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-surface rounded-section border border-line overflow-hidden">
          <div className="p-5 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-ink">手入力 / 写真から入力</h3>
              <p className="text-xs text-ink-muted mt-1">写真から入力しても、内容は登録前に確認・修正できます。</p>
            </div>
            <div>
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleAIAnalysis} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="px-5 py-2.5 bg-page border border-line rounded-control text-sm font-medium text-ink hover:bg-selected transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {isScanning ? <Loader2 className="animate-spin" size={16} /> : <Camera size={16} />}
                {isScanning ? '解析中...' : '写真から入力'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-8">
            <div>
              <h4 className="text-sm font-bold text-ink mb-4">基本情報</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {basicFields.map(renderField)}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-ink mb-4">管理・出荷情報</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {managementFields.map(renderField)}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-control text-sm font-medium text-ink-muted hover:bg-page transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-primary text-white rounded-control text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-60"
              >
                登録する
              </button>
            </div>
          </form>
        </div>
      </div>

      {isSubmitted && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-ink/20">
          <div className="w-full max-w-sm bg-surface rounded-section p-8 shadow-xl flex flex-col items-center gap-5">
            <div className="w-16 h-16 bg-success-bg text-success-text rounded-full flex items-center justify-center">
              <ClipboardCheck size={32} />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-lg font-bold text-ink">登録が完了しました</h4>
              <p className="text-xs text-ink-muted">保管場所：{formData.Zone}</p>
            </div>
            <button onClick={onClose} className="w-full py-3 bg-ink text-white rounded-control text-sm font-medium hover:bg-primary transition-colors">
              マップに戻る
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleForm;
