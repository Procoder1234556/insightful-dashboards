// Sample datasets for demo queries
export interface DataRow {
  [key: string]: string | number;
}

export interface Dataset {
  name: string;
  columns: string[];
  rows: DataRow[];
}

export const SAMPLE_SALES_DATA: DataRow[] = [
  { month: "Jan", region: "North", revenue: 245000, units: 1240, category: "Electronics", growth: 8.2 },
  { month: "Jan", region: "South", revenue: 189000, units: 980, category: "Electronics", growth: 5.1 },
  { month: "Jan", region: "East", revenue: 312000, units: 1560, category: "Electronics", growth: 12.3 },
  { month: "Jan", region: "West", revenue: 278000, units: 1390, category: "Electronics", growth: 9.7 },
  { month: "Feb", region: "North", revenue: 267000, units: 1340, category: "Electronics", growth: 9.0 },
  { month: "Feb", region: "South", revenue: 201000, units: 1010, category: "Electronics", growth: 6.3 },
  { month: "Feb", region: "East", revenue: 334000, units: 1670, category: "Electronics", growth: 7.1 },
  { month: "Feb", region: "West", revenue: 295000, units: 1480, category: "Electronics", growth: 6.1 },
  { month: "Mar", region: "North", revenue: 289000, units: 1450, category: "Software", growth: 8.2 },
  { month: "Mar", region: "South", revenue: 224000, units: 1120, category: "Software", growth: 11.4 },
  { month: "Mar", region: "East", revenue: 356000, units: 1780, category: "Software", growth: 6.6 },
  { month: "Mar", region: "West", revenue: 318000, units: 1590, category: "Software", growth: 7.8 },
  { month: "Apr", region: "North", revenue: 310000, units: 1550, category: "Software", growth: 7.3 },
  { month: "Apr", region: "South", revenue: 246000, units: 1230, category: "Software", growth: 9.8 },
  { month: "Apr", region: "East", revenue: 378000, units: 1890, category: "Software", growth: 6.2 },
  { month: "Apr", region: "West", revenue: 341000, units: 1705, category: "Software", growth: 7.2 },
  { month: "May", region: "North", revenue: 334000, units: 1670, category: "Hardware", growth: 7.7 },
  { month: "May", region: "South", revenue: 268000, units: 1340, category: "Hardware", growth: 8.9 },
  { month: "May", region: "East", revenue: 401000, units: 2005, category: "Hardware", growth: 6.1 },
  { month: "May", region: "West", revenue: 362000, units: 1810, category: "Hardware", growth: 6.2 },
  { month: "Jun", region: "North", revenue: 356000, units: 1780, category: "Hardware", growth: 6.6 },
  { month: "Jun", region: "South", revenue: 289000, units: 1445, category: "Hardware", growth: 7.8 },
  { month: "Jun", region: "East", revenue: 423000, units: 2115, category: "Hardware", growth: 5.5 },
  { month: "Jun", region: "West", revenue: 384000, units: 1920, category: "Hardware", growth: 6.1 },
  { month: "Jul", region: "North", revenue: 378000, units: 1890, category: "Services", growth: 6.2 },
  { month: "Jul", region: "South", revenue: 312000, units: 1560, category: "Services", growth: 8.0 },
  { month: "Jul", region: "East", revenue: 445000, units: 2225, category: "Services", growth: 5.2 },
  { month: "Jul", region: "West", revenue: 406000, units: 2030, category: "Services", growth: 5.7 },
  { month: "Aug", region: "North", revenue: 401000, units: 2005, category: "Services", growth: 6.1 },
  { month: "Aug", region: "South", revenue: 334000, units: 1670, category: "Services", growth: 7.1 },
  { month: "Aug", region: "East", revenue: 467000, units: 2335, category: "Services", growth: 4.9 },
  { month: "Aug", region: "West", revenue: 428000, units: 2140, category: "Services", growth: 5.4 },
  { month: "Sep", region: "North", revenue: 423000, units: 2115, category: "Electronics", growth: 5.5 },
  { month: "Sep", region: "South", revenue: 356000, units: 1780, category: "Electronics", growth: 6.6 },
  { month: "Sep", region: "East", revenue: 489000, units: 2445, category: "Electronics", growth: 4.7 },
  { month: "Sep", region: "West", revenue: 451000, units: 2255, category: "Electronics", growth: 5.4 },
];

export const SAMPLE_PRODUCT_DATA: DataRow[] = [
  { product: "CloudSync Pro", category: "Software", q1_revenue: 456000, q2_revenue: 523000, q3_revenue: 601000, market_share: 28.4, rating: 4.8 },
  { product: "DataVault", category: "Software", q1_revenue: 389000, q2_revenue: 412000, q3_revenue: 478000, market_share: 22.6, rating: 4.6 },
  { product: "NexHub X1", category: "Hardware", q1_revenue: 678000, q2_revenue: 712000, q3_revenue: 698000, market_share: 33.2, rating: 4.4 },
  { product: "SecureEdge", category: "Hardware", q1_revenue: 234000, q2_revenue: 267000, q3_revenue: 312000, market_share: 14.8, rating: 4.7 },
  { product: "Insight Analytics", category: "Software", q1_revenue: 345000, q2_revenue: 401000, q3_revenue: 489000, market_share: 23.1, rating: 4.9 },
  { product: "DevStream", category: "Services", q1_revenue: 189000, q2_revenue: 212000, q3_revenue: 256000, market_share: 12.1, rating: 4.3 },
  { product: "MeshConnect", category: "Hardware", q1_revenue: 523000, q2_revenue: 567000, q3_revenue: 534000, market_share: 25.3, rating: 4.5 },
  { product: "FieldOps Suite", category: "Services", q1_revenue: 412000, q2_revenue: 445000, q3_revenue: 512000, market_share: 24.3, rating: 4.7 },
];

export const SAMPLE_CUSTOMER_DATA: DataRow[] = [
  { segment: "Enterprise", count: 142, avg_deal_size: 48500, churn_rate: 3.2, nps: 72, lifetime_value: 1230000 },
  { segment: "Mid-Market", count: 489, avg_deal_size: 12300, churn_rate: 8.1, nps: 64, lifetime_value: 310000 },
  { segment: "SMB", count: 2341, avg_deal_size: 2400, churn_rate: 14.7, nps: 58, lifetime_value: 48000 },
  { segment: "Startup", count: 876, avg_deal_size: 890, churn_rate: 22.3, nps: 71, lifetime_value: 18000 },
];

export function getDefaultDataset(): Dataset {
  return {
    name: "Sales Analytics Q1–Q3",
    columns: ["month", "region", "revenue", "units", "category", "growth"],
    rows: SAMPLE_SALES_DATA,
  };
}

export function aggregateByField(rows: DataRow[], groupBy: string, valueField: string): DataRow[] {
  const map: Record<string, number> = {};
  rows.forEach(row => {
    const key = String(row[groupBy] ?? "Unknown");
    const val = Number(row[valueField] ?? 0);
    map[key] = (map[key] || 0) + val;
  });
  return Object.entries(map).map(([k, v]) => ({ [groupBy]: k, [valueField]: Math.round(v) }));
}

export function groupByTwo(rows: DataRow[], groupBy: string, seriesField: string, valueField: string): Record<string, DataRow>[] {
  const seriesValues = [...new Set(rows.map(r => String(r[seriesField])))];
  const groupValues = [...new Set(rows.map(r => String(r[groupBy])))];
  return groupValues.map(group => {
    const entry: DataRow = { [groupBy]: group };
    seriesValues.forEach(series => {
      const match = rows.find(r => String(r[groupBy]) === group && String(r[seriesField]) === series);
      entry[series] = match ? Number(match[valueField]) : 0;
    });
    return entry;
  });
}
