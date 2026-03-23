import { motion, AnimatePresence } from 'motion/react';
import { Map as MapIcon, Compass } from 'lucide-react';
import { Location } from '../types';

interface MapModalProps {
  show: boolean;
  onClose: () => void;
  currentLocation: string;
  world: Record<string, Location>;
}

export function MapModal({ show, onClose, currentLocation, world }: MapModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-magic-dark border border-magic-purple/30 rounded-3xl p-8 shadow-2xl space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white font-display italic glow-purple">Academy Grounds</h2>
              <p className="text-slate-400 text-sm">Visualize the arcane ley lines and pathways.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.entries(world).map(([name, loc]) => (
                <div 
                  key={name}
                  className={`p-4 rounded-2xl border transition-all ${
                    currentLocation === name 
                      ? 'bg-magic-purple/20 border-magic-purple/50 ring-2 ring-magic-purple/20' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={currentLocation === name ? 'text-magic-purple' : 'text-slate-500'}>
                      <Compass size={14} />
                    </div>
                    <h3 className={`text-xs font-bold uppercase tracking-widest ${currentLocation === name ? 'text-white' : 'text-slate-400'}`}>
                      {name}
                    </h3>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{loc.description}</p>
                  {currentLocation === name && (
                    <div className="mt-2 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-magic-purple animate-ping" />
                      <span className="text-[8px] font-black text-magic-purple uppercase">Current Location</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4 bg-magic-purple hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all font-display"
            >
              CLOSE MAP
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
