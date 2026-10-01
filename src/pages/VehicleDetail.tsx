
import React, { useState } from 'react';
import { Vehicle } from '../types';
import { isUnassigned as isVehicleUnassigned, documentLabel, documentToneClass } from '../utils';
import {
  ArrowLeft, MapPin, Printer, MoreVertical, Trash2, MapIcon,
} from 'lucide-react';

interface VehicleDetailProps {
  vehicle: Vehicle;
  onBack: () => void;
  onDelete: (id: string) => void;
  onStartAssignment: (vehicle: Vehicle) => void;
  onShowOnMap: (vin: string) => void;
}

const VehicleDetail: React.FC<VehicleDetailProps> = ({ vehicle, onBack, onDelete, onStartAssignment, onShowOnMap }) => {
  const isUnassigned = isVehicleUnassigned(vehicle);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const qrData = `yard-v2:${vehicle.id}|${vehicle.VIN}|${vehicle.Automaker}|${vehicle.ModelOfCar}`;

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between gap-4 py-3 border-b border-line last:border-b-0">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="text-sm font-medium text-ink text-right">{value || '—'}</dd>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          在庫一覧に戻る
        </button>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-ink-muted rounded-control hover:bg-page"
            aria-label="その他の操作"
            aria-expanded={isMenuOpen}
          >
            <MoreVertical size={20} />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-surface border border-line rounded-control shadow-lg py-1 z-20">
              <button
                onClick={() => { setIsMenuOpen(false); window.print(); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-page text-left"
              >
                <Printer size={15} /> QRラベルを印刷
              </button>
              <button
                onClick={() => { setIsMenuOpen(false); onDelete(vehicle.id); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-text hover:bg-danger-bg text-left"
              >
                <Trash2 size={15} /> 車両を削除
              </button>
            </div>
          )}
        </div>
      </div>

      {isUnassigned && (
        <div className="bg-warning-bg border border-warning-text/20 rounded-section p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-warning-text">ヤード未配置の車両です</h4>
            <p className="text-warning-text/80 text-sm mt-1">この車両はまだマップ上の位置が確定していません。</p>
          </div>
          <button
            onClick={() => onStartAssignment(vehicle)}
            className="shrink-0 px-6 py-3 bg-warning-text text-white rounded-control text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <MapIcon size={16} />
            ヤードの場所を選択して配置する
          </button>
        </div>
      )}

      <div className="bg-surface rounded-section border border-line p-6">
        <h2 className="text-2xl font-bold text-ink">{vehicle.Automaker} {vehicle.ModelOfCar}</h2>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-ink-muted mb-1">車体番号</p>
            <p className="text-sm font-mono font-medium text-ink">{vehicle.VIN}</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted mb-1">保管場所</p>
            {isUnassigned ? (
              <p className="text-sm font-medium text-ink-muted">未配置</p>
            ) : (
              <button
                onClick={() => onShowOnMap(vehicle.VIN)}
                className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1"
              >
                {vehicle.Zone}
                <MapPin size={13} />
                <span className="underline">マップで確認</span>
              </button>
            )}
          </div>
          <div>
            <p className="text-xs text-ink-muted mb-1">書類状況</p>
            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${documentToneClass(vehicle.Document)}`}>
              {documentLabel(vehicle.Document)}
            </span>
          </div>
          <div>
            <p className="text-xs text-ink-muted mb-1">出荷予定日</p>
            <p className="text-sm font-medium text-ink">{vehicle.ShippingDate || '未定'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-surface rounded-section border border-line p-6">
            <h3 className="text-base font-bold text-ink mb-3">基本情報</h3>
            <dl>
              <Field label="メーカー" value={vehicle.Automaker} />
              <Field label="車名" value={vehicle.ModelOfCar} />
              <Field label="年式" value={vehicle.Year} />
              <Field label="色" value={vehicle.Color} />
              <Field label="ナンバー" value={vehicle.NumberPlate} />
            </dl>
          </div>

          <div className="bg-surface rounded-section border border-line p-6">
            <h3 className="text-base font-bold text-ink mb-3">管理・出荷情報</h3>
            <dl>
              <Field label="保管場所" value={isUnassigned ? '未配置' : vehicle.Zone} />
              <Field label="入庫日" value={vehicle.DateOfReceipt} />
              <Field label="会社" value={vehicle.CompanyName} />
              <Field label="輸出先" value={vehicle.Destination} />
              <Field label="書類状況" value={documentLabel(vehicle.Document)} />
              <Field label="出荷予定日" value={vehicle.ShippingDate} />
            </dl>
          </div>

          <div className="bg-surface rounded-section border border-line p-6">
            <h3 className="text-base font-bold text-ink mb-3">メモ</h3>
            <p className="text-sm text-ink leading-relaxed">
              {vehicle.Note || '特記事項はありません。'}
            </p>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-surface rounded-section border border-line p-6 text-center">
            <h3 className="text-sm font-medium text-ink-muted mb-4">QRコード</h3>
            <div className="bg-white p-3 rounded-control border border-line inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrData)}`}
                alt={`${vehicle.Automaker} ${vehicle.ModelOfCar}のQRコード`}
                className="w-[140px] h-[140px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
