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
  Home,
  X,
  MapPin,
  Bed,
  Volume2,
  VolumeX,
  Music,
  Info,
  Scroll,
  CheckCircle2,
  Circle
} from 'lucide-react';

import { Equipment, Player, Item, Location, Enemy, Quest, GameState, Skill } from './types';
import { 
  WORLD, 
  INITIAL_PLAYER, 
  GAME_ITEMS, 
  SKILL_TREE, 
  ENEMIES_BY_LOCATION, 
  GRACES, 
  CURSES, 
  TRAITS 
} from './constants';
import { getTotalStats as calculateTotalStats, cn } from './lib/utils';

// Components
import { StatBar } from './components/StatBar';
import { MiniStat } from './components/MiniStat';
import { ActionButton } from './components/ActionButton';
import { EquipmentPanel } from './components/EquipmentPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { LevelUpModal } from './components/LevelUpModal';
import { QuestModal } from './components/QuestModal';
import { SkillTreeModal } from './components/SkillTreeModal';
import { MapModal } from './components/MapModal';
import { CombatView } from './components/CombatView';
import { ExplorationView } from './components/ExplorationView';
import { PlayerCard } from './components/PlayerCard';
import { LocationViewport } from './components/LocationViewport';
import { MessageLog } from './components/MessageLog';
import { GameMenuModal } from './components/GameMenuModal';


import { useAudio } from './hooks/useAudio';
import { useGameState } from './hooks/useGameState';
import { useCombat } from './hooks/useCombat';
import { useSaveLoad } from './hooks/useSaveLoad';
import { useQuests } from './hooks/useQuests';
import { useLevelUp } from './hooks/useLevelUp';

// --- Main Component ---

export default function App() {
  const {
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    audioRef,
    clickSoundRef,
    playSound
  } = useAudio();

  const {
    gameStarted,
    setGameStarted,
    selectingGender,
    setSelectingGender,
    distributingStats,
    setDistributingStats,
    gameState,
    setGameState,
    addLog,
    rest,
    move,
    equipItem,
    unequipItem,
    useItem,
    unlockSkill
  } = useGameState(playSound);

  const { checkQuests } = useQuests(setGameState, addLog);

  const getTotalStats = () => {
    return calculateTotalStats(gameState.player);
  };

  const {
    addCombatLog,
    startCombat,
    attack,
    castSkill,
    handleVictory,
    handleDefeat
  } = useCombat(
    gameState,
    setGameState,
    getTotalStats,
    addLog,
    playSound,
    checkQuests
  );

  const {
    showLevelUp,
    setShowLevelUp,
    availablePoints,
    setAvailablePoints,
    finalizeCharacter
  } = useLevelUp(
    gameState,
    setGameState,
    setGameStarted,
    setDistributingStats,
    addLog
  );

  const [showSkillTree, setShowSkillTree] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuView, setMenuView] = useState<'main' | 'save' | 'load' | 'settings' | 'credits'>('main');

  const {
    currentSlot,
    setCurrentSlot,
    showOverwriteWarning,
    setShowOverwriteWarning,
    saveGame,
    loadGame,
    hasSaveData,
    getSaveSummary,
    startNewGame
  } = useSaveLoad(
    gameState,
    setGameState,
    setGameStarted,
    setSelectingGender,
    setMenuView,
    setAvailablePoints,
    addLog,
    playSound
  );

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [gameState.history]);

  const currentLocation = WORLD[gameState.currentLocation];

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-twilight-deep flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <audio 
          ref={audioRef} 
          src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
          loop 
          autoPlay 
        />
        <audio 
          ref={clickSoundRef} 
          src="https://www.soundjay.com/buttons/sounds/button-16.mp3" 
        />
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
                      onClick={() => {
                        playSound();
                        setMenuView('save');
                      }}
                      className="w-full group relative px-8 py-4 bg-magic-purple hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-magic-purple/20 flex items-center justify-center gap-3 overflow-hidden font-display"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      BEGIN THE STORY
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={() => {
                        playSound();
                        setMenuView('load');
                      }}
                      className="w-full px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-3 font-display"
                    >
                      <RotateCcw size={20} />
                      CONTINUE
                    </button>
                    <button 
                      onClick={() => {
                        playSound();
                        setMenuView('settings');
                      }}
                      className="w-full px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-3 font-display"
                    >
                      <Shield size={20} />
                      SETTINGS
                    </button>
                    <button 
                      onClick={() => {
                        playSound();
                        setMenuView('credits');
                      }}
                      className="w-full px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-3 font-display"
                    >
                      <Info size={20} />
                      CREDITS
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
                    onClick={() => { playSound(); setMenuView('main'); }}
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
                    onClick={() => { playSound(); setMenuView('main'); }}
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
                  className="space-y-8 w-full max-w-md mx-auto"
                >
                  <h2 className="text-4xl font-bold text-white font-display italic glow-purple">Settings</h2>
                  <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Music size={18} />
                          <span className="font-bold uppercase tracking-widest text-xs">Soundtrack</span>
                        </div>
                        <button 
                          onClick={() => setIsMuted(!isMuted)}
                          className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          {isMuted ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} className="text-magic-purple" />}
                        </button>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={volume} 
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-magic-purple"
                      />
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Academy Notice</p>
                      <p className="text-xs text-slate-400 leading-relaxed italic">"The volume of your magic should match the volume of your spirit." — Headmaster Aetherius</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { playSound(); setMenuView('main'); }}
                    className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Back to Menu
                  </button>
                </motion.div>
              )}

              {menuView === 'credits' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 w-full max-w-md mx-auto"
                >
                  <h2 className="text-4xl font-bold text-white font-display italic glow-purple">Credits</h2>
                  <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6 text-left">
                    <div className="space-y-1">
                      <p className="text-[10px] text-magic-purple uppercase tracking-widest font-bold">Concept & Design</p>
                      <p className="text-white font-display">Aetheria Development Team</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-magic-purple uppercase tracking-widest font-bold">Arcane Engine</p>
                      <p className="text-white font-display">React & Tailwind Sorcery</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-magic-purple uppercase tracking-widest font-bold">Visual Assets</p>
                      <p className="text-white font-display text-sm">Unsplash, Lucide Icons</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-magic-purple uppercase tracking-widest font-bold">Soundtrack</p>
                      <p className="text-white font-display text-sm">"Mystic Journey" - Royalty Free Music</p>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-xs text-slate-400 leading-relaxed">Thank you for attending Aetheria Academy. May your mana never run dry.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { playSound(); setMenuView('main'); }}
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

              {/* Grace & Curse Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md mx-auto">
                {/* Grace */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-magic-purple" />
                    <label className="text-[10px] font-bold text-magic-purple uppercase tracking-widest">Select Grace</label>
                  </div>
                  <select 
                    value={gameState.player.grace}
                    onChange={(e) => {
                      const newGrace = e.target.value;
                      const oldGrace = gameState.player.grace;
                      const oldGraceObj = GRACES.find(g => g.name === oldGrace);
                      const newGraceObj = GRACES.find(g => g.name === newGrace);
                      
                      setGameState(prev => ({ ...prev, player: { ...prev.player, grace: newGrace } }));
                      setAvailablePoints(prev => prev + (oldGraceObj?.cost || 0) - (newGraceObj?.cost || 0));
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-magic-purple/50 appearance-none cursor-pointer hover:bg-white/10 transition-all"
                  >
                    {GRACES.map(g => (
                      <option key={g.name} value={g.name} className="bg-magic-dark">
                        {g.name} {g.cost > 0 ? `(-${g.cost} AP)` : '(Free)'}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 leading-relaxed px-1">
                    {GRACES.find(g => g.name === gameState.player.grace)?.desc}
                  </p>
                </div>

                {/* Curse */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-2">
                    <Flame size={14} className="text-red-400" />
                    <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Innate Curse</label>
                  </div>
                  <select 
                    value={gameState.player.curse}
                    onChange={(e) => {
                      const newCurse = e.target.value;
                      const oldCurse = gameState.player.curse;
                      const oldCurseObj = CURSES.find(c => c.name === oldCurse);
                      const newCurseObj = CURSES.find(c => c.name === newCurse);
                      
                      setGameState(prev => ({ ...prev, player: { ...prev.player, curse: newCurse } }));
                      setAvailablePoints(prev => prev - (oldCurseObj?.bonus || 0) + (newCurseObj?.bonus || 0));
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-red-400/50 appearance-none cursor-pointer hover:bg-white/10 transition-all"
                  >
                    {CURSES.map(c => (
                      <option key={c.name} value={c.name} className="bg-magic-dark">
                        {c.name} {c.bonus > 0 ? `(+${c.bonus} AP)` : '(None)'}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 leading-relaxed px-1">
                    {CURSES.find(c => c.name === gameState.player.curse)?.desc}
                  </p>
                </div>
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
      <audio 
        ref={audioRef} 
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
        loop 
        autoPlay 
      />
      <audio 
        ref={clickSoundRef} 
        src="https://www.soundjay.com/buttons/sounds/button-16.mp3" 
      />
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
            {gameState.inCombat ? (
              <CombatView 
                gameState={gameState}
                attack={attack}
                castSkill={castSkill}
                retreat={() => {
                  setGameState(prev => ({ ...prev, inCombat: false, enemy: null }));
                  addLog("You retreated to a safe distance.");
                }}
                skillTree={SKILL_TREE}
              />
            ) : (
              <div key="exploration" className="space-y-6">
                <LocationViewport currentLocation={currentLocation} />
                <ExplorationView 
                  currentLocation={currentLocation}
                  onObserve={() => { playSound(); addLog(`You observe the arcane patterns in the ${currentLocation.name}.`); }}
                  onPractice={startCombat}
                  onRest={gameState.currentLocation === "Dormitories" ? rest : undefined}
                  onMove={(dir) => move(dir, checkQuests)}
                />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Stats & Inventory */}
        <div className="lg:col-span-4 space-y-6">
          <PlayerCard 
            player={gameState.player}
            totalStats={getTotalStats()}
            onShowLevelUp={() => { playSound(); setShowLevelUp(true); }}
            onShowSkillTree={() => { playSound(); setShowSkillTree(true); }}
            onShowMap={() => { playSound(); setShowMap(true); }}
            onShowQuests={() => { playSound(); setShowQuests(true); }}
          />

          <EquipmentPanel 
            equipment={gameState.player.equipment}
            unequipItem={unequipItem}
          />

          <InventoryPanel 
            inventory={gameState.player.inventory}
            useItem={useItem}
          />
        </div>

        {/* Bottom: Message Log */}
        <div className="lg:col-span-12">
          <MessageLog history={gameState.history} logEndRef={logEndRef} />
        </div>
      </main>

      <QuestModal 
        show={showQuests} 
        onClose={() => { playSound(); setShowQuests(false); }} 
        quests={gameState.quests} 
      />

      <LevelUpModal 
        show={showLevelUp} 
        onClose={() => setShowLevelUp(false)} 
        player={gameState.player} 
        setGameState={setGameState}
        getTotalStats={getTotalStats}
      />

      <MapModal 
        show={showMap} 
        onClose={() => setShowMap(false)} 
        currentLocation={gameState.currentLocation}
        world={WORLD}
      />

      <SkillTreeModal 
        show={showSkillTree} 
        onClose={() => setShowSkillTree(false)} 
        player={gameState.player}
        skillTree={SKILL_TREE}
        unlockSkill={unlockSkill}
      />
      <GameMenuModal 
        show={showMenu}
        onClose={() => setShowMenu(false)}
        onSave={() => { saveGame(); setShowMenu(false); }}
        onLoad={() => { loadGame(); setShowMenu(false); }}
        onReturnToMainMenu={() => {
          setGameStarted(false);
          setSelectingGender(false);
          setDistributingStats(false);
          setShowMenu(false);
          setMenuView('main');
          setCurrentSlot(null);
          addLog("Returned to Main Menu.");
        }}
      />
    </div>
  );
}
