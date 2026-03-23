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

// --- Types ---

interface Equipment {
  weapon: string | null;
  armor: string | null;
  accessory: string | null;
}

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
  skillPoints: number;
  unlockedSkills: string[];
  str: number;
  agi: number;
  int: number;
  vit: number;
  lck: number;
  trait: string;
  grace: string;
  curse: string;
  inventory: string[];
  equipment: Equipment;
}

interface Item {
  id: string;
  name: string;
  description: string;
  type: 'Weapon' | 'Armor' | 'Accessory' | 'Consumable' | 'Material';
  stats?: {
    str?: number;
    agi?: number;
    int?: number;
    vit?: number;
    lck?: number;
    hp?: number;
    mp?: number;
  };
  icon: any;
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
  level: number;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  reward: { xp: number; items?: string[] };
  isCompleted: boolean;
  requirement: { type: 'location' | 'kill' | 'item'; target: string; count?: number; current?: number };
}

interface GameState {
  player: Player;
  currentLocation: string;
  history: string[];
  inCombat: boolean;
  enemy: Enemy | null;
  turn: 'player' | 'enemy';
  combatLog: string[];
  quests: Quest[];
}

// --- Data ---

const WORLD: { [key: string]: Location } = {
  "Grand Hall": {
    name: "Grand Hall",
    description: "The heart of Aetheria Academy. Towering stained-glass windows depict legendary wizards, and floating candles illuminate the marble floors.",
    image: "https://images.unsplash.com/photo-1519074063912-ad25b57b9d17?auto=format&fit=crop&q=80&w=1000",
    exits: { "north": "Library", "east": "Training Grounds", "south": "Dormitories", "west": "Alchemy Lab" }
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
  },
  "Alchemy Lab": {
    name: "Alchemy Lab",
    description: "Bubbling cauldrons and strange fumes fill the air. Be careful what you touch.",
    image: "https://picsum.photos/seed/alchemy/1920/1080?blur=2",
    exits: { "east": "Grand Hall" }
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
  skillPoints: 0,
  unlockedSkills: [],
  str: 5,
  agi: 5,
  int: 5,
  vit: 5,
  lck: 5,
  trait: "None",
  grace: "None",
  curse: "None",
  inventory: ["Mana Potion"],
  equipment: {
    weapon: "Wooden Wand",
    armor: "Apprentice Robe",
    accessory: null
  }
};

const GAME_ITEMS: { [key: string]: Item } = {
  "Wooden Wand": {
    id: "wooden_wand",
    name: "Wooden Wand",
    description: "A simple wand for beginners. +2 INT.",
    type: "Weapon",
    stats: { int: 2 },
    icon: <Sword size={16} />
  },
  "Apprentice Robe": {
    id: "apprentice_robe",
    name: "Apprentice Robe",
    description: "Standard academy uniform. +2 VIT.",
    type: "Armor",
    stats: { vit: 2 },
    icon: <Shield size={16} />
  },
  "Mana Potion": {
    id: "mana_potion",
    name: "Mana Potion",
    description: "Restores 50 MP.",
    type: "Consumable",
    icon: <Zap size={16} />
  },
  "Mana Crystal": {
    id: "mana_crystal",
    name: "Mana Crystal",
    description: "A crystal pulsing with magical energy. Used for crafting.",
    type: "Material",
    icon: <Sparkles size={16} />
  },
  "Old Parchment": {
    id: "old_parchment",
    name: "Old Parchment",
    description: "Fragile paper from the ancient library.",
    type: "Material",
    icon: <Scroll size={16} />
  },
  "Magic Ink": {
    id: "magic_ink",
    name: "Magic Ink",
    description: "Ink that glows in the dark.",
    type: "Material",
    icon: <Flame size={16} />
  },
  "Iron Scraps": {
    id: "iron_scraps",
    name: "Iron Scraps",
    description: "Pieces of metal from a training golem.",
    type: "Material",
    icon: <Shield size={16} />
  },
  "Spectral Essence": {
    id: "spectral_essence",
    name: "Spectral Essence",
    description: "Ethereal remains of a ghost.",
    type: "Material",
    icon: <Eye size={16} />
  },
  "Silver Ring": {
    id: "silver_ring",
    name: "Silver Ring",
    description: "A simple ring that enhances focus. +1 INT, +1 LCK.",
    type: "Accessory",
    stats: { int: 1, lck: 1 },
    icon: <Circle size={16} />
  },
  "Wooden Staff": {
    id: "wooden_staff",
    name: "Wooden Staff",
    description: "A sturdy staff. +3 INT, +1 VIT.",
    type: "Weapon",
    stats: { int: 3, vit: 1 },
    icon: <Sword size={16} />
  },
  "Crystal Staff": {
    id: "crystal_staff",
    name: "Crystal Staff",
    description: "A staff topped with a glowing crystal. +8 INT, +2 LCK.",
    type: "Weapon",
    stats: { int: 8, lck: 2 },
    icon: <Sparkles size={16} />
  }
};

interface Skill {
  id: string;
  name: string;
  description: string;
  cost: number;
  manaCost: number;
  damageMultiplier: number;
  prerequisites: string[];
  type: 'Passive' | 'Active';
  icon: any;
}

const SKILL_TREE: Skill[] = [
  { 
    id: 'meditation', 
    name: 'Deep Meditation', 
    description: 'Recover 5% MP every turn in combat.', 
    cost: 1, 
    manaCost: 0,
    damageMultiplier: 0,
    prerequisites: [], 
    type: 'Passive',
    icon: <Sparkles size={16} />
  },
  { 
    id: 'fireball', 
    name: 'Fireball', 
    description: 'A powerful fire spell that deals 1.5x INT damage.', 
    cost: 2, 
    manaCost: 20,
    damageMultiplier: 1.5,
    prerequisites: [], 
    type: 'Active',
    icon: <Flame size={16} />
  },
  { 
    id: 'shield', 
    name: 'Mana Shield', 
    description: 'Reduce incoming damage by 15% at the cost of 10 MP per hit.', 
    cost: 2, 
    manaCost: 0,
    damageMultiplier: 0,
    prerequisites: ['meditation'], 
    type: 'Passive',
    icon: <Shield size={16} />
  },
  { 
    id: 'haste', 
    name: 'Arcane Haste', 
    description: 'Increase AGI by 20% during combat.', 
    cost: 3, 
    manaCost: 0,
    damageMultiplier: 0,
    prerequisites: ['meditation'], 
    type: 'Passive',
    icon: <Wind size={16} />
  },
  { 
    id: 'inferno', 
    name: 'Inferno Burst', 
    description: 'Deals massive 2.5x INT damage. Requires Fireball.', 
    cost: 4, 
    manaCost: 45,
    damageMultiplier: 2.5,
    prerequisites: ['fireball'], 
    type: 'Active',
    icon: <Flame size={20} />
  },
  { 
    id: 'frostbolt', 
    name: 'Frostbolt', 
    description: 'A chilling bolt that deals 1.2x INT damage and slows enemy.', 
    cost: 2, 
    manaCost: 15,
    damageMultiplier: 1.2,
    prerequisites: [], 
    type: 'Active',
    icon: <Wind size={16} className="text-blue-400" />
  },
];

const ENEMIES_BY_LOCATION: { [key: string]: Enemy[] } = {
  "Library": [
    { name: "Animated Scroll", hp: 25, maxHp: 25, str: 4, xpReward: 30, loot: "Old Parchment", level: 1 },
    { name: "Ink Elemental", hp: 45, maxHp: 45, str: 6, xpReward: 55, loot: "Magic Ink", level: 3 }
  ],
  "Training Grounds": [
    { name: "Training Golem", hp: 60, maxHp: 60, str: 8, xpReward: 70, loot: "Iron Scraps", level: 5 },
    { name: "Rogue Familiar", hp: 35, maxHp: 35, str: 5, xpReward: 40, loot: "Mana Crystal", level: 2 }
  ],
  "Grand Hall": [
    { name: "Ghostly Apprentice", hp: 40, maxHp: 40, str: 7, xpReward: 50, loot: "Spectral Essence", level: 4 }
  ],
  "Dormitories": [
    { name: "Shadow Creeper", hp: 30, maxHp: 30, str: 6, xpReward: 35, loot: "Silver Ring", level: 2 }
  ],
  "Alchemy Lab": [
    { name: "Toxic Slime", hp: 50, maxHp: 50, str: 9, xpReward: 45, loot: "Mana Potion", level: 3 },
    { name: "Failed Experiment", hp: 80, maxHp: 80, str: 14, xpReward: 75, loot: "Mana Crystal", level: 4 }
  ]
};

const GRACES = [
  { name: "None", desc: "No special blessing.", cost: 0 },
  { name: "Arcane Affinity", desc: "+10% Magic Damage", cost: 1 },
  { name: "Iron Skin", desc: "+10% Damage Reduction", cost: 1 },
  { name: "Fleet Foot", desc: "+10% Evasion Chance", cost: 1 },
];

const CURSES = [
  { name: "None", desc: "No innate curse.", bonus: 0 },
  { name: "Mana Leak", desc: "-5 MP per turn in combat", bonus: 1 },
  { name: "Brittle Bones", desc: "+10% Damage taken", bonus: 1 },
  { name: "Unlucky Soul", desc: "-5% Critical Chance", bonus: 1 },
];

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
    const player = gameState.player;
    const stats = {
      str: player.str,
      agi: player.agi,
      int: player.int,
      vit: player.vit,
      lck: player.lck
    };

    Object.values(player.equipment).forEach(itemId => {
      const id = itemId as string | null;
      if (id && GAME_ITEMS[id]) {
        const item = GAME_ITEMS[id];
        if (item.stats) {
          if (item.stats.str) stats.str += item.stats.str;
          if (item.stats.agi) stats.agi += item.stats.agi;
          if (item.stats.int) stats.int += item.stats.int;
          if (item.stats.vit) stats.vit += item.stats.vit;
          if (item.stats.lck) stats.lck += item.stats.lck;
        }
      }
    });

    return stats;
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
            <motion.div 
              key={gameState.currentLocation}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 ${gameState.inCombat ? 'min-h-[500px]' : 'aspect-video'}`}
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-magic-dark/95 backdrop-blur-2xl z-50 overflow-y-auto"
                >
                  <div className="min-h-full flex flex-col items-center justify-center p-6 py-12">
                    <div className="w-full max-w-md space-y-8">
                      {/* Combat Header */}
                      <div className="text-center space-y-1">
                        <div className="flex items-center justify-center gap-3 text-red-500 mb-1">
                          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-red-500" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Arcane Duel</span>
                          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-red-500" />
                        </div>
                        <h2 className="text-4xl font-black text-white font-display tracking-tight">ENGAGED</h2>
                      </div>

                      {/* Turn Indicator */}
                      <div className="flex justify-center items-center gap-8">
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

                      {/* Enemy Status Card */}
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
                            
                            {/* Real-time Combat Log */}
                            <div className="h-32 overflow-y-auto bg-black/40 rounded-xl p-3 border border-white/5 custom-scrollbar">
                              <div className="space-y-2">
                                {gameState.combatLog.map((log, i) => (
                                  <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`text-[10px] leading-relaxed ${i === gameState.combatLog.length - 1 ? 'text-white font-bold' : 'text-slate-500'}`}
                                  >
                                    {log}
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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
                    onClick={() => { playSound(); addLog(`You observe the arcane patterns in the ${currentLocation.name}.`); }} 
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

                  {/* Active Skills */}
                  {SKILL_TREE.filter(s => s.type === 'Active' && gameState.player.unlockedSkills?.includes(s.id)).map(skill => (
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
                    onClick={() => {
                      setGameState(prev => ({ ...prev, inCombat: false, enemy: null }));
                      addLog("You retreated to a safe distance.");
                    }}
                    className="relative group overflow-hidden py-5 rounded-3xl font-black font-display transition-all flex flex-col items-center justify-center gap-1 border border-white/10 bg-white/5 text-slate-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 active:scale-95"
                  >
                    <Wind size={24} />
                    <span className="text-[10px] uppercase tracking-[0.2em]">Tactical</span>
                    <span className="text-lg">RETREAT</span>
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
                  onClick={() => { playSound(); setShowLevelUp(true); }}
                  className="col-span-2 bg-amber-500/20 border border-amber-500/40 p-2 rounded-xl text-center hover:bg-amber-500/30 transition-all animate-pulse"
                >
                  <div className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">Points Available</div>
                  <div className="text-xs font-bold text-white font-display">DISTRIBUTE {gameState.player.attributePoints} AP</div>
                </button>
              )}
              <button 
                onClick={() => { playSound(); setShowSkillTree(true); }}
                className="col-span-1 bg-magic-purple/20 border border-magic-purple/40 p-2 rounded-xl text-center hover:bg-magic-purple/30 transition-all"
              >
                <div className="text-[8px] font-bold text-magic-purple uppercase tracking-widest">Arcane Mastery</div>
                <div className="text-xs font-bold text-white font-display flex items-center justify-center gap-2">
                  <Sparkles size={12} /> SKILLS
                </div>
              </button>
              <button 
                onClick={() => { playSound(); setShowMap(true); }}
                className="col-span-1 bg-emerald-500/20 border border-emerald-500/40 p-2 rounded-xl text-center hover:bg-emerald-500/30 transition-all"
              >
                <div className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Navigation</div>
                <div className="text-xs font-bold text-white font-display flex items-center justify-center gap-2">
                  <MapIcon size={12} /> VIEW MAP
                </div>
              </button>
              <div className="col-span-2 bg-magic-purple/10 border border-magic-purple/20 p-2 rounded-xl text-center">
                <div className="text-[8px] font-bold text-magic-purple uppercase tracking-widest">Active Trait</div>
                <div className="text-xs font-bold text-white font-display">{gameState.player.trait}</div>
              </div>
              {gameState.player.grace !== "None" && (
                <div className="col-span-1 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl text-center">
                  <div className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Grace</div>
                  <div className="text-[10px] font-bold text-white font-display">{gameState.player.grace}</div>
                </div>
              )}
              {gameState.player.curse !== "None" && (
                <div className="col-span-1 bg-red-500/10 border border-red-500/20 p-2 rounded-xl text-center">
                  <div className="text-[8px] font-bold text-red-400 uppercase tracking-widest">Curse</div>
                  <div className="text-[10px] font-bold text-white font-display">{gameState.player.curse}</div>
                </div>
              )}
            <div className="col-span-2 grid grid-cols-4 gap-2 pt-2">
              <MiniStat label="INT" value={getTotalStats().int} />
              <MiniStat label="VIT" value={getTotalStats().vit} />
              <MiniStat label="AGI" value={getTotalStats().agi} />
              <MiniStat label="LCK" value={getTotalStats().lck} />
            </div>
              <button 
                onClick={() => {
                  playSound();
                  setShowQuests(true);
                }}
                className="col-span-2 bg-white/5 border border-white/10 p-2 rounded-xl text-center hover:bg-white/10 transition-all"
              >
                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Active</div>
                <div className="text-xs font-bold text-white font-display flex items-center justify-center gap-2">
                  <Scroll size={12} /> QUESTS
                </div>
              </button>
            </div>
          </div>

          {/* Equipment */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4 text-slate-400">
              <Shield size={18} />
              <h3 className="text-sm font-bold uppercase tracking-widest">Equipment</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(gameState.player.equipment).map(([slot, itemName]) => {
                const typedItemName = itemName as string | null;
                return (
                  <div key={slot} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="text-[10px] font-bold text-slate-500 uppercase w-16">{slot}</div>
                      {typedItemName ? (
                        <div className="flex items-center gap-2 text-white">
                          {GAME_ITEMS[typedItemName]?.icon}
                          <span>{typedItemName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">Empty</span>
                      )}
                    </div>
                    {typedItemName && (
                      <button 
                        onClick={() => unequipItem(slot as keyof Equipment)}
                        className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase"
                      >
                        Unequip
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4 text-slate-400">
              <Package size={18} />
              <h3 className="text-sm font-bold uppercase tracking-widest">Arcane Bag</h3>
            </div>
            <div className="space-y-2">
              {gameState.player.inventory.map((itemName, i) => {
                const item = GAME_ITEMS[itemName];
                return (
                  <div key={i} className="group relative flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 text-sm hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-magic-purple">{item?.icon || <Package size={14} />}</div>
                      <div>
                        <div className="font-bold text-white">{itemName}</div>
                        <div className="text-[10px] text-slate-500">{item?.description}</div>
                      </div>
                    </div>
                    {item && (item.type === 'Consumable' || ['Weapon', 'Armor', 'Accessory'].includes(item.type)) && (
                      <button 
                        onClick={() => useItem(itemName)}
                        className="opacity-0 group-hover:opacity-100 bg-magic-purple/20 text-magic-purple text-[10px] font-bold px-2 py-1 rounded-lg hover:bg-magic-purple/30 transition-all uppercase"
                      >
                        {item.type === 'Consumable' ? 'Use' : 'Equip'}
                      </button>
                    )}
                  </div>
                );
              })}
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
            <div className="h-48 overflow-y-auto p-6 space-y-3 custom-scrollbar">
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

      {/* Quest Modal */}
      <AnimatePresence>
        {showQuests && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuests(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-magic-dark border border-magic-purple/30 rounded-3xl p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-magic-purple/20 rounded-xl text-magic-purple">
                    <Scroll size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-display italic">Quest Journal</h2>
                </div>
                <button 
                  onClick={() => {
                    playSound();
                    setShowQuests(false);
                  }}
                  className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {gameState.quests.map((quest) => (
                  <div key={quest.id} className={`p-4 rounded-2xl border transition-all ${
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
                {gameState.quests.length === 0 && (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600">
                      <Scroll size={24} />
                    </div>
                    <p className="text-slate-500 text-sm italic">No active quests in your journal.</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  playSound();
                  setShowQuests(false);
                }}
                className="w-full py-4 bg-magic-purple hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all font-display"
              >
                CLOSE JOURNAL
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Base</span>
                        <span className="w-6 text-center font-bold text-white">{(gameState.player[stat.key as keyof Player] as number)}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] text-magic-purple uppercase font-bold tracking-tighter">Total</span>
                        <span className="w-6 text-center font-bold text-magic-purple">{(getTotalStats()[stat.key as keyof Player] as number)}</span>
                      </div>
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

      {/* Map Modal */}
      <AnimatePresence>
        {showMap && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowMap(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-stone-900 border-4 border-stone-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Map Header */}
              <div className="bg-stone-800 p-6 flex items-center justify-between border-b border-stone-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                    <MapIcon size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white font-display">Academy Layout</h2>
                    <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">Aetheria Academy Grounds</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMap(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-stone-500 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Map Content */}
              <div className="p-4 sm:p-8 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] bg-stone-900/50">
                <div className="relative aspect-square w-full max-w-[min(90vw,450px)] mx-auto bg-stone-800/50 rounded-full border-4 border-dashed border-stone-700/50 flex items-center justify-center overflow-hidden">
                  
                  {/* Compass Rose Decoration */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <Compass size={300} className="text-stone-400 w-[60%] h-[60%]" />
                  </div>

                  {/* Locations */}
                  <MapMarker 
                    name="Library" 
                    icon={<BookOpen size={20} />} 
                    pos="top-[10%] left-1/2 -translate-x-1/2" 
                    isActive={gameState.currentLocation === "Library"}
                    onClick={() => {
                      playSound();
                      setGameState(prev => ({ ...prev, currentLocation: "Library" }));
                      addLog("You navigate through the halls to the Library.");
                      checkQuests("Library");
                      setShowMap(false);
                    }}
                  />

                  <MapMarker 
                    name="Grand Hall" 
                    icon={<Home size={20} />} 
                    pos="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
                    isActive={gameState.currentLocation === "Grand Hall"}
                    onClick={() => {
                      playSound();
                      setGameState(prev => ({ ...prev, currentLocation: "Grand Hall" }));
                      addLog("You return to the heart of the academy, the Grand Hall.");
                      checkQuests("Grand Hall");
                      setShowMap(false);
                    }}
                  />

                  <MapMarker 
                    name="Training Grounds" 
                    icon={<Sword size={20} />} 
                    pos="top-1/2 right-[10%] -translate-y-1/2" 
                    isActive={gameState.currentLocation === "Training Grounds"}
                    onClick={() => {
                      playSound();
                      setGameState(prev => ({ ...prev, currentLocation: "Training Grounds" }));
                      addLog("You head out to the Training Grounds.");
                      checkQuests("Training Grounds");
                      setShowMap(false);
                    }}
                  />

                  <MapMarker 
                    name="Dormitories" 
                    icon={<Bed size={20} />} 
                    pos="bottom-[10%] left-1/2 -translate-x-1/2" 
                    isActive={gameState.currentLocation === "Dormitories"}
                    onClick={() => {
                      playSound();
                      setGameState(prev => ({ ...prev, currentLocation: "Dormitories" }));
                      addLog("You walk back to your quarters in the Dormitories.");
                      checkQuests("Dormitories");
                      setShowMap(false);
                    }}
                  />

                  {/* Connection Lines (Visual only) */}
                  <div className="absolute top-1/2 left-1/2 w-px h-[30%] bg-stone-700 -translate-x-1/2 -translate-y-full opacity-30" />
                  <div className="absolute top-1/2 left-1/2 w-px h-[30%] bg-stone-700 -translate-x-1/2 opacity-30" />
                  <div className="absolute top-1/2 left-1/2 h-px w-[30%] bg-stone-700 -translate-y-1/2 opacity-30" />
                </div>

                <div className="mt-8 text-center">
                  <p className="text-stone-500 text-xs italic">Click on a location marker to travel there instantly.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skill Tree Modal */}
      <AnimatePresence>
        {showSkillTree && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSkillTree(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-magic-dark border border-magic-purple/30 rounded-3xl p-8 shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white font-display italic glow-purple">Skill Tree</h2>
                <p className="text-slate-400 text-sm">Unlock powerful arcane abilities with Skill Points (SP).</p>
              </div>

              <div className="bg-magic-purple/10 py-2 px-4 rounded-full text-center">
                <span className="text-magic-purple font-bold text-sm tracking-widest uppercase">SP Remaining: {gameState.player.skillPoints}</span>
              </div>

              <div className="space-y-8">
                {/* Active Skills Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                    <Zap size={18} className="text-red-400" />
                    <h3 className="text-lg font-bold text-white font-display uppercase tracking-widest">Active Skills</h3>
                  </div>
                  <div className="grid gap-4">
                    {SKILL_TREE.filter(s => s.type === 'Active').map((skill) => {
                      const isUnlocked = gameState.player.unlockedSkills?.includes(skill.id);
                      const canUnlock = !isUnlocked && 
                                        gameState.player.skillPoints >= skill.cost && 
                                        skill.prerequisites.every(p => gameState.player.unlockedSkills?.includes(p));
                      
                      return (
                        <div 
                          key={skill.id} 
                          className={`p-4 rounded-2xl border transition-all ${
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
                                {skill.prerequisites.length > 0 && (
                                  <div className="flex items-center gap-1 mt-2">
                                    <span className="text-[8px] text-slate-500 uppercase font-bold">Requires:</span>
                                    {skill.prerequisites.map(p => (
                                      <span key={p} className={`text-[8px] px-1.5 py-0.5 rounded bg-white/5 ${gameState.player.unlockedSkills?.includes(p) ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {SKILL_TREE.find(s => s.id === p)?.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              {isUnlocked ? (
                                <div className="text-emerald-400 text-[10px] font-black uppercase flex items-center gap-1">
                                  <Trophy size={10} /> Unlocked
                                </div>
                              ) : (
                                <div className={`text-[10px] font-black uppercase ${canUnlock ? 'text-amber-400' : 'text-slate-500'}`}>
                                  Cost: {skill.cost} SP
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Passive Skills Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                    <Shield size={18} className="text-blue-400" />
                    <h3 className="text-lg font-bold text-white font-display uppercase tracking-widest">Passive Skills</h3>
                  </div>
                  <div className="grid gap-4">
                    {SKILL_TREE.filter(s => s.type === 'Passive').map((skill) => {
                      const isUnlocked = gameState.player.unlockedSkills?.includes(skill.id);
                      const canUnlock = !isUnlocked && 
                                        gameState.player.skillPoints >= skill.cost && 
                                        skill.prerequisites.every(p => gameState.player.unlockedSkills?.includes(p));
                      
                      return (
                        <div 
                          key={skill.id} 
                          className={`p-4 rounded-2xl border transition-all ${
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
                                </div>
                                <p className="text-xs text-slate-400 mt-1">{skill.description}</p>
                                {skill.prerequisites.length > 0 && (
                                  <div className="flex items-center gap-1 mt-2">
                                    <span className="text-[8px] text-slate-500 uppercase font-bold">Requires:</span>
                                    {skill.prerequisites.map(p => (
                                      <span key={p} className={`text-[8px] px-1.5 py-0.5 rounded bg-white/5 ${gameState.player.unlockedSkills?.includes(p) ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {SKILL_TREE.find(s => s.id === p)?.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              {isUnlocked ? (
                                <div className="text-emerald-400 text-[10px] font-black uppercase flex items-center gap-1">
                                  <Trophy size={10} /> Unlocked
                                </div>
                              ) : (
                                <div className={`text-[10px] font-black uppercase ${canUnlock ? 'text-amber-400' : 'text-slate-500'}`}>
                                  Cost: {skill.cost} SP
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowSkillTree(false)}
                className="w-full py-4 bg-magic-purple hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all font-display"
              >
                CLOSE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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

function MapMarker({ name, icon, pos, isActive, onClick }: { name: string, icon: any, pos: string, isActive: boolean, onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`absolute ${pos} flex flex-col items-center gap-1 sm:gap-2 group z-10`}
    >
      <div className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all shadow-lg ${
        isActive 
          ? 'bg-emerald-500 border-emerald-400 text-white scale-110 ring-4 ring-emerald-500/20' 
          : 'bg-stone-800 border-stone-700 text-stone-400 hover:border-emerald-500/50 hover:text-emerald-400'
      }`}>
        <div className="scale-75 sm:scale-100">
          {icon}
        </div>
        {isActive && (
          <motion.div 
            layoutId="current-loc-indicator"
            className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-white text-emerald-600 rounded-full p-0.5 shadow-md"
          >
            <MapPin size={8} className="sm:w-[10px] sm:h-[10px]" fill="currentColor" />
          </motion.div>
        )}
      </div>
      <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg transition-all ${
        isActive ? 'bg-emerald-500 text-white' : 'bg-stone-800 text-stone-500 group-hover:text-emerald-400'
      }`}>
        {name}
      </span>
    </motion.button>
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
