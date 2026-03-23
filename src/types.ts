/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Equipment {
  weapon: string | null;
  armor: string | null;
  accessory: string | null;
}

export interface Player {
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

export interface Item {
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

export interface Location {
  name: string;
  description: string;
  image: string;
  exits: { [key: string]: string };
}

export interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  str: number;
  xpReward: number;
  loot: string;
  level: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: { xp: number; items?: string[] };
  isCompleted: boolean;
  requirement: { type: 'location' | 'kill' | 'item' | 'combat'; target: string; count?: number; current?: number };
}

export interface GameState {
  player: Player;
  currentLocation: string;
  history: string[];
  inCombat: boolean;
  enemy: Enemy | null;
  turn: 'player' | 'enemy';
  combatLog: string[];
  quests: Quest[];
}

export interface Skill {
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
