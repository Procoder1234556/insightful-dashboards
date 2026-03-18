import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ChartSpec } from "@/lib/dashboardEngine";

interface StatCardProps {
  chart: ChartSpec;
  delay?: number;
}

function formatValue(value: number, format?: ChartSpec["format"]): string {
  if (format === "currency") {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toLocaleString()}`;
  }
  if (format === "percent") return `${value.toFixed(1)}%`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export function StatCard({ chart, delay = 0 }: StatCardProps) {
  const raw = chart.data[0];
  const value = Number(raw?.["value"] ?? 0);
  const label = chart.insight ?? String(raw?.["label"] ?? "");
  const trend = chart.trend;

  const isPositive = trend && trend.value > 0;
  const isNegative = trend && trend.value < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay, ease: [0.16, 1, 0.3, 1] }}
      className="surface-raised p-3 sm:p-5 flex flex-col gap-2 sm:gap-3 h-full"
    >
      <p className="text-xs font-body font-medium text-muted-foreground leading-tight">{chart.title}</p>

      {label && !chart.format ? (
        <div className="flex-1 flex items-center">
          <span className="text-lg sm:text-2xl font-display font-bold text-foreground leading-none">{label}</span>
        </div>
      ) : (
        <div className="flex-1 flex items-end">
          <span className="text-2xl sm:text-3xl font-display font-bold text-foreground leading-none tabular-nums">
            {formatValue(value, chart.format)}
          </span>
        </div>
      )}

      {trend && (
        <div className={`flex items-center gap-1.5 text-xs font-medium ${isPositive ? "stat-up" : isNegative ? "stat-down" : "text-muted-foreground"}`}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : isNegative ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          <span>{isPositive ? "+" : ""}{trend.value.toFixed(1)}% {trend.label}</span>
        </div>
      )}

      {chart.insight && chart.format && (
        <p className="text-xs text-muted-foreground leading-snug">{chart.insight}</p>
      )}
    </motion.div>
  );
}
