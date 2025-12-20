
import React, { useState, useRef } from 'react';
import { Vehicle, VehicleStatus } from '../types';
import { 
  Camera, Save, X, AlertCircle, Info, MapPin, 
  Sparkles, Loader2, Upload, FileSearch, 
  CheckCircle2, ChevronRight, Image as ImageIcon,
  Code
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface VehicleFormProps {
  onSubmit: (vehicle: Omit<Vehicle, 'id'>) => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    controlNumber: `MGT-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    status: VehicleStatus.INVENTORY,
    arrivalDate: new Date().toISOString().split('T')[0],
    companyName: '自社在庫',
    locationCode: 'A-01-01'
  });

  const [isScanning, setIsScanning] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [rawJson, setRawJson] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // プレビュー表示
    const newPreviews: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = URL.createObjectURL(files[i]);
      newPreviews.push(url);
    }
    setPreviews(newPreviews);

    setIsScanning(true);
    setRawJson(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const imageParts = await Promise.all(
        Array.from(files).map(async (file) => {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
          });
          return {
            inlineData: {
              data: base64,
              mimeType: file.type
            }
          };
        })
      );

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { text: `Analyze the vehicle image(s) and extract data. 
Strict Rules:
- Fill only fields that are clearly and certainly visible.
- Use null for any unknown, unclear, or invisible fields. DO NOT GUESS.
- Automaker: Formal English name (e.g., "Toyota", "Nissan", "Honda").
- ModelOfCar: Only if clearly identifiable.
- Color: Common English color name (white, black, silver, etc.).
- NumberPlate: null if unreadable or not visible.
- VIN: Extract only if the ID is clearly visible on the body or document.
- Note: Short supplementary explanation in Japanese (within 50 characters).
- Fields like Destination, CompanyName, Document, ShippingDate, and DateOfReceipt should be null unless they are explicitly written in a visible document within the photo.` },
              ...imageParts
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              Zone: { type: Type.STRING, nullable: true },
              DateOfReceipt: { type: Type.STRING, nullable: true },
              CompanyName: { type: Type.STRING, nullable: true },
              Automaker: { type: Type.STRING, nullable: true },
              ModelOfCar: { type: Type.STRING, nullable: true },
              VIN: { type: Type.STRING, nullable: true },
              Year: { type: Type.STRING, nullable: true },
              Color: { type: Type.STRING, nullable: true },
              NumberPlate: { type: Type.STRING, nullable: true },
              Destination: { type: Type.STRING, nullable: true },
              Document: { type: Type.STRING, nullable: true },
              ShippingDate: { type: Type.STRING, nullable: true },
              Note: { type: Type.STRING, nullable: true }
            },
            required: ["Zone", "DateOfReceipt", "CompanyName", "Automaker", "ModelOfCar", "VIN", "Year", "Color", "NumberPlate", "Destination", "Document", "ShippingDate", "Note"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setRawJson(JSON.stringify(result, null, 2));
      
      // フォームデータを更新
      setFormData(prev => ({
        ...prev,
        carName: [result.Automaker, result.ModelOfCar].filter(Boolean).join(' ') || prev.carName,
        vin: result.VIN || prev.vin,
        color: result.Color || prev.color,
        remarks: [result.Note, result.NumberPlate ? `ナンバー: ${result.NumberPlate}` : null].filter(Boolean).join('\n') || prev.remarks,
        companyName: result.CompanyName || prev.companyName,
        destination: result.Destination || prev.destination
      }));

    } catch (error) {
      console.error("AI Scan Error:", error);
      alert("AIスキャンに失敗しました。直接入力してください。");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.carName || !formData.vin) return;
    onSubmit(formData as Omit<Vehicle, 'id'>);
  };

  const InputLabel = ({ children, required }: { children?: React.ReactNode, required?: boolean }) => (
    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 pl-1">
      {children} {required && <span className="text-blue-500 ml-1 leading-none">*</span>}
    </label>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
      {/* AI Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 blur-[80px]"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/40">
                <Sparkles className="text-white" size={28} />
              </div>
              <h2 className="text-3xl font-black tracking-tighter mb-4 leading-[1.1]">AI Vision<br/>Intake Scanner</h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed opacity-90">
                車両の写真をアップロードまたは撮影してください。AIが画像を解析し、正確な在庫データを抽出します。
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-blue-500" />
              Extraction Rule
            </h4>
            <ul className="space-y-3">
              {['確実な情報のみ抽出', '不明な項目はnullで返却', '日本語の補足メモ生成'].map(rule => (
                <li key={rule} className="text-xs font-bold text-slate-600 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div 
            className={`
              h-full min-h-[440px] rounded-[48px] border-2 border-dashed transition-all duration-700 flex flex-col items-center justify-center p-10 relative overflow-hidden group
              ${isScanning ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50/30'}
              ${previews.length > 0 ? 'border-solid' : ''}
            `}
          >
            {isScanning && (
              <div className="absolute inset-0 z-20 pointer-events-none">
                <div className="h-full w-full bg-gradient-to-b from-transparent via-blue-500/10 to-transparent animate-[shimmer_2s_infinite] -translate-y-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4 bg-white/80 backdrop-blur-md px-10 py-8 rounded-[32px] shadow-2xl border border-white">
                    <Loader2 size={40} className="animate-spin text-blue-600" />
                    <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] animate-pulse">Analyzing Visuals</span>
                  </div>
                </div>
              </div>
            )}

            <input 
              type="file" 
              accept="image/*" 
              multiple 
              capture="environment"
              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              disabled={isScanning}
            />

            {previews.length > 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-10">
                <div className="flex -space-x-6">
                  {previews.slice(0, 4).map((src, i) => (
                    <div key={i} className="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl overflow-hidden rotate-[4deg] first:rotate-[-4deg] even:rotate-[-2deg] odd:rotate-[2deg] transition-all hover:scale-110 hover:z-30">
                      <img src={src} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {previews.length > 4 && (
                    <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-lg z-20">
                      +{previews.length - 4}
                    </div>
                  )}
                </div>
                
                <div className="text-center z-10">
                  <h3 className="text-2xl font-black tracking-tighter text-slate-900 mb-2">
                    {isScanning ? 'AI Analysis Active' : 'Data Ready to Process'}
                  </h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                    Tap to replace or add more photos
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-8 group-hover:scale-105 transition-transform duration-500">
                <div className="relative">
                  <div className="absolute -inset-6 bg-blue-100/50 rounded-full blur-2xl group-hover:bg-blue-200/50 transition-colors"></div>
                  <div className="relative w-28 h-28 bg-blue-50 rounded-[40px] flex items-center justify-center text-blue-600 shadow-inner border border-blue-100/50">
                    <Camera size={44} strokeWidth={1.5} />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tighter text-slate-900 mb-3">Capture or Upload</h3>
                  <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                    スマホのカメラで車両を撮影、またはライブラリから写真を選択してください。AIが瞬時に在庫化します。
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-8 py-4 bg-slate-900 text-white rounded-[20px] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all">
                    Choose Assets
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI JSON Output Preview (Optional/Debug) */}
      {rawJson && (
        <div className="bg-slate-50 rounded-[40px] border border-slate-100 p-8 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between mb-6">
            <h4 className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest">
              <Code size={16} className="text-blue-500" />
              Extracted Raw JSON
            </h4>
            <span className="text-[10px] font-bold text-slate-400">Gemini 3 Flash Output</span>
          </div>
          <pre className="bg-slate-900 text-blue-300 p-6 rounded-3xl text-[11px] font-mono overflow-x-auto shadow-inner leading-relaxed">
            {rawJson}
          </pre>
        </div>
      )}

      {/* Manual Input Form Section */}
      <form onSubmit={handleSubmit} className="bg-white rounded-[64px] border border-slate-100 shadow-2xl shadow-slate-200/50 p-10 lg:p-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Main Specs */}
          <div className="lg:col-span-7 space-y-14">
            <div>
              <div className="flex items-center space-x-4 mb-12">
                <div className="w-2.5 h-10 bg-blue-600 rounded-full shadow-lg shadow-blue-200"></div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Vehicle Master</h3>
                  <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] mt-2 uppercase">Core Inventory Data</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="md:col-span-2 group">
                  <InputLabel required>Vehicle Designation</InputLabel>
                  <div className="relative">
                    <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={22} />
                    <input
                      type="text"
                      name="carName"
                      required
                      placeholder="e.g. TOYOTA ALPHARD EXECUTIVE LOUNGE"
                      value={formData.carName || ''}
                      onChange={handleChange}
                      className="w-full pl-16 pr-8 py-6 bg-slate-50 border-2 border-transparent rounded-[32px] focus:bg-white focus:border-blue-500/20 focus:ring-[12px] focus:ring-blue-500/5 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 shadow-sm text-lg"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 group">
                  <InputLabel required>Body Identifier (VIN)</InputLabel>
                  <div className="relative">
                    <FileSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={22} />
                    <input
                      type="text"
                      name="vin"
                      required
                      placeholder="FRAME NUMBER / CHASSIS ID"
                      value={formData.vin || ''}
                      onChange={handleChange}
                      className="w-full pl-16 pr-8 py-6 bg-slate-50 border-2 border-transparent rounded-[32px] focus:bg-white focus:border-blue-500/20 focus:ring-[12px] focus:ring-blue-500/5 outline-none transition-all font-mono font-bold text-slate-700 placeholder:text-slate-300 shadow-sm uppercase tracking-wider text-lg"
                    />
                  </div>
                </div>

                <div className="group">
                  <InputLabel>Color Profile</InputLabel>
                  <input
                    type="text"
                    name="color"
                    placeholder="e.g. PEARL WHITE"
                    value={formData.color || ''}
                    onChange={handleChange}
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[28px] focus:bg-white focus:border-blue-500/20 focus:ring-[12px] focus:ring-blue-500/5 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
                  />
                </div>
                <div className="group">
                  <InputLabel>Arrival Timestamp</InputLabel>
                  <input
                    type="date"
                    name="arrivalDate"
                    value={formData.arrivalDate}
                    onChange={handleChange}
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-[28px] focus:bg-white focus:border-blue-500/20 focus:ring-[12px] focus:ring-blue-500/5 outline-none transition-all font-bold text-slate-700 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="group">
              <InputLabel>Condition Remarks & Diagnostics</InputLabel>
              <textarea
                name="remarks"
                rows={6}
                value={formData.remarks || ''}
                onChange={handleChange}
                className="w-full px-10 py-8 bg-slate-50 border-2 border-transparent rounded-[48px] focus:bg-white focus:border-blue-500/20 focus:ring-[12px] focus:ring-blue-500/5 outline-none transition-all resize-none font-medium text-slate-700 placeholder:text-slate-200 shadow-sm leading-relaxed"
                placeholder="AIが抽出した補足情報がここに表示されます。手動で編集も可能です..."
              />
            </div>
          </div>

          {/* Logistics Configuration */}
          <div className="lg:col-span-5">
            <div className="bg-slate-50 rounded-[56px] p-10 lg:p-14 border border-slate-100/60 sticky top-12 shadow-sm">
              <div className="flex items-center space-x-4 mb-14">
                <div className="w-2.5 h-10 bg-slate-900 rounded-full"></div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Logistics</h3>
                  <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] mt-2 uppercase">Destination & Location</p>
                </div>
              </div>

              <div className="space-y-12">
                <div className="relative group">
                  <InputLabel>Yard Allocation Code</InputLabel>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={22} />
                    <input
                      type="text"
                      name="locationCode"
                      placeholder="A-01-01"
                      value={formData.locationCode || ''}
                      onChange={handleChange}
                      className="w-full pl-16 pr-8 py-6 bg-white border-2 border-transparent rounded-[32px] shadow-sm focus:border-blue-500/20 focus:ring-[12px] focus:ring-blue-500/5 outline-none transition-all font-black text-blue-600 placeholder:text-slate-200 tracking-[0.3em] uppercase text-lg"
                    />
                  </div>
                </div>

                <div className="group">
                  <InputLabel>Asset Owner</InputLabel>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName || ''}
                    onChange={handleChange}
                    className="w-full px-10 py-6 bg-white border-2 border-transparent rounded-[32px] shadow-sm focus:border-blue-500/20 focus:ring-[12px] focus:ring-blue-500/5 outline-none transition-all font-bold text-slate-700 text-lg"
                  />
                </div>

                <div className="group">
                  <InputLabel>Export Target Port</InputLabel>
                  <input
                    type="text"
                    name="destination"
                    placeholder="e.g. DUBAI, UAE"
                    value={formData.destination || ''}
                    onChange={handleChange}
                    className="w-full px-10 py-6 bg-white border-2 border-transparent rounded-[32px] shadow-sm focus:border-blue-500/20 focus:ring-[12px] focus:ring-blue-500/5 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300 text-lg"
                  />
                </div>
              </div>

              <div className="mt-20 p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[48px] text-white/95 shadow-2xl shadow-blue-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="flex items-start space-x-5 relative z-10">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Info size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[13px] font-black leading-relaxed uppercase tracking-[0.2em] mb-2">Review Required</p>
                    <p className="text-sm text-blue-50 font-medium leading-relaxed opacity-90">
                      AIによる自動抽出結果を最終確認してください。特に車台番号と位置コードの整合性は業務フローにおいて極めて重要です。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-14 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-end space-y-6 sm:space-y-0 sm:space-x-8">
          <button 
            type="button"
            className="w-full sm:w-auto px-12 py-6 text-slate-400 font-black uppercase text-[12px] tracking-[0.2em] hover:text-rose-500 transition-all flex items-center justify-center space-x-3 group"
          >
            <X size={18} className="group-hover:rotate-90 transition-transform" />
            <span>Discard Entry</span>
          </button>
          <button 
            type="submit"
            disabled={!formData.carName || !formData.vin}
            className={`
              w-full sm:w-auto flex items-center justify-center space-x-4 px-20 py-7 rounded-[32px] shadow-2xl transition-all font-black uppercase text-[12px] tracking-[0.4em]
              ${(!formData.carName || !formData.vin) 
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                : 'bg-slate-900 text-white hover:bg-black shadow-slate-300 hover:scale-[1.03] active:scale-95'}
            `}
          >
            <Save size={22} />
            <span>Sync To Inventory</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
