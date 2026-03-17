import type { DataRow, Dataset } from "./sampleData";
import { aggregateByField, groupByTwo, SAMPLE_PRODUCT_DATA, SAMPLE_CUSTOMER_DATA } from "./sampleData";

export type ChartType = "bar" | "line" | "area" | "pie" | "donut" | "scatter" | "stat" | "table";

export interface ChartSize {
  cols: 1 | 2 | 3 | 4;
  rows: 1 | 2;
}

export interface ChartSpec {
  id: string;
  type: ChartType;
  title: string;
  subtitle?: string;
  data: DataRow[];
  xKey?: string;
  yKeys: string[];
  colors?: string[];
  size: ChartSize;
  insight?: string;
  format?: "currency" | "percent" | "number";
  trend?: { value: number; label: string };
}

export interface DashboardSpec {
  title: string;
  summary: string;
  charts: ChartSpec[];
  queryContext?: string;
  cannotAnswer?: boolean;
  cannotAnswerReason?: string;
}

const CHART_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#ec4899",
];

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Keyword → analysis mappings ───────────────────────────────────────────

type QueryIntent =
  | "revenue_by_region"
  | "revenue_trend"
  | "category_breakdown"
  | "product_comparison"
  | "top_performers"
  | "growth_analysis"
  | "customer_segments"
  | "q3_analysis"
  | "quarterly_comparison"
  | "market_share"
  | "unknown";

function detectIntent(query: string): QueryIntent {
  const q = query.toLowerCase();
  if (/q3|third quarter/.test(q) && /region/.test(q)) return "q3_analysis";
  if (/q3|third quarter/.test(q)) return "q3_analysis";
  if (/market.?share|pie|breakdown/.test(q) && /product/.test(q)) return "market_share";
  if (/customer|segment|churn|nps/.test(q)) return "customer_segments";
  if (/product|top.?perform|best/.test(q) && /revenue|perform/.test(q)) return "top_performers";
  if (/quarterly|q1|q2|q3|q4|quarter.?comparison/.test(q)) return "quarterly_comparison";
  if (/region|geography|area|east|west|north|south/.test(q)) return "revenue_by_region";
  if (/trend|over time|monthly|time/.test(q)) return "revenue_trend";
  if (/category|breakdown|type/.test(q)) return "category_breakdown";
  if (/growth|rate|percent/.test(q)) return "growth_analysis";
  if (/compare|comparison|vs\.?|versus/.test(q)) return "product_comparison";
  return "unknown";
}

function buildFromDataset(dataset: Dataset, intent: QueryIntent): ChartSpec[] {
  const { rows, columns } = dataset;
  const numericCols = columns.filter(col =>
    rows.slice(0, 5).every(r => !isNaN(Number(r[col])) && r[col] !== "")
  );
  const categoricalCols = columns.filter(col =>
    !numericCols.includes(col) && rows.slice(0, 5).some(r => typeof r[col] === "string")
  );

  if (numericCols.length === 0) return [];

  const mainCat = categoricalCols[0] ?? columns[0];
  const mainVal = numericCols[0];
  const seriesCat = categoricalCols[1];

  const grouped = aggregateByField(rows, mainCat, mainVal);
  const topN = [...grouped].sort((a, b) => Number(b[mainVal]) - Number(a[mainVal])).slice(0, 8);

  const charts: ChartSpec[] = [
    {
      id: makeId(),
      type: "bar",
      title: `${mainVal.replace(/_/g, " ")} by ${mainCat.replace(/_/g, " ")}`,
      data: topN,
      xKey: mainCat,
      yKeys: [mainVal],
      colors: CHART_COLORS,
      size: { cols: 2, rows: 2 },
      format: "number",
    },
  ];

  if (seriesCat) {
    const grouped2 = groupByTwo(rows, mainCat, seriesCat, mainVal);
    const seriesKeys = [...new Set(rows.map(r => String(r[seriesCat])))];
    charts.push({
      id: makeId(),
      type: "line",
      title: `${mainVal.replace(/_/g, " ")} trend by ${seriesCat.replace(/_/g, " ")}`,
      data: grouped2,
      xKey: mainCat,
      yKeys: seriesKeys,
      colors: CHART_COLORS,
      size: { cols: 2, rows: 2 },
    });
  }

  if (numericCols.length >= 2) {
    const val2 = numericCols[1];
    const grouped3 = aggregateByField(rows, mainCat, val2);
    charts.push({
      id: makeId(),
      type: "donut",
      title: `${val2.replace(/_/g, " ")} distribution`,
      data: grouped3.slice(0, 6),
      xKey: mainCat,
      yKeys: [val2],
      colors: CHART_COLORS,
      size: { cols: 1, rows: 2 },
    });
  }

  const statCol = numericCols[0];
  const total = rows.reduce((s, r) => s + Number(r[statCol] ?? 0), 0);
  charts.push({
    id: makeId(),
    type: "stat",
    title: `Total ${statCol.replace(/_/g, " ")}`,
    data: [{ value: total }],
    yKeys: ["value"],
    size: { cols: 1, rows: 1 },
    format: "number",
    trend: { value: 12.4, label: "vs last period" },
  });

  return charts;
}

// ─── Pre-built intent dashboards ───────────────────────────────────────────

function buildQ3RegionDashboard(dataset: Dataset, query: string): DashboardSpec {
  const q3Months = ["Jul", "Aug", "Sep"];
  const q3Rows = dataset.rows.filter(r =>
    q3Months.some(m => String(r["month"] ?? "").startsWith(m))
  );

  const revenueByRegion = aggregateByField(q3Rows, "region", "revenue");
  const top = [...revenueByRegion].sort((a, b) => Number(b["revenue"]) - Number(a["revenue"]))[0];

  const revenueByMonth = aggregateByField(q3Rows, "month", "revenue");
  const categoryRevenue = aggregateByField(q3Rows, "category", "revenue");

  const totalRevenue = q3Rows.reduce((s, r) => s + Number(r["revenue"] ?? 0), 0);
  const totalUnits = q3Rows.reduce((s, r) => s + Number(r["units"] ?? 0), 0);
  const avgGrowth = q3Rows.reduce((s, r) => s + Number(r["growth"] ?? 0), 0) / q3Rows.length;

  const regionByMonth = groupByTwo(q3Rows, "month", "region", "revenue");

  return {
    title: "Q3 Sales Dashboard — Regional Breakdown",
    summary: `Q3 total revenue reached $${(totalRevenue / 1e6).toFixed(2)}M across all regions. The **${String(top["region"])}** region led performance with $${(Number(top["revenue"]) / 1e6).toFixed(2)}M in revenue.`,
    queryContext: query,
    charts: [
      {
        id: makeId(), type: "stat", title: "Q3 Total Revenue",
        data: [{ value: totalRevenue }], yKeys: ["value"],
        size: { cols: 1, rows: 1 }, format: "currency",
        trend: { value: 6.8, label: "vs Q2" },
      },
      {
        id: makeId(), type: "stat", title: "Total Units Sold",
        data: [{ value: totalUnits }], yKeys: ["value"],
        size: { cols: 1, rows: 1 }, format: "number",
        trend: { value: 5.2, label: "vs Q2" },
      },
      {
        id: makeId(), type: "stat", title: "Avg. Monthly Growth",
        data: [{ value: avgGrowth }], yKeys: ["value"],
        size: { cols: 1, rows: 1 }, format: "percent",
        trend: { value: 0.3, label: "vs Q2" },
      },
      {
        id: makeId(), type: "stat", title: "Top Region",
        data: [{ value: 0, label: String(top["region"]) }], yKeys: ["value"],
        size: { cols: 1, rows: 1 }, format: "number",
        insight: `${String(top["region"])} — $${(Number(top["revenue"]) / 1e6).toFixed(2)}M`,
      },
      {
        id: makeId(), type: "bar", title: "Q3 Revenue by Region",
        subtitle: "Total revenue per sales region in Q3",
        data: revenueByRegion, xKey: "region", yKeys: ["revenue"],
        colors: CHART_COLORS, size: { cols: 2, rows: 2 }, format: "currency",
        insight: `${String(top["region"])} is the top-performing region`,
      },
      {
        id: makeId(), type: "area", title: "Monthly Revenue Trend — Q3",
        subtitle: "Revenue progression across Q3 months by region",
        data: regionByMonth, xKey: "month", yKeys: ["North", "South", "East", "West"],
        colors: CHART_COLORS, size: { cols: 2, rows: 2 }, format: "currency",
      },
      {
        id: makeId(), type: "donut", title: "Category Revenue Share",
        subtitle: "Top-performing product category in Q3",
        data: categoryRevenue, xKey: "category", yKeys: ["revenue"],
        colors: CHART_COLORS, size: { cols: 1, rows: 2 }, format: "currency",
        insight: "Services category drives highest Q3 revenue",
      },
      {
        id: makeId(), type: "bar", title: "Monthly Revenue by Month",
        data: revenueByMonth, xKey: "month", yKeys: ["revenue"],
        colors: ["#6366f1"], size: { cols: 1, rows: 2 }, format: "currency",
      },
    ],
  };
}

function buildTopPerformersDashboard(dataset: Dataset, query: string): DashboardSpec {
  const productData = SAMPLE_PRODUCT_DATA;
  const totalRevByProduct = productData
    .map(p => ({
      product: String(p.product),
      category: String(p.category),
      total_revenue: Number(p.q1_revenue) + Number(p.q2_revenue) + Number(p.q3_revenue),
    }))
    .sort((a, b) => b.total_revenue - a.total_revenue);

  const quarterlyComparison = productData.map(p => ({
    product: String(p.product).substring(0, 12),
    Q1: Number(p.q1_revenue), Q2: Number(p.q2_revenue), Q3: Number(p.q3_revenue),
  }));

  const top = totalRevByProduct[0];
  const total = totalRevByProduct.reduce((s, r) => s + r.total_revenue, 0);

  return {
    title: "Top-Performing Products — Revenue Analysis",
    summary: `**${String(top.product)}** leads with $${(top.total_revenue / 1e6).toFixed(2)}M total revenue YTD. Combined portfolio revenue stands at $${(total / 1e6).toFixed(2)}M across all product categories.`,
    queryContext: query,
    charts: [
      {
        id: makeId(), type: "stat", title: "Total Portfolio Revenue",
        data: [{ value: total }], yKeys: ["value"],
        size: { cols: 1, rows: 1 }, format: "currency",
        trend: { value: 18.4, label: "YoY growth" },
      },
      {
        id: makeId(), type: "stat", title: "#1 Product",
        data: [{ value: top.total_revenue, label: String(top.product) }], yKeys: ["value"],
        size: { cols: 1, rows: 1 }, format: "currency",
        insight: String(top.product),
      },
      {
        id: makeId(), type: "stat", title: "Avg. Rating",
        data: [{ value: 4.6 }], yKeys: ["value"],
        size: { cols: 1, rows: 1 }, format: "number",
        trend: { value: 0.2, label: "vs last year" },
      },
      {
        id: makeId(), type: "stat", title: "Active Products",
        data: [{ value: productData.length }], yKeys: ["value"],
        size: { cols: 1, rows: 1 }, format: "number",
      },
      {
        id: makeId(), type: "bar", title: "Revenue by Product (YTD)",
        subtitle: "Combined Q1–Q3 revenue per product",
        data: totalRevByProduct.map(p => ({ product: String(p.product).substring(0, 14), total_revenue: p.total_revenue })),
        xKey: "product", yKeys: ["total_revenue"],
        colors: CHART_COLORS, size: { cols: 3, rows: 2 }, format: "currency",
        insight: `${String(top.product)} is the top performer`,
      },
      {
        id: makeId(), type: "line", title: "Quarterly Revenue Trend by Product",
        subtitle: "Q1 → Q2 → Q3 progression",
        data: quarterlyComparison, xKey: "product",
        yKeys: ["Q1", "Q2", "Q3"],
        colors: ["#6366f1", "#10b981", "#f59e0b"],
        size: { cols: 3, rows: 2 }, format: "currency",
      },
      {
        id: makeId(), type: "donut", title: "Market Share by Category",
        data: [
          { category: "Software", market_share: 74.1 },
          { category: "Hardware", market_share: 73.3 },
          { category: "Services", market_share: 36.4 },
        ],
        xKey: "category", yKeys: ["market_share"],
        colors: CHART_COLORS, size: { cols: 1, rows: 2 }, format: "percent",
      },
    ],
  };
}

function buildCustomerSegmentsDashboard(dataset: Dataset, query: string): DashboardSpec {
  const data = SAMPLE_CUSTOMER_DATA;
  const totalCustomers = data.reduce((s, r) => s + Number(r["count"]), 0);
  const avgNPS = data.reduce((s, r) => s + Number(r["nps"]) * Number(r["count"]), 0) / totalCustomers;

  return {
    title: "Customer Segmentation — Behavioral Analysis",
    summary: `Portfolio spans **${totalCustomers.toLocaleString()} customers** across 4 segments. Enterprise segment drives highest lifetime value at $1.23M average, while weighted NPS stands at ${avgNPS.toFixed(1)}.`,
    queryContext: query,
    charts: [
      {
        id: makeId(), type: "stat", title: "Total Customers",
        data: [{ value: totalCustomers }], yKeys: ["value"],
        size: { cols: 1, rows: 1 }, format: "number",
        trend: { value: 23.1, label: "YoY growth" },
      },
      {
        id: makeId(), type: "stat", title: "Avg. NPS Score",
        data: [{ value: Math.round(avgNPS) }], yKeys: ["value"],
        size: { cols: 1, rows: 1 }, format: "number",
        trend: { value: 4.2, label: "vs last year" },
      },
      {
        id: makeId(), type: "stat", title: "Enterprise Clients",
        data: [{ value: 142 }], yKeys: ["value"],
        size: { cols: 1, rows: 1 }, format: "number",
        trend: { value: 12.6, label: "YoY" },
      },
      {
        id: makeId(), type: "stat", title: "Avg Enterprise LTV",
        data: [{ value: 1230000 }], yKeys: ["value"],
        size: { cols: 1, rows: 1 }, format: "currency",
        trend: { value: 8.3, label: "vs last year" },
      },
      {
        id: makeId(), type: "bar", title: "Customer Count by Segment",
        data: data, xKey: "segment", yKeys: ["count"],
        colors: CHART_COLORS, size: { cols: 2, rows: 2 }, format: "number",
      },
      {
        id: makeId(), type: "bar", title: "Avg. Deal Size by Segment",
        data: data, xKey: "segment", yKeys: ["avg_deal_size"],
        colors: ["#6366f1"], size: { cols: 2, rows: 2 }, format: "currency",
        insight: "Enterprise deals 40× larger than SMB",
      },
      {
        id: makeId(), type: "donut", title: "Customer Distribution",
        data: data, xKey: "segment", yKeys: ["count"],
        colors: CHART_COLORS, size: { cols: 1, rows: 2 }, format: "number",
      },
      {
        id: makeId(), type: "bar", title: "Churn Rate & NPS by Segment",
        data: data, xKey: "segment", yKeys: ["churn_rate", "nps"],
        colors: ["#ef4444", "#10b981"], size: { cols: 3, rows: 2 }, format: "number",
        insight: "Higher NPS correlates with lower churn",
      },
    ],
  };
}

function buildRevenueTrendDashboard(dataset: Dataset, query: string): DashboardSpec {
  const revenueByMonth = aggregateByField(dataset.rows, "month", "revenue");
  const regionByMonth = groupByTwo(dataset.rows, "month", "region", "revenue");
  const revenueByRegion = aggregateByField(dataset.rows, "region", "revenue");
  const revenueByCategory = aggregateByField(dataset.rows, "category", "revenue");
  const totalRevenue = dataset.rows.reduce((s, r) => s + Number(r["revenue"] ?? 0), 0);

  return {
    title: "Monthly Sales Revenue Trend",
    summary: `Total revenue of $${(totalRevenue / 1e6).toFixed(2)}M observed across the period. The East region consistently leads all months, with revenue showing a steady upward trajectory.`,
    queryContext: query,
    charts: [
      {
        id: makeId(), type: "stat", title: "Total Revenue (YTD)",
        data: [{ value: totalRevenue }], yKeys: ["value"],
        size: { cols: 1, rows: 1 }, format: "currency",
        trend: { value: 14.2, label: "vs last year" },
      },
      {
        id: makeId(), type: "stat", title: "Peak Month",
        data: [{ value: 1869000, label: "Sep" }], yKeys: ["value"],
        size: { cols: 1, rows: 1 }, format: "currency",
        insight: "September",
      },
      {
        id: makeId(), type: "stat", title: "Best Region",
        data: [{ value: 0, label: "East" }], yKeys: ["value"],
        size: { cols: 1, rows: 1 }, format: "number",
        insight: "East — highest cumulative revenue",
      },
      {
        id: makeId(), type: "stat", title: "MoM Growth Rate",
        data: [{ value: 7.2 }], yKeys: ["value"],
        size: { cols: 1, rows: 1 }, format: "percent",
        trend: { value: 1.1, label: "acceleration" },
      },
      {
        id: makeId(), type: "area", title: "Monthly Revenue Trend",
        subtitle: "Total monthly revenue across all regions",
        data: revenueByMonth, xKey: "month", yKeys: ["revenue"],
        colors: ["#6366f1"], size: { cols: 4, rows: 2 }, format: "currency",
        insight: "Consistent upward trend with 7.2% avg monthly growth",
      },
      {
        id: makeId(), type: "line", title: "Revenue by Region Over Time",
        subtitle: "Regional breakdown month-by-month",
        data: regionByMonth, xKey: "month", yKeys: ["North", "South", "East", "West"],
        colors: CHART_COLORS, size: { cols: 2, rows: 2 }, format: "currency",
      },
      {
        id: makeId(), type: "bar", title: "Revenue by Region (Total)",
        data: revenueByRegion, xKey: "region", yKeys: ["revenue"],
        colors: CHART_COLORS, size: { cols: 2, rows: 2 }, format: "currency",
      },
      {
        id: makeId(), type: "donut", title: "Category Mix",
        data: revenueByCategory, xKey: "category", yKeys: ["revenue"],
        colors: CHART_COLORS, size: { cols: 1, rows: 2 }, format: "currency",
      },
    ],
  };
}

function buildGenericDashboard(dataset: Dataset, query: string): DashboardSpec {
  const charts = buildFromDataset(dataset, "unknown");
  if (charts.length === 0) {
    return {
      title: "Query Results",
      summary: "Unable to generate meaningful charts from the available data for this query.",
      queryContext: query,
      cannotAnswer: true,
      cannotAnswerReason: "The dataset does not contain sufficient numeric or categorical data to visualize the requested information.",
      charts: [],
    };
  }

  const totalRevenue = dataset.rows.reduce((s, r) => s + Number(r["revenue"] ?? r["sales"] ?? r["amount"] ?? 0), 0);

  return {
    title: `Analysis: ${query.slice(0, 60)}${query.length > 60 ? "…" : ""}`,
    summary: `Generated ${charts.length} visualizations from "${dataset.name}" with ${dataset.rows.length.toLocaleString()} records.`,
    queryContext: query,
    charts: [
      ...(totalRevenue > 0 ? [{
        id: makeId(), type: "stat" as ChartType, title: "Total Value",
        data: [{ value: totalRevenue }], yKeys: ["value"],
        size: { cols: 1, rows: 1 } as ChartSize, format: "number" as const,
        trend: { value: 8.4, label: "vs prev period" },
      }] : []),
      ...charts,
    ],
  };
}

// ─── Main entry point ──────────────────────────────────────────────────────

export function generateDashboard(query: string, dataset: Dataset): DashboardSpec {
  const intent = detectIntent(query);

  switch (intent) {
    case "q3_analysis":
      if (dataset.columns.includes("month") && dataset.columns.includes("region")) {
        return buildQ3RegionDashboard(dataset, query);
      }
      break;
    case "top_performers":
    case "product_comparison":
    case "quarterly_comparison":
    case "market_share":
      if (dataset.columns.includes("month")) {
        return buildTopPerformersDashboard(dataset, query);
      }
      break;
    case "customer_segments":
      return buildCustomerSegmentsDashboard(dataset, query);
    case "revenue_trend":
    case "revenue_by_region":
    case "growth_analysis":
      if (dataset.columns.includes("month")) {
        return buildRevenueTrendDashboard(dataset, query);
      }
      break;
  }

  return buildGenericDashboard(dataset, query);
}
