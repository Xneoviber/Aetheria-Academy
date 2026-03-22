/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Sword, 
  Map as MapIcon, 
  User, 
  Package, 
  Save, 
  RotateCcw, 
  Compass, 
  Eye,
  ChevronRight,
  Heart,
  Zap,
  Trophy,
  BookOpen,
  Sparkles,
  Flame,
  Wind,
  Menu,
  Home
} from 'lucide-react';

// --- Types ---

interface Player {
  name: string;
  gender: 'Boy' | 'Girl';
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  level: number;
  xp: number;
  attributePoints: number;
  str: number;
  agi: number;
  int: number;
  vit: number;
  lck: number;
  trait: string;
  inventory: string[];
}

interface Location {
  name: string;
  description: string;
  image: string;
  exits: { [key: string]: string };
}

interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  str: number;
  xpReward: number;
  loot: string;
}

interface GameState {
  player: Player;
  currentLocation: string;
  history: string[];
  inCombat: boolean;
  enemy: Enemy | null;
  turn: 'player' | 'enemy';
  combatLog: string[];
}

// --- Data ---

const WORLD: { [key: string]: Location } = {
  "Grand Hall": {
    name: "Grand Hall",
    description: "The heart of Aetheria Academy. Towering stained-glass windows depict legendary wizards, and floating candles illuminate the marble floors.",
    image: "https://images.unsplash.com/photo-1519074063912-ad25b57b9d17?auto=format&fit=crop&q=80&w=1000",
    exits: { "north": "Library", "east": "Training Grounds", "south": "Dormitories" }
  },
  "Library": {
    name: "Library",
    description: "A labyrinth of ancient scrolls and whispering books. The air smells of old parchment and latent magical energy.",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1000",
    exits: { "south": "Grand Hall" }
  },
  "Training Grounds": {
    name: "Training Grounds",
    description: "An open courtyard where apprentices practice their spells. Targets are charred from fireballs and frozen from ice shards.",
    image: "https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?auto=format&fit=crop&q=80&w=1000",
    exits: { "west": "Grand Hall" }
  },
  "Dormitories": {
    name: "Dormitories",
    description: "Your private sanctuary. A comfortable bed and a desk cluttered with scrolls. A perfect place to recover your energy.",
    image: "https://images.unsplash.com/photo-1555854816-802f188095e4?auto=format&fit=crop&q=80&w=1000",
    exits: { "north": "Grand Hall" }
  }
};

const INITIAL_PLAYER: Player = {
  name: "Apprentice",
  gender: 'Boy',
  hp: 100,
  maxHp: 100,
  mp: 100,
  maxMp: 100,
  level: 1,
  xp: 0,
  attributePoints: 0,
  str: 5,
  agi: 5,
  int: 5,
  vit: 5,
  lck: 5,
  trait: "None",
  inventory: ["Wooden Wand", "Apprentice Robe"]
};

// --- Main Component ---

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectingGender, setSelectingGender] = useState(false);
  const [distributingStats, setDistributingStats] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showOverwriteWarning, setShowOverwriteWarning] = useState<number | null>(null);
  const [menuView, setMenuView] = useState<'main' | 'save' | 'load' | 'settings'>('main');
  const [currentSlot, setCurrentSlot] = useState<number | null>(null);
  const [availablePoints, setAvailablePoints] = useState(20);
  const [gameState, setGameState] = useState<GameState>({
    player: { ...INITIAL_PLAYER },
    currentLocation: "Grand Hall",
    history: ["Welcome to Aetheria Academy. Your magical education begins today."],
    inCombat: false,
    enemy: null,
    turn: 'player',
    combatLog: []
  });

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [gameState.history]);

  const addLog = (message: string) => {
    setGameState(prev => ({
      ...prev,
      history: [...prev.history, message]
    }));
  };

  const finalizeCharacter = () => {
    const p = gameState.player;
    let trait = "Versatile Apprentice";
    let bonusHp = 0;
    let bonusMp = 0;
    let startingItem = "";

    const stats = { str: p.str, agi: p.agi, int: p.int, vit: p.vit, lck: p.lck };
    const maxStat = Object.entries(stats).reduce((a, b) => a[1] > b[1] ? a : b);

    if (maxStat[0] === 'int') {
      trait = "Arcane Prodigy";
      bonusMp = 30;
      startingItem = "Spell: Arcane Missile";
    } else if (maxStat[0] === 'vit') {
      trait = "Resilient Soul";
      bonusHp = 30;
      startingItem = "Protective Amulet";
    } else if (maxStat[0] === 'agi') {
      trait = "Ghost Step";
      startingItem = "Swift Boots";
    } else if (maxStat[0] === 'str') {
      trait = "Forceful Will";
      startingItem = "Spell: Kinetic Blast";
    } else if (maxStat[0] === 'lck') {
      trait = "Fortune's Favor";
      startingItem = "Lucky Coin";
    }

    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        trait,
        maxHp: prev.player.vit * 10 + 50 + bonusHp,
        hp: prev.player.vit * 10 + 50 + bonusHp,
        maxMp: prev.player.int * 10 + 50 + bonusMp,
        mp: prev.player.int * 10 + 50 + bonusMp,
        inventory: [...prev.player.inventory, startingItem]
      }
    }));
    setDistributingStats(false);
    setGameStarted(true);
  };

  // --- Game Actions ---

  const rest = () => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        hp: prev.player.maxHp,
        mp: prev.player.maxMp
      }
    }));
    addLog("✨ You take a deep rest. Your vitality and mana are fully restored.");
  };

  const move = (direction: string) => {
    const currentLoc = WORLD[gameState.currentLocation];
    const nextLocName = currentLoc.exits[direction];
    if (nextLocName) {
      setGameState(prev => ({ ...prev, currentLocation: nextLocName }));
      addLog(`You walk ${direction} to the ${nextLocName}.`);
    }
  };

  const addCombatLog = (message: string) => {
    setGameState(prev => ({
      ...prev,
      combatLog: [...prev.combatLog, message].slice(-5)
    }));
  };

  const startCombat = () => {
    const familiar: Enemy = {
      name: "Rogue Familiar",
      hp: 35,
      maxHp: 35,
      str: 5,
      xpReward: 40,
      loot: "Mana Crystal"
    };
    setGameState(prev => ({
      ...prev,
      inCombat: true,
      enemy: familiar,
      turn: 'player',
      combatLog: ["A Rogue Familiar attacks!"]
    }));
    addLog(`A ${familiar.name} has escaped its master and attacks you!`);
  };

  const attack = () => {
    if (!gameState.enemy || gameState.turn !== 'player') return;

    const hasArcaneMissile = gameState.player.inventory.includes("Spell: Arcane Missile");
    const hasKineticBlast = gameState.player.inventory.includes("Spell: Kinetic Blast");

    // Player attacks (Magic based on INT)
    const isCrit = Math.random() < (gameState.player.lck * 0.02);
    let playerDmg = Math.floor(gameState.player.int * 0.8) + Math.floor(Math.random() * 10);
    
    let attackMsg = "You cast a spark";
    if (hasArcaneMissile) {
      playerDmg += 8;
      attackMsg = "You fire an Arcane Missile";
    } else if (hasKineticBlast) {
      playerDmg += 12;
      attackMsg = "You release a Kinetic Blast";
    }

    if (gameState.player.trait === "Forceful Will") playerDmg += 5;
    if (isCrit) {
      playerDmg = Math.floor(playerDmg * 1.5);
      addCombatLog("✨ CRITICAL CAST!");
    }
    
    const newEnemyHp = Math.max(0, gameState.enemy.hp - playerDmg);
    addCombatLog(`${attackMsg} for ${playerDmg} damage.`);

    setGameState(prev => ({
      ...prev,
      enemy: prev.enemy ? { ...prev.enemy, hp: newEnemyHp } : null,
      turn: newEnemyHp <= 0 ? 'player' : 'enemy'
    }));

    if (newEnemyHp <= 0) {
      setTimeout(() => handleVictory(), 1000);
    }
  };

  useEffect(() => {
    if (gameState.inCombat && gameState.turn === 'enemy' && gameState.enemy) {
      const timer = setTimeout(() => {
        // Enemy attacks back
        const fleeChance = gameState.player.agi * 0.02 + (gameState.player.trait === "Ghost Step" ? 0.1 : 0);
        const isEvaded = Math.random() < fleeChance;

        if (isEvaded) {
          addCombatLog(`💨 You nimbly evaded the ${gameState.enemy!.name}'s attack!`);
        } else {
          const enemyDmg = Math.max(1, gameState.enemy!.str + Math.floor(Math.random() * 5) - Math.floor(gameState.player.vit * 0.2));
          const newPlayerHp = Math.max(0, gameState.player.hp - enemyDmg);
          addCombatLog(`The ${gameState.enemy!.name} strikes you for ${enemyDmg} damage.`);

          setGameState(prev => ({
            ...prev,
            player: { ...prev.player, hp: newPlayerHp }
          }));

          if (newPlayerHp <= 0) {
            setTimeout(() => handleDefeat(), 1000);
            return;
          }
        }

        setGameState(prev => ({ ...prev, turn: 'player' }));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.inCombat, gameState.turn, gameState.enemy]);

  const handleVictory = () => {
    const enemy = gameState.enemy!;
    addLog(`The ${enemy.name} dissipates into magical energy.`);
    addLog(`Gained ${enemy.xpReward} XP and found: ${enemy.loot}.`);

    setGameState(prev => {
      let newXp = prev.player.xp + enemy.xpReward;
      let newLevel = prev.player.level;
      let newMaxHp = prev.player.maxHp;
      let newMaxMp = prev.player.maxMp;
      let newAttributePoints = prev.player.attributePoints;
      
      if (newXp >= newLevel * 100) {
        newXp -= newLevel * 100;
        newLevel++;
        newMaxHp += 15;
        newMaxMp += 15;
        newAttributePoints += 5;
        setTimeout(() => addLog(`✨ Rank Up! You are now a Level ${newLevel} Apprentice! You have 5 new Attribute Points to distribute.`), 500);
      }

      return {
        ...prev,
        inCombat: false,
        enemy: null,
        player: {
          ...prev.player,
          xp: newXp,
          level: newLevel,
          maxHp: newMaxHp,
          maxMp: newMaxMp,
          hp: newMaxHp,
          mp: newMaxMp,
          attributePoints: newAttributePoints,
          inventory: [...prev.player.inventory, enemy.loot]
        }
      };
    });
  };

  const handleDefeat = () => {
    addLog("Your vision fades as your mana depletes...");
    setTimeout(() => {
      setGameState({
        player: { ...INITIAL_PLAYER },
        currentLocation: "Grand Hall",
        history: ["You wake up in the Infirmary. The Matron has restored your energy."],
        inCombat: false,
        enemy: null
      });
    }, 2000);
  };

  const startNewGame = (slot: number) => {
    setCurrentSlot(slot);
    setSelectingGender(true);
    setMenuView('main');
    setAvailablePoints(20);
    setGameState({
      player: { ...INITIAL_PLAYER },
      currentLocation: "Grand Hall",
      history: ["Welcome to Aetheria Academy. Your magical education begins today."],
      inCombat: false,
      enemy: null
    });
    setShowOverwriteWarning(null);
  };

  const saveGame = (slot?: number) => {
    const targetSlot = slot ?? currentSlot;
    if (targetSlot === null) return;

    localStorage.setItem(`aetheria_save_${targetSlot}`, JSON.stringify({
      player: gameState.player,
      currentLocation: gameState.currentLocation,
      history: gameState.history
    }));
    addLog(`Magical progress recorded in Slot ${targetSlot}.`);
  };

  const loadGame = (slot?: number) => {
    const targetSlot = slot ?? currentSlot;
    if (targetSlot === null) return;

    const saved = localStorage.getItem(`aetheria_save_${targetSlot}`);
    if (saved) {
      const data = JSON.parse(saved);
      setGameState({
        player: data.player,
        currentLocation: data.currentLocation,
        history: data.history || ["Magical progress restored."],
        inCombat: false,
        enemy: null
      });
      setCurrentSlot(targetSlot);
      setGameStarted(true);
      setMenuView('main');
      addLog(`Magical progress restored from Slot ${targetSlot}.`);
    } else {
      alert(`No saved game found in Slot ${targetSlot}.`);
    }
  };

  const hasSaveData = (slot: number) => {
    return !!localStorage.getItem(`aetheria_save_${slot}`);
  };

  const getSaveSummary = (slot: number) => {
    const saved = localStorage.getItem(`aetheria_save_${slot}`);
    if (!saved) return "Empty Slot";
    const data = JSON.parse(saved);
    return `Rank ${data.player.level} ${data.player.trait}`;
  };

  const currentLocation = WORLD[gameState.currentLocation];

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-twilight-deep flex items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Magical Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-magic-purple/10 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[150px] rounded-full animate-pulse" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full text-center space-y-12 relative z-10"
        >
          {!selectingGender && !distributingStats ? (
            <div className="space-y-12">
              {menuView === 'main' && (
                <>
                  <div className="space-y-4">
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-magic-purple/10 border border-magic-purple/20 text-magic-purple text-[10px] font-bold uppercase tracking-[0.3em]"
                    >
                      <Sparkles size={12} /> The Gates of Knowledge Open
                    </motion.div>
                    <motion.h1 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-6xl md:text-7xl font-black text-white tracking-tighter italic font-display glow-purple"
                    >
                      AETHERIA<span className="text-magic-purple"> ACADEMY</span>
                    </motion.h1>
                    <motion.p 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed"
                    >
                      Master the mystic arts and uncover the secrets of the arcane in the world's most prestigious magic school.
                    </motion.p>
                  </div>

                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center justify-center gap-4 max-w-xs mx-auto w-full"
                  >
                    <button 
                      onClick={() => setMenuView('save')}
                      className="w-full group relative px-8 py-4 bg-magic-purple hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-magic-purple/20 flex items-center justify-center gap-3 overflow-hidden font-display"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      BEGIN THE STORY
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={() => setMenuView('load')}
                      className="w-full px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-3 font-display"
                    >
                      <RotateCcw size={20} />
                      CONTINUE
                    </button>
                    <button 
                      onClick={() => setMenuView('settings')}
                      className="w-full px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-3 font-display"
                    >
                      <Shield size={20} />
                      SETTINGS
                    </button>
                  </motion.div>
                </>
              )}

              {menuView === 'save' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <h2 className="text-4xl font-bold text-white font-display italic glow-purple">Choose Save Slot</h2>
                  <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                    {[1, 2, 3].map(slot => (
                      <button 
                        key={slot}
                        onClick={() => {
                          if (hasSaveData(slot)) {
                            setShowOverwriteWarning(slot);
                          } else {
                            startNewGame(slot);
                          }
                        }}
                        className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-magic-purple/20 hover:border-magic-purple/50 transition-all text-left group"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-magic-purple text-[10px] font-bold uppercase tracking-widest mb-1">Slot {slot}</div>
                            <div className="text-white font-bold font-display">{getSaveSummary(slot)}</div>
                          </div>
                          <ChevronRight className="text-slate-600 group-hover:text-magic-purple transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setMenuView('main')}
                    className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Back to Menu
                  </button>
                </motion.div>
              )}

              {menuView === 'load' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <h2 className="text-4xl font-bold text-white font-display italic glow-purple">Load Slot</h2>
                  <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                    {[1, 2, 3].map(slot => (
                      <button 
                        key={slot}
                        disabled={!hasSaveData(slot)}
                        onClick={() => loadGame(slot)}
                        className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-magic-purple/20 hover:border-magic-purple/50 transition-all text-left group disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:border-white/10"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-magic-purple text-[10px] font-bold uppercase tracking-widest mb-1">Slot {slot}</div>
                            <div className="text-white font-bold font-display">{getSaveSummary(slot)}</div>
                          </div>
                          {hasSaveData(slot) && <RotateCcw className="text-slate-600 group-hover:text-magic-purple transition-colors" />}
                        </div>
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setMenuView('main')}
                    className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Back to Menu
                  </button>
                </motion.div>
              )}

              {menuView === 'settings' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <h2 className="text-4xl font-bold text-white font-display italic glow-purple">Settings</h2>
                  <div className="max-w-md mx-auto p-8 bg-white/5 border border-white/10 rounded-3xl text-slate-400">
                    <p>Magical configurations are currently being calibrated by the Academy professors.</p>
                  </div>
                  <button 
                    onClick={() => setMenuView('main')}
                    className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Back to Menu
                  </button>
                </motion.div>
              )}
            </div>
          ) : selectingGender ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-4xl font-bold text-white font-display">Choose Your Path</h2>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <button 
                  onClick={() => {
                    setGameState(prev => ({ ...prev, player: { ...prev.player, gender: 'Boy' } }));
                    setSelectingGender(false);
                    setDistributingStats(true);
                  }}
                  className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all group flex-1"
                >
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <User className="text-blue-400" size={32} />
                  </div>
                  <span className="font-bold text-white font-display">Magic Apprentice (Boy)</span>
                </button>
                <button 
                  onClick={() => {
                    setGameState(prev => ({ ...prev, player: { ...prev.player, gender: 'Girl' } }));
                    setSelectingGender(false);
                    setDistributingStats(true);
                  }}
                  className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-purple-500/20 hover:border-purple-500/50 transition-all group flex-1"
                >
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <User className="text-pink-400" size={32} />
                  </div>
                  <span className="font-bold text-white font-display">Magic Apprentice (Girl)</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white font-display">Initial Attributes</h2>
                <p className="text-slate-400 text-sm">Distribute your arcane potential. Your highest stat defines your unique trait.</p>
              </div>

              <div className="bg-magic-purple/10 py-2 px-4 rounded-full inline-block">
                <span className="text-magic-purple font-bold text-sm tracking-widest uppercase">Points Available: {availablePoints}</span>
              </div>

              {/* Grace Preview */}
              <div className="max-w-md mx-auto p-4 bg-magic-purple/5 border border-magic-purple/20 rounded-2xl text-left space-y-2">
                <div className="text-[10px] font-bold text-magic-purple uppercase tracking-widest">Current Grace</div>
                {(() => {
                  const stats = { 
                    str: gameState.player.str, 
                    agi: gameState.player.agi, 
                    int: gameState.player.int, 
                    vit: gameState.player.vit, 
                    lck: gameState.player.lck 
                  };
                  const maxStat = Object.entries(stats).reduce((a, b) => a[1] > b[1] ? a : b);
                  const grace = {
                    int: { trait: "Arcane Prodigy", item: "Spell: Arcane Missile", desc: "+30 Max MP & Offensive Magic" },
                    vit: { trait: "Resilient Soul", item: "Protective Amulet", desc: "+30 Max HP & Damage Reduction" },
                    agi: { trait: "Ghost Step", item: "Swift Boots", desc: "High Evasion & Quick Retreat" },
                    str: { trait: "Forceful Will", item: "Spell: Kinetic Blast", desc: "Bonus Damage & Physical Might" },
                    lck: { trait: "Fortune's Favor", item: "Lucky Coin", desc: "High Critical Chance & Better Loot" },
                  }[maxStat[0] as keyof typeof stats] || { trait: "Versatile Apprentice", item: "None", desc: "Balanced potential" };

                  return (
                    <div className="space-y-1">
                      <div className="text-white font-bold font-display text-sm">{grace.trait}</div>
                      <div className="text-slate-400 text-[10px] leading-tight">{grace.desc}</div>
                      <div className="text-magic-purple text-[9px] font-bold uppercase tracking-tighter">Bonus Item: {grace.item}</div>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                {[
                  { key: 'int', label: 'Intelligence', icon: <Sparkles size={16} />, desc: 'Magic Damage & Mana' },
                  { key: 'vit', label: 'Vitality', icon: <Heart size={16} />, desc: 'Health & Defense' },
                  { key: 'agi', label: 'Agility', icon: <Wind size={16} />, desc: 'Evasion & Speed' },
                  { key: 'str', label: 'Strength', icon: <Flame size={16} />, desc: 'Physical Force' },
                  { key: 'lck', label: 'Luck', icon: <Trophy size={16} />, desc: 'Criticals & Fortune' },
                ].map((stat) => (
                  <div key={stat.key} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="text-magic-purple">{stat.icon}</div>
                      <div className="text-left">
                        <div className="text-white font-bold text-sm">{stat.label}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.desc}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        disabled={gameState.player[stat.key as keyof Player] as number <= 5}
                        onClick={() => {
                          setGameState(prev => ({ ...prev, player: { ...prev.player, [stat.key]: (prev.player[stat.key as keyof Player] as number) - 1 } }));
                          setAvailablePoints(prev => prev + 1);
                        }}
                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-white">{(gameState.player[stat.key as keyof Player] as number)}</span>
                      <button 
                        disabled={availablePoints <= 0}
                        onClick={() => {
                          setGameState(prev => ({ ...prev, player: { ...prev.player, [stat.key]: (prev.player[stat.key as keyof Player] as number) + 1 } }));
                          setAvailablePoints(prev => prev - 1);
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
                disabled={availablePoints > 0}
                onClick={finalizeCharacter}
                className="w-full py-4 bg-magic-purple hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-magic-purple/20 disabled:opacity-50 font-display"
              >
                BEGIN JOURNEY
              </button>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="pt-12 flex items-center justify-center gap-8 text-slate-600"
          >
            <div className="flex flex-col items-center gap-1">
              <Flame size={24} />
              <span className="text-[8px] font-bold uppercase tracking-widest">Pyromancy</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Sparkles size={24} />
              <span className="text-[8px] font-bold uppercase tracking-widest">Alchemy</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Wind size={24} />
              <span className="text-[8px] font-bold uppercase tracking-widest">Telekinesis</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Overwrite Warning Modal */}
        <AnimatePresence>
          {showOverwriteWarning !== null && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowOverwriteWarning(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-magic-dark border border-red-500/30 rounded-3xl p-8 shadow-2xl space-y-6 text-center"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                  <RotateCcw className="text-red-500" size={32} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white font-display italic">Overwrite Slot {showOverwriteWarning}?</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    This will permanently erase your current progress in this slot. This magical action cannot be undone.
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <button 
                    onClick={() => startNewGame(showOverwriteWarning)}
                    className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all font-display shadow-lg shadow-red-500/20"
                  >
                    YES, OVERWRITE
                  </button>
                  <button 
                    onClick={() => setShowOverwriteWarning(null)}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 font-bold rounded-2xl transition-all font-display border border-white/5"
                  >
                    CANCEL
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-twilight-deep text-slate-200 font-sans selection:bg-magic-purple/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-magic-purple rounded-xl flex items-center justify-center shadow-lg shadow-magic-purple/20">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white font-display">Aetheria Academy</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Apprentice Year 1</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowMenu(true)} 
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white flex items-center gap-2"
              title="Game Menu"
            >
              <Menu size={20} />
              <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Menu</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Illustration & Description */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={gameState.currentLocation}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <img 
                src={currentLocation.image} 
                alt={currentLocation.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-8">
                <div className="flex items-center gap-2 text-magic-purple mb-1">
                  <BookOpen size={14} />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Academy Grounds</span>
                </div>
                <h2 className="text-3xl font-bold text-white font-display">{currentLocation.name}</h2>
              </div>
              
              {/* Combat Overlay */}
              {gameState.inCombat && gameState.enemy && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-magic-dark/80 backdrop-blur-md flex flex-col items-center justify-center p-8"
                >
                  <div className="w-full max-w-md space-y-6">
                    {/* Turn Indicator */}
                    <div className="flex justify-between items-center px-4">
                      <div className={`flex items-center gap-2 transition-all ${gameState.turn === 'player' ? 'scale-110 opacity-100' : 'opacity-30 scale-90'}`}>
                        <div className="w-2 h-2 rounded-full bg-magic-purple animate-pulse" />
                        <span className="text-xs font-bold text-white uppercase tracking-widest">Your Turn</span>
                      </div>
                      <div className={`flex items-center gap-2 transition-all ${gameState.turn === 'enemy' ? 'scale-110 opacity-100' : 'opacity-30 scale-90'}`}>
                        <span className="text-xs font-bold text-white uppercase tracking-widest">Enemy Turn</span>
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      </div>
                    </div>

                    {/* Enemy Status */}
                    <div className="bg-black/60 border border-magic-purple/30 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-magic-purple/20" />
                      <h3 className="text-2xl font-bold text-white mb-3 font-display">{gameState.enemy.name}</h3>
                      <div className="space-y-2">
                        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-magic-purple to-indigo-500"
                            initial={{ width: "100%" }}
                            animate={{ width: `${(gameState.enemy.hp / gameState.enemy.maxHp) * 100}%` }}
                            transition={{ type: "spring", stiffness: 50 }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-magic-purple font-bold uppercase tracking-widest">Energy Core</span>
                          <span className="text-xs font-mono text-white">{gameState.enemy.hp} / {gameState.enemy.maxHp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Real-time Combat Log */}
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 h-32 overflow-y-auto space-y-2 scrollbar-hide">
                      {gameState.combatLog.map((log, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-xs text-slate-400 border-l-2 border-magic-purple/30 pl-3 py-1"
                        >
                          {log}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
            <p className="text-lg leading-relaxed text-slate-300 italic">
              "{currentLocation.description}"
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {!gameState.inCombat ? (
                <>
                  <ActionButton 
                    icon={<Eye size={18}/>} 
                    label="Observe" 
                    onClick={() => addLog(`You observe the arcane patterns in the ${currentLocation.name}.`)} 
                  />
                  <ActionButton 
                    icon={<Sparkles size={18}/>} 
                    label="Practice" 
                    onClick={startCombat}
                    variant="danger"
                  />
                  {gameState.currentLocation === "Dormitories" && (
                    <ActionButton 
                      icon={<RotateCcw size={18}/>} 
                      label="Rest" 
                      onClick={rest}
                    />
                  )}
                  {Object.entries(currentLocation.exits).map(([dir, loc]) => (
                    <ActionButton 
                      key={dir}
                      icon={<Compass size={18}/>} 
                      label={`Walk ${dir}`} 
                      onClick={() => move(dir)}
                    />
                  ))}
                </>
              ) : (
                <div className="col-span-2 sm:col-span-4 grid grid-cols-2 gap-4">
                  <button 
                    disabled={gameState.turn !== 'player'}
                    onClick={attack}
                    className={`relative group overflow-hidden py-4 rounded-2xl font-bold font-display transition-all flex items-center justify-center gap-3 border shadow-xl ${
                      gameState.turn === 'player' 
                        ? 'bg-magic-purple border-magic-purple/50 text-white hover:bg-indigo-500 shadow-magic-purple/20' 
                        : 'bg-white/5 border-white/10 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <Flame size={20} className={gameState.turn === 'player' ? 'animate-pulse' : ''} />
                    CAST ARCANE SPARK
                    {gameState.turn === 'player' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    )}
                  </button>
                  <button 
                    onClick={() => {
                      setGameState(prev => ({ ...prev, inCombat: false, enemy: null }));
                      addLog("You retreated to a safe distance.");
                    }}
                    className="py-4 bg-white/5 border border-white/10 text-slate-400 font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 font-display"
                  >
                    <RotateCcw size={20} />
                    RETREAT
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Inventory */}
        <div className="lg:col-span-4 space-y-6">
          {/* Player Card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-white/10 overflow-hidden">
                <User className={gameState.player.gender === 'Boy' ? "text-blue-400" : "text-pink-400"} size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white font-display">{gameState.player.name}</h3>
                <div className="flex items-center gap-2 text-magic-purple text-xs font-bold uppercase tracking-widest">
                  <BookOpen size={12} /> Rank {gameState.player.level}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <StatBar 
                icon={<Heart size={14} className="text-red-400"/>} 
                label="Vitality" 
                current={gameState.player.hp} 
                max={gameState.player.maxHp} 
                color="bg-red-500" 
              />
              <StatBar 
                icon={<Zap size={14} className="text-blue-400"/>} 
                label="Mana" 
                current={gameState.player.mp} 
                max={gameState.player.maxMp} 
                color="bg-blue-500" 
              />
              <StatBar 
                icon={<Trophy size={14} className="text-amber-400"/>} 
                label="Arcane XP" 
                current={gameState.player.xp} 
                max={gameState.player.level * 100} 
                color="bg-amber-500" 
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {gameState.player.attributePoints > 0 && (
                <button 
                  onClick={() => setShowLevelUp(true)}
                  className="col-span-2 bg-amber-500/20 border border-amber-500/40 p-2 rounded-xl text-center hover:bg-amber-500/30 transition-all animate-pulse"
                >
                  <div className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">Points Available</div>
                  <div className="text-xs font-bold text-white font-display">DISTRIBUTE {gameState.player.attributePoints} AP</div>
                </button>
              )}
              <div className="col-span-2 bg-magic-purple/10 border border-magic-purple/20 p-2 rounded-xl text-center">
                <div className="text-[8px] font-bold text-magic-purple uppercase tracking-widest">Active Trait</div>
                <div className="text-xs font-bold text-white font-display">{gameState.player.trait}</div>
              </div>
              <MiniStat label="INT" value={gameState.player.int} />
              <MiniStat label="VIT" value={gameState.player.vit} />
              <MiniStat label="AGI" value={gameState.player.agi} />
              <MiniStat label="LCK" value={gameState.player.lck} />
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4 text-slate-400">
              <Package size={18} />
              <h3 className="text-sm font-bold uppercase tracking-widest">Arcane Bag</h3>
            </div>
            <div className="space-y-2">
              {gameState.player.inventory.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 text-sm hover:bg-white/10 transition-colors cursor-default">
                  <div className="w-2 h-2 rounded-full bg-magic-purple" />
                  {item}
                </div>
              ))}
              {gameState.player.inventory.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-4">Your bag is empty...</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom: Message Log */}
        <div className="lg:col-span-12">
          <div className="bg-black/40 border border-white/10 rounded-3xl overflow-hidden">
            <div className="px-6 py-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-magic-purple animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Academy Log</span>
            </div>
            <div className="h-48 overflow-y-auto p-6 space-y-3 scrollbar-hide">
              {gameState.history.map((log, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3 text-sm text-slate-400"
                >
                  <span className="text-magic-purple font-mono opacity-50">[{i + 1}]</span>
                  <p>{log}</p>
                </motion.div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </main>

      {/* Level Up Modal */}
      <AnimatePresence>
        {showLevelUp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLevelUp(false)}
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
                <span className="text-magic-purple font-bold text-sm tracking-widest uppercase">AP Remaining: {gameState.player.attributePoints}</span>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'int', label: 'Intelligence', icon: <Sparkles size={16} /> },
                  { key: 'vit', label: 'Vitality', icon: <Heart size={16} /> },
                  { key: 'agi', label: 'Agility', icon: <Wind size={16} /> },
                  { key: 'str', label: 'Strength', icon: <Flame size={16} /> },
                  { key: 'lck', label: 'Luck', icon: <Trophy size={16} /> },
                ].map((stat) => (
                  <div key={stat.key} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="text-magic-purple">{stat.icon}</div>
                      <div className="text-white font-bold text-sm">{stat.label}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-6 text-center font-bold text-white">{(gameState.player[stat.key as keyof Player] as number)}</span>
                      <button 
                        disabled={gameState.player.attributePoints <= 0}
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
                onClick={() => setShowLevelUp(false)}
                className="w-full py-4 bg-magic-purple hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all font-display"
              >
                CLOSE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Game Menu Modal */}
      <AnimatePresence>
        {showMenu && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
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
                  onClick={() => setShowMenu(false)}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all font-display flex items-center justify-center gap-3 border border-white/5"
                >
                  <Sparkles size={20} className="text-magic-purple" />
                  RESUME
                </button>
                <button 
                  onClick={() => { saveGame(); setShowMenu(false); }}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all font-display flex items-center justify-center gap-3 border border-white/5"
                >
                  <Save size={20} className="text-magic-purple" />
                  SAVE PROGRESS
                </button>
                <button 
                  onClick={() => { loadGame(); setShowMenu(false); }}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all font-display flex items-center justify-center gap-3 border border-white/5"
                >
                  <RotateCcw size={20} className="text-magic-purple" />
                  RESTORE PROGRESS
                </button>
                <div className="h-px bg-white/10 my-2" />
                <button 
                  onClick={() => {
                    setGameStarted(false);
                    setSelectingGender(false);
                    setDistributingStats(false);
                    setShowMenu(false);
                    setMenuView('main');
                    setCurrentSlot(null);
                    addLog("Returned to Main Menu.");
                  }}
                  className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-2xl transition-all font-display flex items-center justify-center gap-3 border border-red-500/20"
                >
                  <Home size={20} />
                  MAIN MENU
                </button>
              </div>

              <button 
                onClick={() => setShowMenu(false)}
                className="w-full py-3 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-components ---

function ActionButton({ icon, label, onClick, variant = "default", className = "" }: { 
  icon: any, 
  label: string, 
  onClick: () => void,
  variant?: "default" | "danger",
  className?: string,
  key?: string | number
}) {
  const baseStyles = "flex items-center justify-center gap-2 p-4 rounded-2xl font-bold text-sm transition-all active:scale-95 border shadow-sm font-display";
  const variants = {
    default: "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-magic-purple/50 hover:text-white",
    danger: "bg-magic-purple/10 border-magic-purple/20 text-magic-purple hover:bg-magic-purple/20 hover:border-magic-purple/50 hover:text-magic-purple"
  };

  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {icon}
      {label}
    </button>
  );
}

function StatBar({ icon, label, current, max, color }: { icon: any, label: string, current: number, max: number, color: string }) {
  const percentage = (current / max) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
        <div className="flex items-center gap-1.5 text-slate-400">
          {icon}
          {label}
        </div>
        <div className="text-slate-300">{current} / {max}</div>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string, value: number }) {
  return (
    <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center">
      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter mb-0.5">{label}</div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  );
}
