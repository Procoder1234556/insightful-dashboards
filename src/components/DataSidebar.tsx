import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Database, History, X, ChevronLeft, ChevronRight, FileText, Clock } from "lucide-react";
import { parseCSV } from "@/lib/csvParser";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Dataset } from "@/lib/sampleData";

interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
}

interface DataSidebarProps {
  dataset: Dataset;
  queryHistory: QueryHistoryItem[];
  onDatasetChange: (dataset: Dataset) => void;
  onHistorySelect: (query: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function DataSidebar({
  dataset,
  queryHistory,
  onDatasetChange,
  onHistorySelect,
  mobileOpen = false,
  onMobileClose,
}: DataSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const parsed = await parseCSV(file);
      onDatasetChange(parsed);
      onMobileClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CSV");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const sidebarContent = (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
      {/* Active Dataset */}
      <div>
        <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Database className="w-3 h-3" /> Data Source
        </p>
        <div className="bg-sidebar-accent rounded-lg p-3 border border-sidebar-border">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{dataset.name}</p>
              <p className="text-xs text-sidebar-foreground/50 mt-0.5">
                {dataset.rows.length.toLocaleString()} rows · {dataset.columns.length} cols
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {dataset.columns.slice(0, 4).map(col => (
                  <span key={col} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono">
                    {col}
                  </span>
                ))}
                {dataset.columns.length > 4 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-foreground/50">
                    +{dataset.columns.length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload CSV */}
      <div>
        <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Upload className="w-3 h-3" /> Upload Data
        </p>
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-sidebar-border text-sidebar-foreground/50 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-medium"
        >
          {uploading ? <span className="animate-spin">⟳</span> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? "Parsing CSV…" : "Upload CSV file"}
        </button>
        {error && (
          <div className="flex items-start gap-1.5 mt-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
            <X className="w-3 h-3 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}
        <p className="text-xs text-sidebar-foreground/40 mt-2 leading-relaxed">
          Upload any CSV to start querying your own data instantly.
        </p>
      </div>

      {/* Query History */}
      {queryHistory.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <History className="w-3 h-3" /> Recent Queries
          </p>
          <div className="space-y-1">
            <AnimatePresence initial={false}>
              {queryHistory.slice(0, 8).map((item) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  onClick={() => {
                    onHistorySelect(item.query);
                    onMobileClose?.();
                  }}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-sidebar-accent transition-colors group"
                >
                  <div className="flex items-start gap-2">
                    <Clock className="w-3 h-3 text-sidebar-foreground/30 flex-shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-sidebar-foreground/70 group-hover:text-sidebar-foreground transition-colors leading-snug line-clamp-2">
                        {item.query}
                      </p>
                      <p className="text-[10px] text-sidebar-foreground/30 mt-1">{timeAgo(item.timestamp)}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );

  /* ── MOBILE: full off-canvas drawer ── */
  if (isMobile) {
    return (
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 left-0 z-40 w-72 flex flex-col bg-sidebar border-r border-sidebar-border shadow-2xl"
          >
            {/* Mobile header */}
            <div className="flex items-center justify-between px-3 py-4 border-b border-sidebar-border">
              <span className="text-xs font-display font-semibold text-sidebar-foreground/60 uppercase tracking-widest">
                InsightFlow
              </span>
              <button
                onClick={onMobileClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    );
  }

  /* ── DESKTOP: collapsible sidebar ── */
  return (
    <motion.aside
      animate={{ width: collapsed ? 48 : 260 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="flex-shrink-0 h-full flex flex-col bg-sidebar border-r border-sidebar-border overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-xs font-display font-semibold text-sidebar-foreground/60 uppercase tracking-widest">
            InsightFlow
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && sidebarContent}

      {collapsed && (
        <div className="flex flex-col items-center gap-4 py-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sidebar-foreground/50 hover:text-primary hover:bg-sidebar-accent transition-colors"
            title="Upload CSV"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          {queryHistory.length > 0 && (
            <button
              onClick={() => setCollapsed(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sidebar-foreground/50 hover:text-primary hover:bg-sidebar-accent transition-colors"
              title={`${queryHistory.length} recent queries`}
            >
              <History className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </motion.aside>
  );
}
