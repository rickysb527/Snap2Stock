
import React, { useState, useRef } from 'react';
import { Vehicle } from '../types';
import { MapPin, QrCode, Loader2, Camera, CheckCircle2, X as CloseIcon, Search } from 'lucide-react';
import { analyzeImage } from '../services/imageAnalysis';

interface MobileScannerProps {
  vehicles: Vehicle[];
  onUpdateZone: (id: string, newZone: string) => void;
}

type ScanState = 'idle' | 'analyzing' | 'found' | 'not-found' | 'error';

const MobileScanner: React.FC<MobileScannerProps> = ({ vehicles, onUpdateZone }) => {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [detectedVehicle, setDetectedVehicle] = useState<Vehicle | null>(null);
  const [newZone, setNewZone] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [vinQuery, setVinQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setDetectedVehicle(null);
    setScanState('analyzing');

    try {
      const response = await analyzeImage(file, 'identify');
      const rawText = response.text || '';
      const cleanedInput = rawText.replace(/[`\s]|ID:|Result:|yard-edit-|yard-v2:/gi, '').trim();

      if (cleanedInput !== 'NOT_FOUND' && cleanedInput.length > 2) {
        const parts = cleanedInput.split('|');
        const searchTerms = parts.map(p => p.toLowerCase());

        const vehicle = vehicles.find(v => {
          const vId = v.id.toLowerCase();
          const vVin = v.VIN.toLowerCase();
          const vVinNoHyphen = vVin.replace(/-/g, '');

          return searchTerms.some(term => {
            const termNoHyphen = term.replace(/-/g, '');
            return (
              vId === term ||
              vVin === term ||
              vVin.includes(term) ||
              vVinNoHyphen === termNoHyphen ||
              termNoHyphen.includes(vVinNoHyphen)
            );
          });
        });

        if (vehicle) {
          setDetectedVehicle(vehicle);
          setScanState('found');
        } else {
          setScanState('not-found');
        }
      } else {
        setScanState('not-found');
      }
    } catch (err) {
      console.error('Analysis Error:', err);
      setScanState('error');
    }
  };

  const handleUpdate = () => {
    if (detectedVehicle && newZone) {
      onUpdateZone(detectedVehicle.id, newZone);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setDetectedVehicle(null);
        setNewZone('');
        setPreviewUrl(null);
        setScanState('idle');
      }, 2000);
    }
  };

  const reset = () => {
    setDetectedVehicle(null);
    setPreviewUrl(null);
    setNewZone('');
    setScanState('idle');
  };

  const handleVinSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = vinQuery.trim().toLowerCase();
    if (!q) return;
    const vehicle = vehicles.find(v => v.VIN.toLowerCase().includes(q));
    if (vehicle) {
      setDetectedVehicle(vehicle);
      setScanState('found');
      setPreviewUrl(null);
    } else {
      setScanState('not-found');
      setDetectedVehicle(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">QRスキャン</h2>
        <p className="text-sm text-ink-muted mt-1">車両ラベルのQRコードを撮影して在庫情報を照合します。</p>
      </div>

      <div className="bg-surface rounded-section border border-line overflow-hidden min-h-[360px] flex flex-col items-center justify-center">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          ref={fileInputRef}
          onChange={handleCapture}
        />

        {!previewUrl ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-selected text-primary rounded-section flex items-center justify-center mb-6">
              <QrCode size={36} />
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">車両をスキャン</h3>
            <p className="text-sm text-ink-muted mb-8 leading-relaxed max-w-sm">
              QRコードが読み取れない場合は、車体番号（VIN）でも検索できます。
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-3.5 bg-primary text-white rounded-control text-sm font-medium hover:bg-primary-hover transition-colors flex items-center gap-2"
            >
              <Camera size={18} />
              撮影して読み取る
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col">
            <div className="relative aspect-[4/3] w-full bg-page overflow-hidden">
              <img src={previewUrl} className="w-full h-full object-cover" alt="撮影した画像のプレビュー" />
              {scanState === 'analyzing' && (
                <div className="absolute inset-0 bg-ink/60 flex flex-col items-center justify-center">
                  <Loader2 size={40} className="text-white animate-spin mb-3" />
                  <p className="text-white text-sm font-medium">読取中...</p>
                </div>
              )}
              <button
                onClick={reset}
                className="absolute top-4 right-4 p-2 bg-white/80 text-ink rounded-full hover:bg-white transition-colors"
                aria-label="閉じる"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {scanState === 'found' && detectedVehicle && (
              <div className="p-6 space-y-5">
                {isSuccess ? (
                  <div className="py-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-success-bg text-success-text rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <p className="text-lg font-bold text-ink">更新が完了しました</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-xs font-medium text-primary mb-1">該当車両が見つかりました</p>
                      <h4 className="text-lg font-bold text-ink">{detectedVehicle.Automaker} {detectedVehicle.ModelOfCar}</h4>
                      <p className="text-xs font-mono text-ink-muted mt-1">{detectedVehicle.VIN}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-page rounded-control border border-line">
                        <p className="text-xs text-ink-muted mb-1">現在の保管場所</p>
                        <p className="text-lg font-bold text-ink">{detectedVehicle.Zone || '未配置'}</p>
                      </div>
                      <div className="p-4 bg-selected rounded-control border border-primary/20">
                        <label htmlFor="new-zone" className="text-xs text-primary mb-1 block">新しい保管場所</label>
                        <input
                          id="new-zone"
                          type="text"
                          value={newZone}
                          placeholder="例: B-2"
                          className="w-full bg-transparent border-none outline-none text-lg font-bold text-primary placeholder:text-primary/40"
                          onChange={(e) => setNewZone(e.target.value.toUpperCase())}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-3 bg-page border border-line text-ink rounded-control text-sm font-medium hover:bg-selected transition-colors"
                      >
                        撮り直す
                      </button>
                      <button
                        onClick={handleUpdate}
                        disabled={!newZone}
                        className="flex-[2] py-3 bg-ink text-white rounded-control text-sm font-medium disabled:opacity-30 transition-opacity flex items-center justify-center gap-2 hover:bg-primary"
                      >
                        <MapPin size={16} /> 保管場所を変更
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {scanState === 'not-found' && (
              <div className="p-10 text-center">
                <p className="text-sm font-medium text-ink mb-1">該当する車両が見つかりませんでした。</p>
                <p className="text-xs text-ink-muted mb-6">QRコードや車体番号をもう一度ご確認ください。</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-primary text-white rounded-control text-sm font-medium hover:bg-primary-hover transition-colors"
                >
                  再撮影
                </button>
              </div>
            )}

            {scanState === 'error' && (
              <div className="p-10 text-center">
                <p className="text-sm font-medium text-danger-text mb-1">読取処理に失敗しました。</p>
                <p className="text-xs text-ink-muted mb-6">通信状況を確認し、もう一度お試しください。</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-primary text-white rounded-control text-sm font-medium hover:bg-primary-hover transition-colors"
                >
                  再試行
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-surface rounded-section border border-line p-5">
        <h3 className="text-sm font-bold text-ink mb-3">車体番号で検索</h3>
        <form onSubmit={handleVinSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={16} aria-hidden="true" />
          <label htmlFor="vin-search" className="sr-only">車体番号（VIN）で検索</label>
          <input
            id="vin-search"
            type="text"
            placeholder="車体番号（VIN）を入力"
            className="w-full pl-10 pr-4 py-2.5 bg-page border border-line rounded-control focus:bg-surface focus:border-primary outline-none text-sm text-ink"
            value={vinQuery}
            onChange={(e) => setVinQuery(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
};

export default MobileScanner;
