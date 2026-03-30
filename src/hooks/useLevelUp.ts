import { useState, Dispatch, SetStateAction } from 'react';
import { GameState } from '../types';

export function useLevelUp(
  gameState: GameState,
  setGameState: Dispatch<SetStateAction<GameState>>,
  setGameStarted: (started: boolean) => void,
  setDistributingStats: (distributing: boolean) => void,
  addLog: (message: string) => void
) {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [availablePoints, setAvailablePoints] = useState(20);

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

  return {
    showLevelUp,
    setShowLevelUp,
    availablePoints,
    setAvailablePoints,
    finalizeCharacter
  };
}
