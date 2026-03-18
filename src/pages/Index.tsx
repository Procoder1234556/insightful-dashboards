import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, BarChart2, TrendingUp, PieChart, Zap, Upload, MessageSquare } from "lucide-react";
import heroVisual from "@/assets/hero-visual.png";

const ROTATING_PHRASES = [
  "living dashboards",
  "instant insights",
  "real-time charts",
  "data stories",
  "business clarity",
  "smart analytics",
];

const DEMO_QUERIES = [
  "Show Q3 revenue by region and highlight top category",
  "Compare product performance across all quarters",
  "Analyze customer churn by segment",
];

const FEATURES = [
  { icon: Sparkles, title: "Natural Language", desc: "Ask in plain English. No SQL, no dashboards to configure." },
  { icon: BarChart2, title: "Smart Chart Selection", desc: "AI picks the right chart type—bar, line, donut—automatically." },
  { icon: Upload, title: "Your Own Data", desc: "Upload any CSV and start querying it instantly." },
  { icon: MessageSquare, title: "Follow-up Questions", desc: "Refine, filter, and drill down with conversational follow-ups." },
  { icon: TrendingUp, title: "Trend Detection", desc: "Surfaces insights and anomalies without you having to ask." },
  { icon: Zap, title: "Real-time Generation", desc: "Dashboards render in under a second with live chart animations." },
];

export default function Index() {
  const navigate = useNavigate();
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex(i => (i + 1) % ROTATING_PHRASES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-glow">
              <PieChart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground text-lg tracking-tight">InsightFlow<span className="text-primary"> AI</span></span>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shadow-glow"
          >
            Launch App <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(239_84%_67%/0.12),transparent)]" />
        <div className="absolute top-32 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-48 right-1/4 w-56 h-56 bg-accent/5 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
            <Sparkles className="w-3 h-3" /> AI-Powered Business Intelligence
          </div>

          <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-foreground leading-[1.08] tracking-tight mb-6">
            Turn questions into<br />
            <span className="relative inline-block" style={{ minHeight: "1.1em" }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="gradient-text inline-block"
                >
                  {ROTATING_PHRASES[phraseIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10 font-body">
            Ask any business question in plain English. InsightFlow AI queries your data, selects the optimal chart types, and renders a fully interactive dashboard in real-time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-glow"
            >
              <Sparkles className="w-4 h-4" /> Generate Your Dashboard
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-border bg-card text-foreground text-sm font-medium hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              View Demo <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative max-w-5xl mx-auto mt-16"
        >
          <div className="surface-raised overflow-hidden rounded-2xl shadow-lg border border-border">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-background rounded-md px-3 py-1 text-xs text-muted-foreground font-mono max-w-xs">
                  insightflow.ai/dashboard
                </div>
              </div>
            </div>
            <img src={heroVisual} alt="InsightFlow AI dashboard preview" className="w-full object-cover opacity-90" />
            {/* Overlay with mock dashboard UI */}
            <div className="absolute inset-0 top-10 flex items-end justify-center pb-6 pointer-events-none">
              <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg border border-white/20 mx-6">
                <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm font-body text-foreground/80 italic">
                  "Show Q3 revenue broken down by region and highlight the top category..."
                </span>
                <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* Glow under preview */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-primary/15 blur-2xl rounded-full" />
        </motion.div>
      </section>

      {/* Example queries ticker */}
      <section className="py-8 px-6 border-y border-border bg-muted/30 overflow-hidden">
        <div className="flex items-center gap-3 max-w-6xl mx-auto">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex-shrink-0">Try asking:</span>
          <div className="flex gap-3 flex-wrap">
            {DEMO_QUERIES.map((q, i) => (
              <span key={i} className="text-sm text-muted-foreground font-body px-3 py-1 rounded-full bg-background border border-border">
                "{q}"
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display font-bold text-4xl text-foreground mb-4">Built for the boardroom</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto font-body">
              Every feature designed for non-technical executives who need answers, not training.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="surface-raised p-5 group hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-base mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="surface-raised p-10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_120%,hsl(239_84%_67%/0.12),transparent)]" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display font-bold text-3xl text-foreground mb-3">Ready to see your data differently?</h2>
              <p className="text-muted-foreground font-body mb-7">No setup required. Upload a CSV or use our sample dataset to get started in seconds.</p>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-glow mx-auto"
              >
                <Sparkles className="w-4 h-4" /> Start Generating Dashboards
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-border text-center">
        <p className="text-xs text-muted-foreground font-body">
          InsightFlow AI — Intelligent dashboards for non-technical executives
        </p>
      </footer>
    </div>
  );
}
