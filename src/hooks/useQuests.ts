import { Dispatch, SetStateAction } from 'react';
import { GameState } from '../types';

export function useQuests(
  setGameState: Dispatch<SetStateAction<GameState>>,
  addLog: (message: string) => void
) {
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

  return { checkQuests };
}
