import { motion } from 'motion/react';
import { Eye, Sparkles, RotateCcw, Compass } from 'lucide-react';
import { Location } from '../types';
import { ActionButton } from './ActionButton';

interface ExplorationViewProps {
  currentLocation: Location;
  onObserve: () => void;
  onPractice: () => void;
  onRest?: () => void;
  onMove: (direction: string) => void;
}

export function ExplorationView({ currentLocation, onObserve, onPractice, onRest, onMove }: ExplorationViewProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6"
    >
      <p className="text-lg leading-relaxed text-slate-300 italic">
        "{currentLocation.description}"
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <ActionButton 
          icon={<Eye size={18}/>} 
          label="Observe" 
          onClick={onObserve} 
        />
        <ActionButton 
          icon={<Sparkles size={18}/>} 
          label="Practice" 
          onClick={onPractice}
          variant="danger"
        />
        {onRest && (
          <ActionButton 
            icon={<RotateCcw size={18}/>} 
            label="Rest" 
            onClick={onRest}
          />
        )}
        {Object.entries(currentLocation.exits).map(([dir, loc]) => (
          <ActionButton 
            key={dir}
            icon={<Compass size={18}/>} 
            label={`Walk ${dir}`} 
            onClick={() => onMove(dir)}
          />
        ))}
      </div>
    </motion.div>
  );
}
