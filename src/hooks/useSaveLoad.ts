import { useState, Dispatch, SetStateAction } from 'react';
import { GameState } from '../types';
import { INITIAL_PLAYER } from '../constants';

export function useSaveLoad(
  gameState: GameState,
  setGameState: Dispatch<SetStateAction<GameState>>,
  setGameStarted: (started: boolean) => void,
  setSelectingGender: (selecting: boolean) => void,
  setMenuView: (view: any) => void,
  setAvailablePoints: (points: number) => void,
  addLog: (message: string) => void,
  playSound: () => void
) {
  const [currentSlot, setCurrentSlot] = useState<number | null>(null);
  const [showOverwriteWarning, setShowOverwriteWarning] = useState<number | null>(null);

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

  return {
    currentSlot,
    setCurrentSlot,
    showOverwriteWarning,
    setShowOverwriteWarning,
    saveGame,
    loadGame,
    hasSaveData,
    getSaveSummary,
    startNewGame
  };
}
