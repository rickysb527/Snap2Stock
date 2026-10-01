
import React, { useState } from 'react';
import { Vehicle } from '../types';
import { X as CloseIcon } from 'lucide-react';
import YardMap from '../components/YardMap';
import VehicleForm from '../components/VehicleForm';

interface InboundMapFlowProps {
  vehicles: Vehicle[];
  presetVehicle?: Vehicle;
  onInboundComplete: (v: Vehicle) => void;
}

const InboundMapFlow: React.FC<InboundMapFlowProps> = ({ vehicles, onInboundComplete, presetVehicle }) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const handleSlotSelect = (zone: string) => {
    const existing = vehicles.find(v => v.Zone === zone);
    if (existing) {
      alert(`${zone} は既に使用されています。`);
      return;
    }
    setSelectedSlot(zone);
  };

  const handleCancel = () => {
    setSelectedSlot(null);
  };

  if (selectedSlot) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-ink">車両登録</h2>
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
          >
            <CloseIcon size={14} /> キャンセルしてマップへ戻る
          </button>
        </div>
        <div className="bg-selected text-primary rounded-control px-4 py-2 inline-block text-sm font-medium">
          保管場所：{selectedSlot}
        </div>
        <VehicleForm
          vehicles={vehicles}
          presetVehicle={presetVehicle}
          initialZone={selectedSlot}
          onSubmit={(v) => {
            onInboundComplete(v);
          }}
          onClose={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">
          {presetVehicle ? 'ヤードの場所を選択' : '車両登録'}
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          {presetVehicle
            ? `${presetVehicle.Automaker} ${presetVehicle.ModelOfCar} を配置する区画を選択してください。`
            : '登録する区画を選択してください。選択後、入力フォームに進みます。'}
        </p>
      </div>

      <div className="bg-surface rounded-section border border-line p-6 max-w-4xl">
        <YardMap vehicles={vehicles} selectedZone={selectedSlot ?? undefined} onZoneSelect={handleSlotSelect} />
      </div>
    </div>
  );
};

export default InboundMapFlow;
