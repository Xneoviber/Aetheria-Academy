import { motion } from 'motion/react';
import { BookOpen } from 'lucide-react';
import { Location } from '../types';

interface LocationViewportProps {
  currentLocation: Location;
}

export function LocationViewport({ currentLocation }: LocationViewportProps) {
  return (
    <motion.div 
      key={currentLocation.name}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 aspect-video"
    >
      <img 
        src={currentLocation.image} 
        alt={currentLocation.name}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className="absolute bottom-6 left-8">
        <div className="flex items-center gap-2 text-magic-purple mb-1">
          <BookOpen size={14} />
          <span className="text-[10px] uppercase tracking-widest font-bold">Academy Grounds</span>
        </div>
        <h2 className="text-3xl font-bold text-white font-display">{currentLocation.name}</h2>
      </div>
    </motion.div>
  );
}
