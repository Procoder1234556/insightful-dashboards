import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowUp, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const EXAMPLE_QUERIES = [
  "Show me monthly sales revenue for Q3 broken down by region",
  "Which are the top-performing products by revenue this year?",
  "Analyze customer segments by deal size and churn rate",
  "Show revenue trend across all months with regional breakdown",
];

interface CommandBarProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
}

export function CommandBar({ onSubmit, isLoading }: CommandBarProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  const handleSubmit = useCallback(() => {
    const q = value.trim();
    if (!q || isLoading) return;
    onSubmit(q);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, isLoading, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleExample = (example: string) => {
    setValue(example);
    textareaRef.current?.focus();
  };

  /* ── MOBILE ── */
  if (isMobile) {
    return (
      <div className="w-full">
        {/* Chips — only when idle and empty */}
        <AnimatePresence>
          {!isLoading && value === "" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1"
              style={{ scrollbarWidth: "none" }}
            >
              {EXAMPLE_QUERIES.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleExample(q)}
                  className="flex-shrink-0 text-[10px] px-2.5 py-1.5 rounded-full bg-muted border border-border text-muted-foreground active:bg-primary/10 active:text-primary active:border-primary/30 transition-all font-body whitespace-nowrap"
                >
                  {q.length > 32 ? q.slice(0, 32) + "…" : q}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input row */}
        <motion.div
          animate={
            focused
              ? { boxShadow: "0 0 0 2px hsl(239 84% 67% / 0.35)" }
              : { boxShadow: "0 1px 6px hsl(222 47% 11% / 0.08)" }
          }
          transition={{ duration: 0.15 }}
          className="flex items-center gap-2 bg-card border border-border rounded-2xl px-3 py-2.5"
        >
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${focused || value ? "bg-primary/10" : "bg-muted"}`}>
            {isLoading
              ? <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
              : <Sparkles className={`w-3.5 h-3.5 transition-colors ${focused || value ? "text-primary" : "text-muted-foreground"}`} />
            }
          </div>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Ask about your data…"
            className="flex-1 resize-none bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground outline-none min-h-[24px] max-h-[80px] leading-relaxed"
            rows={1}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 80) + "px";
            }}
            disabled={isLoading}
          />

          <button
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            className={[
              "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
              value.trim() && !isLoading
                ? "bg-primary text-primary-foreground shadow-glow active:scale-95 pulse-active"
                : "bg-muted text-muted-foreground",
            ].join(" ")}
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    );
  }

  /* ── DESKTOP ── */
  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <AnimatePresence>
        {!isLoading && value === "" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="flex flex-wrap gap-2 justify-center mb-3"
          >
            {EXAMPLE_QUERIES.map((q, i) => (
              <button
                key={i}
                onClick={() => handleExample(q)}
                className="text-xs px-3 py-1.5 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all font-body"
              >
                {q.length > 48 ? q.slice(0, 48) + "…" : q}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={focused ? { boxShadow: "0 0 0 2px hsl(239 84% 67% / 0.3), var(--shadow-lg)" } : { boxShadow: "var(--shadow-md)" }}
        transition={{ duration: 0.15 }}
        className="relative bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="flex items-end gap-2 p-3 pr-12">
          <div className="flex-shrink-0 mt-1">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${focused || value ? "bg-primary/10" : "bg-muted"}`}>
              <Sparkles className={`w-3.5 h-3.5 transition-colors ${focused || value ? "text-primary" : "text-muted-foreground"}`} />
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder='Ask anything about your data… e.g. "Show Q3 sales by region"'
            className="flex-1 resize-none bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground outline-none min-h-[42px] max-h-[120px] leading-relaxed py-1"
            rows={1}
            style={{ height: "auto", overflowY: "hidden" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          className={[
            "absolute right-3 bottom-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all",
            value.trim() && !isLoading
              ? "bg-primary text-primary-foreground shadow-glow hover:opacity-90 active:scale-95 pulse-active"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          ].join(" ")}
        >
          {isLoading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <ArrowUp className="w-3.5 h-3.5" />
          }
        </button>
      </motion.div>

      <p className="text-center text-xs text-muted-foreground mt-2 font-body">
        Press <kbd className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">Enter</kbd> to generate ·{" "}
        <kbd className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
