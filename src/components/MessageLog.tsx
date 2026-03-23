import { motion } from 'motion/react';
import { RefObject } from 'react';

interface MessageLogProps {
  history: string[];
  logEndRef: RefObject<HTMLDivElement | null>;
}

export function MessageLog({ history, logEndRef }: MessageLogProps) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-3xl overflow-hidden">
      <div className="px-6 py-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-magic-purple animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Academy Log</span>
      </div>
      <div className="h-48 overflow-y-auto p-6 space-y-3 custom-scrollbar">
        {history.map((log, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3 text-sm text-slate-400"
          >
            <span className="text-magic-purple font-mono opacity-50">[{i + 1}]</span>
            <p>{log}</p>
          </motion.div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
