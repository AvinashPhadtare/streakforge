import { HEATMAP_COLORS, generateHeatmap } from "@/lib/mock-data";
import { useMemo } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function Heatmap({ weeks = 52, cellSize = 12 }: { weeks?: number; cellSize?: number }) {
  const cells = useMemo(() => generateHeatmap(weeks), [weeks]);

  // Build columns of 7
  const columns: { date: string; value: number }[][] = [];
  for (let w = 0; w < weeks; w++) {
    columns.push(cells.slice(w * 7, w * 7 + 7));
  }

  // Month labels: show label when month changes in first row of column
  const monthLabels = columns.map((col, i) => {
    const d = new Date(col[0].date);
    const m = d.getMonth();
    if (i === 0) return MONTHS[m];
    const prev = new Date(columns[i - 1][0].date).getMonth();
    return m !== prev ? MONTHS[m] : "";
  });

  const gap = 3;

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block">
        <div className="flex" style={{ paddingLeft: 24 }}>
          {monthLabels.map((m, i) => (
            <div
              key={i}
              style={{ width: cellSize + gap }}
              className="text-[10px] text-neutral-500"
            >
              {m}
            </div>
          ))}
        </div>
        <div className="flex">
          <div className="flex flex-col justify-between pr-2 text-[10px] text-neutral-500" style={{ height: 7 * (cellSize + gap) }}>
            <span style={{ height: cellSize }}>M</span>
            <span style={{ height: cellSize }}>W</span>
            <span style={{ height: cellSize }}>F</span>
          </div>
          <div className="flex" style={{ gap }}>
            {columns.map((col, i) => (
              <div key={i} className="flex flex-col" style={{ gap }}>
                {col.map((c, j) => (
                  <div
                    key={j}
                    title={`${c.date} • ${c.value * 20}% complete`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: HEATMAP_COLORS[c.value],
                      borderRadius: 2,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-end gap-2 text-[11px] text-neutral-500">
          <span>Less</span>
          {HEATMAP_COLORS.map((c, i) => (
            <span
              key={i}
              style={{ backgroundColor: c, width: cellSize, height: cellSize, borderRadius: 2 }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
