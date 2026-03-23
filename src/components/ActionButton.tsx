import React from 'react';

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onClick, disabled, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-magic-purple hover:bg-indigo-500 border-magic-purple/50 text-white shadow-magic-purple/20',
    secondary: 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300',
    danger: 'bg-red-600 hover:bg-red-500 border-red-400/50 text-white shadow-red-600/20'
  };

  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={`relative group overflow-hidden py-5 rounded-3xl font-black font-display transition-all flex flex-col items-center justify-center gap-1 border shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale ${variants[variant]}`}
    >
      <div className="text-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-[10px] uppercase tracking-[0.2em]">{label}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </button>
  );
}
