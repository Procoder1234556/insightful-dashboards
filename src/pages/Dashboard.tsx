import { useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CommandBar } from "@/components/CommandBar";
import { DataSidebar } from "@/components/DataSidebar";
import { DashboardGrid } from "@/components/DashboardGrid";
import { DashboardSkeleton } from "@/components/charts/ChartSkeleton";
import { generateDashboard, type DashboardSpec } from "@/lib/dashboardEngine";
import { getDefaultDataset, type Dataset } from "@/lib/sampleData";
import { LayoutDashboard, Menu, Sparkles, Database, History } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"home" | "data" | "history">("home");
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const handleQuery = useCallback(async (query: string) => {
    setIsLoading(true);
    setMobileSidebarOpen(false);
    setMobileTab("home");

    setQueryHistory(prev => [
      { id: Math.random().toString(36).slice(2), query, timestamp: new Date() },
      ...prev,
    ]);

    const delay = 300 + Math.random() * 300;
    await new Promise(r => setTimeout(r, delay));

    try {
      const spec = generateDashboard(query, dataset);
      setCurrentSpec(spec);
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

  /* ─── MOBILE LAYOUT ─────────────────────────────────────────── */
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-background overflow-hidden">

        {/* Mobile Top Bar */}
        <header className="flex items-center gap-3 px-4 pt-4 pb-3 bg-background flex-shrink-0 safe-top">
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-glow">
              <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-display font-bold text-foreground text-[15px] leading-none block">InsightFlow AI</span>
              <span className="text-[10px] text-muted-foreground font-body mt-0.5 block truncate max-w-[140px]">{dataset.name}</span>
            </div>
          </div>
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted text-muted-foreground active:bg-muted/70 transition-colors"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
        </header>

        {/* Mobile Content Tabs */}
        {queryHistory.length > 0 && (
          <div className="flex gap-1.5 px-4 pb-3 flex-shrink-0">
            {(["home", "history"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setMobileTab(tab)}
                className={[
                  "px-3 py-1 rounded-full text-xs font-medium font-body capitalize transition-all",
                  mobileTab === tab
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground"
                ].join(" ")}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Mobile Scrollable Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-4 pb-2">
          <AnimatePresence mode="wait">
            {/* History Tab */}
            {mobileTab === "history" && queryHistory.length > 0 ? (
              <motion.div key="history" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-2 py-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Recent Queries</p>
                {queryHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { handleHistorySelect(item.query); setMobileTab("home"); }}
                    className="w-full text-left p-3.5 rounded-2xl bg-card border border-border active:bg-muted/60 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground font-medium leading-snug line-clamp-2">{item.query}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {Math.floor((Date.now() - item.timestamp.getTime()) / 60000) < 1
                            ? "just now"
                            : `${Math.floor((Date.now() - item.timestamp.getTime()) / 60000)}m ago`}
                        </p>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] text-muted-foreground">↗</span>
                      </div>
                    </div>
                  </button>
                ))}
              </motion.div>
            ) : isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-2">
                <DashboardSkeleton />
              </motion.div>
            ) : currentSpec ? (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-2">
                <DashboardGrid spec={currentSpec} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center py-8"
              >
                {/* AI orb */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
                    <Sparkles className="w-9 h-9 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent border-2 border-background animate-pulse" />
                </div>

                <h2 className="font-display font-bold text-xl text-foreground mb-2">Ask your first question</h2>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
                  Type a business question below to instantly generate an interactive dashboard.
                </p>

                {/* Quick action cards */}
                <div className="w-full space-y-2">
                  {[
                    { emoji: "📊", label: "Revenue by region", q: "Show me monthly sales revenue for Q3 broken down by region" },
                    { emoji: "🏆", label: "Top products", q: "Which are the top-performing products by revenue this year?" },
                    { emoji: "👥", label: "Customer segments", q: "Analyze customer segments by deal size and churn rate" },
                    { emoji: "📈", label: "Growth trends", q: "Show revenue trend across all months with regional breakdown" },
                  ].map(({ emoji, label, q }) => (
                    <button
                      key={label}
                      onClick={() => handleQuery(q)}
                      className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border active:bg-muted/50 transition-all text-left group"
                    >
                      <span className="text-xl flex-shrink-0">{emoji}</span>
                      <span className="text-sm font-medium text-foreground font-body">{label}</span>
                      <span className="ml-auto text-muted-foreground group-active:translate-x-0.5 transition-transform">→</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Command Bar */}
        <div className="flex-shrink-0 px-3 pt-2 pb-3 bg-background/95 backdrop-blur-md border-t border-border safe-bottom">
          <CommandBar onSubmit={handleQuery} isLoading={isLoading} />
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-30 bg-black/50"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}
        </AnimatePresence>
        <DataSidebar
          dataset={dataset}
          queryHistory={queryHistory}
          onDatasetChange={setDataset}
          onHistorySelect={handleHistorySelect}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
      </div>
    );
  }

  /* ─── DESKTOP LAYOUT ────────────────────────────────────────── */
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DataSidebar
        dataset={dataset}
        queryHistory={queryHistory}
        onDatasetChange={setDataset}
        onHistorySelect={handleHistorySelect}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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

        <div ref={contentRef} className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
                <DashboardSkeleton />
              </motion.div>
            ) : currentSpec ? (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
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
                <div className="grid grid-cols-2 gap-2 mt-5 w-full max-w-lg">
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
                      <span className="text-xs text-muted-foreground font-body leading-snug">{label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-shrink-0 py-4 bg-background/80 backdrop-blur-md border-t border-border">
          <CommandBar onSubmit={handleQuery} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
