/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Shield, 
  Sword, 
  Zap, 
  Sparkles, 
  Scroll, 
  Flame, 
  Eye, 
  Circle, 
  Wind,
  Trophy,
  Heart
} from 'lucide-react';
import { Location, Player, Item, Skill, Enemy } from './types';

export const WORLD: { [key: string]: Location } = {
  "Grand Hall": {
    name: "Grand Hall",
    description: "The heart of Aetheria Academy. Towering stained-glass windows depict legendary wizards, and floating candles illuminate the marble floors.",
    image: "src/assets/academy-grand-hall.webp",
    exits: { "north": "Library", "east": "Training Grounds", "south": "Dormitories", "west": "Alchemy Lab" }
  },
  "Library": {
    name: "Library",
    description: "A labyrinth of ancient scrolls and whispering books. The air smells of old parchment and latent magical energy.",
    image: "src/assets/academy-library.webp",
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
    image: "src/assets/academy-dormitory.webp",
    exits: { "north": "Grand Hall" }
  },
  "Alchemy Lab": {
    name: "Alchemy Lab",
    description: "Bubbling cauldrons and strange fumes fill the air. Be careful what you touch.",
    image: "https://picsum.photos/seed/alchemy/1920/1080?blur=2",
    exits: { "east": "Grand Hall" }
  }
};

export const INITIAL_PLAYER: Player = {
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

export const GAME_ITEMS: { [key: string]: Item } = {
  "Wooden Wand": {
    id: "wooden_wand",
    name: "Wooden Wand",
    description: "A simple wand for beginners. +2 INT.",
    type: "Weapon",
    stats: { int: 2 },
    icon: <Sword size={16} />
  },
  "Mana Potion": {
    id: "mana_potion",
    name: "Mana Potion",
    description: "Restores 50 MP.",
    type: "Consumable",
    icon: <Zap size={16} />
  },
  "Health Potion": {
    id: "health_potion",
    name: "Health Potion",
    description: "Restores 50 HP.",
    type: "Consumable",
    icon: <Flame size={16} className="text-red-400" />
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
  "Protective Amulet": {
    id: "protective_amulet",
    name: "Protective Amulet",
    description: "A heavy amulet that shields the wearer. +5 VIT.",
    type: "Accessory",
    stats: { vit: 5 },
    icon: <Shield size={16} className="text-blue-400" />
  },
  "Lucky Coin": {
    id: "lucky_coin",
    name: "Lucky Coin",
    description: "A gold coin that seems to bring good fortune. +5 LCK.",
    type: "Accessory",
    stats: { lck: 5 },
    icon: <Circle size={16} className="text-yellow-400" />
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
  },
  "Steel Dagger": {
    id: "steel_dagger",
    name: "Steel Dagger",
    description: "A sharp blade for quick strikes. +4 STR, +2 AGI.",
    type: "Weapon",
    stats: { str: 4, agi: 2 },
    icon: <Sword size={16} className="text-slate-400" />
  },
  "Apprentice Robe": {
    id: "apprentice_robe",
    name: "Apprentice Robe",
    description: "Standard issue robes for academy students. +2 INT, +2 VIT.",
    type: "Armor",
    stats: { int: 2, vit: 2 },
    icon: <Shield size={16} className="text-magic-purple" />
  },
  "Swift Boots": {
    id: "swift_boots",
    name: "Swift Boots",
    description: "Lightweight boots that make you feel faster. +5 AGI.",
    type: "Armor",
    stats: { agi: 5 },
    icon: <Wind size={16} className="text-green-400" />
  }
};

export const SKILL_TREE: Skill[] = [
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

export const ENEMIES_BY_LOCATION: { [key: string]: Enemy[] } = {
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

export const GRACES = [
  { name: "None", desc: "No special blessing.", cost: 0, type: "General" },
  { name: "Arcane Affinity", desc: "+15% Magic Damage, but -5% Physical Defense.", cost: 2, type: "Offensive" },
  { name: "Iron Skin", desc: "+15% Damage Reduction, but -10% Evasion.", cost: 2, type: "Defensive" },
  { name: "Fleet Foot", desc: "+15% Evasion Chance, but -10% Max HP.", cost: 2, type: "Utility" },
  { name: "Giant's Might", desc: "+15% Physical Damage, but -10% Mana Pool.", cost: 2, type: "Offensive" },
  { name: "Fortune's Favor", desc: "+10% Critical Chance and +20% Gold/Loot.", cost: 3, type: "Utility" },
  { name: "Mana Well", desc: "Recover 3 MP every turn automatically.", cost: 3, type: "Utility" },
  { name: "Scholar's Mind", desc: "+20% Experience Gained from all sources.", cost: 3, type: "Utility" },
  { name: "Phoenix Spark", desc: "Once per battle, survive a lethal hit with 1 HP.", cost: 4, type: "Defensive" },
];

export const CURSES = [
  { name: "None", desc: "No innate curse.", bonus: 0, type: "General" },
  { name: "Mana Leak", desc: "-5 MP per turn in combat.", bonus: 2, type: "Resource" },
  { name: "Brittle Bones", desc: "+15% Damage taken from all sources.", bonus: 2, type: "Defensive" },
  { name: "Unlucky Soul", desc: "-10% Critical Chance and -10% Loot quality.", bonus: 2, type: "Utility" },
  { name: "Heavy Burden", desc: "-20% Evasion and -10% Agility.", bonus: 3, type: "Utility" },
  { name: "Feeble Mind", desc: "-15% Magic Damage and -10% Intelligence.", bonus: 3, type: "Offensive" },
  { name: "Hemophilia", desc: "Lose 2% of Max HP every turn in combat.", bonus: 3, type: "Resource" },
  { name: "Arcane Void", desc: "Spells cost 50% more Mana to cast.", bonus: 4, type: "Resource" },
];

export const TRAITS = [
  { name: "None", desc: "No special trait." },
  { name: "Arcane Prodigy", desc: "+30 Max MP" },
  { name: "Resilient Soul", desc: "+30 Max HP" },
  { name: "Forceful Will", desc: "+5 Magic Damage" },
  { name: "Ghost Step", desc: "+10% Evasion Chance" },
];
