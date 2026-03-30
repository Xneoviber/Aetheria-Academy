import { useState, Dispatch, SetStateAction } from 'react';
import { GameState, Equipment } from '../types';
import { WORLD, GAME_ITEMS, SKILL_TREE, INITIAL_PLAYER } from '../constants';

export function useGameState(
  playSound: () => void
) {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectingGender, setSelectingGender] = useState(false);
  const [distributingStats, setDistributingStats] = useState(false);
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

  const addLog = (message: string) => {
    setGameState(prev => ({
      ...prev,
      history: [...prev.history, message]
    }));
  };

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

  const move = (direction: string, checkQuests: (target: string, type: 'location' | 'combat') => void) => {
    playSound();
    const currentLoc = WORLD[gameState.currentLocation];
    const nextLocName = currentLoc.exits[direction];
    if (nextLocName) {
      setGameState(prev => ({ ...prev, currentLocation: nextLocName }));
      addLog(`You walk ${direction} to the ${nextLocName}.`);
      checkQuests(nextLocName, 'location');
    }
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

  return {
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
  };
}
