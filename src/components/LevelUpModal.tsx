import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Wind, Flame, Trophy } from 'lucide-react';
import { Player, GameState } from '../types';

interface LevelUpModalProps {
  show: boolean;
  onClose: () => void;
  player: Player;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  getTotalStats: () => Player;
}

export function LevelUpModal({ show, onClose, player, setGameState, getTotalStats }: LevelUpModalProps) {
  const stats = [
    { key: 'int', label: 'Intelligence', icon: <Sparkles size={16} /> },
    { key: 'vit', label: 'Vitality', icon: <Heart size={16} /> },
    { key: 'agi', label: 'Agility', icon: <Wind size={16} /> },
    { key: 'str', label: 'Strength', icon: <Flame size={16} /> },
    { key: 'lck', label: 'Luck', icon: <Trophy size={16} /> },
  ];

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
            className="relative w-full max-w-md bg-magic-dark border border-magic-purple/30 rounded-3xl p-8 shadow-2xl space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white font-display italic glow-purple">Level Up</h2>
              <p className="text-slate-400 text-sm">Distribute your earned attribute points.</p>
            </div>

            <div className="bg-magic-purple/10 py-2 px-4 rounded-full text-center">
              <span className="text-magic-purple font-bold text-sm tracking-widest uppercase">AP Remaining: {player.attributePoints}</span>
            </div>

            <div className="space-y-3">
              {stats.map((stat) => (
                <div key={stat.key} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="text-magic-purple">{stat.icon}</div>
                    <div className="text-white font-bold text-sm">{stat.label}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Base</span>
                      <span className="w-6 text-center font-bold text-white">{(player[stat.key as keyof Player] as number)}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] text-magic-purple uppercase font-bold tracking-tighter">Total</span>
                      <span className="w-6 text-center font-bold text-magic-purple">{(getTotalStats()[stat.key as keyof Player] as number)}</span>
                    </div>
                    <button 
                      disabled={player.attributePoints <= 0}
                      onClick={() => {
                        setGameState(prev => {
                          const newPlayer = { ...prev.player };
                          (newPlayer[stat.key as keyof Player] as number) += 1;
                          newPlayer.attributePoints -= 1;
                          
                          // Recalculate HP/MP if VIT/INT changed
                          if (stat.key === 'vit') {
                            newPlayer.maxHp = newPlayer.vit * 10 + 50 + (newPlayer.trait === "Resilient Soul" ? 30 : 0);
                            newPlayer.hp = Math.min(newPlayer.hp + 10, newPlayer.maxHp);
                          }
                          if (stat.key === 'int') {
                            newPlayer.maxMp = newPlayer.int * 10 + 50 + (newPlayer.trait === "Arcane Prodigy" ? 30 : 0);
                            newPlayer.mp = Math.min(newPlayer.mp + 10, newPlayer.maxMp);
                          }
                          
                          return { ...prev, player: newPlayer };
                        });
                      }}
                      className="w-8 h-8 rounded-lg bg-magic-purple/20 border border-magic-purple/30 text-magic-purple flex items-center justify-center hover:bg-magic-purple/30 disabled:opacity-30 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4 bg-magic-purple hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all font-display"
            >
              CLOSE
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
