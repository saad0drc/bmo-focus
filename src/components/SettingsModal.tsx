import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Trash2 } from 'lucide-react';
import { TimerSettings } from '../hooks/useTimer';

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

  const handleSave = () => {
    onUpdate(localSettings);
    onClose();
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
            className="relative bg-[#DCF6E6] w-full max-w-md rounded-3xl border-[6px] border-[#1F4E5A] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#1F4E5A] p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5E5E]" />
                <div className="w-3 h-3 rounded-full bg-[#FFD93D]" />
                <h2 className="font-pixel text-xl text-[#DCF6E6] uppercase tracking-widest">System Config</h2>
              </div>
              <button 
                onClick={onClose}
                className="text-[#DCF6E6]/60 hover:text-[#DCF6E6] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Focus Setting */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-[#1F4E5A] uppercase tracking-wide">
                  <div className="w-2 h-2 bg-[#1F4E5A] rounded-full" />
                  Focus Duration (min)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={localSettings.focus}
                    onChange={(e) => setLocalSettings({ ...localSettings, focus: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 rounded-xl bg-[#63C5DA]/10 border-[3px] border-[#1F4E5A]/10 text-[#1F4E5A] font-pixel text-2xl focus:outline-none focus:border-[#1F4E5A] focus:bg-white transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1F4E5A]/30 font-pixel text-sm">MIN</div>
                </div>
              </div>

              {/* Break Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-[#1F4E5A] uppercase tracking-wide">
                    <div className="w-2 h-2 bg-[#6BCB77] rounded-full" />
                    Short Break
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={localSettings.shortBreak}
                      onChange={(e) => setLocalSettings({ ...localSettings, shortBreak: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 rounded-xl bg-[#63C5DA]/10 border-[3px] border-[#1F4E5A]/10 text-[#1F4E5A] font-pixel text-2xl focus:outline-none focus:border-[#1F4E5A] focus:bg-white transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-[#1F4E5A] uppercase tracking-wide">
                    <div className="w-2 h-2 bg-[#4D96FF] rounded-full" />
                    Long Break
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={localSettings.longBreak}
                      onChange={(e) => setLocalSettings({ ...localSettings, longBreak: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 rounded-xl bg-[#63C5DA]/10 border-[3px] border-[#1F4E5A]/10 text-[#1F4E5A] font-pixel text-2xl focus:outline-none focus:border-[#1F4E5A] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  onClick={handleSave}
                  className="w-full py-4 bg-[#1F4E5A] rounded-xl border-b-4 border-[#14363F] text-[#DCF6E6] font-bold uppercase tracking-widest hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-3 shadow-lg group"
                >
                  <Save size={20} className="group-hover:scale-110 transition-transform" />
                  Save Changes
                </button>

                {onResetAll && (
                  confirmReset ? (
                    <div className="space-y-2">
                      <p className="text-center text-xs font-bold text-[#FF5E5E] uppercase tracking-wide">
                        ⚠️ This will erase ALL tasks, sessions & settings!
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setConfirmReset(false)}
                          className="py-3 bg-[#1F4E5A]/20 rounded-xl border-b-4 border-[#1F4E5A]/30 text-[#1F4E5A] font-bold uppercase tracking-widest hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={onResetAll}
                          className="py-3 bg-[#FF5E5E] rounded-xl border-b-4 border-[#CC3D3D] text-white font-bold uppercase tracking-widest hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 text-sm group"
                        >
                          <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                          Confirm
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmReset(true)}
                      className="w-full py-3 bg-transparent rounded-xl border-2 border-[#FF5E5E]/50 text-[#FF5E5E] font-bold uppercase tracking-widest hover:bg-[#FF5E5E]/10 transition-all flex items-center justify-center gap-3 text-sm group"
                    >
                      <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                      Reset All Data
                    </button>
                  )
                )}
              </div>
            </div>
            
            {/* Footer Deco */}
            <div className="bg-[#1F4E5A]/5 p-2 text-center">
              <div className="text-[10px] font-pixel text-[#1F4E5A]/40">BMO SYSTEM v2.0</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
