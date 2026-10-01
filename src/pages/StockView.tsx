
import React, { useMemo, useState } from 'react';
import { Vehicle } from '../types';
import { MapPin, Printer, Search, QrCode, X as CloseIcon, ChevronRight, MoreVertical, Trash2 } from 'lucide-react';
import { StockFilters } from '../App';
import { documentLabel, documentToneClass } from '../utils';

interface StockViewProps {
  vehicles: Vehicle[];
  filters: StockFilters;
  onFiltersChange: (filters: StockFilters) => void;
  onViewDetail: (id: string) => void;
  onDeleteVehicle: (id: string) => void;
  onShowOnMap: (vin: string) => void;
}

const StockView: React.FC<StockViewProps> = ({ vehicles, filters, onFiltersChange, onViewDetail, onDeleteVehicle, onShowOnMap }) => {
  const [selectedQrVehicle, setSelectedQrVehicle] = useState<Vehicle | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const companies = useMemo(() => Array.from(new Set(vehicles.map(v => v.CompanyName).filter(Boolean))).sort(), [vehicles]);
  const automakers = useMemo(() => Array.from(new Set(vehicles.map(v => v.Automaker).filter(Boolean))).sort(), [vehicles]);
  const documents = useMemo(() => Array.from(new Set(vehicles.map(v => v.Document).filter(Boolean))).sort(), [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchQuery = !filters.query || `${v.Automaker} ${v.ModelOfCar} ${v.VIN} ${v.NumberPlate}`.toLowerCase().includes(filters.query.toLowerCase());
      const matchCompany = !filters.company || v.CompanyName === filters.company;
      const matchAuto = !filters.automaker || v.Automaker === filters.automaker;
      const matchDocument = !filters.document || v.Document === filters.document;
      return matchQuery && matchCompany && matchAuto && matchDocument;
    });
  }, [vehicles, filters]);

  const hasActiveFilters = !!(filters.query || filters.company || filters.automaker || filters.document);

  const handleZoneClick = (e: React.MouseEvent, vin: string) => {
    e.stopPropagation();
    onShowOnMap(vin);
  };

  const openQrModal = (e: React.MouseEvent, vehicle: Vehicle) => {
    e.stopPropagation();
    setSelectedQrVehicle(vehicle);
    setOpenMenuId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteVehicle(id);
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-2xl font-bold text-ink">在庫一覧</h2>
          <span className="text-sm text-ink-muted">{filteredVehicles.length}台</span>
        </div>
      </div>

      <div className="bg-surface rounded-section border border-line p-5 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={18} aria-hidden="true" />
          <label htmlFor="stock-search" className="sr-only">車体番号・車名・ナンバーで検索</label>
          <input
            id="stock-search"
            type="text"
            placeholder="車体番号・車名・ナンバーで検索"
            className="w-full pl-11 pr-4 py-2.5 bg-page border border-line rounded-control focus:bg-surface focus:border-primary outline-none transition-colors text-sm text-ink"
            onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
            value={filters.query}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label htmlFor="filter-company" className="text-xs font-medium text-ink-muted">会社</label>
            <select
              id="filter-company"
              className="w-full px-3 py-2 bg-page border border-line rounded-control outline-none text-sm text-ink focus:border-primary"
              value={filters.company}
              onChange={(e) => onFiltersChange({ ...filters, company: e.target.value })}
            >
              <option value="">すべて</option>
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="filter-automaker" className="text-xs font-medium text-ink-muted">メーカー</label>
            <select
              id="filter-automaker"
              className="w-full px-3 py-2 bg-page border border-line rounded-control outline-none text-sm text-ink focus:border-primary"
              value={filters.automaker}
              onChange={(e) => onFiltersChange({ ...filters, automaker: e.target.value })}
            >
              <option value="">すべて</option>
              {automakers.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="filter-document" className="text-xs font-medium text-ink-muted">書類状況</label>
            <select
              id="filter-document"
              className="w-full px-3 py-2 bg-page border border-line rounded-control outline-none text-sm text-ink focus:border-primary"
              value={filters.document}
              onChange={(e) => onFiltersChange({ ...filters, document: e.target.value })}
            >
              <option value="">すべて</option>
              {documents.map(d => <option key={d} value={d}>{documentLabel(d)}</option>)}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => onFiltersChange({ query: '', company: '', automaker: '', document: '' })}
            className="text-xs font-medium text-primary hover:text-primary-hover"
          >
            条件をクリア
          </button>
        )}
      </div>

      {filteredVehicles.length === 0 ? (
        <div className="bg-surface rounded-section border border-line px-4 py-16 text-center text-ink-muted text-sm">
          条件に一致する車両が見つかりません。
        </div>
      ) : (
        <>
          {/* モバイル表示: 車名・車体番号・区画・状態・詳細を優先したカード表示 */}
          <div className="md:hidden space-y-3">
            {filteredVehicles.map(v => (
              <div
                key={v.id}
                onClick={() => onViewDetail(v.id)}
                className="bg-surface rounded-section border border-line p-4 space-y-3 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{v.Automaker} {v.ModelOfCar}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{v.Color} / {v.Year}</p>
                  </div>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${documentToneClass(v.Document)}`}>
                    {documentLabel(v.Document)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-mono text-ink-muted whitespace-nowrap truncate">{v.VIN}</span>
                  <button
                    onClick={(e) => handleZoneClick(e, v.VIN)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-selected text-primary rounded-control text-xs font-medium hover:bg-primary hover:text-white transition-colors whitespace-nowrap shrink-0"
                  >
                    <MapPin size={14} aria-hidden="true" />
                    {v.Zone || '未配置'}
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onViewDetail(v.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 bg-ink text-white rounded-control text-xs font-medium hover:bg-ink/80 transition-colors"
                  >
                    詳細
                    <ChevronRight size={14} aria-hidden="true" />
                  </button>
                  <button
                    onClick={(e) => openQrModal(e, v)}
                    className="p-2.5 text-ink-muted border border-line rounded-control hover:bg-page"
                    aria-label="QRラベルを表示"
                  >
                    <QrCode size={16} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, v.id)}
                    className="p-2.5 text-danger-text border border-line rounded-control hover:bg-danger-bg"
                    aria-label="車両を削除"
                  >
                    <Trash2 size={16} />
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
                    <th className="px-4 py-3 font-medium">車体番号・ナンバー</th>
                    <th className="px-4 py-3 font-medium text-center whitespace-nowrap">保管場所</th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">会社</th>
                    <th className="px-4 py-3 font-medium">書類</th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">出荷予定</th>
                    <th className="px-4 py-3 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredVehicles.map(v => (
                    <tr
                      key={v.id}
                      className="hover:bg-page transition-colors cursor-pointer"
                      onClick={() => onViewDetail(v.id)}
                    >
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-ink">{v.Automaker} {v.ModelOfCar}</span>
                          <span className="text-xs text-ink-muted">{v.Color} / {v.Year}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-mono text-ink whitespace-nowrap">{v.VIN}</span>
                          <span className="text-xs text-ink-muted whitespace-nowrap">{v.NumberPlate}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={(e) => handleZoneClick(e, v.VIN)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-selected text-primary rounded-control text-xs font-medium hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
                        >
                          <MapPin size={14} aria-hidden="true" />
                          {v.Zone || '未配置'}
                        </button>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell text-ink-muted whitespace-nowrap">{v.CompanyName}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${documentToneClass(v.Document)}`}>
                          {documentLabel(v.Document)}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell text-ink-muted whitespace-nowrap">{v.ShippingDate || '—'}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onViewDetail(v.id)}
                            className="flex items-center gap-1 px-3 py-2 bg-ink text-white rounded-control text-xs font-medium hover:bg-ink/80 transition-colors"
                          >
                            詳細
                            <ChevronRight size={14} aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === v.id ? null : v.id)}
                            className="p-2 text-ink-muted rounded-control hover:bg-page"
                            aria-label="その他の操作"
                            aria-expanded={openMenuId === v.id}
                          >
                            <MoreVertical size={16} />
                          </button>
                          {openMenuId === v.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-surface border border-line rounded-control shadow-lg py-1 z-20">
                              <button
                                onClick={(e) => openQrModal(e, v)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-page text-left"
                              >
                                <QrCode size={15} /> QRラベルを表示
                              </button>
                              <button
                                onClick={(e) => handleDelete(e, v.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-text hover:bg-danger-bg text-left"
                              >
                                <Trash2 size={15} /> 車両を削除
                              </button>
                            </div>
                          )}
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

      {selectedQrVehicle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setSelectedQrVehicle(null)}></div>
          <div className="relative bg-surface rounded-section p-10 max-w-sm w-full shadow-xl">
            <button
              onClick={() => setSelectedQrVehicle(null)}
              className="absolute top-4 right-4 p-1 text-ink-muted hover:text-ink"
              aria-label="閉じる"
            >
              <CloseIcon size={22} />
            </button>

            <div className="text-center space-y-6">
              <div>
                <p className="text-xs font-medium text-ink-muted mb-1">車両ラベル</p>
                <h3 className="text-lg font-bold text-ink">{selectedQrVehicle.Automaker} {selectedQrVehicle.ModelOfCar}</h3>
              </div>

              <div className="bg-page p-6 rounded-section">
                <div className="bg-white p-3 rounded-control shadow-sm inline-block mb-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`yard-v2:${selectedQrVehicle.id}|${selectedQrVehicle.VIN}|${selectedQrVehicle.Automaker}|${selectedQrVehicle.ModelOfCar}`)}`}
                    alt={`${selectedQrVehicle.Automaker} ${selectedQrVehicle.ModelOfCar}のQRコード`}
                    className="w-40 h-40"
                  />
                </div>
                <p className="text-xs text-ink-muted">車体番号</p>
                <p className="text-sm font-mono text-ink">{selectedQrVehicle.VIN}</p>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-3 bg-ink text-white rounded-control text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary transition-colors"
              >
                <Printer size={16} /> QRラベルを印刷
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockView;
