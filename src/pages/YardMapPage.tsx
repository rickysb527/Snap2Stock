
import React, { useMemo, useState, useEffect } from 'react';
import { Vehicle } from '../types';
import { Search, MapPin, X as CloseIcon } from 'lucide-react';
import YardMap from '../components/YardMap';
import { StockFilters } from '../App';
import { documentLabel, documentToneClass } from '../utils';

interface YardMapPageProps {
  vehicles: Vehicle[];
  filters: StockFilters;
  onFiltersChange: (filters: StockFilters) => void;
  highlightedVin?: string;
  onHighlightVin: (vin: string | undefined) => void;
  onViewDetail: (id: string) => void;
}

const YardMapPage: React.FC<YardMapPageProps> = ({ vehicles, filters, onFiltersChange, highlightedVin, onHighlightVin, onViewDetail }) => {
  const [showCandidates, setShowCandidates] = useState(false);

  const searchResults = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    if (!q) return [];
    return vehicles.filter(v => `${v.Automaker} ${v.ModelOfCar} ${v.VIN} ${v.NumberPlate}`.toLowerCase().includes(q));
  }, [vehicles, filters.query]);

  useEffect(() => {
    if (searchResults.length === 1) {
      onHighlightVin(searchResults[0].VIN);
      setShowCandidates(false);
    } else if (searchResults.length > 1) {
      setShowCandidates(true);
    } else {
      setShowCandidates(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.query]);

  const selectedVehicle = vehicles.find(v => v.VIN === highlightedVin);

  const handleZoneSelect = (zone: string) => {
    const vehicle = vehicles.find(v => v.Zone === zone);
    onHighlightVin(vehicle?.VIN);
    setShowCandidates(false);
  };

  const handlePickCandidate = (vehicle: Vehicle) => {
    onHighlightVin(vehicle.VIN);
    setShowCandidates(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">ヤードマップ</h2>
        <p className="text-sm text-ink-muted mt-1">区画または検索結果から車両を選択してください。</p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={18} aria-hidden="true" />
        <label htmlFor="map-search" className="sr-only">車体番号・車名・ナンバーで検索</label>
        <input
          id="map-search"
          type="text"
          placeholder="車体番号・車名・ナンバーで検索"
          className="w-full pl-11 pr-10 py-2.5 bg-surface border border-line rounded-control focus:border-primary outline-none transition-colors text-sm text-ink"
          value={filters.query}
          onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
        />
        {filters.query && (
          <button
            onClick={() => { onFiltersChange({ ...filters, query: '' }); onHighlightVin(undefined); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
            aria-label="検索条件をクリア"
          >
            <CloseIcon size={16} />
          </button>
        )}

        {showCandidates && searchResults.length > 1 && (
          <div className="absolute z-10 mt-1 w-full bg-surface border border-line rounded-control shadow-lg py-1 max-h-64 overflow-y-auto">
            {searchResults.map(v => (
              <button
                key={v.id}
                onClick={() => handlePickCandidate(v)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-page text-sm"
              >
                <span className="text-ink font-medium">{v.Automaker} {v.ModelOfCar}</span>
                <span className="text-ink-muted text-xs">{v.Zone || '未配置'}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {filters.query && searchResults.length === 0 && (
        <p className="text-sm text-ink-muted">検索条件に一致する車両が見つかりません。</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-surface rounded-section border border-line p-6">
          <YardMap vehicles={vehicles} selectedZone={selectedVehicle?.Zone} onZoneSelect={handleZoneSelect} />
        </div>

        <div className="lg:col-span-4">
          <div className="bg-surface rounded-section border border-line p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="text-primary" size={18} aria-hidden="true" />
              <h3 className="text-base font-bold text-ink">選択中の車両</h3>
            </div>

            {selectedVehicle ? (
              <div className="flex-1 space-y-4">
                <div className="bg-page rounded-control p-4">
                  <p className="text-xs text-ink-muted mb-1">保管場所</p>
                  <p className="text-3xl font-bold text-ink">{selectedVehicle.Zone || '未配置'}</p>
                </div>

                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-ink-muted">車名</dt>
                    <dd className="font-semibold text-ink">{selectedVehicle.Automaker} {selectedVehicle.ModelOfCar}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-muted">車体番号</dt>
                    <dd className="font-mono text-ink">{selectedVehicle.VIN}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-muted">会社</dt>
                    <dd className="text-ink">{selectedVehicle.CompanyName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-muted">書類状況</dt>
                    <dd>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${documentToneClass(selectedVehicle.Document)}`}>
                        {documentLabel(selectedVehicle.Document)}
                      </span>
                    </dd>
                  </div>
                </dl>

                <button
                  onClick={() => onViewDetail(selectedVehicle.id)}
                  className="w-full py-3 bg-ink text-white rounded-control text-sm font-medium hover:bg-primary transition-colors"
                >
                  詳細を見る
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <MapPin size={40} strokeWidth={1.5} className="text-line mb-4" aria-hidden="true" />
                <p className="text-sm text-ink-muted">
                  区画または検索結果から<br />車両を選択してください。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YardMapPage;
