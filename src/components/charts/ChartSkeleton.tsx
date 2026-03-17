import { motion } from "framer-motion";

export function ChartSkeleton({ type = "bar", large = false }: { type?: "bar" | "line" | "stat" | "pie"; large?: boolean }) {
  return (
    <div className={`surface-raised p-5 flex flex-col gap-3 ${large ? "h-full" : ""}`}>
      {/* Title skeleton */}
      <div className="flex flex-col gap-1.5">
        <div className="skeleton h-3.5 w-2/3 rounded" />
        <div className="skeleton h-2.5 w-1/2 rounded" />
      </div>

      {type === "stat" ? (
        <div className="flex flex-col gap-3">
          <div className="skeleton h-9 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/3 rounded" />
        </div>
      ) : type === "pie" ? (
        <div className="flex items-center justify-center py-4">
          <div className="skeleton rounded-full w-32 h-32" />
        </div>
      ) : type === "line" ? (
        <div className="flex flex-col gap-2 pt-2">
          {/* Y-axis labels */}
          <div className="flex items-end gap-1 h-36">
            <div className="flex flex-col justify-between h-full pr-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-2 w-8 rounded" />
              ))}
            </div>
            {/* Wavy line area */}
            <div className="flex-1 h-full relative">
              <div className="skeleton w-full h-full rounded opacity-30" />
              {/* Fake line */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                <path d="M0,60 C20,50 40,20 60,30 S100,50 120,35 S160,15 200,25" fill="none" stroke="hsl(239 84% 67% / 0.3)" strokeWidth="2" />
              </svg>
            </div>
          </div>
          {/* X-axis */}
          <div className="flex gap-3 pl-12">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-2 w-8 rounded" />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 pt-2">
          {/* Bar chart skeleton */}
          <div className="flex items-end gap-2 h-36">
            <div className="flex flex-col justify-between h-full pr-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-2 w-8 rounded" />
              ))}
            </div>
            {[...Array(6)].map((_, i) => {
              const heights = [70, 45, 90, 55, 80, 35];
              return (
                <div key={i} className="flex-1 flex items-end">
                  <div
                    className="skeleton w-full rounded-sm"
                    style={{ height: `${heights[i % heights.length]}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 pl-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-2 flex-1 rounded" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full space-y-4"
    >
      {/* Title bar skeleton */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="skeleton h-6 w-72 rounded" />
        <div className="skeleton h-4 w-[480px] max-w-full rounded" />
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <ChartSkeleton key={i} type="stat" />
        ))}
      </div>

      {/* Chart row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-4 md:col-span-2">
          <ChartSkeleton type="bar" large />
        </div>
        <div className="col-span-4 md:col-span-2">
          <ChartSkeleton type="line" large />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-4 md:col-span-3">
          <ChartSkeleton type="bar" large />
        </div>
        <div className="col-span-4 md:col-span-1">
          <ChartSkeleton type="pie" large />
        </div>
      </div>
    </motion.div>
  );
}
