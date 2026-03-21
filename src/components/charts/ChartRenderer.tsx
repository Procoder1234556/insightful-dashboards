import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { ChartSpec } from "@/lib/dashboardEngine";

const CHART_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#ec4899",
];

function formatTick(value: number, format?: ChartSpec["format"]): string {
  if (format === "currency") {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  }
  if (format === "percent") return `${value}%`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

function CustomTooltip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  format?: ChartSpec["format"];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg px-3 py-2.5 text-xs font-body">
      {label && <p className="font-semibold text-foreground mb-1.5">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name.replace(/_/g, " ")}</span>
          <span className="font-semibold text-foreground ml-auto pl-3">
            {formatTick(p.value, format)}
          </span>
        </div>
      ))}
    </div>
  );
}

interface ChartRendererProps {
  chart: ChartSpec;
  delay?: number;
}

export function ChartRenderer({ chart, delay = 0 }: ChartRendererProps) {
  const colors = chart.colors ?? CHART_COLORS;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25, delay, ease: [0.16, 1, 0.3, 1] }}
      className="surface-raised p-3 sm:p-4 flex flex-col gap-2 h-full min-h-0"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-[11px] sm:text-xs font-display font-bold text-foreground leading-tight uppercase tracking-wide">
            {chart.title}
          </h3>
          {chart.subtitle && (
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{chart.subtitle}</p>
          )}
        </div>
        {/* Type badge */}
        <span className="flex-shrink-0 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-body">
          {chart.type}
        </span>
      </div>

      {/* Chart area */}
      <div
        className="flex-1 min-h-0"
        style={{ minHeight: chart.size.rows === 2 ? 180 : 110 }}
      >
        {chart.type === "bar" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chart.data}
              margin={{ top: 4, right: 4, bottom: 8, left: 0 }}
              barSize={chart.data.length > 6 ? 14 : 22}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
              <XAxis
                dataKey={chart.xKey}
                tick={{ fontSize: 9, fontFamily: "DM Sans", fill: "hsl(215 16% 47%)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatTick(v, chart.format)}
                tick={{ fontSize: 9, fontFamily: "DM Sans", fill: "hsl(215 16% 47%)" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip format={chart.format} />} cursor={{ fill: "hsl(239 84% 67% / 0.06)" }} />
              {chart.yKeys.length > 1 && (
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: "DM Sans" }} />
              )}
              {chart.yKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}

        {chart.type === "line" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart.data} margin={{ top: 4, right: 4, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
              <XAxis
                dataKey={chart.xKey}
                tick={{ fontSize: 9, fontFamily: "DM Sans", fill: "hsl(215 16% 47%)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatTick(v, chart.format)}
                tick={{ fontSize: 9, fontFamily: "DM Sans", fill: "hsl(215 16% 47%)" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip format={chart.format} />} />
              <Legend wrapperStyle={{ fontSize: 9, fontFamily: "DM Sans" }} />
              {chart.yKeys.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[i % colors.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        {chart.type === "area" && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart.data} margin={{ top: 4, right: 4, bottom: 8, left: 0 }}>
              <defs>
                {chart.yKeys.map((key, i) => (
                  <linearGradient key={key} id={`grad-${key}-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
              <XAxis
                dataKey={chart.xKey}
                tick={{ fontSize: 9, fontFamily: "DM Sans", fill: "hsl(215 16% 47%)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatTick(v, chart.format)}
                tick={{ fontSize: 9, fontFamily: "DM Sans", fill: "hsl(215 16% 47%)" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip format={chart.format} />} />
              {chart.yKeys.length > 1 && (
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: "DM Sans" }} />
              )}
              {chart.yKeys.map((key, i) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[i % colors.length]}
                  strokeWidth={2}
                  fill={`url(#grad-${key}-${chart.id})`}
                  dot={false}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}

        {(chart.type === "pie" || chart.type === "donut") && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chart.data}
                dataKey={chart.yKeys[0]}
                nameKey={chart.xKey}
                cx="50%"
                cy="50%"
                innerRadius={chart.type === "donut" ? "50%" : "0%"}
                outerRadius="70%"
                paddingAngle={2}
              >
                {chart.data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip format={chart.format} />} />
              <Legend wrapperStyle={{ fontSize: 9, fontFamily: "DM Sans" }} iconType="circle" iconSize={7} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {chart.insight && (
        <div className="flex items-start gap-1.5 border-t border-border pt-2">
          <span className="text-[10px]">💡</span>
          <p className="text-[10px] sm:text-[11px] text-primary font-medium leading-snug">
            {chart.insight}
          </p>
        </div>
      )}
    </motion.div>
  );
}
