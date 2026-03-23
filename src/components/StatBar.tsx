import React from 'react';
import { motion } from 'motion/react';

interface StatBarProps {
  icon: React.ReactNode;
  label: string;
  current: number;
  max: number;
  color: string;
}

export function StatBar({ icon, label, current, max, color }: StatBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-[10px] font-mono font-bold text-white">{current} / {max}</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${(current / max) * 100}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
      </div>
    </div>
  );
}
