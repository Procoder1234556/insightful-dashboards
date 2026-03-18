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
        className="surface-raised p-4 sm:p-6 flex items-start gap-4"
      >
        <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground">Cannot Answer This Query</h3>
          <p className="text-sm text-muted-foreground mt-1">{spec.cannotAnswerReason}</p>
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
        className="space-y-3 sm:space-y-4 w-full"
      >
        {/* Summary Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-start gap-3"
        >
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-foreground text-base sm:text-lg leading-tight">{spec.title}</h2>
            <p
              className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: spec.summary.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>'),
              }}
            />
          </div>
        </motion.div>

        {/* Stat Cards Row */}
        {statCharts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {statCharts.map((chart, i) => (
              <StatCard key={chart.id} chart={chart} delay={i * 0.05} />
            ))}
          </div>
        )}

        {/* Main Charts — mobile-first single col, scales up */}
        {dataCharts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 auto-rows-[minmax(200px,auto)]">
            {dataCharts.map((chart, i) => {
              const cs = responsiveColSpan(chart.size.cols);
              const rs = rowSpan(chart.size.rows);
              return (
                <div
                  key={chart.id}
                  className={[cs, rs, "min-h-0"].filter(Boolean).join(" ")}
                  style={{ minHeight: chart.size.rows >= 2 ? 240 : 160 }}
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
