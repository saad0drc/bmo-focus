import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Flame, Target, Clock, BarChart2, TrendingUp, CheckCircle2, Timer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Session, Task } from '../types';
import {
  computeTodayStats,
  computeWeekStats,
  computeStreak,
  computeChartData,
} from '../hooks/useSessions';

interface StatsBoardProps {
  sessions: Session[];
  tasks: Task[];
}

interface MiniStatProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  bg: string;
}

function MiniStat({ label, value, icon, bg }: MiniStatProps) {
  return (
    <div className={`${bg} rounded-xl p-3 flex flex-col gap-1.5`}>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest text-[#1F4E5A]/50">{label}</span>
      </div>
      <div className="font-pixel text-3xl text-[#1F4E5A] leading-none">{value}</div>
    </div>
  );
}

export function StatsBoard({ sessions, tasks }: StatsBoardProps) {
  const today = computeTodayStats(sessions);
  const week  = computeWeekStats(sessions);
  const streak = computeStreak(sessions);
  const chartData = computeChartData(sessions);

  // Only render the chart once the container has positive dimensions.
  // In browser extension popups the layout isn't always computed before
  // Recharts' ResponsiveContainer tries to measure, resulting in width/height = -1.
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartReady, setChartReady] = useState(false);
  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setChartReady(true);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const tasksCompleted = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#F5F5F0] overflow-y-auto gap-4 custom-scrollbar">

      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFD93D]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#6BCB77]" />
        </div>
        <h3 className="font-mono text-base text-[#1F4E5A] tracking-widest font-bold">DATA CENTER</h3>
      </div>

      {/* TODAY — 2×2 compact grid */}
      <div className="shrink-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-[#1F4E5A]/40 mb-2">Today</p>
        <div className="grid grid-cols-2 gap-2">
          <MiniStat
            label="Pomodoros"
            value={today.pomodoros}
            icon={<Target className="w-3 h-3 text-[#FF5E5E]" strokeWidth={2.5} />}
            bg="bg-[#FF5E5E]/8 border border-[#FF5E5E]/15"
          />
          <MiniStat
            label="Focus min"
            value={today.focusMinutes}
            icon={<Clock className="w-3 h-3 text-[#4ECDC4]" strokeWidth={2.5} />}
            bg="bg-[#4ECDC4]/8 border border-[#4ECDC4]/15"
          />
          <MiniStat
            label="Day streak"
            value={streak}
            icon={<Flame className="w-3 h-3 text-[#FF6B6B]" strokeWidth={2.5} />}
            bg="bg-[#FF6B6B]/8 border border-[#FF6B6B]/15"
          />
          <MiniStat
            label="Completed"
            value={tasksCompleted}
            icon={<CheckCircle2 className="w-3 h-3 text-[#6BCB77]" strokeWidth={2.5} />}
            bg="bg-[#6BCB77]/8 border border-[#6BCB77]/15"
          />
        </div>
      </div>

      {/* CHART */}
      <div className="bg-white rounded-2xl p-3 shadow-sm shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <BarChart2 size={12} className="text-[#1F4E5A]/40" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#1F4E5A]/40">
              Pomodoros — last 7 days
            </span>
          </div>
          <span className="text-[9px] font-black text-[#4ECDC4]">{week.totalPomodoros} total</span>
        </div>
        <div ref={chartContainerRef} className="h-36 min-w-0">
          {chartReady && (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={chartData} barSize={20} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: '#1F4E5A', fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  dy={4}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 8, fill: '#1F4E5A99' }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F4E5A',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#F5F5F0',
                    padding: '6px 10px',
                  }}
                  formatter={(val: number) => [`${val} 🍅`, '']}
                  labelStyle={{ color: '#DCF6E6', fontWeight: 700, fontSize: '10px' }}
                  cursor={{ fill: '#1F4E5A', opacity: 0.06 }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.count === maxCount && entry.count > 0 ? '#FF5E5E' : '#4ECDC4'}
                      fillOpacity={entry.count === 0 ? 0.25 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* THIS WEEK summary row */}
      <div className="shrink-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-[#1F4E5A]/40 mb-2">This week</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total',   value: week.totalPomodoros, color: 'text-[#FF5E5E]', bg: 'bg-[#FF5E5E]/8'  },
            { label: 'Avg/day', value: week.avgPerDay,      color: 'text-[#4ECDC4]', bg: 'bg-[#4ECDC4]/8'  },
            { label: 'Best',    value: week.bestDay,        color: 'text-[#FFD93D]', bg: 'bg-[#FFD93D]/8'  },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-2.5 flex flex-col items-center gap-1 border border-current/10`}>
              <div className={`font-pixel text-2xl leading-none ${s.color}`}>{s.value}</div>
              <div className="text-[8px] font-black uppercase tracking-widest text-[#1F4E5A]/40">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TASK PROGRESS bar */}
      {totalTasks > 0 && (
        <div className="shrink-0 bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Timer size={12} className="text-[#1F4E5A]/40" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#1F4E5A]/40">
                Task Progress
              </span>
            </div>
            <span className="text-[9px] font-black text-[#1F4E5A]/60">{tasksCompleted}/{totalTasks}</span>
          </div>
          <div className="w-full h-2.5 bg-[#1F4E5A]/8 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#4ECDC4] to-[#6BCB77] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(tasksCompleted / totalTasks) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[8px] text-[#1F4E5A]/30 font-bold">0</span>
            <span className="text-[8px] text-[#6BCB77] font-black">{Math.round((tasksCompleted / totalTasks) * 100)}%</span>
            <span className="text-[8px] text-[#1F4E5A]/30 font-bold">{totalTasks}</span>
          </div>
        </div>
      )}

    </div>
  );
}
