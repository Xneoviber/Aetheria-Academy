import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Save, RotateCcw, Home } from 'lucide-react';

interface GameMenuModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  onLoad: () => void;
  onReturnToMainMenu: () => void;
}

export function GameMenuModal({ show, onClose, onSave, onLoad, onReturnToMainMenu }: GameMenuModalProps) {
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
            className="relative w-full max-w-sm bg-magic-dark border border-magic-purple/30 rounded-3xl p-8 shadow-2xl space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white font-display italic glow-purple">Menu</h2>
              <p className="text-slate-400 text-sm">Academy of Arcane Arts</p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={onClose}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all font-display flex items-center justify-center gap-3 border border-white/5"
              >
                <Sparkles size={20} className="text-magic-purple" />
                RESUME
              </button>
              <button 
                onClick={onSave}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all font-display flex items-center justify-center gap-3 border border-white/5"
              >
                <Save size={20} className="text-magic-purple" />
                SAVE PROGRESS
              </button>
              <button 
                onClick={onLoad}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all font-display flex items-center justify-center gap-3 border border-white/5"
              >
                <RotateCcw size={20} className="text-magic-purple" />
                RESTORE PROGRESS
              </button>
              <div className="h-px bg-white/10 my-2" />
              <button 
                onClick={onReturnToMainMenu}
                className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-2xl transition-all font-display flex items-center justify-center gap-3 border border-red-500/20"
              >
                <Home size={20} />
                MAIN MENU
              </button>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-3 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
