
import React, { useState, useRef, useEffect } from 'react';
import { Vehicle } from '../types';
import { Camera, Loader2, Save, Printer, ClipboardCheck, ChevronDown, ListFilter, Search } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface VehicleFormProps {
  initialZone?: string;
  vehicles: Vehicle[]; 
  presetVehicle?: Vehicle;
  onSubmit: (vehicle: Vehicle) => void;
  onClose?: () => void;
}

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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [tempId, setTempId] = useState<string>('');
  const [unassignedSearch, setUnassignedSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const unassignedVehicles = vehicles.filter(v => {
    const zone = v.Zone || '';
    return !zone || !/^[A-J]-\d+$/.test(zone);
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      const base64 = await base64Promise;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: "Extract car details: Automaker, ModelOfCar, Color, Year, NumberPlate. Return ONLY valid JSON." },
            { inlineData: { data: base64, mimeType: file.type } }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              Automaker: { type: Type.STRING },
              ModelOfCar: { type: Type.STRING },
              Color: { type: Type.STRING },
              Year: { type: Type.STRING },
              NumberPlate: { type: Type.STRING }
            }
          },
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      // JSON文字列をクレンジング (```json ... ``` を除去)
      let text = response.text || "{}";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) text = jsonMatch[0];
      
      const result = JSON.parse(text);
      setFormData(prev => ({ ...prev, ...result }));
    } catch (error) {
      console.error("AI Analysis Error:", error);
      alert("AI analysis failed. Please ensure the photo is clear.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalId = formData.id || Math.random().toString(36).substr(2, 9);
    setTempId(finalId);
    onSubmit({ ...formData, id: finalId } as Vehicle);
    setIsSubmitted(true);
  };

  const fields = [
    { id: 'Zone', label: 'Yard Slot', type: 'text', readOnly: !!initialZone },
    { id: 'DateOfReceipt', label: 'Date Received', type: 'date' },
    { id: 'CompanyName', label: 'Company Name', type: 'text' },
    { id: 'Automaker', label: 'Maker', type: 'select', options: ['Toyota', 'Nissan', 'Honda', 'Mazda', 'Mitsubishi', 'Subaru', 'Suzuki', 'Daihatsu', 'Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen', 'Other'] },
    { id: 'ModelOfCar', label: 'Model', type: 'text' },
    { id: 'VIN', label: 'VIN / Chassis ID', type: 'text' },
    { id: 'Year', label: 'Year', type: 'select', options: years },
    { id: 'Color', label: 'Color', type: 'select', options: ['White', 'Black', 'Silver', 'Pearl', 'Grey', 'Blue', 'Red', 'Green', 'Gold', 'Brown', 'Other'] },
    { id: 'NumberPlate', label: 'Plate', type: 'text' },
    { id: 'Destination', label: 'Destination', type: 'select', options: ['Kenya', 'Dubai', 'Tanzania', 'Pakistan', 'Uganda', 'Zambia', 'Mongolia', 'Other'] },
    { id: 'Document', label: 'Docs Status', type: 'select', options: ['OK', 'Pending', 'Missing'] },
    { id: 'ShippingDate', label: 'Shipping Date', type: 'date' },
  ];

  return (
    <div className="relative min-h-[600px] pb-10">
      <div className={`max-w-5xl mx-auto space-y-8 transition-all duration-700 ${isSubmitted ? 'blur-xl opacity-20 pointer-events-none' : 'animate-in fade-in'}`}>
        
        {/* 未割り当てリストの表示 - 常に表示されるように修正 */}
        {unassignedVehicles.length > 0 && (
          <div className="bg-blue-600 rounded-[40px] p-8 text-white shadow-xl shadow-blue-500/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ListFilter size={24} />
                <h4 className="text-xl font-black tracking-tight uppercase italic">Imported (Unassigned) List</h4>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={16} />
                <input type="text" placeholder="Search..." className="w-full bg-blue-700/50 border-none rounded-xl py-2 pl-10 text-xs font-bold text-white outline-none focus:ring-2 ring-blue-400" value={unassignedSearch} onChange={(e) => setUnassignedSearch(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {filteredUnassigned.map(v => (
                <button key={v.id} type="button" onClick={() => selectUnassigned(v)} className={`flex-shrink-0 w-64 border rounded-2xl p-5 text-left transition-all active:scale-95 ${formData.id === v.id ? 'bg-white border-white' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}>
                  <p className={`text-[10px] font-black uppercase mb-1 ${formData.id === v.id ? 'text-blue-600' : 'text-blue-200'}`}>{v.Automaker || 'Unknown'}</p>
                  <h5 className={`font-black text-lg truncate ${formData.id === v.id ? 'text-slate-900' : 'text-white'}`}>{v.ModelOfCar || 'No Name'}</h5>
                  <p className={`text-[9px] font-mono mt-2 opacity-60 truncate ${formData.id === v.id ? 'text-slate-400' : 'text-blue-100'}`}>{v.VIN || 'No VIN'}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
          <div className="bg-slate-900 p-8 lg:p-12 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-3xl font-black tracking-tighter uppercase italic">Manual Entry / AI Scan</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Target Slot: {formData.Zone}</p>
            </div>
            <div className="flex gap-4">
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleAIAnalysis} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isScanning} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center gap-3 transition-all">
                {isScanning ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
                {isScanning ? 'ANALYZING...' : 'PHOTO AUTO-FILL'}
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-10 lg:p-14">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {fields.map(field => (
                <div key={field.id} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                  <div className="relative">
                    {field.type === 'select' ? (
                      <select value={(formData as any)[field.id] || ''} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white outline-none font-bold text-slate-700 appearance-none" onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}>
                        <option value="">Select {field.label}</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input type={field.type} value={(formData as any)[field.id] || ''} readOnly={field.readOnly} className={`w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white outline-none font-bold text-slate-700 ${field.readOnly ? 'opacity-50' : ''}`} onChange={(e) => setFormData({...formData, [field.id]: e.target.value})} />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12"><button type="submit" className="w-full px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"><Save size={18} />Confirm and Save</button></div>
          </form>
        </div>
      </div>

      {isSubmitted && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/10 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-[48px] p-10 shadow-2xl flex flex-col items-center gap-8">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center"><ClipboardCheck size={40} className="animate-bounce" /></div>
            <div className="text-center space-y-2"><h4 className="text-2xl font-black text-slate-900 tracking-tighter">Registration Complete!</h4><p className="text-slate-400 font-bold text-[10px] uppercase">Registered to Slot {formData.Zone}</p></div>
            <button onClick={onClose} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Back to Map</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleForm;