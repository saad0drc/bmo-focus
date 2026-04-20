import React, { useMemo, memo } from 'react';
import { motion } from 'motion/react';
import { Flame, Target, Clock, BarChart2, TrendingUp, CheckCircle2, Timer, Heart } from 'lucide-react';
import { SimpleBarChart } from './SimpleBarChart';
import { Session, Task } from '../types';
import { Emotion } from '../hooks/useBMOState';
import { TimerMode } from '../hooks/useTimer';
import {
  computeTodayStats,
  computeWeekStats,
  computeStreak,
  computeChartData,
} from '../hooks/useSessions';
import { ADVENTURE_TIME_COLORS } from '../constants/adventureTimeColors';

interface StatsBoardProps {
  sessions: Session[];
  tasks: Task[];
  emotion?: Emotion;
  onOpenHistory?: () => void;
  mode?: TimerMode;
  activeTaskId?: string | null;
  timeLeft?: number;
  totalFocusTime?: number;
}

interface MiniStatProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  bg: string;
}

function MiniStat({ label, value, icon, bg }: MiniStatProps) {
  return (
    <div className={`${bg} rounded-lg p-2 flex flex-col gap-1`}>
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-[8px] font-black uppercase tracking-widest text-[#1F4E5A]/50">{label}</span>
      </div>
      <div className="font-pixel text-lg lg:text-2xl text-[#1F4E5A] leading-none">{value}</div>
    </div>
  );
}

function TimeStats({ focusMinutes, totalMinutes }: { focusMinutes: number; totalMinutes: number }) {
  return (
    <div className="bg-gradient-to-br from-[#4ECDC4]/12 to-[#FFD93D]/12 border border-[#4ECDC4]/15 rounded-lg p-2 flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3 text-[#4ECDC4]" strokeWidth={2.5} />
        <span className="text-[8px] font-black uppercase tracking-widest text-[#1F4E5A]/50">Focus/Total</span>
      </div>
      <div className="font-pixel text-lg lg:text-2xl text-[#1F4E5A] leading-none">
        <span className="text-[#4ECDC4]">{focusMinutes}m</span>
        <span className="text-[#1F4E5A]/40 mx-1">/</span>
        <span className="text-[#FFD93D]">{totalMinutes}m</span>
      </div>
    </div>
  );
}

// SVG character icons for HEART display — more detailed and expressive
const heartCharacterSVGs: { [key: string]: string } = {
  '#4ECDC4': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- BMO Screen/Body -->
    <rect x="20" y="20" width="216" height="216" rx="24" fill="#4ECDC4" stroke="#1F4E5A" stroke-width="8"/>
    <!-- Screen Display -->
    <rect x="40" y="40" width="176" height="176" rx="16" fill="#E8F5E9" stroke="#1F4E5A" stroke-width="6"/>
    <!-- Left Eye -->
    <g>
      <rect x="55" y="65" width="45" height="55" rx="4" fill="#1F4E5A"/>
      <rect x="62" y="72" width="18" height="22" fill="#E8F5E9" rx="2"/>
      <circle cx="71" cy="83" r="4" fill="#1F4E5A"/>
    </g>
    <!-- Right Eye -->
    <g>
      <rect x="156" y="65" width="45" height="55" rx="4" fill="#1F4E5A"/>
      <rect x="163" y="72" width="18" height="22" fill="#E8F5E9" rx="2"/>
      <circle cx="172" cy="83" r="4" fill="#1F4E5A"/>
    </g>
    <!-- Mouth - happy curve -->
    <path d="M 70 130 Q 128 150 186 130" stroke="#1F4E5A" stroke-width="8" fill="none" stroke-linecap="round"/>
    <!-- Buttons on side -->
    <circle cx="35" cy="140" r="6" fill="#1F4E5A"/>
    <circle cx="35" cy="165" r="6" fill="#1F4E5A"/>
  </svg>`,

  '#5B9BD5': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Hat - fluffy top -->
    <path d="M 50 120 Q 50 40 128 30 Q 206 40 206 120" fill="white" stroke="#1F4E5A" stroke-width="8"/>
    <rect x="50" y="110" width="156" height="20" fill="white" stroke="#1F4E5A" stroke-width="8"/>
    <rect x="70" y="100" width="116" height="15" fill="#5B9BD5" stroke="#1F4E5A" stroke-width="3"/>
    <!-- Head/Face -->
    <circle cx="128" cy="150" r="85" fill="#5B9BD5" stroke="#1F4E5A" stroke-width="8"/>
    <!-- Face skin -->
    <circle cx="128" cy="160" r="65" fill="#FFD9B3"/>
    <!-- Left Eye -->
    <g>
      <rect x="75" y="125" width="32" height="40" rx="4" fill="#1F4E5A"/>
      <rect x="82" y="133" width="12" height="16" fill="white" rx="2"/>
      <circle cx="88" cy="141" r="3" fill="#1F4E5A"/>
    </g>
    <!-- Right Eye -->
    <g>
      <rect x="149" y="125" width="32" height="40" rx="4" fill="#1F4E5A"/>
      <rect x="156" y="133" width="12" height="16" fill="white" rx="2"/>
      <circle cx="162" cy="141" r="3" fill="#1F4E5A"/>
    </g>
    <!-- Happy Smile -->
    <path d="M 90 175 Q 128 195 166 175" stroke="#1F4E5A" stroke-width="8" fill="none" stroke-linecap="round"/>
  </svg>`,

  '#FF9F1C': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Jake Head -->
    <circle cx="128" cy="140" r="100" fill="#FF9F1C" stroke="#1F4E5A" stroke-width="8"/>
    <!-- Ears -->
    <ellipse cx="50" cy="80" rx="35" ry="50" fill="#FF9F1C" stroke="#1F4E5A" stroke-width="8" transform="rotate(-20 50 80)"/>
    <ellipse cx="206" cy="80" rx="35" ry="50" fill="#FF9F1C" stroke="#1F4E5A" stroke-width="8" transform="rotate(20 206 80)"/>
    <!-- Snout -->
    <ellipse cx="128" cy="160" rx="60" ry="55" fill="#FFB84D" stroke="#1F4E5A" stroke-width="6"/>
    <!-- Nose -->
    <circle cx="128" cy="145" r="20" fill="#1F4E5A"/>
    <!-- Left Eye -->
    <g>
      <circle cx="90" cy="110" r="22" fill="#1F4E5A"/>
      <circle cx="95" cy="108" r="8" fill="white"/>
    </g>
    <!-- Right Eye -->
    <g>
      <circle cx="166" cy="110" r="22" fill="#1F4E5A"/>
      <circle cx="171" cy="108" r="8" fill="white"/>
    </g>
    <!-- Tongue/Smile -->
    <ellipse cx="128" cy="175" rx="25" ry="15" fill="#FF5E5E"/>
  </svg>`,

  '#FF69B4': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Head -->
    <circle cx="128" cy="140" r="90" fill="#FF69B4" stroke="#1F4E5A" stroke-width="8"/>
    <!-- Crown - 3 peaks -->
    <polygon points="60,100 40,30 85,80" fill="#FFD700" stroke="#1F4E5A" stroke-width="6"/>
    <polygon points="128,60 100,10 156,60" fill="#FFD700" stroke="#1F4E5A" stroke-width="6"/>
    <polygon points="196,100 216,30 171,80" fill="#FFD700" stroke="#1F4E5A" stroke-width="6"/>
    <!-- Face -->
    <circle cx="128" cy="150" r="70" fill="#FFB6D9"/>
    <!-- Left Eye -->
    <circle cx="95" cy="130" r="20" fill="#1F4E5A"/>
    <circle cx="100" cy="128" r="7" fill="white"/>
    <!-- Right Eye -->
    <circle cx="161" cy="130" r="20" fill="#1F4E5A"/>
    <circle cx="166" cy="128" r="7" fill="white"/>
    <!-- Sweet Smile -->
    <path d="M 100 165 Q 128 180 156 165" stroke="#1F4E5A" stroke-width="8" fill="none" stroke-linecap="round"/>
    <!-- Blush circles -->
    <circle cx="75" cy="150" r="12" fill="#FF5E5E" opacity="0.5"/>
    <circle cx="181" cy="150" r="12" fill="#FF5E5E" opacity="0.5"/>
  </svg>`,

  '#9D4EDD': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Head -->
    <circle cx="128" cy="140" r="90" fill="#9D4EDD" stroke="#1F4E5A" stroke-width="8"/>
    <!-- Horns -->
    <polygon points="65,85 40,20 80,90" fill="#6B2E8F" stroke="#1F4E5A" stroke-width="6"/>
    <polygon points="191,85 216,20 176,90" fill="#6B2E8F" stroke="#1F4E5A" stroke-width="6"/>
    <!-- Face -->
    <circle cx="128" cy="150" r="65" fill="#B59FFF"/>
    <!-- Intense Red Eyes -->
    <rect x="80" y="115" width="30" height="45" rx="4" fill="#FF0000"/>
    <circle cx="95" cy="142" r="8" fill="white"/>
    <rect x="146" y="115" width="30" height="45" rx="4" fill="#FF0000"/>
    <circle cx="161" cy="142" r="8" fill="white"/>
    <!-- Smirk -->
    <path d="M 90 175 Q 128 188 166 175" stroke="#6B2E8F" stroke-width="8" fill="none" stroke-linecap="round"/>
  </svg>`,

  '#00D9FF': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Wizard Hat -->
    <polygon points="128,20 60,140 196,140" fill="#00D9FF" stroke="#0099CC" stroke-width="8"/>
    <rect x="55" y="135" width="146" height="30" fill="#FFD700" stroke="#1F4E5A" stroke-width="6"/>
    <!-- Face -->
    <circle cx="128" cy="170" r="70" fill="#FFD9B3" stroke="#1F4E5A" stroke-width="6"/>
    <!-- Beard -->
    <path d="M 80 210 Q 128 230 176 210" stroke="#E8D5FF" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M 90 230 Q 128 245 166 230" stroke="#E8D5FF" stroke-width="8" fill="none" stroke-linecap="round"/>
    <!-- Left Eye -->
    <rect x="80" y="145" width="20" height="28" rx="3" fill="#1F4E5A"/>
    <circle cx="90" cy="158" r="4" fill="#FFD9B3"/>
    <!-- Right Eye -->
    <rect x="156" y="145" width="20" height="28" rx="3" fill="#1F4E5A"/>
    <circle cx="166" cy="158" r="4" fill="#FFD9B3"/>
    <!-- Smile -->
    <path d="M 95 185 Q 128 200 161 185" stroke="#1F4E5A" stroke-width="6" fill="none" stroke-linecap="round"/>
  </svg>`,

  '#C77DFF': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Cloud body - 3 overlapping circles -->
    <ellipse cx="60" cy="150" rx="70" ry="65" fill="#C77DFF" stroke="#1F4E5A" stroke-width="8"/>
    <ellipse cx="128" cy="80" rx="75" ry="70" fill="#C77DFF" stroke="#1F4E5A" stroke-width="8"/>
    <ellipse cx="196" cy="150" rx="70" ry="65" fill="#C77DFF" stroke="#1F4E5A" stroke-width="8"/>
    <!-- Crown -->
    <polygon points="70,60 45,10 100,50" fill="#FFD700" stroke="#1F4E5A" stroke-width="6"/>
    <polygon points="128,45 100,0 156,45" fill="#FFD700" stroke="#1F4E5A" stroke-width="6"/>
    <polygon points="186,60 216,10 156,50" fill="#FFD700" stroke="#1F4E5A" stroke-width="6"/>
    <!-- Left Eye -->
    <circle cx="85" cy="115" r="24" fill="#1F4E5A"/>
    <circle cx="90" cy="112" r="8" fill="white"/>
    <!-- Right Eye -->
    <circle cx="171" cy="115" r="24" fill="#1F4E5A"/>
    <circle cx="176" cy="112" r="8" fill="white"/>
    <!-- Smile -->
    <path d="M 90 160 Q 128 180 166 160" stroke="#1F4E5A" stroke-width="8" fill="none" stroke-linecap="round"/>
  </svg>`,

  '#6BCB77': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Blade -->
    <polygon points="128,15 100,120 100,230 156,230 156,120" fill="#6BCB77" stroke="#4A9D5F" stroke-width="8"/>
    <!-- Hilt -->
    <rect x="95" y="230" width="66" height="35" fill="#8B4513" stroke="#1F4E5A" stroke-width="6"/>
    <!-- Cross guard -->
    <rect x="65" y="215" width="126" height="25" fill="#FFD700" stroke="#1F4E5A" stroke-width="6"/>
    <!-- Highlight/shine -->
    <polygon points="128,15 115,50 141,50" fill="#8FE387"/>
    <!-- Eyes (on blade) -->
    <rect x="95" y="100" width="18" height="24" rx="3" fill="#1F4E5A"/>
    <circle cx="104" cy="112" r="3" fill="white"/>
    <rect x="143" y="100" width="18" height="24" rx="3" fill="#1F4E5A"/>
    <circle cx="152" cy="112" r="3" fill="white"/>
    <!-- Mouth -->
    <line x1="105" y1="140" x2="151" y2="140" stroke="#1F4E5A" stroke-width="6" stroke-linecap="round"/>
  </svg>`,

  '#FF5E5E': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Flame shape -->
    <path d="M 128 15 L 85 120 L 95 180 L 128 240 L 161 180 L 171 120 Z" fill="#FF5E5E" stroke="#FF2020" stroke-width="8"/>
    <!-- Inner flame highlight -->
    <path d="M 128 45 L 105 130 L 110 170 L 128 220 L 146 170 L 151 130 Z" fill="#FFB347"/>
    <!-- Eyes (angry) -->
    <rect x="90" y="90" width="22" height="28" rx="3" fill="#1F4E5A" transform="rotate(-15 101 104)"/>
    <circle cx="101" cy="104" r="4" fill="white"/>
    <rect x="144" y="90" width="22" height="28" rx="3" fill="#1F4E5A" transform="rotate(15 155 104)"/>
    <circle cx="155" cy="104" r="4" fill="white"/>
    <!-- Mouth - intense -->
    <line x1="100" y1="140" x2="156" y2="140" stroke="#1F4E5A" stroke-width="7" stroke-linecap="round"/>
  </svg>`,
};

// SVG character icons by color (for tab favicon - minimal style)
const characterSVGs: { [key: string]: string } = {
  '#4ECDC4': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <rect x="0" y="0" width="256" height="256" rx="20" fill="#4ECDC4" stroke="#1F4E5A" stroke-width="20"/>
    <rect x="30" y="30" width="196" height="196" rx="15" fill="#E8F5E9" stroke="#1F4E5A" stroke-width="8"/>
    <rect x="60" y="70" width="50" height="60" fill="#1F4E5A"/>
    <rect x="146" y="70" width="50" height="60" fill="#1F4E5A"/>
    <rect x="75" y="85" width="20" height="30" fill="#E8F5E9"/>
    <rect x="161" y="85" width="20" height="30" fill="#E8F5E9"/>
    <line x1="80" y1="150" x2="176" y2="150" stroke="#1F4E5A" stroke-width="14" stroke-linecap="round"/>
  </svg>`,
  '#5B9BD5': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <circle cx="128" cy="130" r="105" fill="#5B9BD5" stroke="#1F4E5A" stroke-width="18"/>
    <polygon points="128,0 50,80 206,80" fill="white" stroke="#1F4E5A" stroke-width="12"/>
    <rect x="80" y="40" width="96" height="24" fill="#5B9BD5" stroke="#1F4E5A" stroke-width="3"/>
    <circle cx="128" cy="150" r="70" fill="#FFD9B3"/>
    <rect x="80" y="110" width="35" height="40" fill="#1F4E5A"/>
    <rect x="141" y="110" width="35" height="40" fill="#1F4E5A"/>
    <line x1="90" y1="170" x2="166" y2="170" stroke="#1F4E5A" stroke-width="10" stroke-linecap="round"/>
  </svg>`,
  '#FF9F1C': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <circle cx="128" cy="130" r="110" fill="#FF9F1C" stroke="#1F4E5A" stroke-width="18"/>
    <polygon points="50,40 15,-5 65,80" fill="#FF9F1C" stroke="#1F4E5A" stroke-width="10"/>
    <polygon points="206,40 240,-5 191,80" fill="#FF9F1C" stroke="#1F4E5A" stroke-width="10"/>
    <ellipse cx="128" cy="155" rx="65" ry="60" fill="#FFB84D" stroke="#1F4E5A" stroke-width="8"/>
    <circle cx="128" cy="145" r="22" fill="#1F4E5A"/>
    <circle cx="90" cy="80" r="24" fill="#1F4E5A"/>
    <circle cx="166" cy="80" r="24" fill="#1F4E5A"/>
  </svg>`,
  '#FF69B4': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <circle cx="128" cy="130" r="105" fill="#FF69B4" stroke="#1F4E5A" stroke-width="18"/>
    <polygon points="40,80 0,-20 80,100" fill="#FFD700" stroke="#1F4E5A" stroke-width="12"/>
    <polygon points="128,40 100,-20 156,80" fill="#FFD700" stroke="#1F4E5A" stroke-width="12"/>
    <polygon points="216,80 255,-20 176,100" fill="#FFD700" stroke="#1F4E5A" stroke-width="12"/>
    <circle cx="128" cy="150" r="75" fill="#FFB6D9"/>
    <circle cx="95" cy="125" r="22" fill="#1F4E5A"/>
    <circle cx="161" cy="125" r="22" fill="#1F4E5A"/>
    <line x1="85" y1="175" x2="171" y2="175" stroke="#1F4E5A" stroke-width="10" stroke-linecap="round"/>
  </svg>`,
  '#9D4EDD': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <circle cx="128" cy="130" r="105" fill="#9D4EDD" stroke="#1F4E5A" stroke-width="18"/>
    <polygon points="50,30 0,-20 70,100" fill="#6B2E8F" stroke="#1F4E5A" stroke-width="12"/>
    <polygon points="206,30 255,-20 186,100" fill="#6B2E8F" stroke="#1F4E5A" stroke-width="12"/>
    <circle cx="128" cy="150" r="70" fill="#B59FFF"/>
    <rect x="85" y="115" width="30" height="45" fill="#FF0000"/>
    <rect x="141" y="115" width="30" height="45" fill="#FF0000"/>
    <line x1="95" y1="175" x2="161" y2="175" stroke="#6B2E8F" stroke-width="10" stroke-linecap="round"/>
  </svg>`,
  '#00D9FF': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <polygon points="128,0 20,180 236,180" fill="#00D9FF" stroke="#0099CC" stroke-width="14"/>
    <rect x="20" y="160" width="216" height="35" fill="#FFD700" stroke="#1F4E5A" stroke-width="6"/>
    <circle cx="128" cy="185" r="75" fill="#FFD9B3" stroke="#1F4E5A" stroke-width="8"/>
    <line x1="60" y1="225" x2="196" y2="225" stroke="#E8D5FF" stroke-width="10"/>
    <line x1="70" y1="245" x2="186" y2="245" stroke="#E8D5FF" stroke-width="8"/>
    <rect x="85" y="160" width="25" height="32" fill="#1F4E5A"/>
    <rect x="146" y="160" width="25" height="32" fill="#1F4E5A"/>
  </svg>`,
  '#C77DFF': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <ellipse cx="60" cy="145" rx="85" ry="80" fill="#C77DFF" stroke="#1F4E5A" stroke-width="12"/>
    <ellipse cx="196" cy="145" rx="85" ry="80" fill="#C77DFF" stroke="#1F4E5A" stroke-width="12"/>
    <ellipse cx="128" cy="50" rx="85" ry="80" fill="#C77DFF" stroke="#1F4E5A" stroke-width="12"/>
    <circle cx="95" cy="105" r="26" fill="#1F4E5A"/>
    <circle cx="161" cy="105" r="26" fill="#1F4E5A"/>
    <line x1="90" y1="170" x2="166" y2="170" stroke="#1F4E5A" stroke-width="10" stroke-linecap="round"/>
    <polygon points="70,50 40,0 128,35 216,0 186,50" fill="#FFD700" stroke="#1F4E5A" stroke-width="6"/>
  </svg>`,
  '#6BCB77': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <polygon points="128,0 95,110 100,256 156,256 161,110" fill="#6BCB77" stroke="#4A9D5F" stroke-width="12"/>
    <rect x="92" y="256" width="72" height="40" fill="#8B4513" stroke="#1F4E5A" stroke-width="6"/>
    <rect x="65" y="235" width="126" height="24" fill="#FFD700" stroke="#1F4E5A" stroke-width="5"/>
    <polygon points="128,0 110,50 146,50" fill="#8FE387"/>
  </svg>`,
  '#FF5E5E': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <polygon points="128,10 85,130 95,190 128,256 161,190 171,130" fill="#FF5E5E" stroke="#FF2020" stroke-width="10"/>
    <polygon points="128,50 105,140 110,180 128,230 146,180 151,140" fill="#FFB347" stroke="#FF9500" stroke-width="4"/>
    <rect x="95" y="120" width="24" height="32" fill="#1F4E5A"/>
    <rect x="137" y="120" width="24" height="32" fill="#1F4E5A"/>
  </svg>`,
};

interface BMOHeartStatProps {
  emotion?: Emotion;
  mode?: TimerMode;
  activeTaskId?: string | null;
  tasks?: Task[];
  timeLeft?: number;
  totalFocusTime?: number;
}

function BMOHeartStat({ emotion, mode = 'focus', activeTaskId, tasks = [], timeLeft = 0, totalFocusTime = 0 }: BMOHeartStatProps) {
  const activeTask = activeTaskId && tasks.length > 0 ? tasks.find(t => t.id === activeTaskId) : undefined;
  const taskColor = activeTask?.color || '#4ECDC4';
  const taskName = activeTask?.title || 'Ready';
  
  // Get SVG for this color (use heart variants)
  const characterSvg = heartCharacterSVGs[taskColor] || heartCharacterSVGs['#4ECDC4'];
  
  // Calculate damage percentage during focus (0 to 100)
  const damagePercent = mode === 'focus' && totalFocusTime > 0 
    ? Math.min(100, ((totalFocusTime - timeLeft) / totalFocusTime) * 100)
    : 0;

  // Helper to convert hex color to lighter/darker variants
  const getLighterColor = (hex: string): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + 60);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + 60);
    const b = Math.min(255, (num & 0x0000FF) + 60);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  const getDarkerColor = (hex: string): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - 80);
    const g = Math.max(0, ((num >> 8) & 0x0000FF) - 80);
    const b = Math.max(0, (num & 0x0000FF) - 80);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  const lighterColor = getLighterColor(taskColor);
  const darkerColor = getDarkerColor(taskColor);

  return (
    <motion.div
      className={`col-span-2 flex items-center gap-6 lg:gap-8`}
    >
      {/* Heart on left with ripple effect */}
      <div className="relative w-32 h-32 lg:w-40 lg:h-40 flex items-center justify-center flex-shrink-0">
        
        {/* Animated ripple effect rings - task color gradient */}
        {mode === 'focus' && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`ripple-focus-${i}`}
                className="absolute rounded-full border-2"
                style={{
                  width: '100%',
                  height: '100%',
                  borderColor: taskColor,
                }}
                animate={{
                  scale: [1, 1.4, 1.8],
                  opacity: [0.8, 0.4, 0],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </>
        )}

        {mode === 'shortBreak' && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`ripple-break-${i}`}
                className="absolute rounded-full border-2 border-[#6BCB77]"
                style={{
                  width: '100%',
                  height: '100%',
                }}
                animate={{
                  scale: [1, 1.3, 1.6],
                  opacity: [0.6, 0.3, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </>
        )}

        {mode === 'longBreak' && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`ripple-longbreak-${i}`}
                className="absolute rounded-full border-2"
                style={{
                  width: '100%',
                  height: '100%',
                  borderColor: darkerColor,
                }}
                animate={{
                  scale: [1, 1.5, 2],
                  opacity: [0.8, 0.4, 0],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.25,
                }}
              />
            ))}
          </>
        )}

        {/* Heart SVG with task color and progressive damage */}
        <motion.div
          className="relative z-10"
          animate={
            mode === 'focus'
              ? { scale: [0.95, 1.08, 0.95] }
              : mode === 'longBreak'
              ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
              : { scale: 1 }
          }
          transition={
            mode === 'focus'
              ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
              : mode === 'longBreak'
              ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0 }
          }
        >
          <svg
            width="110"
            height="110"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg"
          >
            <defs>
              <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: lighterColor, stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: taskColor, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: darkerColor, stopOpacity: 1 }} />
              </linearGradient>
              <filter id="heartGlow">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Heart shape */}
            <path
              d="M50,90 C20,70 5,55 5,40 C5,25 15,15 25,15 C35,15 45,25 50,32 C55,25 65,15 75,15 C85,15 95,25 95,40 C95,55 80,70 50,90 Z"
              fill="url(#heartGradient)"
              stroke={darkerColor}
              strokeWidth="1.5"
              filter="url(#heartGlow)"
            />
            
            {/* Progressive crack overlays based on damage */}
            {damagePercent > 20 && (
              <motion.path
                d="M50,32 Q60,50 55,70"
                stroke={darkerColor}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                opacity={Math.min(1, (damagePercent - 20) / 20)}
              />
            )}
            {damagePercent > 45 && (
              <motion.path
                d="M50,32 Q40,50 45,70"
                stroke={darkerColor}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                opacity={Math.min(1, (damagePercent - 45) / 20)}
              />
            )}
            {damagePercent > 70 && (
              <motion.path
                d="M30,55 L70,50"
                stroke={darkerColor}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                opacity={Math.min(1, (damagePercent - 70) / 30)}
              />
            )}
          </svg>
        </motion.div>
      </div>

      {/* Icon and Title on right side */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        {/* Character SVG */}
        <div className="w-12 h-12 lg:w-16 lg:h-16">
          <svg
            viewBox="0 0 256 256"
            xmlns="http://www.w3.org/2000/svg"
            dangerouslySetInnerHTML={{ __html: characterSvg }}
            className="w-full h-full drop-shadow-md"
          />
        </div>

        {/* Task name below */}
        <div className="text-center">
          <div className="font-pixel text-[9px] lg:text-xs text-[#1F4E5A] leading-none font-bold truncate max-w-[80px] uppercase tracking-tight">
            {taskName}
          </div>
        </div>
      </div>
    </motion.div>
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

export const StatsBoard = memo(function StatsBoard({ sessions, tasks, emotion, onOpenHistory, mode = 'focus', activeTaskId, timeLeft = 0, totalFocusTime = 0 }: StatsBoardProps) {
  const today    = useMemo(() => computeTodayStats(sessions), [sessions]);
  const week     = useMemo(() => computeWeekStats(sessions),  [sessions]);
  const streak   = useMemo(() => computeStreak(sessions),     [sessions]);
  const chartData = useMemo(() => computeChartData(sessions), [sessions]);

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
        {onOpenHistory && (
          <button
            onClick={onOpenHistory}
            className="px-3 py-1 rounded-lg bg-[#4ECDC4]/15 hover:bg-[#4ECDC4]/25 text-[#4ECDC4] text-xs font-bold uppercase transition-colors"
          >
            📅 History
          </button>
        )}
      </div>

      {/* TODAY — 3×2 compact grid */}
      {/* TODAY — reorganized compact grid */}
      <div className="shrink-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-[#1F4E5A]/40 mb-2">Today</p>
        <div className="grid grid-cols-2 gap-2">
          {/* Row 1: Streak | Pomodoros */}
          <MiniStat
            label="Day streak"
            value={streak}
            icon={<Flame className="w-3 h-3 text-[#FF6B6B]" strokeWidth={2.5} />}
            bg="bg-[#FF6B6B]/8 border border-[#FF6B6B]/15"
          />
          <MiniStat
            label="Pomodoros"
            value={today.pomodoros}
            icon={<Target className="w-3 h-3 text-[#FF5E5E]" strokeWidth={2.5} />}
            bg="bg-[#FF5E5E]/8 border border-[#FF5E5E]/15"
          />
          
          {/* Row 2: Completed | Focus/Total */}
          <MiniStat
            label="Completed"
            value={tasksCompleted}
            icon={<CheckCircle2 className="w-3 h-3 text-[#6BCB77]" strokeWidth={2.5} />}
            bg="bg-[#6BCB77]/8 border border-[#6BCB77]/15"
          />
          <TimeStats focusMinutes={today.focusMinutes} totalMinutes={today.totalTimeMinutes} />
          
          {/* Row 3: BMO Heart (full width) */}
          <BMOHeartStat emotion={emotion} mode={mode} activeTaskId={activeTaskId} tasks={tasks} timeLeft={timeLeft} totalFocusTime={totalFocusTime} />
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
        <SimpleBarChart
          data={chartData}
          maxCount={Math.max(...chartData.map(d => d.count), 8)}
          height="h-24 lg:h-36"
        />
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
