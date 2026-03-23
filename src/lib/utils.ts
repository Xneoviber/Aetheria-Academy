import { Player, Equipment } from '../types';
import { GAME_ITEMS } from '../constants';

export function getTotalStats(player: Player): Player {
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

  // Apply skill bonuses
  if (player.unlockedSkills.includes("haste")) {
    stats.agi = Math.floor(stats.agi * 1.2);
  }

  return {
    ...player,
    ...stats
  };
}

export function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
