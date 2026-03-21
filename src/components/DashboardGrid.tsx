import { AnimatePresence, motion } from "framer-motion";
import type { DashboardSpec } from "@/lib/dashboardEngine";
import { ChartRenderer } from "./charts/ChartRenderer";
import { StatCard } from "./charts/StatCard";
import { AlertTriangle, Sparkles } from "lucide-react";

interface DashboardGridProps {
  spec: DashboardSpec;
}

// Mobile-first responsive col-span classes
function responsiveColSpan(cols: number): string {
  if (cols >= 3) return "col-span-1 sm:col-span-2 lg:col-span-3";
  if (cols === 2) return "col-span-1 sm:col-span-2";
  return "col-span-1";
}

function rowSpan(rows: number): string {
  return rows >= 2 ? "row-span-2" : "";
}

export function DashboardGrid({ spec }: DashboardGridProps) {
  if (spec.cannotAnswer) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-raised p-4 flex items-start gap-4"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground text-sm">Cannot Answer This Query</h3>
          <p className="text-xs text-muted-foreground mt-1">{spec.cannotAnswerReason}</p>
          <p className="text-xs text-muted-foreground mt-2">Try: "Show revenue by region" or "What are the top products by revenue?"</p>
        </div>
      </motion.div>
    );
  }

  const statCharts = spec.charts.filter(c => c.type === "stat");
  const dataCharts = spec.charts.filter(c => c.type !== "stat");

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={spec.title}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-3 w-full"
      >
        {/* Summary Header — mobile card style */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="surface-raised p-3 sm:p-4 flex items-start gap-3"
        >
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-glow">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-foreground text-sm sm:text-base leading-tight">{spec.title}</h2>
            <p
              className="text-xs text-muted-foreground mt-1 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: spec.summary.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>'),
              }}
            />
          </div>
        </motion.div>

        {/* Stat Cards — 2-col on mobile, 4-col on desktop */}
        {statCharts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {statCharts.map((chart, i) => (
              <StatCard key={chart.id} chart={chart} delay={i * 0.05} />
            ))}
          </div>
        )}

        {/* Data Charts — single col mobile, responsive desktop */}
        {dataCharts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 auto-rows-[minmax(180px,auto)]">
            {dataCharts.map((chart, i) => {
              const cs = responsiveColSpan(chart.size.cols);
              const rs = rowSpan(chart.size.rows);
              return (
                <div
                  key={chart.id}
                  className={[cs, rs, "min-h-0"].filter(Boolean).join(" ")}
                  style={{ minHeight: chart.size.rows >= 2 ? 220 : 160 }}
                >
                  <ChartRenderer chart={chart} delay={(statCharts.length + i) * 0.05} />
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
