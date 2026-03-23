import { motion, AnimatePresence } from 'motion/react';
import { Scroll, Zap, Package, CheckCircle2 } from 'lucide-react';
import { Quest } from '../types';

interface QuestModalProps {
  show: boolean;
  onClose: () => void;
  quests: Quest[];
}

export function QuestModal({ show, onClose, quests }: QuestModalProps) {
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
            className="relative w-full max-w-lg bg-magic-dark border border-magic-purple/30 rounded-3xl p-8 shadow-2xl space-y-6 max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white font-display italic glow-purple">Quest Journal</h2>
              <p className="text-slate-400 text-sm">Track your progress and rewards.</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {quests.map(quest => (
                <div key={quest.id} className={`p-5 rounded-2xl border transition-all ${
                  quest.isCompleted 
                    ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold font-display ${quest.isCompleted ? 'text-emerald-400 line-through' : 'text-white'}`}>
                          {quest.title}
                        </h3>
                        {quest.isCompleted && <CheckCircle2 size={14} className="text-emerald-400" />}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{quest.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-magic-purple uppercase tracking-tighter">
                        <Zap size={10} /> {quest.reward.xp} XP
                      </div>
                      {quest.reward.items?.map(item => (
                        <div key={item} className="flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase tracking-tighter">
                          <Package size={10} /> {item}
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {quest.isCompleted ? 'Completed' : 'Active'}
                    </div>
                  </div>
                </div>
              ))}
              {quests.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600">
                    <Scroll size={24} />
                  </div>
                  <p className="text-slate-500 text-sm italic">No active quests in your journal.</p>
                </div>
              )}
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4 bg-magic-purple hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all font-display"
            >
              CLOSE JOURNAL
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
