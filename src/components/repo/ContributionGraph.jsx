import { useMemo } from "react";




const LEVELS = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const iso = (d) => d.toISOString().slice(0, 10);

function levelFor(count, max) {
  if (!count) return 0;
  if (max <= 4) return Math.min(count, 4);
  const ratio = count / max;
  if (ratio > 0.66) return 4;
  if (ratio > 0.33) return 3;
  if (ratio > 0.12) return 2;
  return 1;
}

export default function ContributionGraph({ days, total, source, weeks = 53, compact = false }) {
  const { grid, months, max } = useMemo(() => {
    const today = new Date();
    
    const end = new Date(today);
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(start.getDate() - (weeks * 7 - 1));
    start.setDate(start.getDate() - start.getDay());

    const counts = days || {};
    const maxCount = Math.max(0, ...Object.values(counts));

    const cols = [];
    const monthLabels = [];
    let lastMonth = -1;
    const cursor = new Date(start);

    while (cursor <= end) {
      const col = [];
      for (let d = 0; d < 7; d += 1) {
        if (cursor > end) {
          col.push(null);
        } else {
          const key = iso(cursor);
          col.push({ date: key, count: counts[key] || 0 });
        }
        cursor.setDate(cursor.getDate() + 1);
      }

      const firstReal = col.find(Boolean);
      if (firstReal) {
        const m = new Date(firstReal.date).getMonth();
        if (m !== lastMonth) {
          monthLabels.push({ col: cols.length, label: MONTHS[m] });
          lastMonth = m;
        }
      }
      cols.push(col);
    }

    return { grid: cols, months: monthLabels, max: maxCount };
  }, [days, weeks]);

  const cell = compact ? 9 : 11;
  const gap = 2;

  return (
    <div className="w-full">
      {total !== undefined ? (
        <p className="t-small mb-3 text-vs-text">
          {total.toLocaleString()} contribution{total === 1 ? "" : "s"} in the last year
          {source === "reconstructed" ? (
            <span
              className="ml-2 text-vs-descr"
              title="Rebuilt from commit dates across the listed repositories, so this undercounts activity elsewhere."
            >
              · from commit history
            </span>
          ) : null}
        </p>
      ) : null}

      <div className="overflow-x-auto pb-1">
        <div style={{ minWidth: grid.length * (cell + gap) }}>
          <div
            aria-hidden="true"
            className="relative mb-1 h-[13px] text-[10px] text-vs-descr"
            style={{ width: grid.length * (cell + gap) }}
          >
            {months.map(({ col, label }) => (
              <span key={`${label}-${col}`} className="absolute top-0" style={{ left: col * (cell + gap) }}>
                {label}
              </span>
            ))}
          </div>

          <div className="flex" style={{ gap }}>
            {grid.map((col, ci) => (
              <div key={ci} className="flex flex-col" style={{ gap }}>
                {col.map((day, di) =>
                  day ? (
                    <span
                      key={day.date}
                      title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                      className="block rounded-[2px]"
                      style={{
                        width: cell,
                        height: cell,
                        backgroundColor: LEVELS[levelFor(day.count, max)],
                        outline: day.count ? "1px solid rgba(255,255,255,0.04)" : "none",
                        outlineOffset: "-1px",
                      }}
                    />
                  ) : (
                    <span key={`${ci}-${di}`} style={{ width: cell, height: cell }} />
                  )
                )}
              </div>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-vs-descr">
            <span className="mr-1">Less</span>
            {LEVELS.map((c) => (
              <span
                key={c}
                className="block rounded-[2px]"
                style={{ width: cell, height: cell, backgroundColor: c }}
              />
            ))}
            <span className="ml-1">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
