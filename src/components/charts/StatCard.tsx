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

/* Accent color pairs mapped by card index */
const CARD_ACCENTS = [
  { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary" },
  { bg: "bg-accent/10", text: "text-accent", dot: "bg-accent" },
  { bg: "bg-amber-500/10", text: "text-amber-500", dot: "bg-amber-500" },
  { bg: "bg-rose-500/10", text: "text-rose-500", dot: "bg-rose-500" },
];

export function StatCard({ chart, delay = 0 }: StatCardProps) {
  const raw = chart.data[0];
  const value = Number(raw?.["value"] ?? 0);
  const label = chart.insight ?? String(raw?.["label"] ?? "");
  const trend = chart.trend;

  const isPositive = trend && trend.value > 0;
  const isNegative = trend && trend.value < 0;

  // pick an accent based on the chart id hash
  const accentIdx = (chart.id?.charCodeAt(0) ?? 0) % CARD_ACCENTS.length;
  const accent = CARD_ACCENTS[accentIdx];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay, ease: [0.16, 1, 0.3, 1] }}
      className="surface-raised p-3 sm:p-4 flex flex-col justify-between h-full min-h-[88px] sm:min-h-[100px] overflow-hidden relative"
    >
      {/* Accent dot in corner */}
      <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${accent.dot} opacity-70`} />

      <p className="text-[10px] sm:text-xs font-body font-semibold text-muted-foreground leading-tight uppercase tracking-wide pr-5">
        {chart.title}
      </p>

      <div className="mt-1.5">
        {label && !chart.format ? (
          <span className={`text-base sm:text-lg font-display font-bold leading-none ${accent.text}`}>{label}</span>
        ) : (
          <span className="text-2xl sm:text-3xl font-display font-extrabold text-foreground leading-none tabular-nums">
            {formatValue(value, chart.format)}
          </span>
        )}
      </div>

      {trend && (
        <div
          className={[
            "inline-flex items-center gap-1 mt-2 text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-full w-fit",
            isPositive
              ? "bg-accent/10 text-accent"
              : isNegative
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-muted-foreground",
          ].join(" ")}
        >
          {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          <span>{isPositive ? "+" : ""}{trend.value.toFixed(1)}%</span>
        </div>
      )}
    </motion.div>
  );
}
