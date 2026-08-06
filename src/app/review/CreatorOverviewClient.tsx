"use client";

import { useMemo, useRef, useState } from "react";

type Range = "7d" | "28d" | "lifetime";
type StatKey = "gmv" | "comm" | "orders" | "videos";

function genSeries(seed: number, len: number, base: number, variance: number) {
  const out: number[] = [];
  for (let i = 0; i < len; i++) {
    const r =
      Math.sin(seed * (i + 1)) * variance +
      Math.cos((seed + i) * 0.7) * variance * 0.5;
    const v = Math.max(0, base + r + i * (base / 80));
    out.push(Math.round(v));
  }
  return out;
}

const SERIES = {
  gmv: genSeries(2.1, 28, 1200, 380),
  comm: genSeries(2.2, 28, 960, 280),
  orders: genSeries(2.3, 28, 22, 8),
  videos: genSeries(2.4, 28, 5, 2),
};

const STAT_LABEL: Record<StatKey, string> = {
  gmv: "Total GMV",
  comm: "Creator Commission",
  orders: "Orders Sold",
  videos: "Total Videos Posted",
};

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function CreatorOverviewClient() {
  const [range, setRange] = useState<Range>("28d");
  const [statFocus, setStatFocus] = useState<StatKey>("gmv");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const series = useMemo(() => {
    if (range === "7d") {
      return {
        gmv: SERIES.gmv.slice(-7),
        comm: SERIES.comm.slice(-7),
        orders: SERIES.orders.slice(-7),
        videos: SERIES.videos.slice(-7),
      };
    }
    return SERIES;
  }, [range]);

  const totals = useMemo(
    () => ({
      gmv: series.gmv.reduce((s, v) => s + v, 0),
      comm: series.comm.reduce((s, v) => s + v, 0),
      orders: series.orders.reduce((s, v) => s + v, 0),
      videos: series.videos.reduce((s, v) => s + v, 0),
    }),
    [series]
  );

  const priorTotals = useMemo(
    () => ({
      gmv: Math.round(totals.gmv / 1.18),
      comm: Math.round(totals.comm / 1.16),
      orders: Math.round(totals.orders / 1.12),
      videos: Math.round(totals.videos / 1.1),
    }),
    [totals]
  );

  const W = 900, H = 260, padL = 48, padR = 16, padT = 14, padB = 28;
  const focusData = series[statFocus];
  const overlay = statFocus === "gmv" ? series.comm : null;
  const maxV = Math.max(1, Math.max(...focusData, ...(overlay || [])));
  const dx = (W - padL - padR) / Math.max(1, focusData.length - 1);
  const chartH = H - padT - padB;

  function toPath(data: number[]) {
    return data
      .map((v, i) => {
        const x = padL + i * dx;
        const y = padT + chartH - (v / (maxV * 1.08)) * chartH;
        const c = i === 0 ? "M" : "L";
        return `${c}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }
  function toArea(data: number[]) {
    const line = toPath(data);
    const lastX = padL + (data.length - 1) * dx;
    return `${line} L${lastX.toFixed(1)},${(padT + chartH).toFixed(1)} L${padL.toFixed(1)},${(padT + chartH).toFixed(1)} Z`;
  }

  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round(((maxV * 1.08) / yTicks) * (yTicks - i))
  );

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());
    const idx = Math.round((local.x - padL) / dx);
    setHoverIdx(Math.max(0, Math.min(focusData.length - 1, idx)));
  }
  function handleLeave() { setHoverIdx(null); }

  return (
    <div className="ov-wrap">
      <header className="ov-head">
        <div>
          <p className="ov-eyebrow">TikTok &middot; Creator Overview</p>
          <h1>TikTok Account &amp; Revenue</h1>
          <p className="ov-sub">
            What this tab looks like once your TikTok Partner Center
            connection is wired. Mock data shown for review.
          </p>
        </div>
      </header>

      <section className="ov-card">
        <div className="ov-card-head">
          <h2>Connection Status</h2>
          <span className="ov-connected">
            <span className="ov-connected-dot" />
            TikTok Connected
          </span>
        </div>
        <div className="ov-view-row">
          <label className="ov-view-label" htmlFor="ov-view">View</label>
          <select id="ov-view" className="ov-select" defaultValue="all">
            <option value="all">All accounts (combined)</option>
          </select>
        </div>
      </section>

      <section className="ov-card">
        <div className="ov-card-head">
          <h2>
            {range === "7d" ? "Last 7 Days" : range === "28d" ? "Last 28 Days" : "Lifetime"}
          </h2>
          <div className="ov-range">
            {(["7d", "28d", "lifetime"] as Range[]).map((r) => (
              <button
                key={r}
                type="button"
                className={`ov-range-btn${range === r ? " active" : ""}`}
                onClick={() => setRange(r)}
              >
                {r === "7d" ? "Last 7D" : r === "28d" ? "Last 28D" : "Lifetime"}
              </button>
            ))}
          </div>
        </div>
        <p className="ov-hint">Click any card to focus the chart</p>

        <div className="ov-stat-grid">
          {(["gmv", "comm", "orders", "videos"] as StatKey[]).map((k) => {
            const t = totals[k];
            const p = priorTotals[k];
            const delta = p === 0 ? 0 : ((t - p) / p) * 100;
            const money$ = k === "gmv" || k === "comm";
            const val = money$ ? money(t) : t.toLocaleString();
            const perDayNote =
              k === "orders"
                ? `${Math.round(t / focusData.length)} per day`
                : k === "gmv" || k === "comm"
                ? `${delta > 0 ? "↑" : "↓"} ${Math.abs(delta).toFixed(0)}% vs prior period`
                : "Across all accounts";
            const tone = k === "gmv" || k === "comm" ? "green" : k === "videos" ? "gold" : "";
            return (
              <button
                key={k}
                type="button"
                className={`ov-stat ${tone}${statFocus === k ? " focused" : ""}`}
                onClick={() => setStatFocus(k)}
                aria-pressed={statFocus === k}
              >
                <div className="ov-stat-label">
                  {STAT_LABEL[k]}
                  <span className="ov-stat-dot" />
                </div>
                <div className={`ov-stat-val ${tone}`}>{val}</div>
                <div className="ov-stat-sub">
                  {k === "comm" ? "Your earnings" : perDayNote}
                </div>
                <div className="ov-stat-cta">view chart →</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="ov-card">
        <div className="ov-card-head">
          <h2>
            All Accounts &middot;{" "}
            {range === "7d" ? "Last 7 Days" : range === "28d" ? "Last 28 Days" : "Lifetime"}{" "}
            &middot; {STAT_LABEL[statFocus]}
          </h2>
          <div className="ov-legend">
            <span className="ov-legend-item"><span className="ov-legend-swatch gold" /> Total GMV</span>
            <span className="ov-legend-item"><span className="ov-legend-swatch green" /> Commission</span>
          </div>
        </div>
        <p className="ov-hint">GMV (gold) and creator commission (green) over time</p>

        <div className="ov-chart-wrap">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="ov-chart"
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            role="img"
            aria-label="GMV and Commission over time"
          >
            <defs>
              <linearGradient id="rvGmvFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="rvCommFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2BA567" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#2BA567" stopOpacity="0" />
              </linearGradient>
            </defs>

            {yTickValues.map((val, i) => {
              const y = padT + (chartH / yTicks) * i;
              return (
                <g key={i}>
                  <line
                    x1={padL} y1={y} x2={W - padR} y2={y}
                    stroke="var(--rv-border)" strokeWidth="1"
                    strokeDasharray={i === yTicks ? "" : "2,4"} opacity="0.7"
                  />
                  <text
                    x={padL - 8} y={y + 4}
                    fontSize="10" fill="var(--rv-muted)" textAnchor="end"
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  >
                    {statFocus === "gmv" || statFocus === "comm"
                      ? `$${val.toLocaleString()}`
                      : val.toLocaleString()}
                  </text>
                </g>
              );
            })}

            <path d={toArea(focusData)} fill={statFocus === "comm" ? "url(#rvCommFill)" : "url(#rvGmvFill)"} />

            {overlay ? (
              <>
                <path d={toArea(overlay)} fill="url(#rvCommFill)" />
                <path d={toPath(focusData)} fill="none" stroke="#C9A84C" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
                <path d={toPath(overlay)} fill="none" stroke="#2BA567" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
              </>
            ) : (
              <path
                d={toPath(focusData)} fill="none"
                stroke={statFocus === "comm" ? "#2BA567" : "#C9A84C"}
                strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round"
              />
            )}

            {hoverIdx !== null && (
              <>
                <line
                  x1={padL + hoverIdx * dx} y1={padT}
                  x2={padL + hoverIdx * dx} y2={padT + chartH}
                  stroke="var(--rv-muted)" strokeDasharray="3,3" strokeWidth="1"
                />
                <circle
                  cx={padL + hoverIdx * dx}
                  cy={padT + chartH - (focusData[hoverIdx] / (maxV * 1.08)) * chartH}
                  r="4" fill="#C9A84C" stroke="#0F0F0F" strokeWidth="2"
                />
                {overlay && (
                  <circle
                    cx={padL + hoverIdx * dx}
                    cy={padT + chartH - (overlay[hoverIdx] / (maxV * 1.08)) * chartH}
                    r="4" fill="#2BA567" stroke="#0F0F0F" strokeWidth="2"
                  />
                )}
              </>
            )}
          </svg>

          {hoverIdx !== null && (
            <div className="ov-tip" style={{ left: `${((padL + hoverIdx * dx) / W) * 100}%` }}>
              <div className="ov-tip-title">Day {hoverIdx + 1}</div>
              <div className="ov-tip-row">
                <span className="ov-tip-dot gold" /> GMV <b>{money(series.gmv[hoverIdx])}</b>
              </div>
              <div className="ov-tip-row">
                <span className="ov-tip-dot green" /> Commission <b>{money(series.comm[hoverIdx])}</b>
              </div>
            </div>
          )}

          <div className="ov-xaxis">
            {[0, Math.floor(focusData.length / 3), Math.floor((2 * focusData.length) / 3), focusData.length - 1].map((i) => (
              <span key={i}>Day {i + 1}</span>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .ov-wrap { display: flex; flex-direction: column; gap: 22px; max-width: 1180px; }
        .ov-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 18px; }
        .ov-eyebrow {
          margin: 0 0 6px;
          font-size: 11px; letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--rv-gold); font-weight: 700;
        }
        .ov-head h1 {
          margin: 0;
          font-size: 30px; font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--rv-text);
        }
        .ov-sub {
          margin: 8px 0 0;
          font-size: 13px; color: var(--rv-muted);
          max-width: 640px;
        }

        .ov-card {
          background: var(--rv-card-bg);
          border: 1px solid var(--rv-border);
          border-radius: 14px;
          padding: 22px 22px 18px;
          box-shadow: var(--rv-shadow);
        }
        .ov-card-head {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 14px; gap: 12px; flex-wrap: wrap;
        }
        .ov-card-head h2 {
          margin: 0; font-size: 15px; font-weight: 700;
          letter-spacing: 0.02em;
          color: var(--rv-text); text-transform: uppercase;
        }

        .ov-connected {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700;
          color: var(--rv-good);
          padding: 6px 12px;
          background: rgba(43, 165, 103, 0.1);
          border: 1px solid rgba(43, 165, 103, 0.32);
          border-radius: 999px;
        }
        .ov-connected-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--rv-good);
          box-shadow: 0 0 0 3px rgba(43, 165, 103, 0.22);
        }

        .ov-view-row { display: flex; align-items: center; gap: 14px; }
        .ov-view-label {
          font-size: 11px; letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--rv-muted); font-weight: 700;
        }
        .ov-select {
          background: var(--rv-chip-bg);
          border: 1px solid var(--rv-border);
          color: var(--rv-text);
          font: inherit; font-size: 13px;
          padding: 9px 14px; border-radius: 8px;
          min-width: 260px;
        }

        .ov-range {
          display: inline-flex; padding: 3px;
          background: var(--rv-chip-bg);
          border: 1px solid var(--rv-border);
          border-radius: 10px; gap: 2px;
        }
        .ov-range-btn {
          background: transparent; border: none;
          color: var(--rv-muted);
          font: inherit; font-size: 11.5px; font-weight: 700;
          letter-spacing: 0.05em;
          padding: 6px 12px; border-radius: 7px;
          cursor: pointer; text-transform: uppercase;
          transition: background 120ms ease, color 120ms ease;
        }
        .ov-range-btn:hover { color: var(--rv-text); }
        .ov-range-btn.active { background: var(--rv-gold); color: #0B0B0B; }

        .ov-hint {
          margin: 0 0 14px;
          font-size: 12px; color: var(--rv-muted-2);
        }

        .ov-stat-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;
        }
        .ov-stat {
          text-align: left;
          background: var(--rv-chip-bg);
          border: 1px solid var(--rv-border);
          border-radius: 12px;
          padding: 18px 20px 16px;
          font-family: inherit; color: var(--rv-text);
          cursor: pointer;
          transition: border-color 120ms ease, background 120ms ease, transform 120ms ease;
          position: relative;
        }
        .ov-stat:hover { border-color: var(--rv-gold-soft); transform: translateY(-1px); }
        .ov-stat.focused { border-color: var(--rv-gold); background: var(--rv-chip-hover); }
        .ov-stat-label {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 10.5px; letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--rv-muted); font-weight: 700;
        }
        .ov-stat-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--rv-muted-2); }
        .ov-stat.green .ov-stat-dot { background: var(--rv-good); }
        .ov-stat.gold .ov-stat-dot { background: var(--rv-gold); }
        .ov-stat-val {
          margin: 8px 0 6px;
          font-size: 28px; font-weight: 700;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }
        .ov-stat-val.green { color: var(--rv-good); }
        .ov-stat-val.gold { color: var(--rv-gold); }
        .ov-stat-sub { font-size: 12px; color: var(--rv-muted); }
        .ov-stat-cta { margin-top: 10px; font-size: 11px; color: var(--rv-muted-2); letter-spacing: 0.04em; }
        .ov-stat.focused .ov-stat-cta { color: var(--rv-gold); }

        .ov-legend { display: inline-flex; gap: 18px; }
        .ov-legend-item {
          font-size: 11.5px; color: var(--rv-muted);
          display: inline-flex; align-items: center; gap: 7px;
          font-weight: 600;
        }
        .ov-legend-swatch { width: 10px; height: 10px; border-radius: 50%; }
        .ov-legend-swatch.gold { background: var(--rv-gold); }
        .ov-legend-swatch.green { background: var(--rv-good); }

        .ov-chart-wrap { position: relative; padding: 4px 0 0; }
        .ov-chart { width: 100%; height: 260px; display: block; }
        .ov-xaxis {
          display: flex; justify-content: space-between;
          padding: 2px 6px 0 52px;
          font-size: 10.5px; color: var(--rv-muted-2);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .ov-tip {
          position: absolute; top: 4px;
          transform: translateX(-50%);
          background: var(--rv-side-bg);
          border: 1px solid var(--rv-border);
          border-radius: 10px;
          padding: 10px 12px;
          box-shadow: var(--rv-shadow);
          font-size: 12px; color: var(--rv-text);
          pointer-events: none; min-width: 160px;
        }
        .ov-tip-title {
          font-size: 10.5px; color: var(--rv-muted);
          letter-spacing: 0.12em; text-transform: uppercase;
          font-weight: 700; margin-bottom: 6px;
        }
        .ov-tip-row {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: var(--rv-muted); margin-top: 3px;
        }
        .ov-tip-row b { margin-left: auto; color: var(--rv-text); font-variant-numeric: tabular-nums; }
        .ov-tip-dot { width: 8px; height: 8px; border-radius: 50%; }
        .ov-tip-dot.gold { background: var(--rv-gold); }
        .ov-tip-dot.green { background: var(--rv-good); }

        @media (max-width: 900px) {
          .ov-head h1 { font-size: 24px; }
          .ov-stat-grid { grid-template-columns: 1fr; }
          .ov-stat-val { font-size: 24px; }
        }
      `}</style>
    </div>
  );
}
