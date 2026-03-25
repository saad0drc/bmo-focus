import React, { useState } from 'react';

interface ChartData {
  date: string;
  label: string;
  count: number;
}

interface SimpleBarChartProps {
  data: ChartData[];
  maxCount: number;
  height?: string;
}

export function SimpleBarChart({ data, maxCount, height = 'h-24 lg:h-36' }: SimpleBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartHeight = 120;
  const chartWidth = 100;
  const barWidth = chartWidth / data.length;
  const padding = 8;

  return (
    <div className={`${height} flex items-end justify-between gap-1 px-2 py-2`}>
      {data.map((item, idx) => {
        const barHeight = maxCount === 0 ? 0 : (item.count / maxCount) * (chartHeight - padding);
        const isMax = item.count === maxCount && item.count > 0;
        const isEmpty = item.count === 0;

        return (
          <div
            key={item.date}
            className="flex-1 flex flex-col items-center justify-end relative group cursor-pointer"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Bar */}
            <div
              className={`w-full rounded-t transition-all ${
                isMax ? 'bg-[#FF5E5E]' : 'bg-[#4ECDC4]'
              } ${isEmpty ? 'opacity-25' : 'opacity-100'} hover:opacity-90`}
              style={{
                height: `${barHeight}px`,
                minHeight: item.count > 0 ? '4px' : '2px',
              }}
            />

            {/* Label */}
            <span className="text-[9px] font-bold text-[#1F4E5A] mt-1 whitespace-nowrap">
              {item.label}
            </span>

            {/* Tooltip */}
            {hoveredIndex === idx && item.count > 0 && (
              <div className="absolute -top-8 bg-[#1F4E5A] text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-10 pointer-events-none font-semibold">
                {item.count} 🍅
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
