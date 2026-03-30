import { useState, Dispatch, SetStateAction } from 'react';
import { GameState } from '../types';

export function useLevelUp(
  gameState: GameState,
  setGameState: Dispatch<SetStateAction<GameState>>,
  setGameStarted: (started: boolean) => void,
  setDistributingStats: (distributing: boolean) => void,
  setSelectingGender: (selecting: boolean) => void,
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

    // Synergy Logic
    let synergyBonus = { str: 0, agi: 0, int: 0, vit: 0, lck: 0 };
    if (p.grace === "Arcane Affinity" && p.curse === "Mana Leak") {
      synergyBonus.int = 5;
      addLog("🔮 Synergy Active: Mana Surge! (+5 Intelligence)");
    } else if (p.grace === "Iron Skin" && p.curse === "Brittle Bones") {
      synergyBonus.vit = 5;
      addLog("🛡️ Synergy Active: Hardened Shell! (+5 Vitality)");
    } else if (p.grace === "Fleet Foot" && p.curse === "Heavy Burden") {
      synergyBonus.agi = 5;
      addLog("🏃 Synergy Active: Steady Momentum! (+5 Agility)");
    } else if (p.grace === "Giant's Might" && p.curse === "Feeble Mind") {
      synergyBonus.str = 5;
      addLog("💪 Synergy Active: Primal Force! (+5 Strength)");
    } else if (p.grace === "Fortune's Favor" && p.curse === "Unlucky Soul") {
      synergyBonus.lck = 5;
      addLog("🎲 Synergy Active: Gambler's Paradox! (+5 Luck)");
    }

    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        trait,
        str: prev.player.str + synergyBonus.str,
        agi: prev.player.agi + synergyBonus.agi,
        int: prev.player.int + synergyBonus.int,
        vit: prev.player.vit + synergyBonus.vit,
        lck: prev.player.lck + synergyBonus.lck,
        maxHp: (prev.player.vit + synergyBonus.vit) * 10 + 50 + bonusHp,
        hp: (prev.player.vit + synergyBonus.vit) * 10 + 50 + bonusHp,
        maxMp: (prev.player.int + synergyBonus.int) * 10 + 50 + bonusMp,
        mp: (prev.player.int + synergyBonus.int) * 10 + 50 + bonusMp,
        inventory: [...prev.player.inventory, startingItem].filter(Boolean)
      }
    }));
    setDistributingStats(false);
    setSelectingGender(false);
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
