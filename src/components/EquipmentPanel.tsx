import { Shield, Package } from 'lucide-react';
import { Equipment } from '../types';
import { GAME_ITEMS } from '../constants';

interface EquipmentPanelProps {
  equipment: Equipment;
  unequipItem: (slot: keyof Equipment) => void;
}

export function EquipmentPanel({ equipment, unequipItem }: EquipmentPanelProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-4 text-slate-400">
        <Shield size={18} />
        <h3 className="text-sm font-bold uppercase tracking-widest">Equipment</h3>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(equipment).map(([slot, itemName]) => {
          const typedItemName = itemName as string | null;
          return (
            <div key={slot} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 text-sm">
              <div className="flex items-center gap-3">
                <div className="text-[10px] font-bold text-slate-500 uppercase w-16">{slot}</div>
                {typedItemName ? (
                  <div className="flex items-center gap-2 text-white">
                    {GAME_ITEMS[typedItemName]?.icon}
                    <span>{typedItemName}</span>
                  </div>
                ) : (
                  <span className="text-slate-600 italic">Empty</span>
                )}
              </div>
              {typedItemName && (
                <button 
                  onClick={() => unequipItem(slot as keyof Equipment)}
                  className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase"
                >
                  Unequip
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
