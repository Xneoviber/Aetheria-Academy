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


// --- Main Component ---

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectingGender, setSelectingGender] = useState(false);
  const [distributingStats, setDistributingStats] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showOverwriteWarning, setShowOverwriteWarning] = useState<number | null>(null);
  const [menuView, setMenuView] = useState<'main' | 'save' | 'load' | 'settings' | 'credits'>('main');
  const [currentSlot, setCurrentSlot] = useState<number | null>(null);
  const [availablePoints, setAvailablePoints] = useState(20);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    player: { ...INITIAL_PLAYER },
    currentLocation: "Grand Hall",
    history: ["Welcome to Aetheria Academy. Your magical education begins today."],
    inCombat: false,
    enemy: null,
    turn: 'player',
    combatLog: [],
    quests: [
      {
        id: 'explore_library',
        title: 'The Whispering Scrolls',
        description: 'Visit the Library to find the ancient scrolls of Aetheria.',
        reward: { xp: 50, items: ['Mana Potion'] },
        isCompleted: false,
        requirement: { type: 'location', target: 'Library' }
      },
      {
        id: 'train_hard',
        title: 'Combat Basics',
        description: 'Head to the Training Grounds to hone your magical skills.',
        reward: { xp: 30 },
        isCompleted: false,
        requirement: { type: 'location', target: 'Training Grounds' }
      },
      {
        id: 'first_victory',
        title: 'Arcane Mastery',
        description: 'Defeat a Rogue Familiar in combat.',
        reward: { xp: 100, items: ['Spell: Arcane Missile'] },
        isCompleted: false,
        requirement: { type: 'combat', target: 'Rogue Familiar' }
      }
    ]
  });

  const logEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const clickSoundRef = useRef<HTMLAudioElement>(null);

  const playSound = () => {
    if (clickSoundRef.current && !isMuted) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [gameState.history]);

  const addLog = (message: string) => {
    setGameState(prev => ({
      ...prev,
      history: [...prev.history, message]
    }));
  };

  const checkQuests = (target: string, type: 'location' | 'combat' = 'location') => {
    setGameState(prev => {
      let updated = false;
      const newQuests = prev.quests.map(quest => {
        if (!quest.isCompleted && quest.requirement.type === type && quest.requirement.target === target) {
          updated = true;
          return { ...quest, isCompleted: true };
        }
        return quest;
      });

      if (updated) {
        const completedQuests = newQuests.filter(q => q.isCompleted && !prev.quests.find(pq => pq.id === q.id && pq.isCompleted));
        let newXp = prev.player.xp;
        let newInventory = [...prev.player.inventory];
        let newHistory = [...prev.history];
        
        completedQuests.forEach(q => {
          newHistory.push(`✨ QUEST COMPLETED: ${q.title}!`);
          newHistory.push(`Received ${q.reward.xp} XP.`);
          newXp += q.reward.xp;
          if (q.reward.items) {
            q.reward.items.forEach(item => {
              newHistory.push(`Received item: ${item}`);
              newInventory.push(item);
            });
          }
        });

        return {
          ...prev,
          player: { ...prev.player, xp: newXp, inventory: newInventory },
          quests: newQuests,
          history: newHistory
        };
      }
      return prev;
    });
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

    if (p.grace !== "None") addLog(`✨ You are blessed with ${p.grace}.`);
    if (p.curse !== "None") addLog(`🌑 You carry the burden of ${p.curse}.`);

    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        trait,
        maxHp: prev.player.vit * 10 + 50 + bonusHp,
        hp: prev.player.vit * 10 + 50 + bonusHp,
        maxMp: prev.player.int * 10 + 50 + bonusMp,
        mp: prev.player.int * 10 + 50 + bonusMp,
        inventory: [...prev.player.inventory, startingItem].filter(Boolean)
      }
    }));
    setDistributingStats(false);
    setGameStarted(true);
  };

  // --- Game Actions ---

  const rest = () => {
    playSound();
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
    playSound();
    const currentLoc = WORLD[gameState.currentLocation];
    const nextLocName = currentLoc.exits[direction];
    if (nextLocName) {
      setGameState(prev => ({ ...prev, currentLocation: nextLocName }));
      addLog(`You walk ${direction} to the ${nextLocName}.`);
      checkQuests(nextLocName);
    }
  };

  const addCombatLog = (message: string) => {
    setGameState(prev => ({
      ...prev,
      combatLog: [...prev.combatLog, message].slice(-5)
    }));
  };

  const startCombat = () => {
    playSound();
    const locationEnemies = ENEMIES_BY_LOCATION[gameState.currentLocation] || ENEMIES_BY_LOCATION["Training Grounds"];
    const randomEnemy = locationEnemies[Math.floor(Math.random() * locationEnemies.length)];
    const enemy: Enemy = { ...randomEnemy };

    setGameState(prev => ({
      ...prev,
      inCombat: true,
      enemy: enemy,
      turn: 'player',
      combatLog: [`A ${enemy.name} attacks!`]
    }));
    addLog(`A ${enemy.name} appears in the ${gameState.currentLocation} and attacks you!`);
  };

  const getTotalStats = () => {
    return calculateTotalStats(gameState.player);
  };

  const equipItem = (itemName: string) => {
    const item = GAME_ITEMS[itemName];
    if (!item) return;

    setGameState(prev => {
      const newEquipment = { ...prev.player.equipment };
      const newInventory = [...prev.player.inventory];
      
      let slot: keyof Equipment | null = null;
      if (item.type === 'Weapon') slot = 'weapon';
      else if (item.type === 'Armor') slot = 'armor';
      else if (item.type === 'Accessory') slot = 'accessory';

      if (slot) {
        const currentlyEquipped = newEquipment[slot];
        if (currentlyEquipped) {
          newInventory.push(currentlyEquipped);
        }
        newEquipment[slot] = itemName;
        const itemIndex = newInventory.indexOf(itemName);
        if (itemIndex > -1) {
          newInventory.splice(itemIndex, 1);
        }
        
        addLog(`🛡️ Equipped ${itemName}.`);
        return {
          ...prev,
          player: {
            ...prev.player,
            equipment: newEquipment,
            inventory: newInventory
          }
        };
      }
      return prev;
    });
  };

  const unequipItem = (slot: keyof Equipment) => {
    setGameState(prev => {
      const itemToUnequip = prev.player.equipment[slot];
      if (!itemToUnequip) return prev;

      const newEquipment = { ...prev.player.equipment, [slot]: null };
      const newInventory = [...prev.player.inventory, itemToUnequip];

      addLog(`📦 Unequipped ${itemToUnequip}.`);
      return {
        ...prev,
        player: {
          ...prev.player,
          equipment: newEquipment,
          inventory: newInventory
        }
      };
    });
  };

  const useItem = (itemName: string) => {
    const item = GAME_ITEMS[itemName];
    if (!item) return;

    if (item.type === 'Consumable') {
      setGameState(prev => {
        const newInventory = [...prev.player.inventory];
        const itemIndex = newInventory.indexOf(itemName);
        if (itemIndex > -1) {
          newInventory.splice(itemIndex, 1);
        }

        let newHp = prev.player.hp;
        let newMp = prev.player.mp;

        if (item.id === 'mana_potion') {
          newMp = Math.min(prev.player.maxMp, prev.player.mp + 50);
          addLog(`🧪 You drank a Mana Potion. Restored 50 MP.`);
        }

        return {
          ...prev,
          player: {
            ...prev.player,
            hp: newHp,
            mp: newMp,
            inventory: newInventory
          }
        };
      });
    } else if (['Weapon', 'Armor', 'Accessory'].includes(item.type)) {
      equipItem(itemName);
    }
  };

  const castSkill = (skillId: string) => {
    if (!gameState.enemy || gameState.turn !== 'player') return;
    const skill = SKILL_TREE.find(s => s.id === skillId);
    if (!skill || skill.type !== 'Active') return;

    if (gameState.player.mp < skill.manaCost) {
      addCombatLog("❌ Not enough Mana!");
      return;
    }

    playSound();
    const totalStats = getTotalStats();

    let critChance = (totalStats.lck * 0.02);
    if (gameState.player.curse === "Unlucky Soul") critChance -= 0.05;
    const isCrit = Math.random() < critChance;

    let playerDmg = Math.floor(totalStats.int * skill.damageMultiplier) + Math.floor(Math.random() * 10);
    
    if (gameState.player.trait === "Forceful Will") playerDmg += 5;
    if (gameState.player.grace === "Arcane Affinity") playerDmg = Math.floor(playerDmg * 1.1);

    if (isCrit) {
      playerDmg = Math.floor(playerDmg * 1.5);
      addCombatLog("✨ CRITICAL CAST!");
    }
    
    const newEnemyHp = Math.max(0, gameState.enemy.hp - playerDmg);
    addCombatLog(`🔮 You cast ${skill.name} for ${playerDmg} damage.`);

    setGameState(prev => ({
      ...prev,
      player: { ...prev.player, mp: prev.player.mp - skill.manaCost },
      enemy: prev.enemy ? { ...prev.enemy, hp: newEnemyHp } : null,
      turn: newEnemyHp <= 0 ? 'player' : 'enemy'
    }));

    if (newEnemyHp <= 0) {
      setTimeout(() => handleVictory(), 1000);
    }
  };

  const attack = () => {
    if (!gameState.enemy || gameState.turn !== 'player') return;
    playSound();
    const totalStats = getTotalStats();

    const hasArcaneMissile = gameState.player.inventory?.includes("Spell: Arcane Missile");
    const hasKineticBlast = gameState.player.inventory?.includes("Spell: Kinetic Blast");

    // Player attacks (Basic Magic based on INT)
    let critChance = (totalStats.lck * 0.02);
    if (gameState.player.curse === "Unlucky Soul") critChance -= 0.05;
    const isCrit = Math.random() < critChance;

    let playerDmg = Math.floor(totalStats.int * 0.6) + Math.floor(Math.random() * 8);
    
    let attackMsg = "You cast a basic spark";
    if (hasArcaneMissile) {
      playerDmg += 8;
      attackMsg = "You fire an Arcane Missile";
    } else if (hasKineticBlast) {
      playerDmg += 12;
      attackMsg = "You release a Kinetic Blast";
    }

    if (gameState.player.trait === "Forceful Will") playerDmg += 5;
    if (gameState.player.grace === "Arcane Affinity") playerDmg = Math.floor(playerDmg * 1.1);

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
        const totalStats = getTotalStats();
        let agi = totalStats.agi;
        if (gameState.player.unlockedSkills.includes("haste")) agi = Math.floor(agi * 1.2);

        let fleeChance = agi * 0.02 + (gameState.player.trait === "Ghost Step" ? 0.1 : 0);
        if (gameState.player.grace === "Fleet Foot") fleeChance += 0.1;
        const isEvaded = Math.random() < fleeChance;

        if (isEvaded) {
          addCombatLog(`💨 You nimbly evaded the ${gameState.enemy!.name}'s attack!`);
        } else {
          let enemyDmg = Math.max(1, gameState.enemy!.str + Math.floor(Math.random() * 5) - Math.floor(totalStats.vit * 0.2));
          if (gameState.player.grace === "Iron Skin") enemyDmg = Math.floor(enemyDmg * 0.9);
          if (gameState.player.curse === "Brittle Bones") enemyDmg = Math.floor(enemyDmg * 1.1);
          
          if (gameState.player.unlockedSkills?.includes("shield") && gameState.player.mp >= 10) {
            enemyDmg = Math.floor(enemyDmg * 0.85);
            setGameState(prev => ({ ...prev, player: { ...prev.player, mp: prev.player.mp - 10 } }));
            addCombatLog("🛡️ Mana Shield absorbed some damage!");
          }

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

        if (gameState.player.unlockedSkills?.includes("meditation")) {
          setGameState(prev => {
            const mpRecover = Math.floor(prev.player.maxMp * 0.05);
            return {
              ...prev,
              player: { ...prev.player, mp: Math.min(prev.player.maxMp, prev.player.mp + mpRecover) }
            };
          });
          addCombatLog("🧘 Deep Meditation restores some mana.");
        }

        if (gameState.player.curse === "Mana Leak") {
          setGameState(prev => ({
            ...prev,
            player: { ...prev.player, mp: Math.max(0, prev.player.mp - 5) }
          }));
          addCombatLog("🌑 Your mana leaks away...");
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
    checkQuests(enemy.name, 'combat');

    setGameState(prev => {
      let newXp = prev.player.xp + enemy.xpReward;
      let newLevel = prev.player.level;
      let newMaxHp = prev.player.maxHp;
      let newMaxMp = prev.player.maxMp;
      let newAttributePoints = prev.player.attributePoints;
      let newSkillPoints = prev.player.skillPoints;
      
      if (newXp >= newLevel * 100) {
        newXp -= newLevel * 100;
        newLevel++;
        newMaxHp += 15;
        newMaxMp += 15;
        newAttributePoints += 5;
        newSkillPoints += 1;
        setTimeout(() => addLog(`✨ Rank Up! You are now a Level ${newLevel} Apprentice! You have 5 new Attribute Points and 1 Skill Point to distribute.`), 500);
      }

      return {
        ...prev,
        inCombat: false,
        enemy: null,
        turn: 'player',
        combatLog: [],
        player: {
          ...prev.player,
          xp: newXp,
          level: newLevel,
          maxHp: newMaxHp,
          maxMp: newMaxMp,
          hp: newMaxHp,
          mp: newMaxMp,
          attributePoints: newAttributePoints,
          skillPoints: newSkillPoints,
          inventory: [...prev.player.inventory, enemy.loot]
        }
      };
    });
  };

  const handleDefeat = () => {
    addLog("Your vision fades as your mana depletes...");
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        player: { ...INITIAL_PLAYER },
        currentLocation: "Grand Hall",
        history: ["You wake up in the Infirmary. The Matron has restored your energy."],
        inCombat: false,
        enemy: null,
        turn: 'player',
        combatLog: []
      }));
    }, 2000);
  };

  const unlockSkill = (skillId: string) => {
    const skill = SKILL_TREE.find(s => s.id === skillId);
    if (!skill) return;

    if (gameState.player.skillPoints < skill.cost) {
      addLog("❌ Not enough Skill Points.");
      return;
    }

    if (gameState.player.unlockedSkills?.includes(skillId)) {
      addLog("❌ Skill already unlocked.");
      return;
    }

    const hasPrereqs = skill.prerequisites.every(p => gameState.player.unlockedSkills?.includes(p));
    if (!hasPrereqs) {
      addLog("❌ Prerequisites not met.");
      return;
    }

    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        skillPoints: prev.player.skillPoints - skill.cost,
        unlockedSkills: [...prev.player.unlockedSkills, skillId]
      }
    }));
    addLog(`✨ Skill Unlocked: ${skill.name}!`);
  };

  const startNewGame = (slot: number) => {
    playSound();
    setCurrentSlot(slot);
    setSelectingGender(true);
    setMenuView('main');
    setAvailablePoints(20);
    setGameState({
      player: { ...INITIAL_PLAYER },
      currentLocation: "Grand Hall",
      history: ["Welcome to Aetheria Academy. Your magical education begins today."],
      inCombat: false,
      enemy: null,
      turn: 'player',
      combatLog: [],
      quests: [
        {
          id: 'explore_library',
          title: 'The Whispering Scrolls',
          description: 'Visit the Library to find the ancient scrolls of Aetheria.',
          reward: { xp: 50, items: ['Mana Potion'] },
          isCompleted: false,
          requirement: { type: 'location', target: 'Library' }
        },
        {
          id: 'train_hard',
          title: 'Combat Basics',
          description: 'Head to the Training Grounds to hone your magical skills.',
          reward: { xp: 30 },
          isCompleted: false,
          requirement: { type: 'location', target: 'Training Grounds' }
        }
      ]
    });
    setShowOverwriteWarning(null);
  };

  const saveGame = (slot?: number) => {
    const targetSlot = slot ?? currentSlot;
    if (targetSlot === null) return;

    localStorage.setItem(`aetheria_save_${targetSlot}`, JSON.stringify({
      player: gameState.player,
      currentLocation: gameState.currentLocation,
      history: gameState.history,
      quests: gameState.quests
    }));
    addLog(`Magical progress recorded in Slot ${targetSlot}.`);
  };

  const loadGame = (slot?: number) => {
    playSound();
    const targetSlot = slot ?? currentSlot;
    if (targetSlot === null) return;

    const saved = localStorage.getItem(`aetheria_save_${targetSlot}`);
    if (saved) {
      const data = JSON.parse(saved);
      setGameState({
        player: {
          ...INITIAL_PLAYER,
          ...data.player,
          inventory: data.player.inventory || [],
          unlockedSkills: data.player.unlockedSkills || []
        },
        currentLocation: data.currentLocation,
        history: data.history || ["Magical progress restored."],
        inCombat: false,
        enemy: null,
        turn: 'player',
        combatLog: [],
        quests: data.quests || [
          {
            id: 'explore_library',
            title: 'The Whispering Scrolls',
            description: 'Visit the Library to find the ancient scrolls of Aetheria.',
            reward: { xp: 50, items: ['Mana Potion'] },
            isCompleted: false,
            requirement: { type: 'location', target: 'Library' }
          },
          {
            id: 'train_hard',
            title: 'Combat Basics',
            description: 'Head to the Training Grounds to hone your magical skills.',
            reward: { xp: 30 },
            isCompleted: false,
            requirement: { type: 'location', target: 'Training Grounds' }
          }
        ]
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
                  onMove={move}
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
