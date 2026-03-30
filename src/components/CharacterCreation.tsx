import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Sparkles, 
  Flame, 
  Wind, 
  Heart, 
  Trophy, 
  ChevronRight, 
  ChevronLeft,
  Shield,
  Zap,
  Info,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Player, GameState } from '../types';
import { GRACES, CURSES } from '../constants';
import { cn } from '../lib/utils';

interface CharacterCreationProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  availablePoints: number;
  setAvailablePoints: React.Dispatch<React.SetStateAction<number>>;
  onComplete: () => void;
  playSound: () => void;
}

const STAT_CONFIG = [
  { key: 'int' as const, label: 'Intelligence', icon: <Sparkles size={18} />, desc: 'Magic Power & Mana', color: 'text-magic-purple' },
  { key: 'vit' as const, label: 'Vitality', icon: <Heart size={18} />, desc: 'Health & Defense', color: 'text-red-400' },
  { key: 'agi' as const, label: 'Agility', icon: <Wind size={18} />, desc: 'Evasion & Speed', color: 'text-emerald-400' },
  { key: 'str' as const, label: 'Strength', icon: <Flame size={18} />, desc: 'Physical Might', color: 'text-orange-400' },
  { key: 'lck' as const, label: 'Luck', icon: <Trophy size={18} />, desc: 'Crits & Fortune', color: 'text-yellow-400' },
];

export const CharacterCreation: React.FC<CharacterCreationProps> = ({
  gameState,
  setGameState,
  availablePoints,
  setAvailablePoints,
  onComplete,
  playSound
}) => {
  const [step, setStep] = useState<'gender' | 'stats' | 'grace-curse'>('gender');

  const currentGrace = useMemo(() => GRACES.find(g => g.name === gameState.player.grace), [gameState.player.grace]);
  const currentCurse = useMemo(() => CURSES.find(c => c.name === gameState.player.curse), [gameState.player.curse]);

  const synergy = useMemo(() => {
    const g = gameState.player.grace;
    const c = gameState.player.curse;
    
    if (g === "Arcane Affinity" && c === "Mana Leak") return { name: "Mana Surge", desc: "Your mana burns bright. +5 INT bonus." };
    if (g === "Iron Skin" && c === "Brittle Bones") return { name: "Hardened Shell", desc: "Brittle but tough. +5 VIT bonus." };
    if (g === "Fleet Foot" && c === "Heavy Burden") return { name: "Steady Momentum", desc: "Slow start, fast finish. +5 AGI bonus." };
    if (g === "Giant's Might" && c === "Feeble Mind") return { name: "Primal Force", desc: "Strength over mind. +5 STR bonus." };
    if (g === "Fortune's Favor" && c === "Unlucky Soul") return { name: "Gambler's Paradox", desc: "Luck in the dark. +5 LCK bonus." };
    
    return null;
  }, [gameState.player.grace, gameState.player.curse]);

  const handleStatChange = (stat: keyof Player, delta: number) => {
    const currentValue = gameState.player[stat] as number;
    if (delta > 0 && availablePoints <= 0) return;
    if (delta < 0 && currentValue <= 5) return;

    playSound();
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        [stat]: currentValue + delta
      }
    }));
    setAvailablePoints(prev => prev - delta);
  };

  const handleGraceChange = (graceName: string) => {
    const newGrace = GRACES.find(g => g.name === graceName);
    if (!newGrace) return;

    const costDiff = (currentGrace?.cost || 0) - newGrace.cost;
    
    // Check if we have enough points to switch
    if (availablePoints + costDiff < 0) return;

    playSound();
    setGameState(prev => ({
      ...prev,
      player: { ...prev.player, grace: graceName }
    }));
    setAvailablePoints(prev => prev + costDiff);
  };

  const handleCurseChange = (curseName: string) => {
    const newCurse = CURSES.find(c => c.name === curseName);
    if (!newCurse) return;

    const bonusDiff = newCurse.bonus - (currentCurse?.bonus || 0);

    playSound();
    setGameState(prev => ({
      ...prev,
      player: { ...prev.player, curse: curseName }
    }));
    setAvailablePoints(prev => prev + bonusDiff);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 'gender' && (
          <motion.div 
            key="gender"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-bold text-white font-display italic glow-purple">Choose Your Path</h2>
              <p className="text-slate-400">Your journey begins with a single choice.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { gender: 'Boy' as const, icon: <User className="text-blue-400" size={48} />, label: 'Magic Apprentice (Boy)', color: 'hover:bg-blue-500/10 hover:border-blue-500/50' },
                { gender: 'Girl' as const, icon: <User className="text-pink-400" size={48} />, label: 'Magic Apprentice (Girl)', color: 'hover:bg-pink-500/10 hover:border-pink-500/50' },
              ].map((opt) => (
                <button 
                  key={opt.gender}
                  onClick={() => {
                    playSound();
                    setGameState(prev => ({ ...prev, player: { ...prev.player, gender: opt.gender } }));
                    setStep('stats');
                  }}
                  className={cn(
                    "p-12 bg-white/5 border border-white/10 rounded-[2rem] transition-all group relative overflow-hidden",
                    opt.color
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                      {opt.icon}
                    </div>
                    <span className="text-xl font-bold text-white font-display">{opt.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'stats' && (
          <motion.div 
            key="stats"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <button 
                onClick={() => setStep('gender')}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase text-[10px] font-bold tracking-widest"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white font-display italic">Arcane Potential</h2>
                <p className="text-slate-400 text-sm">Distribute your innate magical energy.</p>
              </div>
              <div className="px-6 py-2 bg-magic-purple/20 border border-magic-purple/30 rounded-full">
                <span className="text-magic-purple font-bold text-sm tracking-widest uppercase">Points: {availablePoints}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                {STAT_CONFIG.map((stat) => (
                  <div key={stat.key} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-3 bg-slate-900 rounded-xl", stat.color)}>
                        {stat.icon}
                      </div>
                      <div className="text-left">
                        <div className="text-white font-bold">{stat.label}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.desc}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleStatChange(stat.key, -1)}
                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 disabled:opacity-20 transition-all"
                        disabled={gameState.player[stat.key] <= 5}
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-white text-lg">{gameState.player[stat.key]}</span>
                      <button 
                        onClick={() => handleStatChange(stat.key, 1)}
                        className="w-8 h-8 rounded-lg bg-magic-purple/20 border border-magic-purple/30 text-magic-purple flex items-center justify-center hover:bg-magic-purple/30 disabled:opacity-20 transition-all"
                        disabled={availablePoints <= 0}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                {/* Innate Trait Preview */}
                <div className="p-6 bg-magic-purple/5 border border-magic-purple/20 rounded-3xl text-left space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-magic-purple" />
                    <span className="text-[10px] font-bold text-magic-purple uppercase tracking-widest">Innate Potential</span>
                  </div>
                  {(() => {
                    const stats = { 
                      str: gameState.player.str, 
                      agi: gameState.player.agi, 
                      int: gameState.player.int, 
                      vit: gameState.player.vit, 
                      lck: gameState.player.lck 
                    };
                    const maxStat = Object.entries(stats).reduce((a, b) => a[1] > b[1] ? a : b);
                    const trait = {
                      int: { name: "Arcane Prodigy", item: "Spell: Arcane Missile", desc: "+30 Max MP & Offensive Magic focus." },
                      vit: { name: "Resilient Soul", item: "Protective Amulet", desc: "+30 Max HP & Damage Reduction focus." },
                      agi: { name: "Ghost Step", item: "Swift Boots", desc: "High Evasion & Quick Retreat focus." },
                      str: { name: "Forceful Will", item: "Spell: Kinetic Blast", desc: "Bonus Damage & Physical Might focus." },
                      lck: { name: "Fortune's Favor", item: "Lucky Coin", desc: "High Critical Chance & Better Loot focus." },
                    }[maxStat[0] as keyof typeof stats] || { name: "Versatile Apprentice", item: "None", desc: "Balanced potential." };

                    return (
                      <div className="space-y-2">
                        <div className="text-white font-bold font-display text-lg">{trait.name}</div>
                        <p className="text-slate-400 text-xs leading-relaxed">{trait.desc}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[9px] font-bold text-magic-purple bg-magic-purple/10 px-2 py-0.5 rounded uppercase tracking-tighter">Starting Item: {trait.item}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col justify-center text-center space-y-6">
                  <div className="w-16 h-16 bg-magic-purple/10 rounded-full flex items-center justify-center mx-auto border border-magic-purple/20">
                    <Zap className="text-magic-purple" size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white font-display">Ready to Specialize?</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Your attributes determine your starting skills and survivability in the academy.
                    </p>
                  </div>
                  <button 
                    onClick={() => setStep('grace-curse')}
                    className="w-full py-4 bg-magic-purple hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-magic-purple/20 flex items-center justify-center gap-2 font-display"
                  >
                    NEXT STEP <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'grace-curse' && (
          <motion.div 
            key="grace-curse"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <button 
                onClick={() => setStep('stats')}
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase text-[10px] font-bold tracking-widest"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white font-display italic">Blessings & Curses</h2>
                <p className="text-slate-400 text-sm">Balance your soul's light and shadow.</p>
              </div>
              <div className="px-6 py-2 bg-magic-purple/20 border border-magic-purple/30 rounded-full">
                <span className="text-magic-purple font-bold text-sm tracking-widest uppercase">Points: {availablePoints}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Graces */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <Sparkles size={16} className="text-magic-purple" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Soul Blessings</h3>
                </div>
                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {GRACES.map((grace) => (
                    <button
                      key={grace.name}
                      onClick={() => handleGraceChange(grace.name)}
                      disabled={grace.name !== gameState.player.grace && availablePoints < grace.cost - (currentGrace?.cost || 0)}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all relative group",
                        gameState.player.grace === grace.name 
                          ? "bg-magic-purple/20 border-magic-purple shadow-lg shadow-magic-purple/10" 
                          : "bg-white/5 border-white/10 hover:bg-white/10 disabled:opacity-30"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-white text-sm">{grace.name}</span>
                        <span className={cn(
                          "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                          grace.cost > 0 ? "bg-magic-purple/20 text-magic-purple" : "bg-slate-800 text-slate-400"
                        )}>
                          {grace.cost > 0 ? `-${grace.cost} AP` : 'Free'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">{grace.desc}</p>
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-[8px] font-bold uppercase text-slate-500 tracking-widest">{grace.type}</span>
                      </div>
                      {gameState.player.grace === grace.name && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 size={14} className="text-magic-purple" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Curses */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <Flame size={16} className="text-red-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Innate Curses</h3>
                </div>
                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {CURSES.map((curse) => (
                    <button
                      key={curse.name}
                      onClick={() => handleCurseChange(curse.name)}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all relative group",
                        gameState.player.curse === curse.name 
                          ? "bg-red-500/10 border-red-500 shadow-lg shadow-red-500/10" 
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-white text-sm">{curse.name}</span>
                        <span className={cn(
                          "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                          curse.bonus > 0 ? "bg-red-500/20 text-red-400" : "bg-slate-800 text-slate-400"
                        )}>
                          {curse.bonus > 0 ? `+${curse.bonus} AP` : 'None'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">{curse.desc}</p>
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-[8px] font-bold uppercase text-slate-500 tracking-widest">{curse.type}</span>
                      </div>
                      {gameState.player.curse === curse.name && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 size={14} className="text-red-400" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Synergy Display */}
            <AnimatePresence>
              {synergy && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-6 bg-gradient-to-r from-magic-purple/20 to-indigo-500/20 border border-magic-purple/30 rounded-3xl flex items-center gap-6"
                >
                  <div className="w-16 h-16 bg-magic-purple/20 rounded-2xl flex items-center justify-center border border-magic-purple/30 shrink-0">
                    <Sparkles className="text-magic-purple" size={32} />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-white font-display">Synergy: {synergy.name}</h4>
                      <span className="px-2 py-0.5 bg-white/10 rounded text-[8px] font-bold text-magic-purple uppercase tracking-widest">Active</span>
                    </div>
                    <p className="text-slate-300 text-sm italic">{synergy.desc}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-4">
              <button 
                disabled={availablePoints > 0}
                onClick={() => {
                  playSound();
                  onComplete();
                }}
                className="w-full py-5 bg-magic-purple hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-2xl shadow-magic-purple/30 disabled:opacity-50 flex items-center justify-center gap-3 font-display text-lg"
              >
                {availablePoints > 0 ? `DISTRIBUTE REMAINING ${availablePoints} POINTS` : 'BEGIN YOUR JOURNEY'}
                <ChevronRight size={24} />
              </button>
              {availablePoints > 0 && (
                <p className="text-center text-slate-500 text-[10px] mt-3 uppercase tracking-widest font-bold flex items-center justify-center gap-2">
                  <AlertTriangle size={12} className="text-yellow-500" /> All potential must be realized before entering the academy.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
