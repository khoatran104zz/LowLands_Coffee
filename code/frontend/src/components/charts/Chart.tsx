import React, { useState } from "react";
import { cn } from "@/lib/utils";

// --- Types ---
export interface ChartDataItem {
  label: string;
  value: number;
  secondaryValue?: number;
}

// --- Line Chart Component ---
interface LineChartProps {
  data: ChartDataItem[];
  height?: number;
  color?: string;
  fillColor?: string;
  className?: string;
}

export function LineChart({
  data,
  height = 200,
  color = "stroke-amber-700",
  fillColor = "url(#chart-gradient)",
  className
}: LineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const padding = 40;
  const chartHeight = height - padding * 2;
  const chartWidth = 500;
  const stepX = chartWidth / (data.length - 1 || 1);

  // Generate points
  const points = data.map((item, i) => {
    const x = padding + i * stepX;
    const y = padding + chartHeight - (item.value / maxVal) * chartHeight;
    return { x, y, label: item.label, value: item.value };
  });

  // SVG path definitions
  let pathD = "";
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }
  }

  // Gradient fill path definition
  const fillD = pathD
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : "";

  return (
    <div className={cn("w-full bg-card rounded-xl border border-border/80 p-5 shadow-xs relative", className)}>
      <svg
        viewBox={`0 0 ${chartWidth + padding * 2} ${height}`}
        className="w-full overflow-visible"
      >
        <defs>
          <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#854d0e" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#854d0e" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = padding + chartHeight - ratio * chartHeight;
          const gridVal = Math.round(ratio * maxVal);
          return (
            <g key={idx} className="opacity-40">
              <line
                x1={padding}
                y1={y}
                x2={padding + chartWidth}
                y2={y}
                className="stroke-border stroke-1 stroke-dasharray-[4,4]"
              />
              <text
                x={padding - 8}
                y={y + 4}
                className="text-[10px] font-bold text-muted-foreground text-right fill-current"
                textAnchor="end"
              >
                {gridVal >= 1000000 
                  ? `${(gridVal / 1000000).toFixed(1)}M` 
                  : gridVal >= 1000 
                    ? `${(gridVal / 1000).toFixed(0)}k` 
                    : gridVal}
              </text>
            </g>
          );
        })}

        {/* Filled Area */}
        {fillD && <path d={fillD} fill={fillColor} className="transition-all duration-500 ease-out" />}

        {/* Line Path */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            className={cn("stroke-[2.5] transition-all duration-500 ease-out", color)}
          />
        )}

        {/* X-axis labels */}
        {points.map((pt, i) => (
          <text
            key={i}
            x={pt.x}
            y={height - padding + 16}
            className="text-[9px] font-bold text-muted-foreground/80 fill-current"
            textAnchor="middle"
          >
            {pt.label}
          </text>
        ))}

        {/* Interactive Dots */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredIndex === i ? 6 : 4}
              className={cn(
                "fill-background stroke-[2.5] cursor-pointer transition-all duration-150",
                hoveredIndex === i ? "stroke-amber-900 scale-125" : "stroke-amber-700"
              )}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            {hoveredIndex === i && (
              <g>
                <rect
                  x={pt.x - 55}
                  y={pt.y - 36}
                  width="110"
                  height="26"
                  rx="6"
                  className="fill-zinc-950/90 shadow-lg"
                />
                <text
                  x={pt.x}
                  y={pt.y - 20}
                  className="text-[10px] font-bold fill-white text-center"
                  textAnchor="middle"
                >
                  {pt.value.toLocaleString("vi-VN")}đ
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

// --- Bar Chart Component ---
interface BarChartProps {
  data: ChartDataItem[];
  height?: number;
  color?: string;
  className?: string;
}

export function BarChart({
  data,
  height = 200,
  color = "fill-amber-800 hover:fill-amber-700",
  className
}: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const padding = 40;
  const chartHeight = height - padding * 2;
  const chartWidth = 500;
  const barWidth = Math.max(12, (chartWidth / data.length) * 0.4);
  const stepX = chartWidth / data.length;

  return (
    <div className={cn("w-full bg-card rounded-xl border border-border/80 p-5 shadow-xs relative", className)}>
      <svg
        viewBox={`0 0 ${chartWidth + padding * 2} ${height}`}
        className="w-full overflow-visible"
      >
        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = padding + chartHeight - ratio * chartHeight;
          const gridVal = Math.round(ratio * maxVal);
          return (
            <g key={idx} className="opacity-40">
              <line
                x1={padding}
                y1={y}
                x2={padding + chartWidth}
                y2={y}
                className="stroke-border stroke-1 stroke-dasharray-[4,4]"
              />
              <text
                x={padding - 8}
                y={y + 4}
                className="text-[10px] font-bold text-muted-foreground text-right fill-current"
                textAnchor="end"
              >
                {gridVal >= 1000000 
                  ? `${(gridVal / 1000000).toFixed(1)}M` 
                  : gridVal >= 1000 
                    ? `${(gridVal / 1000).toFixed(0)}k` 
                    : gridVal}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, i) => {
          const x = padding + i * stepX + stepX / 2 - barWidth / 2;
          const h = (item.value / maxVal) * chartHeight;
          const y = padding + chartHeight - h;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx="4"
                className={cn("transition-all duration-300 ease-out cursor-pointer", color)}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              {/* X Axis Label */}
              <text
                x={x + barWidth / 2}
                y={height - padding + 16}
                className="text-[9px] font-bold text-muted-foreground/80 fill-current"
                textAnchor="middle"
              >
                {item.label.length > 10 ? `${item.label.substring(0, 8)}..` : item.label}
              </text>

              {/* Tooltip */}
              {hoveredIndex === i && (
                <g>
                  <rect
                    x={x + barWidth / 2 - 50}
                    y={y - 32}
                    width="100"
                    height="22"
                    rx="6"
                    className="fill-zinc-950/90 shadow-lg"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 18}
                    className="text-[9px] font-bold fill-white text-center"
                    textAnchor="middle"
                  >
                    {item.value.toLocaleString("vi-VN")}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// --- Pie Chart Component ---
interface PieChartProps {
  data: ChartDataItem[];
  height?: number;
  className?: string;
}

export function PieChart({ data, height = 200, className }: PieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const cx = 100;
  const cy = 100;
  const r = 70;

  // Nice premium coffee brand palette
  const colors = [
    "#7c2d12", // amber-900 (robusta)
    "#b45309", // amber-700 (espresso)
    "#d97706", // amber-600 (latte)
    "#f59e0b", // amber-500 (cappuccino)
    "#f5f5f4", // stone-100 (cream)
    "#a8a29e"  // stone-400 (milk)
  ];

  let accumulatedAngle = 0;

  const slices = data.map((item, idx) => {
    const percentage = item.value / (total || 1);
    const angle = percentage * 360;
    
    // Calculate arc
    const radStart = (accumulatedAngle - 90) * (Math.PI / 180);
    const radEnd = (accumulatedAngle + angle - 90) * (Math.PI / 180);

    const x1 = cx + r * Math.cos(radStart);
    const y1 = cy + r * Math.sin(radStart);
    const x2 = cx + r * Math.cos(radEnd);
    const y2 = cy + r * Math.sin(radEnd);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    accumulatedAngle += angle;

    return {
      pathData,
      color: colors[idx % colors.length],
      label: item.label,
      value: item.value,
      percentage: (percentage * 100).toFixed(1)
    };
  });

  return (
    <div className={cn("w-full bg-card rounded-xl border border-border/80 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-around", className)}>
      <svg width={cx * 2} height={cy * 2} className="overflow-visible">
        {slices.map((slice, idx) => {
          const isHovered = hoveredIndex === idx;
          return (
            <path
              key={idx}
              d={slice.pathData}
              fill={slice.color}
              className="transition-all duration-200 cursor-pointer stroke-card stroke-2"
              style={{
                transform: isHovered ? "scale(1.05)" : "scale(1.0)",
                transformOrigin: `${cx}px ${cy}px`,
                filter: isHovered ? "drop-shadow(0px 8px 12px rgba(0,0,0,0.15))" : "none"
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          );
        })}
        {/* Center circle for Donut effect */}
        <circle cx={cx} cy={cy} r={35} className="fill-card" />
        {hoveredIndex !== null && (
          <g>
            <text
              x={cx}
              y={cy - 4}
              className="text-[10px] font-bold text-muted-foreground fill-current text-center"
              textAnchor="middle"
            >
              {slices[hoveredIndex].label}
            </text>
            <text
              x={cx}
              y={cy + 12}
              className="text-xs font-bold text-foreground fill-current text-center font-outfit"
              textAnchor="middle"
            >
              {slices[hoveredIndex].percentage}%
            </text>
          </g>
        )}
      </svg>

      <div className="flex flex-col space-y-2 mt-4 sm:mt-0 max-w-[200px]">
        {slices.map((slice, idx) => (
          <div
            key={idx}
            className={cn(
              "flex items-center space-x-2.5 text-xs font-medium cursor-pointer p-1 rounded-md transition-colors",
              hoveredIndex === idx ? "bg-muted/30" : ""
            )}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="w-3.5 h-3.5 rounded-sm shrink-0" style={{ backgroundColor: slice.color }} />
            <div className="flex-grow min-w-0">
              <span className="block truncate text-foreground/80 font-semibold">{slice.label}</span>
              <span className="block text-[10px] text-muted-foreground font-semibold">
                {slice.value.toLocaleString("vi-VN")} ({slice.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
