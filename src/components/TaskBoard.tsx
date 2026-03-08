import React from 'react';
import { Task } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Check, Plus, Clock, Settings, Pin, PinOff, Repeat2 } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAdd: (title: string, settings: import('../types').TaskSettings, dueDate?: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSelectActive: (id: string) => void;
  onOpenAdd: () => void;
  onOpenEdit: (task: Task) => void;
}

export function TaskBoard({
  tasks,
  activeTaskId,
  onUpdate,
  onToggle,
  onDelete,
  onSelectActive,
  onOpenAdd,
  onOpenEdit,
}: TaskBoardProps) {

  // Sort: pinned first → incomplete before complete → newest first within each group
  const sortedTasks = [...tasks].sort((a, b) => {
    if ((a.pinned ? 1 : 0) !== (b.pinned ? 1 : 0)) return a.pinned ? -1 : 1;
    if ((a.completed ? 1 : 0) !== (b.completed ? 1 : 0)) return a.completed ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="w-full h-full flex flex-col p-5 bg-[#F5F5F0]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#4D96FF] shadow-sm animate-pulse" />
          <h3 className="font-mono text-xl text-[#1F4E5A] tracking-widest font-bold">MISSION LOG</h3>
        </div>
        <button
          onClick={onOpenAdd}
          className="bg-[#1F4E5A] text-[#F5F5F0] hover:bg-[#1F4E5A]/90 w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>

      {/* Task list — scrollable, bounded by parent height */}
      <div
        className="task-list flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3"
        style={{ maxHeight: '70vh' }}
      >
        <AnimatePresence initial={false}>
          {tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              className="flex flex-col items-center justify-center h-40 text-[#1F4E5A]/40 gap-4 border-2 border-dashed border-[#1F4E5A]/10 rounded-2xl bg-white/50"
            >
              <div className="font-pixel text-4xl opacity-30">EMPTY</div>
              <span className="text-xs font-bold uppercase tracking-widest bg-[#1F4E5A]/5 px-4 py-2 rounded-full">
                No Active Missions
              </span>
            </motion.div>
          )}

          {sortedTasks.map(task => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => onSelectActive(task.id)}
              className={`group flex items-center gap-3 p-3 rounded-2xl border-2 transition-all relative overflow-hidden cursor-pointer ${
                activeTaskId === task.id
                  ? 'bg-white border-[#1F4E5A] shadow-md ring-1 ring-[#1F4E5A]/10'
                  : task.completed
                  ? 'bg-[#1F4E5A]/5 border-transparent opacity-60 grayscale-[0.5]'
                  : task.pinned
                  ? 'bg-[#FFF9E6] border-[#FFD93D]/60 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                  : 'bg-white border-transparent shadow-sm hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              {/* Active indicator bar */}
              {activeTaskId === task.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1F4E5A]" />
              )}
              {/* Pinned indicator bar */}
              {task.pinned && activeTaskId !== task.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FFD93D]" />
              )}

              {/* Completion checkbox */}
              <button
                onClick={e => { e.stopPropagation(); onToggle(task.id); }}
                className={`w-6 h-6 rounded-md border-[2px] flex items-center justify-center transition-all shrink-0 ml-1 ${
                  task.completed
                    ? 'bg-[#6BCB77] border-[#6BCB77] text-white'
                    : 'border-[#1F4E5A]/20 hover:border-[#1F4E5A] bg-transparent'
                }`}
              >
                {task.completed && <Check size={14} strokeWidth={4} />}
              </button>

              {/* Task info */}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-sm font-bold tracking-tight truncate ${
                      task.completed ? 'text-[#1F4E5A]/50 line-through decoration-2' : 'text-[#1F4E5A]'
                    }`}
                  >
                    {task.title}
                  </span>
                  {task.repeatDaily && (
                    <span className="flex items-center gap-0.5 shrink-0">
                      <Repeat2 size={11} className="text-[#4ECDC4]" strokeWidth={2.5} />
                      {(task.dailyStreak ?? 0) > 0 && (
                        <span className="text-[9px] font-black text-[#FF6B6B] leading-none">
                          🔥{task.dailyStreak}
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#1F4E5A]/50 font-mono flex items-center gap-1.5">
                  <Clock size={10} />
                  {task.settings.focusDuration}m
                </span>
                {/* Pomodoro progress dots */}
                <div className="flex items-center gap-0.5 mt-0.5 flex-wrap">
                  {Array.from({ length: task.settings.sessionsPerRound }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i < task.completedPomodoros ? 'bg-[#FF5E5E]' : 'bg-[#1F4E5A]/10'
                      }`}
                    />
                  ))}
                  <span className="text-[9px] text-[#1F4E5A]/35 font-mono ml-1">
                    {task.completedPomodoros}/{task.settings.sessionsPerRound}
                  </span>
                </div>
              </div>

              {/* Action buttons — visible on hover */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={e => { e.stopPropagation(); onUpdate(task.id, { pinned: !task.pinned }); }}
                  className={`p-2 rounded-lg transition-all ${
                    task.pinned
                      ? 'text-[#B89400] bg-[#FFD93D]/10 !opacity-100'
                      : 'text-[#1F4E5A]/40 hover:bg-[#FFD93D]/10 hover:text-[#B89400]'
                  }`}
                >
                  {task.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onOpenEdit(task); }}
                  className="text-[#1F4E5A] hover:bg-[#1F4E5A]/10 p-2 rounded-lg transition-all"
                >
                  <Settings size={14} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(task.id); }}
                  className="text-[#FF5E5E] hover:bg-[#FF5E5E]/10 p-2 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
