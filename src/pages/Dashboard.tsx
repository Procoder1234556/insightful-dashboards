import { useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CommandBar } from "@/components/CommandBar";
import { DataSidebar } from "@/components/DataSidebar";
import { DashboardGrid } from "@/components/DashboardGrid";
import { DashboardSkeleton } from "@/components/charts/ChartSkeleton";
import { generateDashboard, type DashboardSpec } from "@/lib/dashboardEngine";
import { getDefaultDataset, type Dataset } from "@/lib/sampleData";
import { LayoutDashboard } from "lucide-react";

interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
}

export default function Dashboard() {
  const [dataset, setDataset] = useState<Dataset>(getDefaultDataset());
  const [currentSpec, setCurrentSpec] = useState<DashboardSpec | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleQuery = useCallback(async (query: string) => {
    setIsLoading(true);

    // Add to history
    setQueryHistory(prev => [
      { id: Math.random().toString(36).slice(2), query, timestamp: new Date() },
      ...prev,
    ]);

    // Simulate a brief "thinking" delay (200–600ms) for realism
    const delay = 300 + Math.random() * 300;
    await new Promise(r => setTimeout(r, delay));

    try {
      const spec = generateDashboard(query, dataset);
      setCurrentSpec(spec);
      // Scroll to content
      setTimeout(() => {
        contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    } catch (err) {
      console.error("Dashboard generation error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [dataset]);

  const handleHistorySelect = useCallback((query: string) => {
    handleQuery(query);
  }, [handleQuery]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <DataSidebar
        dataset={dataset}
        queryHistory={queryHistory}
        onDatasetChange={setDataset}
        onHistorySelect={handleHistorySelect}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-6 py-3.5 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground text-base">InsightFlow AI</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-muted-foreground font-body">{dataset.name}</span>
          </div>
        </header>

        {/* Scrollable content area */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                <DashboardSkeleton />
              </motion.div>
            ) : currentSpec ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6"
              >
                <DashboardGrid spec={currentSpec} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-12 min-h-[60vh]"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <LayoutDashboard className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-display font-bold text-xl text-foreground">Ask your first question</h2>
                <p className="text-muted-foreground text-sm mt-2 max-w-sm leading-relaxed">
                  Type a business question below to instantly generate an interactive dashboard. No SQL, no configuration.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-lg w-full">
                  {[
                    { label: "Revenue by region", q: "Show me monthly sales revenue for Q3 broken down by region" },
                    { label: "Top products", q: "Which are the top-performing products by revenue this year?" },
                    { label: "Customer segments", q: "Analyze customer segments by deal size and churn rate" },
                    { label: "Growth trends", q: "Show revenue trend across all months with regional breakdown" },
                  ].map(({ label, q }) => (
                    <button
                      key={label}
                      onClick={() => handleQuery(q)}
                      className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-xs text-muted-foreground font-body">{label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating command bar at bottom */}
        <div className="flex-shrink-0 py-4 bg-background/80 backdrop-blur-md border-t border-border">
          <CommandBar onSubmit={handleQuery} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
