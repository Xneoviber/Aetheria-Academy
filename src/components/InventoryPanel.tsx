import { useState } from 'react';
import { motion } from 'motion/react';
import { Package, Sword, Shield, FlaskConical, Gem, Circle, Info } from 'lucide-react';
import { GAME_ITEMS } from '../constants';
import { cn } from '../lib/utils';

interface InventoryPanelProps {
  inventory: string[];
  useItem: (itemName: string) => void;
}

type ItemCategory = 'All' | 'Weapon' | 'Armor' | 'Accessory' | 'Consumable' | 'Material';

export function InventoryPanel({ inventory, useItem }: InventoryPanelProps) {
  const [activeCategory, setActiveCategory] = useState<ItemCategory>('All');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const categories: { id: ItemCategory; icon: any }[] = [
    { id: 'All', icon: <Package size={14} /> },
    { id: 'Weapon', icon: <Sword size={14} /> },
    { id: 'Armor', icon: <Shield size={14} /> },
    { id: 'Accessory', icon: <Circle size={14} /> },
    { id: 'Consumable', icon: <FlaskConical size={14} /> },
    { id: 'Material', icon: <Gem size={14} /> },
  ];

  const filteredInventory = inventory.filter(itemName => {
    if (activeCategory === 'All') return true;
    return GAME_ITEMS[itemName]?.type === activeCategory;
  });

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col h-full max-h-[600px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-slate-400">
          <Package size={18} />
          <h3 className="text-sm font-bold uppercase tracking-widest">Arcane Bag</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">
          {inventory.length} / 20
        </span>
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap border",
              activeCategory === cat.id 
                ? "bg-magic-purple text-white border-magic-purple shadow-lg shadow-magic-purple/20" 
                : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
            )}
          >
            {cat.icon}
            {cat.id}
          </button>
        ))}
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {filteredInventory.map((itemName, i) => {
          const item = GAME_ITEMS[itemName];
          const isSelected = selectedItem === itemName;

          return (
            <div key={i} className="space-y-2">
              <div 
                onClick={() => setSelectedItem(isSelected ? null : itemName)}
                className={cn(
                  "group relative flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                  isSelected 
                    ? "bg-magic-purple/10 border-magic-purple/30" 
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isSelected ? "bg-magic-purple/20 text-magic-purple" : "bg-white/5 text-slate-400"
                  )}>
                    {item?.icon || <Package size={14} />}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{itemName}</div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-tighter flex items-center gap-1">
                      <span className="opacity-60">ID:</span> {item?.id || 'unknown'}
                      <span className="mx-1 opacity-20">|</span>
                      <span className="opacity-60">Type:</span> {item?.type}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item && (item.type === 'Consumable' || ['Weapon', 'Armor', 'Accessory'].includes(item.type)) && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        useItem(itemName);
                      }}
                      className="bg-magic-purple/20 text-magic-purple text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-magic-purple/30 transition-all uppercase"
                    >
                      {item.type === 'Consumable' ? 'Use' : 'Equip'}
                    </button>
                  )}
                </div>
              </div>

              {/* Item Details (Expanded) */}
              {isSelected && item && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs space-y-3 overflow-hidden"
                >
                  <p className="text-slate-400 leading-relaxed italic">"{item.description}"</p>
                  
                  {item.stats && Object.keys(item.stats).length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                      {Object.entries(item.stats).map(([stat, value]) => (
                        <div key={stat} className="flex items-center justify-between">
                          <span className="text-slate-500 uppercase tracking-widest text-[9px]">{stat}</span>
                          <span className="text-magic-purple font-bold">+{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          );
        })}
        
        {filteredInventory.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-2 opacity-50">
            <Package size={32} strokeWidth={1} />
            <p className="text-xs italic">No {activeCategory.toLowerCase()} items found...</p>
          </div>
        )}
      </div>
    </div>
  );
}
