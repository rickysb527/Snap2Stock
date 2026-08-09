
import React, { useState, useRef } from 'react';
import { Vehicle } from '../types';
import { MapPin, QrCode, Loader2, Camera, CheckCircle2, X as CloseIcon } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface MobileScannerProps {
  vehicles: Vehicle[];
  onUpdateZone: (id: string, newZone: string) => void;
}

const MobileScanner: React.FC<MobileScannerProps> = ({ vehicles, onUpdateZone }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedVehicle, setDetectedVehicle] = useState<Vehicle | null>(null);
  const [newZone, setNewZone] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setDetectedVehicle(null);
    setIsAnalyzing(true);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      const base64 = await base64Promise;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: "Identify the vehicle in this image. \n1. Primary: Extract data from the QR code. It may contain a simple ID 'yard-edit-ID' or a detailed string 'yard-v2:ID|VIN|MAKER|MODEL'. \n2. Secondary: If no QR, look for a VIN plate or license plate. \nReturn ONLY the most specific identification found (the ID from the QR, the full VIN, or the plate number). No extra text." },
            { inlineData: { data: base64, mimeType: file.type } }
          ]
        },
      });

      const rawText = response.text || '';
      // クレンジング: Markdownや「ID:」などの文字を除去
      const cleanedInput = rawText.replace(/[`\s]|ID:|Result:|yard-edit-|yard-v2:/gi, '').trim();

      if (cleanedInput !== 'NOT_FOUND' && cleanedInput.length > 2) {
        // パイプ区切りのリッチデータが含まれている場合、最初の要素（ID）または2番目（VIN）を使用
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
        } else {
          alert(`車両が見つかりませんでした。認識結果: ${cleanedInput}\n(リロードにより登録データが消えていないか確認してください)`);
        }
      } else {
        alert("QRコードまたは車両情報を認識できませんでした。もう少し近づけて撮影してください。");
      }
    } catch (err) {
      console.error("Analysis Error:", err);
      alert("AI解析中にエラーが発生しました。");
    } finally {
      setIsAnalyzing(false);
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
      }, 2000);
    }
  };

  const reset = () => {
    setDetectedVehicle(null);
    setPreviewUrl(null);
    setNewZone('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">QR Scanner</h2>
        <p className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">Hybrid QR & VIN Recognition</p>
      </div>

      <div className="relative bg-white rounded-[48px] overflow-hidden shadow-2xl border-8 border-white min-h-[400px] flex flex-col items-center justify-center group border border-slate-100">
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleCapture} 
        />

        {!previewUrl ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-32 h-32 bg-blue-50 text-blue-600 rounded-[40px] flex items-center justify-center mb-10 shadow-inner">
               <QrCode size={56} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">車両をスキャン</h3>
            <p className="text-slate-400 font-medium text-sm mb-12 leading-relaxed max-w-sm">
              車両ラベルのQRコードを撮影してください。<br/>QRが読み取れない場合は、車体番号(VIN)やナンバープレートでも認識可能です。
            </p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="group relative px-12 py-6 bg-blue-600 text-white rounded-[28px] font-black uppercase text-xs tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:scale-105 transition-all flex items-center gap-4"
            >
              <Camera size={20} />
              スキャンを開始
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col">
            <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
              <img src={previewUrl} className="w-full h-full object-cover" alt="Captured" />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center">
                   <Loader2 size={48} className="text-blue-400 animate-spin mb-4" />
                   <p className="text-white font-black text-[10px] uppercase tracking-[0.4em]">AI Processing Image...</p>
                </div>
              )}
              <button 
                onClick={reset}
                className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-all"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            {detectedVehicle && (
              <div className="p-8 space-y-6 animate-in slide-in-from-bottom duration-500">
                {isSuccess ? (
                  <div className="py-10 flex flex-col items-center text-center">
                     <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 size={40} />
                     </div>
                     <p className="text-2xl font-black text-slate-900 tracking-tight">更新が完了しました</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">認識結果</p>
                        <h4 className="text-2xl font-black text-slate-900">{detectedVehicle.Automaker} {detectedVehicle.ModelOfCar}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{detectedVehicle.VIN}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">現在の位置</p>
                        <p className="text-xl font-black text-slate-900">{detectedVehicle.Zone}</p>
                      </div>
                      <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">新しい位置</p>
                        <input 
                          type="text" 
                          value={newZone}
                          placeholder="例: B-2"
                          className="w-full bg-transparent border-none outline-none text-xl font-black text-blue-600 placeholder:text-blue-200"
                          onChange={(e) => setNewZone(e.target.value.toUpperCase())}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                       <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                      >
                        撮り直す
                      </button>
                      <button 
                        onClick={handleUpdate}
                        disabled={!newZone}
                        className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl disabled:opacity-20 transition-all flex items-center justify-center gap-3"
                      >
                        <MapPin size={18} /> スロットを変更
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {!detectedVehicle && !isAnalyzing && (
              <div className="p-12 text-center">
                <p className="text-slate-400 font-bold text-sm mb-6">車両の照合に失敗しました。</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest"
                >
                  再撮影
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileScanner;