/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  RotateCcw, 
  ChevronRight,
  Sparkles,
  Flame,
  Wind,
  User,
  Volume2,
  VolumeX,
  Music,
  Info
} from 'lucide-react';
import { GameState } from '../types';
import { CharacterCreation } from './CharacterCreation';

interface MainMenuProps {
  menuView: 'main' | 'save' | 'load' | 'settings' | 'credits';
  setMenuView: (view: 'main' | 'save' | 'load' | 'settings' | 'credits') => void;
  selectingGender: boolean;
  setSelectingGender: (selecting: boolean) => void;
  distributingStats: boolean;
  setDistributingStats: (distributing: boolean) => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  availablePoints: number;
  setAvailablePoints: React.Dispatch<React.SetStateAction<number>>;
  hasSaveData: (slot: number) => boolean;
  getSaveSummary: (slot: number) => string;
  startNewGame: (slot: number) => void;
  loadGame: (slot: number) => void;
  showOverwriteWarning: number | null;
  setShowOverwriteWarning: (slot: number | null) => void;
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
  playSound: () => void;
  finalizeCharacter: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  clickSoundRef: React.RefObject<HTMLAudioElement | null>;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  menuView,
  setMenuView,
  selectingGender,
  setSelectingGender,
  distributingStats,
  setDistributingStats,
  gameState,
  setGameState,
  availablePoints,
  setAvailablePoints,
  hasSaveData,
  getSaveSummary,
  startNewGame,
  loadGame,
  showOverwriteWarning,
  setShowOverwriteWarning,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  playSound,
  finalizeCharacter,
  audioRef,
  clickSoundRef
}) => {
  return (
    <div className="min-h-screen bg-twilight-deep flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <audio 
        ref={audioRef} 
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
        loop 
        autoPlay 
      />
      <audio 
        ref={clickSoundRef} 
        src="https://www.soundjay.com/buttons/sounds/button-16.mp3" 
      />
      {/* Magical Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-magic-purple/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[150px] rounded-full animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full text-center space-y-12 relative z-10"
      >
        {!selectingGender && !distributingStats ? (
          <div className="space-y-12">
            {menuView === 'main' && (
              <>
                <div className="space-y-4">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-magic-purple/10 border border-magic-purple/20 text-magic-purple text-[10px] font-bold uppercase tracking-[0.3em]"
                  >
                    <Sparkles size={12} /> The Gates of Knowledge Open
                  </motion.div>
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-6xl md:text-7xl font-black text-white tracking-tighter italic font-display glow-purple"
                  >
                    AETHERIA<span className="text-magic-purple"> ACADEMY</span>
                  </motion.h1>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed"
                  >
                    Master the mystic arts and uncover the secrets of the arcane in the world's most prestigious magic school.
                  </motion.p>
                </div>

                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col items-center justify-center gap-4 max-w-xs mx-auto w-full"
                >
                  <button 
                    onClick={() => {
                      playSound();
                      setMenuView('save');
                    }}
                    className="w-full group relative px-8 py-4 bg-magic-purple hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-magic-purple/20 flex items-center justify-center gap-3 overflow-hidden font-display"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    BEGIN THE STORY
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => {
                      playSound();
                      setMenuView('load');
                    }}
                    className="w-full px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-3 font-display"
                  >
                    <RotateCcw size={20} />
                    CONTINUE
                  </button>
                  <button 
                    onClick={() => {
                      playSound();
                      setMenuView('settings');
                    }}
                    className="w-full px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-3 font-display"
                  >
                    <Shield size={20} />
                    SETTINGS
                  </button>
                  <button 
                    onClick={() => {
                      playSound();
                      setMenuView('credits');
                    }}
                    className="w-full px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-3 font-display"
                  >
                    <Info size={20} />
                    CREDITS
                  </button>
                </motion.div>
              </>
            )}

            {menuView === 'save' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <h2 className="text-4xl font-bold text-white font-display italic glow-purple">Choose Save Slot</h2>
                <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                  {[1, 2, 3].map(slot => (
                    <button 
                      key={slot}
                      onClick={() => {
                        if (hasSaveData(slot)) {
                          setShowOverwriteWarning(slot);
                        } else {
                          startNewGame(slot);
                        }
                      }}
                      className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-magic-purple/20 hover:border-magic-purple/50 transition-all text-left group"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-magic-purple text-[10px] font-bold uppercase tracking-widest mb-1">Slot {slot}</div>
                          <div className="text-white font-bold font-display">{getSaveSummary(slot)}</div>
                        </div>
                        <ChevronRight className="text-slate-600 group-hover:text-magic-purple transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => { playSound(); setMenuView('main'); }}
                  className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Back to Menu
                </button>
              </motion.div>
            )}

            {menuView === 'load' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <h2 className="text-4xl font-bold text-white font-display italic glow-purple">Load Slot</h2>
                <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                  {[1, 2, 3].map(slot => (
                    <button 
                      key={slot}
                      disabled={!hasSaveData(slot)}
                      onClick={() => loadGame(slot)}
                      className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-magic-purple/20 hover:border-magic-purple/50 transition-all text-left group disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:border-white/10"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-magic-purple text-[10px] font-bold uppercase tracking-widest mb-1">Slot {slot}</div>
                          <div className="text-white font-bold font-display">{getSaveSummary(slot)}</div>
                        </div>
                        {hasSaveData(slot) && <RotateCcw className="text-slate-600 group-hover:text-magic-purple transition-colors" />}
                      </div>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => { playSound(); setMenuView('main'); }}
                  className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Back to Menu
                </button>
              </motion.div>
            )}

            {menuView === 'settings' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 w-full max-w-md mx-auto"
              >
                <h2 className="text-4xl font-bold text-white font-display italic glow-purple">Settings</h2>
                <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Music size={18} />
                        <span className="font-bold uppercase tracking-widest text-xs">Soundtrack</span>
                      </div>
                      <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                      >
                        {isMuted ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} className="text-magic-purple" />}
                      </button>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01" 
                      value={volume} 
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-magic-purple"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Academy Notice</p>
                    <p className="text-xs text-slate-400 leading-relaxed italic">"The volume of your magic should match the volume of your spirit." — Headmaster Aetherius</p>
                  </div>
                </div>
                <button 
                  onClick={() => { playSound(); setMenuView('main'); }}
                  className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Back to Menu
                </button>
              </motion.div>
            )}

            {menuView === 'credits' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 w-full max-w-md mx-auto"
              >
                <h2 className="text-4xl font-bold text-white font-display italic glow-purple">Credits</h2>
                <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6 text-left">
                  <div className="space-y-1">
                    <p className="text-[10px] text-magic-purple uppercase tracking-widest font-bold">Concept & Design</p>
                    <p className="text-white font-display">Aetheria Development Team</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-magic-purple uppercase tracking-widest font-bold">Arcane Engine</p>
                    <p className="text-white font-display">React & Tailwind Sorcery</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-magic-purple uppercase tracking-widest font-bold">Visual Assets</p>
                    <p className="text-white font-display text-sm">Unsplash, Lucide Icons</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-magic-purple uppercase tracking-widest font-bold">Soundtrack</p>
                    <p className="text-white font-display text-sm">"Mystic Journey" - Royalty Free Music</p>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-slate-400 leading-relaxed">Thank you for attending Aetheria Academy. May your mana never run dry.</p>
                  </div>
                </div>
                <button 
                  onClick={() => { playSound(); setMenuView('main'); }}
                  className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Back to Menu
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          <CharacterCreation 
            gameState={gameState}
            setGameState={setGameState}
            availablePoints={availablePoints}
            setAvailablePoints={setAvailablePoints}
            onComplete={finalizeCharacter}
            playSound={playSound}
          />
        )}

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-12 flex items-center justify-center gap-8 text-slate-600"
        >
          <div className="flex flex-col items-center gap-1">
            <Flame size={24} />
            <span className="text-[8px] font-bold uppercase tracking-widest">Pyromancy</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Sparkles size={24} />
            <span className="text-[8px] font-bold uppercase tracking-widest">Alchemy</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Wind size={24} />
            <span className="text-[8px] font-bold uppercase tracking-widest">Telekinesis</span>
          </div>
        </motion.div>

        {/* Overwrite Warning Modal */}
        <AnimatePresence>
          {showOverwriteWarning !== null && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowOverwriteWarning(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-magic-dark border border-red-500/30 rounded-3xl p-8 shadow-2xl space-y-6 text-center"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                  <RotateCcw className="text-red-500" size={32} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white font-display italic">Overwrite Slot {showOverwriteWarning}?</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    This will permanently erase your current progress in this slot. This magical action cannot be undone.
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <button 
                    onClick={() => startNewGame(showOverwriteWarning)}
                    className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all font-display shadow-lg shadow-red-500/20"
                  >
                    YES, OVERWRITE
                  </button>
                  <button 
                    onClick={() => setShowOverwriteWarning(null)}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 font-bold rounded-2xl transition-all font-display border border-white/5"
                  >
                    CANCEL
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
