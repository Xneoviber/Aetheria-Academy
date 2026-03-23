import { motion } from 'motion/react';

interface CombatLogProps {
  logs: string[];
}

export function CombatLog({ logs }: CombatLogProps) {
  return (
    <div className="h-32 overflow-y-auto bg-black/40 rounded-xl p-3 border border-white/5 custom-scrollbar">
      <div className="space-y-2">
        {logs.map((log, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className={`text-[10px] leading-relaxed ${i === logs.length - 1 ? 'text-white font-bold' : 'text-slate-500'}`}
          >
            {log}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
