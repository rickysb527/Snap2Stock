
import React from 'react';
import { Vehicle } from '../types';
import { ArrowLeft, MapPin, CheckCircle, Clock } from 'lucide-react';
import { documentLabel, documentToneClass } from '../utils';

interface TodayOutboundListProps {
  vehicles: Vehicle[];
  onViewDetail: (id: string) => void;
  onBack: () => void;
  onDeleteVehicle: (id: string) => void;
  onShowOnMap: (vin: string) => void;
}

const TodayOutboundList: React.FC<TodayOutboundListProps> = ({ vehicles, onViewDetail, onBack, onDeleteVehicle, onShowOnMap }) => {
  const today = new Date().toISOString().split('T')[0];
  const outboundToday = vehicles.filter(v => v.ShippingDate === today);

  const handleCompleteShipment = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteVehicle(id);
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft size={14} aria-hidden="true" /> ダッシュボードに戻る
        </button>
        <div className="flex items-baseline gap-3">
          <h2 className="text-2xl font-bold text-ink">出荷予定</h2>
          <span className="text-sm text-ink-muted">{today} / {outboundToday.length}台</span>
        </div>
      </div>

      {outboundToday.length === 0 ? (
        <div className="bg-surface rounded-section border border-dashed border-line p-16 text-center">
          <Clock className="mx-auto text-line mb-4" size={40} aria-hidden="true" />
          <p className="font-medium text-ink">本日の出荷予定はありません</p>
        </div>
      ) : (
        <>
          {/* モバイル表示: カード */}
          <div className="md:hidden space-y-3">
            {outboundToday.map(v => (
              <div key={v.id} onClick={() => onViewDetail(v.id)} className="bg-surface rounded-section border border-line p-4 space-y-3 cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{v.Automaker} {v.ModelOfCar}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{v.CompanyName} / {v.Destination}</p>
                  </div>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${documentToneClass(v.Document)}`}>
                    {documentLabel(v.Document)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-mono text-ink-muted whitespace-nowrap truncate">{v.VIN}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onShowOnMap(v.VIN); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-selected text-primary rounded-control text-xs font-medium hover:bg-primary hover:text-white transition-colors whitespace-nowrap shrink-0"
                  >
                    <MapPin size={14} aria-hidden="true" />
                    {v.Zone || '未配置'}
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onViewDetail(v.id)}
                    className="flex-1 px-3 py-2.5 bg-page text-ink rounded-control text-xs font-medium border border-line hover:bg-selected transition-colors"
                  >
                    詳細
                  </button>
                  <button
                    onClick={(e) => handleCompleteShipment(e, v.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-primary text-white rounded-control text-xs font-medium hover:bg-primary-hover transition-colors"
                  >
                    <CheckCircle size={14} /> 出荷完了
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* デスクトップ・タブレット表示: 表形式 */}
          <div className="hidden md:block bg-surface rounded-section border border-line overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-page text-ink-muted text-xs border-b border-line">
                    <th className="px-4 py-3 font-medium">車両</th>
                    <th className="px-4 py-3 font-medium">車体番号</th>
                    <th className="px-4 py-3 font-medium text-center">保管場所</th>
                    <th className="px-4 py-3 font-medium">輸出先</th>
                    <th className="px-4 py-3 font-medium">書類</th>
                    <th className="px-4 py-3 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {outboundToday.map(v => (
                    <tr key={v.id} className="hover:bg-page transition-colors cursor-pointer" onClick={() => onViewDetail(v.id)}>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-ink">{v.Automaker} {v.ModelOfCar}</span>
                          <span className="text-xs text-ink-muted">{v.CompanyName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-ink whitespace-nowrap">{v.VIN}</td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); onShowOnMap(v.VIN); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-selected text-primary rounded-control text-xs font-medium hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
                        >
                          <MapPin size={14} aria-hidden="true" />
                          {v.Zone || '未配置'}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-ink whitespace-nowrap">{v.Destination}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${documentToneClass(v.Document)}`}>
                          {documentLabel(v.Document)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onViewDetail(v.id)}
                            className="px-3 py-2 bg-page text-ink rounded-control text-xs font-medium border border-line hover:bg-selected transition-colors"
                          >
                            詳細
                          </button>
                          <button
                            onClick={(e) => handleCompleteShipment(e, v.id)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-control text-xs font-medium hover:bg-primary-hover transition-colors"
                          >
                            <CheckCircle size={14} /> 出荷完了
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TodayOutboundList;
