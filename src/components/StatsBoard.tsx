import React, { useRef, useState, useEffect, useMemo, memo } from 'react';
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
      <div className="font-pixel text-xl lg:text-3xl text-[#1F4E5A] leading-none">{value}</div>
    </div>
  );
}

interface DayHistoryItem {
  date: string;
  label: string;
  pomodoros: number;
  focusHours: number;
  tasksCompleted: number;
}

function SevenDayHistory({ sessions, tasks }: { sessions: Session[]; tasks: Task[] }) {
  const historyData = useMemo(() => {
    const today = new Date();
    const data: DayHistoryItem[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });

      const daySessions = sessions.filter(s => s.completed && s.date === dateStr);
      const pomodoros = daySessions.length;
      const focusMinutes = daySessions.reduce((sum, s) => sum + s.duration, 0);
      const focusHours = Math.round((focusMinutes / 60) * 10) / 10;

      // Count task completions on this day
      const dayTasksCompleted = tasks.filter(t => {
        if (!t.completed || !t.lastCompletedDate) return false;
        return t.lastCompletedDate === dateStr;
      }).length;

      data.push({
        date: dateStr,
        label,
        pomodoros,
        focusHours,
        tasksCompleted: dayTasksCompleted,
      });
    }
    return data;
  }, [sessions, tasks]);

  return (
    <div className="shrink-0 bg-gradient-to-br from-[#4ECDC4]/10 to-[#6BCB77]/5 rounded-xl p-4 border border-[#4ECDC4]/20 w-full">
      <h3 className="text-xs font-black uppercase tracking-widest text-[#1F4E5A] mb-3 flex items-center gap-1.5">
        <Clock size={12} className="text-[#6BCB77]" />
        LAST 7 DAYS
      </h3>

      <div className="space-y-1.5">
        {historyData.map((day, idx) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="flex items-center justify-between bg-white/60 rounded-lg p-2.5 hover:bg-white transition-colors"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-[#1F4E5A] w-9 shrink-0 tracking-wider">{day.label}</span>
              <div className="flex-1 flex gap-1.5">
                {day.pomodoros > 0 && (
                  <div className="text-[10px] px-2 py-0.5 rounded bg-[#FF5E5E]/15 text-[#FF5E5E] font-bold">
                    {day.pomodoros}🍅
                  </div>
                )}
                {day.focusHours > 0 && (
                  <div className="text-[10px] px-2 py-0.5 rounded bg-[#FFD93D]/20 text-[#1F4E5A] font-bold">
                    {day.focusHours}h
                  </div>
                )}
                {day.tasksCompleted > 0 && (
                  <div className="text-[10px] px-2 py-0.5 rounded bg-[#6BCB77]/20 text-[#6BCB77] font-bold">
                    {day.tasksCompleted}✓
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AllTimeHistory({ sessions, tasks }: { sessions: Session[]; tasks: Task[] }) {
  const allDaysData = useMemo(() => {
    const dateMap = new Map<string, DayHistoryItem>();

    // Collect all dates from sessions and tasks
    sessions.forEach(s => {
      if (!dateMap.has(s.date)) {
        dateMap.set(s.date, { date: s.date, label: '', pomodoros: 0, focusHours: 0, tasksCompleted: 0 });
      }
    });

    tasks.forEach(t => {
      if (t.lastCompletedDate) {
        const dateStr = t.lastCompletedDate;
        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, { date: dateStr, label: '', pomodoros: 0, focusHours: 0, tasksCompleted: 0 });
        }
      }
    });

    // Populate data
    const data = Array.from(dateMap.values()).map(item => {
      const d = new Date(item.date + 'T00:00:00');
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const daySessions = sessions.filter(s => s.completed && s.date === item.date);
      const pomodoros = daySessions.length;
      const focusMinutes = daySessions.reduce((sum, s) => sum + s.duration, 0);
      const focusHours = Math.round((focusMinutes / 60) * 10) / 10;

      const dayTasksCompleted = tasks.filter(t => {
        if (!t.completed || !t.lastCompletedDate) return false;
        return t.lastCompletedDate === item.date;
      }).length;

      return { ...item, label, pomodoros, focusHours, tasksCompleted: dayTasksCompleted };
    });

    // Sort by date descending (newest first)
    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessions, tasks]);

  return (
    <div className="shrink-0 bg-gradient-to-br from-[#6BCB77]/10 to-[#4ECDC4]/5 rounded-xl p-4 border border-[#6BCB77]/20 w-full">
      <h3 className="text-xs font-black uppercase tracking-widest text-[#1F4E5A] mb-3 flex items-center gap-1.5">
        <TrendingUp size={12} className="text-[#FF5E5E]" />
        ALL-TIME HISTORY
      </h3>

      <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar pr-1">
        {allDaysData.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-[10px] text-[#1F4E5A]/40 font-bold tracking-wider">NO HISTORY YET</p>
          </div>
        ) : (
          allDaysData.map((day, idx) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="flex items-center justify-between bg-white/70 rounded-lg p-2 hover:bg-white transition-colors text-[9px]"
            >
              <span className="text-[#1F4E5A] font-bold min-w-fit">{day.label}</span>
              <div className="flex-1 flex gap-1 justify-end ml-2">
                {day.pomodoros > 0 && (
                  <div className="px-1.5 py-0.5 rounded bg-[#FF5E5E]/15 text-[#FF5E5E] font-bold whitespace-nowrap">
                    {day.pomodoros}🍅
                  </div>
                )}
                {day.focusHours > 0 && (
                  <div className="px-1.5 py-0.5 rounded bg-[#FFD93D]/20 text-[#1F4E5A] font-bold whitespace-nowrap">
                    {day.focusHours}h
                  </div>
                )}
                {day.tasksCompleted > 0 && (
                  <div className="px-1.5 py-0.5 rounded bg-[#6BCB77]/20 text-[#6BCB77] font-bold whitespace-nowrap">
                    {day.tasksCompleted}✓
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export const StatsBoard = memo(function StatsBoard({ sessions, tasks }: StatsBoardProps) {
  const today    = useMemo(() => computeTodayStats(sessions), [sessions]);
  const week     = useMemo(() => computeWeekStats(sessions),  [sessions]);
  const streak   = useMemo(() => computeStreak(sessions),     [sessions]);
  const chartData = useMemo(() => computeChartData(sessions), [sessions]);

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
    <div className="w-full h-full flex flex-col p-3 lg:p-4 bg-[#F5F5F0] overflow-y-auto gap-3 lg:gap-4 custom-scrollbar">

      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FFD93D]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#6BCB77]" />
        </div>
        <h3 className="font-mono text-sm lg:text-base text-[#1F4E5A] tracking-widest font-bold">DATA CENTER</h3>
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
        <div ref={chartContainerRef} className="h-24 lg:h-36 min-w-0">
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
              <div className={`font-pixel text-lg lg:text-2xl leading-none ${s.color}`}>{s.value}</div>
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

      {/* 7-DAY HISTORY */}
      <SevenDayHistory sessions={sessions} tasks={tasks} />

      {/* ALL-TIME HISTORY */}
      <AllTimeHistory sessions={sessions} tasks={tasks} />

    </div>
  );
});
