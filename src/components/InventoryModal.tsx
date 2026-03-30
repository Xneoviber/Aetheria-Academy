import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Sword, Shield, FlaskConical, Gem, Circle, X, Info, Trash2 } from 'lucide-react';
import { GAME_ITEMS } from '../constants';
import { cn } from '../lib/utils';

interface InventoryModalProps {
  show: boolean;
  onClose: () => void;
  inventory: string[];
  useItem: (itemName: string) => void;
  removeItem?: (itemName: string) => void;
}

type ItemCategory = 'All' | 'Weapon' | 'Armor' | 'Accessory' | 'Consumable' | 'Material';

export function InventoryModal({ show, onClose, inventory, useItem, removeItem }: InventoryModalProps) {
  const [activeCategory, setActiveCategory] = useState<ItemCategory>('All');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const categories: { id: ItemCategory; icon: any; label: string }[] = [
    { id: 'All', icon: <Package size={18} />, label: 'All Items' },
    { id: 'Weapon', icon: <Sword size={18} />, label: 'Weapons' },
    { id: 'Armor', icon: <Shield size={18} />, label: 'Armor' },
    { id: 'Accessory', icon: <Circle size={18} />, label: 'Accessories' },
    { id: 'Consumable', icon: <FlaskConical size={18} />, label: 'Consumables' },
    { id: 'Material', icon: <Gem size={18} />, label: 'Materials' },
  ];

  const filteredInventory = inventory.filter(itemName => {
    if (activeCategory === 'All') return true;
    return GAME_ITEMS[itemName]?.type === activeCategory;
  });

  const selectedItemData = selectedItem ? GAME_ITEMS[selectedItem] : null;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl h-[85vh] bg-magic-dark border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Sidebar - Categories */}
            <div className="w-full md:w-64 bg-white/5 border-r border-white/10 p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between md:justify-start gap-3">
                <div className="p-3 bg-magic-purple/20 rounded-2xl text-magic-purple border border-magic-purple/30">
                  <Package size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-display italic">Inventory</h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{inventory.length} / 20 Slots</p>
                </div>
                <button onClick={onClose} className="md:hidden p-2 text-slate-500 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible no-scrollbar pb-2 md:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setSelectedItem(null);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all border whitespace-nowrap md:w-full",
                      activeCategory === cat.id 
                        ? "bg-magic-purple text-white border-magic-purple shadow-lg shadow-magic-purple/20" 
                        : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
                    )}
                  >
                    <span className={cn(activeCategory === cat.id ? "text-white" : "text-magic-purple")}>
                      {cat.icon}
                    </span>
                    {cat.label}
                  </button>
                ))}
              </nav>

              <div className="mt-auto hidden md:block">
                <div className="p-4 bg-magic-purple/5 border border-magic-purple/10 rounded-2xl text-[10px] text-slate-400 leading-relaxed italic">
                  "The Arcane Bag expands to fit your needs, but even magic has its limits."
                </div>
              </div>
            </div>

            {/* Main Content - Item Grid */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar bg-magic-dark/50">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredInventory.map((itemName, i) => {
                  const item = GAME_ITEMS[itemName];
                  const isSelected = selectedItem === itemName;

                  return (
                    <motion.div
                      key={`${itemName}-${i}`}
                      layoutId={`${itemName}-${i}`}
                      onClick={() => setSelectedItem(itemName)}
                      className={cn(
                        "group relative aspect-square rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center p-4 gap-2",
                        isSelected 
                          ? "bg-magic-purple/20 border-magic-purple shadow-xl shadow-magic-purple/10" 
                          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                      )}
                    >
                      <div className={cn(
                        "p-4 rounded-2xl transition-transform group-hover:scale-110",
                        isSelected ? "bg-magic-purple/30 text-white" : "bg-white/5 text-magic-purple"
                      )}>
                        {item?.icon || <Package size={24} />}
                      </div>
                      <span className="text-[11px] font-bold text-white text-center line-clamp-1">{itemName}</span>
                      
                      {/* Item Type Badge */}
                      <div className="absolute top-3 right-3">
                         <div className="w-2 h-2 rounded-full bg-magic-purple animate-pulse" />
                      </div>
                    </motion.div>
                  );
                })}

                {filteredInventory.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-500 space-y-4 opacity-30">
                    <Package size={64} strokeWidth={1} />
                    <p className="text-lg font-display italic">No {activeCategory.toLowerCase()} items found...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Item Details */}
            <AnimatePresence>
              {selectedItem && selectedItemData && (
                <motion.div 
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  className="w-full md:w-80 bg-white/5 border-l border-white/10 p-8 flex flex-col gap-8 shadow-2xl z-10"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-magic-purple/20 rounded-3xl text-magic-purple border border-magic-purple/30">
                      {selectedItemData.icon}
                    </div>
                    <button 
                      onClick={() => setSelectedItem(null)}
                      className="p-2 text-slate-500 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-magic-purple bg-magic-purple/10 px-2 py-0.5 rounded uppercase tracking-widest border border-magic-purple/20">
                        {selectedItemData.type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        ID: {selectedItemData.id}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white font-display italic leading-tight">{selectedItemData.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed italic">"{selectedItemData.description}"</p>
                  </div>

                  {selectedItemData.stats && Object.keys(selectedItemData.stats).length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Info size={12} /> Attribute Bonuses
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(selectedItemData.stats).map(([stat, value]) => (
                          <div key={stat} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">{stat}</span>
                            <span className="text-magic-purple font-bold">+{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto space-y-3">
                    {['Weapon', 'Armor', 'Accessory', 'Consumable'].includes(selectedItemData.type) && (
                      <button 
                        onClick={() => {
                          useItem(selectedItem);
                          setSelectedItem(null);
                        }}
                        className="w-full py-4 bg-magic-purple hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-magic-purple/20 flex items-center justify-center gap-2 font-display"
                      >
                        {selectedItemData.type === 'Consumable' ? 'USE ITEM' : 'EQUIP ITEM'}
                      </button>
                    )}
                    
                    {removeItem && (
                      <button 
                        onClick={() => {
                          removeItem(selectedItem);
                          setSelectedItem(null);
                        }}
                        className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-red-500/20 uppercase tracking-widest"
                      >
                        <Trash2 size={14} /> Discard Item
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Close Button (Desktop) */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 hidden md:flex p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
