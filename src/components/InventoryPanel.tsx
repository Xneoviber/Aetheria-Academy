import { Package } from 'lucide-react';
import { GAME_ITEMS } from '../constants';

interface InventoryPanelProps {
  inventory: string[];
  useItem: (itemName: string) => void;
}

export function InventoryPanel({ inventory, useItem }: InventoryPanelProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-4 text-slate-400">
        <Package size={18} />
        <h3 className="text-sm font-bold uppercase tracking-widest">Arcane Bag</h3>
      </div>
      <div className="space-y-2">
        {inventory.map((itemName, i) => {
          const item = GAME_ITEMS[itemName];
          return (
            <div key={i} className="group relative flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 text-sm hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="text-magic-purple">{item?.icon || <Package size={14} />}</div>
                <div>
                  <div className="font-bold text-white">{itemName}</div>
                  <div className="text-[10px] text-slate-500">{item?.description}</div>
                </div>
              </div>
              {item && (item.type === 'Consumable' || ['Weapon', 'Armor', 'Accessory'].includes(item.type)) && (
                <button 
                  onClick={() => useItem(itemName)}
                  className="opacity-0 group-hover:opacity-100 bg-magic-purple/20 text-magic-purple text-[10px] font-bold px-2 py-1 rounded-lg hover:bg-magic-purple/30 transition-all uppercase"
                >
                  {item.type === 'Consumable' ? 'Use' : 'Equip'}
                </button>
              )}
            </div>
          );
        })}
        {inventory.length === 0 && (
          <p className="text-xs text-slate-500 italic text-center py-4">Your bag is empty...</p>
        )}
      </div>
    </div>
  );
}
