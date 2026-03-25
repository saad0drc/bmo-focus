import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DailyStat } from '../hooks/useSessions';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyStats: DailyStat[];
}

export function HistoryModal({ isOpen, onClose, dailyStats }: HistoryModalProps) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-2xl mx-auto max-h-[80vh] bg-gradient-to-b from-[#4ECDC4] to-[#45B8B0] rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1F4E5A] to-[#2a6f7e] px-6 py-4 border-b-2 border-[#4ECDC4]">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  📅 Daily History
                </h2>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-teal-100 mt-1">
                {dailyStats.length} day{dailyStats.length !== 1 ? 's' : ''} with data
              </p>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4">
              {dailyStats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-5xl mb-3">🌱</div>
                  <p className="text-[#1F4E5A] font-semibold">No sessions yet</p>
                  <p className="text-sm text-[#2a6f7e]">
                    Complete your first Pomodoro to start building history!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dailyStats.map((day, idx) => (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <button
                        onClick={() =>
                          setExpandedDate(expandedDate === day.date ? null : day.date)
                        }
                        className="w-full text-left"
                      >
                        {/* Day Card */}
                        <motion.div
                          layout
                          className={`p-4 rounded-xl transition-all border-2 ${
                            expandedDate === day.date
                              ? 'bg-white border-[#FFD93D] shadow-lg'
                              : 'bg-white/80 border-white/50 hover:bg-white hover:border-[#FFD93D]'
                          }`}
                        >
                          <motion.div layout className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-[#1F4E5A] text-lg">
                                {day.dayLabel}
                              </h3>
                              <div className="flex gap-4 mt-2 text-sm font-semibold">
                                <span className="text-[#FF5E5E] flex items-center gap-1">
                                  🍅 {day.pomodoros}
                                </span>
                                <span className="text-[#6BCB77] flex items-center gap-1">
                                  ⏱️ {day.focusMinutes}m
                                </span>
                              </div>
                            </div>
                            <motion.span
                              animate={{ rotate: expandedDate === day.date ? 180 : 0 }}
                              className="text-2xl"
                            >
                              ▼
                            </motion.span>
                          </motion.div>

                          {/* Expanded Details */}
                          <AnimatePresence>
                            {expandedDate === day.date && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                className="mt-4 pt-4 border-t-2 border-[#4ECDC4]/30"
                              >
                                <div className="grid grid-cols-2 gap-4">
                                  {/* Pomodoros */}
                                  <div className="bg-gradient-to-br from-[#FF5E5E]/10 to-[#FF5E5E]/5 p-3 rounded-lg">
                                    <div className="text-xs font-semibold text-[#FF5E5E] uppercase">
                                      Focus Sessions
                                    </div>
                                    <div className="text-3xl font-bold text-[#FF5E5E] mt-1">
                                      {day.pomodoros}
                                    </div>
                                    <div className="text-xs text-[#1F4E5A]/60 mt-1">
                                      Pomodoros
                                    </div>
                                  </div>

                                  {/* Focus Minutes */}
                                  <div className="bg-gradient-to-br from-[#6BCB77]/10 to-[#6BCB77]/5 p-3 rounded-lg">
                                    <div className="text-xs font-semibold text-[#6BCB77] uppercase">
                                      Focus Time
                                    </div>
                                    <div className="text-3xl font-bold text-[#6BCB77] mt-1">
                                      {day.focusMinutes}
                                    </div>
                                    <div className="text-xs text-[#1F4E5A]/60 mt-1">
                                      minutes
                                    </div>
                                  </div>

                                  {/* Hours */}
                                  <div className="bg-gradient-to-br from-[#4ECDC4]/10 to-[#4ECDC4]/5 p-3 rounded-lg col-span-2">
                                    <div className="text-xs font-semibold text-[#4ECDC4] uppercase">
                                      Hours Focused
                                    </div>
                                    <div className="text-3xl font-bold text-[#4ECDC4] mt-1">
                                      {(day.focusMinutes / 60).toFixed(1)}h
                                    </div>
                                  </div>
                                </div>

                                {/* Achievement Badge */}
                                {day.pomodoros >= 8 && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.1 }}
                                    className="mt-4 p-3 bg-gradient-to-r from-[#FFD93D]/30 to-[#FF5E5E]/20 rounded-lg border-2 border-[#FFD93D] text-center"
                                  >
                                    <div className="text-3xl">🏆</div>
                                    <div className="text-sm font-bold text-[#1F4E5A] mt-1">
                                      Amazing Day!
                                    </div>
                                    <div className="text-xs text-[#2a6f7e]">
                                      8+ sessions completed
                                    </div>
                                  </motion.div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
