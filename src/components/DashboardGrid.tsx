import { AnimatePresence, motion } from "framer-motion";
import type { DashboardSpec } from "@/lib/dashboardEngine";
import { ChartRenderer } from "./charts/ChartRenderer";
import { StatCard } from "./charts/StatCard";
import { AlertTriangle, Sparkles } from "lucide-react";

interface DashboardGridProps {
  spec: DashboardSpec;
}

// Grid column span mapping
function colSpan(cols: number): string {
  switch (cols) {
    case 1: return "col-span-1";
    case 2: return "col-span-2";
    case 3: return "col-span-3";
    case 4: return "col-span-4";
    default: return "col-span-2";
  }
}

function rowSpan(rows: number): string {
  switch (rows) {
    case 1: return "";
    case 2: return "row-span-2";
    default: return "";
  }
}

export function DashboardGrid({ spec }: DashboardGridProps) {
  if (spec.cannotAnswer) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-raised p-6 flex items-start gap-4"
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
        className="space-y-4 w-full"
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
            <h2 className="font-display font-bold text-foreground text-lg leading-tight">{spec.title}</h2>
            <p
              className="text-sm text-muted-foreground mt-1 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: spec.summary.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>'),
              }}
            />
          </div>
        </motion.div>

        {/* Stat Cards Row */}
        {statCharts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statCharts.map((chart, i) => (
              <StatCard key={chart.id} chart={chart} delay={i * 0.05} />
            ))}
          </div>
        )}

        {/* Main Charts Bento Grid */}
        {dataCharts.length > 0 && (
          <div className="grid grid-cols-4 gap-3 auto-rows-[minmax(220px,auto)]">
            {dataCharts.map((chart, i) => {
              const cs = colSpan(Math.min(chart.size.cols, 4));
              const rs = rowSpan(chart.size.rows);
              return (
                <div
                  key={chart.id}
                  className={[
                    cs, rs,
                    "min-h-0",
                    // Responsive: collapse to full width on mobile
                    chart.size.cols >= 3 ? "col-span-4 md:col-span-3" : "",
                    chart.size.cols === 2 ? "col-span-4 md:col-span-2" : "",
                    chart.size.cols === 1 ? "col-span-2 md:col-span-1" : "",
                  ].filter(Boolean).join(" ")}
                  style={{ minHeight: chart.size.rows >= 2 ? 260 : 180 }}
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
