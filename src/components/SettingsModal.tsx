import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Trash2, Volume2, Clock, Bell, Play } from 'lucide-react';
import { TimerSettings } from '../hooks/useTimer';
import { playSound, setSoundVolume } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TimerSettings;
  onUpdate: (settings: TimerSettings) => void;
  onResetAll?: () => void;
}

export function SettingsModal({ isOpen, onClose, settings, onUpdate, onResetAll }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (isOpen) setLocalSettings(settings);
  }, [isOpen, settings]);

  const handleSave = () => {
    setSoundVolume(localSettings.soundVolume ?? 70);
    onUpdate(localSettings);
    onClose();
  };

  const testSound = () => {
    playSound.start();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1F4E5A]/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-[#DCF6E6] w-full max-w-md max-h-[90vh] rounded-3xl border-[6px] border-[#1F4E5A] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
          >
            {/* Header - Fixed */}
            <div className="bg-gradient-to-r from-[#1F4E5A] to-[#2a6b7a] p-5 flex justify-between items-center border-b-4 border-[#4ECDC4]/40 flex-shrink-0 z-10">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#FF5E5E] animate-pulse" />
                  <div className="w-3 h-3 rounded-full bg-[#FFD93D]" />
                  <div className="w-3 h-3 rounded-full bg-[#4ECDC4]" />
                </div>
                <h2 className="font-pixel text-2xl text-[#DCF6E6] uppercase tracking-widest drop-shadow-lg">System Config</h2>
              </div>
              <button 
                onClick={onClose}
                className="text-[#DCF6E6]/70 hover:text-[#DCF6E6] hover:bg-[#4ECDC4]/20 p-2 rounded-lg transition-all active:scale-95 flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6 bg-[#DCF6E6]">
              {/* Timer Settings Section */}
              <div className="bg-white/50 rounded-2xl p-4 border-3 border-[#4ECDC4]/30 space-y-4">
                <h3 className="font-pixel text-sm text-[#1F4E5A] uppercase tracking-widest flex items-center gap-2">
                  <Clock size={16} className="text-[#4ECDC4]" />
                  Timer Settings
                </h3>
                
              {/* Focus Setting */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-[#1F4E5A] uppercase tracking-wider">
                  <div className="w-2 h-2 bg-[#FF5E5E] rounded-full" />
                  Focus Duration (min)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1} max={180}
                    value={localSettings.focus}
                    onChange={(e) => setLocalSettings({ ...localSettings, focus: Math.max(1, Math.min(180, parseInt(e.target.value) || 1)) })}
                    className="w-full px-4 py-3 rounded-xl bg-white border-[3px] border-[#4ECDC4]/40 text-[#1F4E5A] font-pixel text-2xl focus:outline-none focus:border-[#4ECDC4] focus:bg-[#E8F5E9] focus:ring-2 focus:ring-[#4ECDC4]/20 transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1F4E5A]/40 font-pixel text-xs">MIN</div>
                </div>
              </div>

              {/* Break Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#1F4E5A] uppercase tracking-wider">
                    <div className="w-2 h-2 bg-[#6BCB77] rounded-full" />
                    Short Break
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1} max={60}
                      value={localSettings.shortBreak}
                      onChange={(e) => setLocalSettings({ ...localSettings, shortBreak: Math.max(1, Math.min(60, parseInt(e.target.value) || 1)) })}
                      className="w-full px-4 py-3 rounded-xl bg-white border-[3px] border-[#4ECDC4]/40 text-[#1F4E5A] font-pixel text-2xl focus:outline-none focus:border-[#4ECDC4] focus:bg-[#E8F5E9] focus:ring-2 focus:ring-[#4ECDC4]/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#1F4E5A] uppercase tracking-wider">
                    <div className="w-2 h-2 bg-[#FFD93D] rounded-full" />
                    Long Break
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1} max={120}
                      value={localSettings.longBreak}
                      onChange={(e) => setLocalSettings({ ...localSettings, longBreak: Math.max(1, Math.min(120, parseInt(e.target.value) || 1)) })}
                      className="w-full px-4 py-3 rounded-xl bg-white border-[3px] border-[#4ECDC4]/40 text-[#1F4E5A] font-pixel text-2xl focus:outline-none focus:border-[#4ECDC4] focus:bg-[#E8F5E9] focus:ring-2 focus:ring-[#4ECDC4]/20 transition-all"
                    />
                  </div>
                </div>
              </div>
              </div>

              {/* Sound Settings Section */}
              <div className="bg-white/50 rounded-2xl p-4 border-3 border-[#4ECDC4]/30 space-y-4">
                <h3 className="font-pixel text-sm text-[#1F4E5A] uppercase tracking-widest flex items-center gap-2">
                  <Volume2 size={16} className="text-[#4ECDC4]" />
                  Sound Settings
                </h3>

                <div className="space-y-3">
                <button
                  onClick={testSound}
                  className="w-full rounded-xl border-[3px] px-4 py-3 flex items-center justify-center gap-2 bg-[#6BCB77] border-[#4A9D5A] text-white hover:bg-[#5AB669] active:border-b-0 active:translate-y-1 transition-all font-bold uppercase text-xs tracking-widest shadow-md group border-b-4"
                >
                  <Play size={16} className="group-active:scale-95" />
                  Test Sound
                </button>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1F4E5A] uppercase tracking-wider">Sound Volume</label>
                    <span className="font-pixel text-sm text-[#4ECDC4] bg-[#4ECDC4]/10 px-3 py-1 rounded-lg">{localSettings.soundVolume ?? 70}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={10}
                    value={localSettings.soundVolume ?? 70}
                    onChange={(e) => {
                      const vol = parseInt(e.target.value);
                      setLocalSettings({ ...localSettings, soundVolume: vol });
                      setSoundVolume(vol);
                    }}
                    className="w-full h-4 bg-[#1F4E5A]/10 rounded-full appearance-none cursor-pointer accent-[#4ECDC4] slider"
                  />
                </div>

                <button
                  onClick={() => setLocalSettings({ ...localSettings, soundEnabled: !(localSettings.soundEnabled ?? true) })}
                  className="w-full rounded-xl border-[3px] px-4 py-3 flex items-center justify-between bg-white border-[#4ECDC4]/50 text-[#1F4E5A] hover:bg-[#4ECDC4]/10 hover:border-[#4ECDC4] active:scale-95 transition-all font-bold uppercase text-xs tracking-wider group"
                >
                  <span className="flex items-center gap-2">
                    <Volume2 size={14} className="text-[#4ECDC4] group-hover:scale-110 transition-transform" />
                    Sound Effects
                  </span>
                  <span className={`font-pixel text-xs px-3 py-1 rounded-lg ${(localSettings.soundEnabled ?? true) ? 'bg-[#6BCB77]/20 text-[#4A9D5A]' : 'bg-[#FF5E5E]/20 text-[#CC3D3D]'}`}>
                    {(localSettings.soundEnabled ?? true) ? 'ON' : 'OFF'}
                  </span>
                </button>
                </div>
              </div>

              {/* Features Section */}
              <div className="bg-white/50 rounded-2xl p-4 border-3 border-[#4ECDC4]/30 space-y-3">
                <h3 className="font-pixel text-sm text-[#1F4E5A] uppercase tracking-widest flex items-center gap-2">
                  <Play size={16} className="text-[#4ECDC4]" />
                  Features
                </h3>

                <button
                  onClick={() => setLocalSettings({ ...localSettings, autoStart: !(localSettings.autoStart ?? false) })}
                  className="w-full rounded-xl border-[3px] px-4 py-3 flex items-center justify-between bg-white border-[#FFD93D]/50 text-[#1F4E5A] hover:bg-[#FFD93D]/10 hover:border-[#FFD93D] active:scale-95 transition-all font-bold uppercase text-xs tracking-wider group"
                >
                  <span className="flex items-center gap-2">
                    <Clock size={14} className="text-[#FFD93D] group-hover:scale-110 transition-transform" />
                    Auto-Start Timer
                  </span>
                  <span className={`font-pixel text-xs px-3 py-1 rounded-lg ${(localSettings.autoStart ?? false) ? 'bg-[#6BCB77]/20 text-[#4A9D5A]' : 'bg-[#FF5E5E]/20 text-[#CC3D3D]'}`}>
                    {(localSettings.autoStart ?? false) ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  onClick={() => setLocalSettings({ ...localSettings, notificationsEnabled: !(localSettings.notificationsEnabled ?? true) })}
                  className="w-full rounded-xl border-[3px] px-4 py-3 flex items-center justify-between bg-white border-[#FF5E5E]/50 text-[#1F4E5A] hover:bg-[#FF5E5E]/10 hover:border-[#FF5E5E] active:scale-95 transition-all font-bold uppercase text-xs tracking-wider group"
                >
                  <span className="flex items-center gap-2">
                    <Bell size={14} className="text-[#FF5E5E] group-hover:scale-110 transition-transform" />
                    Notifications
                  </span>
                  <span className={`font-pixel text-xs px-3 py-1 rounded-lg ${(localSettings.notificationsEnabled ?? true) ? 'bg-[#6BCB77]/20 text-[#4A9D5A]' : 'bg-[#FF5E5E]/20 text-[#CC3D3D]'}`}>
                    {(localSettings.notificationsEnabled ?? true) ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  onClick={() => setLocalSettings({ ...localSettings, challengeEnabled: !(localSettings.challengeEnabled ?? true) })}
                  className="w-full rounded-xl border-[3px] px-4 py-3 flex items-center justify-between bg-white border-[#4ECDC4]/50 text-[#1F4E5A] hover:bg-[#4ECDC4]/10 hover:border-[#4ECDC4] active:scale-95 transition-all font-bold uppercase text-xs tracking-wider group"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm group-hover:scale-110 transition-transform">⚡</span>
                    Challenge System
                  </span>
                  <span className={`font-pixel text-xs px-3 py-1 rounded-lg ${(localSettings.challengeEnabled ?? true) ? 'bg-[#6BCB77]/20 text-[#4A9D5A]' : 'bg-[#FF5E5E]/20 text-[#CC3D3D]'}`}>
                    {(localSettings.challengeEnabled ?? true) ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-3">
                <button
                  onClick={handleSave}
                  className="w-full py-4 bg-gradient-to-r from-[#1F4E5A] to-[#2a6b7a] rounded-xl border-b-4 border-[#14363F] text-[#DCF6E6] font-bold uppercase tracking-widest hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-3 shadow-lg group text-sm border-[3px] border-t-[#4ECDC4]/30"
                >
                  <Save size={18} className="group-hover:scale-110 group-active:scale-95 transition-transform" />
                  Save Changes
                </button>

                {onResetAll && (
                  confirmReset ? (
                    <div className="space-y-2">
                      <p className="text-center text-xs font-bold text-[#FF5E5E] uppercase tracking-wide drop-shadow-sm">
                        ⚠️ This will erase ALL tasks, sessions & settings!
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setConfirmReset(false)}
                          className="py-3 bg-[#1F4E5A]/20 rounded-xl border-[3px] border-[#1F4E5A]/40 text-[#1F4E5A] font-bold uppercase tracking-widest hover:bg-[#1F4E5A]/30 active:scale-95 transition-all text-xs group"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={onResetAll}
                          className="py-3 bg-[#FF5E5E] rounded-xl border-b-4 border-[#CC3D3D] text-white font-bold uppercase tracking-widest hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 text-xs border-[3px] border-t-[#FFB3B3]/30 group shadow-md"
                        >
                          <Trash2 size={14} className="group-hover:scale-110 group-active:scale-95 transition-transform" />
                          Confirm
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmReset(true)}
                      className="w-full py-3 bg-white rounded-xl border-[3px] border-[#FF5E5E]/50 text-[#FF5E5E] font-bold uppercase tracking-widest hover:bg-[#FF5E5E]/10 hover:border-[#FF5E5E] active:scale-95 transition-all flex items-center justify-center gap-2 text-xs group shadow-sm"
                    >
                      <Trash2 size={14} className="group-hover:scale-110 group-active:scale-95 transition-transform" />
                      Reset All Data
                    </button>
                  )
                )}
              </div>
            </div>
            
            {/* Footer Deco - Fixed at Bottom */}
            <div className="bg-gradient-to-r from-[#4ECDC4]/10 via-[#6BCB77]/10 to-[#FFD93D]/10 p-3 text-center border-t-2 border-[#4ECDC4]/20 flex-shrink-0">
              <div className="text-[10px] font-pixel text-[#1F4E5A]/60 uppercase tracking-wider">✧ BMO System v2.0 ✧</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
