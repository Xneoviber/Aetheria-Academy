import { motion, AnimatePresence } from 'motion/react';
import { User, Zap, Shield, Wind } from 'lucide-react';
import { GameState, Skill } from '../types';
import { CombatLog } from './CombatLog';

interface CombatViewProps {
  gameState: GameState;
  attack: () => void;
  castSkill: (skillId: string) => void;
  retreat: () => void;
  skillTree: Skill[];
}

export function CombatView({ gameState, attack, castSkill, retreat, skillTree }: CombatViewProps) {
  if (!gameState.enemy) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative group"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-magic-purple/50 to-red-500/50 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
      <div className="relative bg-magic-dark border border-white/10 p-8 rounded-[3rem] backdrop-blur-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${gameState.turn === 'player' ? 'scale-110 opacity-100' : 'opacity-20 scale-90 grayscale'}`}>
                <div className="p-3 rounded-full bg-magic-purple/20 border border-magic-purple/40 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  <User size={24} className="text-magic-purple" />
                </div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Apprentice</span>
              </div>
              
              <div className="text-white/20 font-black italic text-2xl">VS</div>

              <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${gameState.turn === 'enemy' ? 'scale-110 opacity-100' : 'opacity-20 scale-90 grayscale'}`}>
                <div className="p-3 rounded-full bg-red-500/20 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                  <Zap size={24} className="text-red-500" />
                </div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Adversary</span>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-magic-purple/50 to-red-500/50 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <div className="relative bg-black/80 border border-white/10 p-5 rounded-[2rem] backdrop-blur-2xl overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[9px] font-bold text-magic-purple uppercase tracking-[0.2em] block mb-1">Target Entity</span>
                    <h3 className="text-2xl font-bold text-white font-display">{gameState.enemy.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1">Threat Level</span>
                    <span className="text-sm font-mono text-red-400 font-bold">LVL {gameState.enemy.level}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative h-5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 via-magic-purple to-indigo-500"
                      initial={{ width: "100%" }}
                      animate={{ width: `${(gameState.enemy.hp / gameState.enemy.maxHp) * 100}%` }}
                      transition={{ type: "spring", stiffness: 40, damping: 15 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-black text-white drop-shadow-md tracking-widest">
                        {gameState.enemy.hp} / {gameState.enemy.maxHp} HP
                      </span>
                    </div>
                  </div>
                  
                  <CombatLog logs={gameState.combatLog} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              disabled={gameState.turn !== 'player'}
              onClick={attack}
              className={`relative group overflow-hidden py-5 rounded-3xl font-black font-display transition-all flex flex-col items-center justify-center gap-1 border shadow-2xl ${
                gameState.turn === 'player' 
                  ? 'bg-magic-purple border-magic-purple/50 text-white hover:bg-indigo-500 shadow-magic-purple/40 scale-[1.02] active:scale-95' 
                  : 'bg-white/5 border-white/10 text-slate-600 cursor-not-allowed grayscale'
              }`}
            >
              <Zap size={24} className={gameState.turn === 'player' ? 'animate-bounce' : ''} />
              <span className="text-[10px] uppercase tracking-[0.2em]">Basic</span>
              <span className="text-lg">SPARK</span>
              {gameState.turn === 'player' && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              )}
            </button>

            {skillTree.filter(s => s.type === 'Active' && gameState.player.unlockedSkills?.includes(s.id)).map(skill => (
              <button 
                key={skill.id}
                disabled={gameState.turn !== 'player' || gameState.player.mp < skill.manaCost}
                onClick={() => castSkill(skill.id)}
                className={`relative group overflow-hidden py-5 rounded-3xl font-black font-display transition-all flex flex-col items-center justify-center gap-1 border shadow-2xl ${
                  gameState.turn === 'player' && gameState.player.mp >= skill.manaCost
                    ? 'bg-red-600 border-red-400/50 text-white hover:bg-red-500 shadow-red-600/40 scale-[1.02] active:scale-95' 
                    : 'bg-white/5 border-white/10 text-slate-600 cursor-not-allowed grayscale'
                }`}
              >
                <div className="flex items-center gap-2">
                  {skill.icon}
                  <span className="text-[10px] uppercase tracking-[0.2em]">{skill.name}</span>
                </div>
                <span className="text-lg">{skill.manaCost} MP</span>
                {gameState.turn === 'player' && gameState.player.mp >= skill.manaCost && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                )}
              </button>
            ))}

            <button 
              onClick={retreat}
              className="relative group overflow-hidden py-5 rounded-3xl font-black font-display transition-all flex flex-col items-center justify-center gap-1 border border-white/10 bg-white/5 text-slate-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 active:scale-95"
            >
              <Wind size={24} />
              <span className="text-[10px] uppercase tracking-[0.2em]">Tactical</span>
              <span className="text-lg">RETREAT</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
