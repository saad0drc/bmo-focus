import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, Save, Pin, Repeat2 } from 'lucide-react';
import { Task, TaskSettings } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, settings: TaskSettings, dueDate?: string, pinned?: boolean, repeatDaily?: boolean) => void;
  initialTask?: Task;
}

const DEFAULT_SETTINGS: TaskSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsPerRound: 4,
};

export function TaskModal({ isOpen, onClose, onSave, initialTask }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [settings, setSettings] = useState<TaskSettings>(DEFAULT_SETTINGS);
  const [dueDate, setDueDate] = useState('');
  const [pinned, setPinned] = useState(false);
  const [repeatDaily, setRepeatDaily] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title);
        setSettings(initialTask.settings || DEFAULT_SETTINGS);
        setDueDate(initialTask.dueDate || '');
        setPinned(initialTask.pinned ?? false);
        setRepeatDaily(initialTask.repeatDaily ?? false);
      } else {
        setTitle('');
        setSettings(DEFAULT_SETTINGS);
        setDueDate(new Date().toISOString().split('T')[0]);
        setPinned(false);
        setRepeatDaily(false);
      }
    }
  }, [isOpen, initialTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(title, settings, dueDate, pinned, repeatDaily);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border-4 border-[#1F4E5A]"
          >
            <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-[#F0F4F8] border-b-2 border-[#1F4E5A]/10">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#FF5E5E] flex items-center justify-center text-white shadow-[4px_4px_0px_rgba(31,78,90,0.2)] border-2 border-[#1F4E5A]/10">
                    <Clock size={20} strokeWidth={2.5} />
                  </div>
                  <h2 className="font-pixel text-lg text-[#1F4E5A] uppercase tracking-wide">
                    {initialTask ? 'Edit Mission' : 'New Mission'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-[#1F4E5A]/50 hover:text-[#1F4E5A] rounded-full hover:bg-[#1F4E5A]/5 transition-colors"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar bg-white">
                {/* Task Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#1F4E5A]/50">Mission Objective</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter task name..."
                    className="w-full text-lg font-bold text-[#1F4E5A] placeholder-[#1F4E5A]/30 focus:outline-none border-b-2 border-[#1F4E5A]/10 focus:border-[#63C5DA] py-2 transition-colors bg-transparent"
                    autoFocus
                  />
                </div>

                {/* Date Row */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#1F4E5A]">Target Date</span>
                  <div className="relative">
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="bg-[#F0F4F8] text-sm font-medium text-[#1F4E5A] py-2 px-4 rounded-lg border-2 border-transparent focus:border-[#63C5DA] outline-none"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="h-0.5 bg-[#1F4E5A]/5 rounded-full" />

                {/* Pin + Repeat Daily toggles */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPinned(v => !v)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                      pinned
                        ? 'bg-[#FFD93D]/15 border-[#FFD93D] text-[#B89400]'
                        : 'bg-[#F0F4F8] border-transparent text-[#1F4E5A]/50 hover:border-[#1F4E5A]/20'
                    }`}
                  >
                    <Pin size={15} strokeWidth={2.5} />
                    Pinned
                  </button>
                  <button
                    type="button"
                    onClick={() => setRepeatDaily(v => !v)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                      repeatDaily
                        ? 'bg-[#4ECDC4]/15 border-[#4ECDC4] text-[#1F4E5A]'
                        : 'bg-[#F0F4F8] border-transparent text-[#1F4E5A]/50 hover:border-[#1F4E5A]/20'
                    }`}
                  >
                    <Repeat2 size={15} strokeWidth={2.5} />
                    Daily
                  </button>
                </div>

                {/* Divider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#1F4E5A]">Focus Duration</span>
                    <div className="flex items-center gap-2 bg-[#F0F4F8] rounded-lg p-1 border-2 border-transparent focus-within:border-[#63C5DA]">
                      <input
                        type="number"
                        value={settings.focusDuration}
                        onChange={(e) => setSettings({ ...settings, focusDuration: Number(e.target.value) })}
                        className="w-16 text-center bg-transparent text-sm font-bold text-[#1F4E5A] focus:outline-none"
                      />
                      <span className="text-xs font-bold text-[#1F4E5A]/40 pr-2 uppercase">min</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#1F4E5A]">Short Break</span>
                    <div className="flex items-center gap-2 bg-[#F0F4F8] rounded-lg p-1 border-2 border-transparent focus-within:border-[#63C5DA]">
                      <input
                        type="number"
                        value={settings.shortBreakDuration}
                        onChange={(e) => setSettings({ ...settings, shortBreakDuration: Number(e.target.value) })}
                        className="w-16 text-center bg-transparent text-sm font-bold text-[#1F4E5A] focus:outline-none"
                      />
                      <span className="text-xs font-bold text-[#1F4E5A]/40 pr-2 uppercase">min</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#1F4E5A]">Long Break</span>
                    <div className="flex items-center gap-2 bg-[#F0F4F8] rounded-lg p-1 border-2 border-transparent focus-within:border-[#63C5DA]">
                      <input
                        type="number"
                        value={settings.longBreakDuration}
                        onChange={(e) => setSettings({ ...settings, longBreakDuration: Number(e.target.value) })}
                        className="w-16 text-center bg-transparent text-sm font-bold text-[#1F4E5A] focus:outline-none"
                      />
                      <span className="text-xs font-bold text-[#1F4E5A]/40 pr-2 uppercase">min</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#1F4E5A]">Sessions / Round</span>
                    <div className="flex items-center gap-2 bg-[#F0F4F8] rounded-lg p-1 border-2 border-transparent focus-within:border-[#63C5DA]">
                      <input
                        type="number"
                        value={settings.sessionsPerRound}
                        onChange={(e) => setSettings({ ...settings, sessionsPerRound: Number(e.target.value) })}
                        className="w-16 text-center bg-transparent text-sm font-bold text-[#1F4E5A] focus:outline-none"
                      />
                      <span className="text-xs font-bold text-[#1F4E5A]/40 pr-2 uppercase">x</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t-2 border-[#1F4E5A]/10 bg-[#F0F4F8] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-bold text-[#1F4E5A]/60 hover:text-[#1F4E5A] transition-colors uppercase tracking-wide"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1F4E5A] text-[#DCF6E6] text-sm font-bold rounded-xl shadow-[4px_4px_0px_rgba(31,78,90,0.2)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_rgba(31,78,90,0.2)] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 uppercase tracking-wide"
                >
                  <Save size={16} strokeWidth={2.5} />
                  Save Mission
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
