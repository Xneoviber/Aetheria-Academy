import { useEffect, Dispatch, SetStateAction } from 'react';
import { GameState, Enemy } from '../types';
import { ENEMIES_BY_LOCATION, SKILL_TREE, INITIAL_PLAYER } from '../constants';

export function useCombat(
  gameState: GameState,
  setGameState: Dispatch<SetStateAction<GameState>>,
  getTotalStats: () => any,
  addLog: (message: string) => void,
  playSound: () => void,
  checkQuests: (target: string, type: 'location' | 'combat') => void
) {
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

  return {
    addCombatLog,
    startCombat,
    attack,
    castSkill,
    handleVictory,
    handleDefeat
  };
}
