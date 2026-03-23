import { User, BookOpen, Heart, Zap, Trophy, Sparkles, Map as MapIcon, Scroll } from 'lucide-react';
import { Player } from '../types';
import { StatBar } from './StatBar';
import { MiniStat } from './MiniStat';

interface PlayerCardProps {
  player: Player;
  totalStats: Player;
  onShowLevelUp: () => void;
  onShowSkillTree: () => void;
  onShowMap: () => void;
  onShowQuests: () => void;
}

export function PlayerCard({ 
  player, 
  totalStats, 
  onShowLevelUp, 
  onShowSkillTree, 
  onShowMap, 
  onShowQuests 
}: PlayerCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-white/10 overflow-hidden">
          <User className={player.gender === 'Boy' ? "text-blue-400" : "text-pink-400"} size={24} />
        </div>
        <div>
          <h3 className="font-bold text-white font-display">{player.name}</h3>
          <div className="flex items-center gap-2 text-magic-purple text-xs font-bold uppercase tracking-widest">
            <BookOpen size={12} /> Rank {player.level}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <StatBar 
          icon={<Heart size={14} className="text-red-400"/>} 
          label="Vitality" 
          current={player.hp} 
          max={player.maxHp} 
          color="bg-red-500" 
        />
        <StatBar 
          icon={<Zap size={14} className="text-blue-400"/>} 
          label="Mana" 
          current={player.mp} 
          max={player.maxMp} 
          color="bg-blue-500" 
        />
        <StatBar 
          icon={<Trophy size={14} className="text-amber-400"/>} 
          label="Arcane XP" 
          current={player.xp} 
          max={player.level * 100} 
          color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2">
        {player.attributePoints > 0 && (
          <button 
            onClick={onShowLevelUp}
            className="col-span-2 bg-amber-500/20 border border-amber-500/40 p-2 rounded-xl text-center hover:bg-amber-500/30 transition-all animate-pulse"
          >
            <div className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">Points Available</div>
            <div className="text-xs font-bold text-white font-display">DISTRIBUTE {player.attributePoints} AP</div>
          </button>
        )}
        <button 
          onClick={onShowSkillTree}
          className="col-span-1 bg-magic-purple/20 border border-magic-purple/40 p-2 rounded-xl text-center hover:bg-magic-purple/30 transition-all"
        >
          <div className="text-[8px] font-bold text-magic-purple uppercase tracking-widest">Arcane Mastery</div>
          <div className="text-xs font-bold text-white font-display flex items-center justify-center gap-2">
            <Sparkles size={12} /> SKILLS
          </div>
        </button>
        <button 
          onClick={onShowMap}
          className="col-span-1 bg-emerald-500/20 border border-emerald-500/40 p-2 rounded-xl text-center hover:bg-emerald-500/30 transition-all"
        >
          <div className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Navigation</div>
          <div className="text-xs font-bold text-white font-display flex items-center justify-center gap-2">
            <MapIcon size={12} /> VIEW MAP
          </div>
        </button>
        <div className="col-span-2 bg-magic-purple/10 border border-magic-purple/20 p-2 rounded-xl text-center">
          <div className="text-[8px] font-bold text-magic-purple uppercase tracking-widest">Active Trait</div>
          <div className="text-xs font-bold text-white font-display">{player.trait}</div>
        </div>
        {player.grace !== "None" && (
          <div className="col-span-1 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl text-center">
            <div className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Grace</div>
            <div className="text-[10px] font-bold text-white font-display">{player.grace}</div>
          </div>
        )}
        {player.curse !== "None" && (
          <div className="col-span-1 bg-red-500/10 border border-red-500/20 p-2 rounded-xl text-center">
            <div className="text-[8px] font-bold text-red-400 uppercase tracking-widest">Curse</div>
            <div className="text-[10px] font-bold text-white font-display">{player.curse}</div>
          </div>
        )}
        <div className="col-span-2 grid grid-cols-4 gap-2 pt-2">
          <MiniStat label="INT" value={totalStats.int} />
          <MiniStat label="VIT" value={totalStats.vit} />
          <MiniStat label="AGI" value={totalStats.agi} />
          <MiniStat label="LCK" value={totalStats.lck} />
        </div>
        <button 
          onClick={onShowQuests}
          className="col-span-2 bg-white/5 border border-white/10 p-2 rounded-xl text-center hover:bg-white/10 transition-all"
        >
          <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Active</div>
          <div className="text-xs font-bold text-white font-display flex items-center justify-center gap-2">
            <Scroll size={12} /> QUESTS
          </div>
        </button>
      </div>
    </div>
  );
}
