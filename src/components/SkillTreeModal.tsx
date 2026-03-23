import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, BookOpen } from 'lucide-react';
import { Player, Skill } from '../types';

interface SkillTreeModalProps {
  show: boolean;
  onClose: () => void;
  player: Player;
  unlockSkill: (skillId: string) => void;
  skillTree: Skill[];
}

export function SkillTreeModal({ show, onClose, player, unlockSkill, skillTree }: SkillTreeModalProps) {
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
            className="relative w-full max-w-2xl bg-magic-dark border border-magic-purple/30 rounded-3xl p-8 shadow-2xl space-y-8 max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white font-display italic glow-purple">Arcane Skill Tree</h2>
              <p className="text-slate-400 text-sm">Unlock new powers with your earned skill points.</p>
            </div>

            <div className="flex justify-center gap-6">
              <div className="bg-magic-purple/10 py-2 px-6 rounded-full flex items-center gap-2">
                <BookOpen size={16} className="text-magic-purple" />
                <span className="text-magic-purple font-bold text-sm tracking-widest uppercase">SP: {player.skillPoints}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
              {/* Active Skills */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] pl-2 border-l-2 border-red-500">Active Spells</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {skillTree.filter(s => s.type === 'Active').map(skill => {
                    const isUnlocked = player.unlockedSkills.includes(skill.id);
                    const canUnlock = !isUnlocked && 
                                     player.skillPoints >= skill.cost && 
                                     skill.prerequisites.every(p => player.unlockedSkills.includes(p));
                    
                    return (
                      <div 
                        key={skill.id}
                        className={`p-4 rounded-2xl border transition-all relative group ${
                          isUnlocked 
                            ? 'bg-magic-purple/20 border-magic-purple/50' 
                            : canUnlock 
                              ? 'bg-white/5 border-white/20 hover:border-magic-purple/50 cursor-pointer' 
                              : 'bg-black/40 border-white/5 opacity-60'
                        }`}
                        onClick={() => canUnlock && unlockSkill(skill.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${isUnlocked ? 'bg-magic-purple text-white' : 'bg-white/10 text-slate-400'}`}>
                              {skill.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-white">{skill.name}</h3>
                                <span className="text-[8px] px-1.5 py-0.5 rounded-full uppercase font-black bg-red-500/20 text-red-400">
                                  {skill.manaCost} MP
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1">{skill.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-bold text-magic-purple uppercase">{skill.cost} SP</div>
                          </div>
                        </div>
                        {isUnlocked && (
                          <div className="absolute top-2 right-2">
                            <div className="w-2 h-2 rounded-full bg-magic-purple animate-pulse" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Passive Skills */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] pl-2 border-l-2 border-emerald-500">Passive Graces</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {skillTree.filter(s => s.type === 'Passive').map(skill => {
                    const isUnlocked = player.unlockedSkills.includes(skill.id);
                    const canUnlock = !isUnlocked && 
                                     player.skillPoints >= skill.cost && 
                                     skill.prerequisites.every(p => player.unlockedSkills.includes(p));
                    
                    return (
                      <div 
                        key={skill.id}
                        className={`p-4 rounded-2xl border transition-all relative group ${
                          isUnlocked 
                            ? 'bg-emerald-500/20 border-emerald-500/50' 
                            : canUnlock 
                              ? 'bg-white/5 border-white/20 hover:border-emerald-500/50 cursor-pointer' 
                              : 'bg-black/40 border-white/5 opacity-60'
                        }`}
                        onClick={() => canUnlock && unlockSkill(skill.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${isUnlocked ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                              {skill.icon}
                            </div>
                            <div>
                              <h3 className="font-bold text-white">{skill.name}</h3>
                              <p className="text-xs text-slate-400 mt-1">{skill.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-bold text-emerald-400 uppercase">{skill.cost} SP</div>
                          </div>
                        </div>
                        {isUnlocked && (
                          <div className="absolute top-2 right-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4 bg-magic-purple hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all font-display"
            >
              CLOSE SKILL TREE
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
