interface MiniStatProps {
  label: string;
  value: number;
}

export function MiniStat({ label, value }: MiniStatProps) {
  return (
    <div className="bg-black/40 border border-white/5 p-2 rounded-xl text-center">
      <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
      <div className="text-xs font-bold text-white font-mono">{value}</div>
    </div>
  );
}
