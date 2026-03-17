import Papa from "papaparse";
import type { DataRow, Dataset } from "./sampleData";

export async function parseCSV(file: File): Promise<Dataset> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length && results.data.length === 0) {
          reject(new Error("Failed to parse CSV: " + results.errors[0]?.message));
          return;
        }
        const rows = results.data as DataRow[];
        const columns = results.meta.fields ?? Object.keys(rows[0] ?? {});
        resolve({
          name: file.name.replace(/\.csv$/i, ""),
          columns,
          rows,
        });
      },
      error: (err) => reject(err),
    });
  });
}

export function detectColumnType(values: (string | number)[]): "numeric" | "categorical" | "date" {
  const datePatterns = [/^\d{4}-\d{2}-\d{2}/, /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i, /^Q[1-4]/, /^\d{2}\/\d{2}\/\d{4}/];
  const sample = values.slice(0, 20).filter(Boolean);

  if (sample.every(v => !isNaN(Number(v)))) return "numeric";
  if (sample.some(v => datePatterns.some(p => p.test(String(v))))) return "date";
  return "categorical";
}

export function summarizeDataset(dataset: Dataset): string {
  const numericCols = dataset.columns.filter(col => {
    const vals = dataset.rows.slice(0, 20).map(r => r[col]);
    return detectColumnType(vals) === "numeric";
  });
  const categoricalCols = dataset.columns.filter(col => {
    const vals = dataset.rows.slice(0, 20).map(r => r[col]);
    return detectColumnType(vals) === "categorical";
  });
  const dateCols = dataset.columns.filter(col => {
    const vals = dataset.rows.slice(0, 20).map(r => r[col]);
    return detectColumnType(vals) === "date";
  });

  const categorySummary = categoricalCols.map(col => {
    const unique = [...new Set(dataset.rows.map(r => r[col]))].slice(0, 8);
    return `${col}: [${unique.join(", ")}]`;
  }).join("; ");

  const numericSummary = numericCols.map(col => {
    const vals = dataset.rows.map(r => Number(r[col])).filter(v => !isNaN(v));
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    return `${col} (min=${min.toLocaleString()}, max=${max.toLocaleString()})`;
  }).join("; ");

  return [
    `Dataset: "${dataset.name}"`,
    `Rows: ${dataset.rows.length}`,
    `Columns: ${dataset.columns.join(", ")}`,
    dateCols.length ? `Time columns: ${dateCols.join(", ")}` : "",
    categoricalCols.length ? `Categorical: ${categorySummary}` : "",
    numericCols.length ? `Numeric: ${numericSummary}` : "",
  ].filter(Boolean).join("\n");
}
