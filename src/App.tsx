/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sword, 
  Map as MapIcon, 
  Package, 
  Save, 
  Compass, 
  Eye,
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
import { MainMenu } from './components/MainMenu';


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
      <MainMenu 
        menuView={menuView}
        setMenuView={setMenuView}
        selectingGender={selectingGender}
        setSelectingGender={setSelectingGender}
        distributingStats={distributingStats}
        setDistributingStats={setDistributingStats}
        gameState={gameState}
        setGameState={setGameState}
        availablePoints={availablePoints}
        setAvailablePoints={setAvailablePoints}
        hasSaveData={hasSaveData}
        getSaveSummary={getSaveSummary}
        startNewGame={startNewGame}
        loadGame={loadGame}
        showOverwriteWarning={showOverwriteWarning}
        setShowOverwriteWarning={setShowOverwriteWarning}
        volume={volume}
        setVolume={setVolume}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        playSound={playSound}
        finalizeCharacter={finalizeCharacter}
        audioRef={audioRef}
        clickSoundRef={clickSoundRef}
      />
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
