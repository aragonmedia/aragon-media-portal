"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

type Range = "7d" | "28d" | "lifetime";
type StatKey = "gmv" | "comm" | "orders" | "videos";

type LinkedAccount = { id: string; handle: string; status: string };

// Deterministic per-account mock series — seed derives from handle so
// each account gets a stable but distinct earnings curve.
function seedFromHandle(h: string) {
  let s = 0;
  for (let i = 0; i < h.length; i++) s = (s * 31 + h.charCodeAt(i)) % 10007;
  return 1.1 + (s % 400) / 100; // 1.1 .. 5.1
}
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
function accountSeries(handle: string, len: number) {
  const s = seedFromHandle(handle);
  const scale = 0.65 + (s % 1) * 0.55; // 0.65 .. 1.2 relative size
  return {
    gmv: genSeries(s, len, 900 * scale, 260 * scale),
    comm: genSeries(s + 0.3, len, 270 * scale, 80 * scale),
    orders: genSeries(s + 0.5, len, 16 * scale, 6 * scale),
    videos: genSeries(s + 0.7, len, 3 * scale, 1.4 * scale),
  };
}
function sumSeries(all: ReturnType<typeof accountSeries>[]) {
  const len = all[0]?.gmv.length ?? 0;
  const out = {
    gmv: new Array<number>(len).fill(0),
    comm: new Array<number>(len).fill(0),
    orders: new Array<number>(len).fill(0),
    videos: new Array<number>(len).fill(0),
  };
  for (const s of all) {
    for (let i = 0; i < len; i++) {
      out.gmv[i] += s.gmv[i];
      out.comm[i] += s.comm[i];
      out.orders[i] += s.orders[i];
      out.videos[i] += s.videos[i];
    }
  }
  return out;
}

const STAT_LABEL: Record<StatKey, string> = {
  gmv: "Total GMV",
  comm: "Creator Commission",
  orders: "Orders Sold",
  videos: "Total Videos Posted",
};

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function CreatorOverviewClient({ accounts }: { accounts: LinkedAccount[] }) {
  const [range, setRange] = useState<Range>("28d");
  const [statFocus, setStatFocus] = useState<StatKey>("gmv");
  const [view, setView] = useState<string>("all"); // "all" or a handle
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const LEN = range === "7d" ? 7 : 28;

  // Per-account series (map handle → series) and the combined "all"
  const perAccount = useMemo(() => {
    const map: Record<string, ReturnType<typeof accountSeries>> = {};
    for (const a of accounts) map[a.handle] = accountSeries(a.handle, LEN);
    return map;
  }, [accounts, LEN]);

  const allSeries = useMemo(
    () => sumSeries(Object.values(perAccount).length ? Object.values(perAccount) : [accountSeries("empty", LEN)]),
    [perAccount, LEN]
  );

  const series = view === "all" ? allSeries : perAccount[view] ?? allSeries;

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

  // Per-account earnings breakdown (below chart)
  const breakdownRows = useMemo(() => {
    return accounts.map((a) => {
      const s = perAccount[a.handle];
      const gmv = s.gmv.reduce((x, v) => x + v, 0);
      const comm = s.comm.reduce((x, v) => x + v, 0);
      const orders = s.orders.reduce((x, v) => x + v, 0);
      const videos = s.videos.reduce((x, v) => x + v, 0);
      return { ...a, gmv, comm, orders, videos };
    });
  }, [accounts, perAccount]);

  const viewLabel = view === "all"
    ? "All accounts"
    : `@${view}`;

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

      {/* Connection status */}
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
          <select
            id="ov-view"
            className="ov-select"
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            <option value="all">All accounts (combined)</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.handle}>@{a.handle}</option>
            ))}
          </select>
          <Link href="/review/accounts" className="ov-connect-cta">
            <span aria-hidden>+</span> Add TikTok account
          </Link>
        </div>
      </section>

      {/* Last N days summary */}
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

      {/* Chart */}
      <section className="ov-card">
        <div className="ov-card-head">
          <h2>
            {viewLabel} &middot;{" "}
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
                    stroke="var(--border-soft)" strokeWidth="1"
                    strokeDasharray={i === yTicks ? "" : "2,4"} opacity="0.7"
                  />
                  <text
                    x={padL - 8} y={y + 4}
                    fontSize="10" fill="var(--text-muted)" textAnchor="end"
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
                  stroke="var(--text-muted)" strokeDasharray="3,3" strokeWidth="1"
                />
                <circle
                  cx={padL + hoverIdx * dx}
                  cy={padT + chartH - (focusData[hoverIdx] / (maxV * 1.08)) * chartH}
                  r="4" fill="#C9A84C" stroke="var(--bg)" strokeWidth="2"
                />
                {overlay && (
                  <circle
                    cx={padL + hoverIdx * dx}
                    cy={padT + chartH - (overlay[hoverIdx] / (maxV * 1.08)) * chartH}
                    r="4" fill="#2BA567" stroke="var(--bg)" strokeWidth="2"
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

      {/* Per-account earnings breakdown */}
      <section className="ov-card">
        <div className="ov-card-head">
          <h2>Per-Account Earnings</h2>
          <span className="ov-hint" style={{ margin: 0 }}>
            {range === "7d" ? "Last 7 Days" : range === "28d" ? "Last 28 Days" : "Lifetime"}
          </span>
        </div>
        {breakdownRows.length === 0 ? (
          <div className="ov-empty">
            <p>No TikTok accounts linked yet.</p>
            <Link href="/review/accounts" className="ov-connect-cta">
              <span aria-hidden>+</span> Add your first account
            </Link>
          </div>
        ) : (
          <div className="ov-breakdown">
            <div className="ov-breakdown-head">
              <span>Account</span>
              <span>GMV</span>
              <span>Commission</span>
              <span>Orders</span>
              <span>Videos</span>
            </div>
            {breakdownRows.map((row) => {
              const shareOfCommission = totals.comm > 0
                ? Math.round((row.comm / totals.comm) * 100)
                : 0;
              return (
                <button
                  type="button"
                  key={row.id}
                  className={`ov-breakdown-row${view === row.handle ? " focused" : ""}`}
                  onClick={() => setView(view === row.handle ? "all" : row.handle)}
                  aria-pressed={view === row.handle}
                >
                  <div className="ov-breakdown-acc">
                    <span className="ov-breakdown-mark">@</span>
                    <div>
                      <p className="ov-breakdown-handle">@{row.handle}</p>
                      <p className="ov-breakdown-share">
                        {shareOfCommission}% of your commission
                      </p>
                    </div>
                  </div>
                  <span className="ov-breakdown-cell gold">{money(row.gmv)}</span>
                  <span className="ov-breakdown-cell green">{money(row.comm)}</span>
                  <span className="ov-breakdown-cell">{row.orders.toLocaleString()}</span>
                  <span className="ov-breakdown-cell">{row.videos.toLocaleString()}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <style jsx>{`
        .ov-wrap { display: flex; flex-direction: column; gap: 22px; max-width: 1180px; }
        .ov-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 18px; }
        .ov-eyebrow {
          margin: 0 0 6px;
          font-size: 11px; letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gold); font-weight: 700;
        }
        .ov-head h1 {
          margin: 0;
          font-size: 30px; font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text);
        }
        .ov-sub {
          margin: 8px 0 0;
          font-size: 13px; color: var(--text-muted);
          max-width: 640px;
        }

        .ov-card {
          background: var(--bg-2);
          border: 1px solid var(--border-soft);
          border-radius: 14px;
          padding: 22px 22px 18px;
          box-shadow: var(--shadow-card);
        }
        .ov-card-head {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 14px; gap: 12px; flex-wrap: wrap;
        }
        .ov-card-head h2 {
          margin: 0; font-size: 15px; font-weight: 700;
          letter-spacing: 0.02em;
          color: var(--text); text-transform: uppercase;
        }

        .ov-connected {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700;
          color: var(--green);
          padding: 6px 12px;
          background: rgba(43, 165, 103, 0.1);
          border: 1px solid rgba(43, 165, 103, 0.32);
          border-radius: 999px;
        }
        .ov-connected-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 0 3px rgba(43, 165, 103, 0.22);
        }

        .ov-view-row {
          display: flex; align-items: center; gap: 14px;
          flex-wrap: wrap;
        }
        .ov-view-label {
          font-size: 11px; letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-muted); font-weight: 700;
        }
        .ov-select {
          background: var(--bg-deep);
          border: 1px solid var(--border);
          color: var(--text);
          font: inherit; font-size: 13px;
          padding: 9px 14px; border-radius: 8px;
          min-width: 260px;
        }
        .ov-connect-cta {
          margin-left: auto;
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 700;
          color: #0B0B0B;
          background: var(--gold);
          border: 1px solid var(--gold);
          padding: 8px 14px; border-radius: 8px;
          text-decoration: none;
          transition: transform 120ms ease, box-shadow 120ms ease;
        }
        .ov-connect-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px -8px rgba(201, 168, 76, 0.6);
        }
        .ov-connect-cta span { font-size: 15px; line-height: 1; }

        .ov-range {
          display: inline-flex; padding: 3px;
          background: var(--bg-deep);
          border: 1px solid var(--border-soft);
          border-radius: 10px; gap: 2px;
        }
        .ov-range-btn {
          background: transparent; border: none;
          color: var(--text-muted);
          font: inherit; font-size: 11.5px; font-weight: 700;
          letter-spacing: 0.05em;
          padding: 6px 12px; border-radius: 7px;
          cursor: pointer; text-transform: uppercase;
          transition: background 120ms ease, color 120ms ease;
        }
        .ov-range-btn:hover { color: var(--text); }
        .ov-range-btn.active { background: var(--gold); color: #0B0B0B; }

        .ov-hint {
          margin: 0 0 14px;
          font-size: 12px; color: var(--text-sub);
        }

        .ov-stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        .ov-stat {
          text-align: left;
          background: var(--bg-deep);
          border: 1px solid var(--border-soft);
          border-radius: 12px;
          padding: 18px 20px 16px;
          font-family: inherit; color: var(--text);
          cursor: pointer;
          transition: border-color 120ms ease, background 120ms ease, transform 120ms ease;
          position: relative;
        }
        .ov-stat:hover { border-color: rgba(201, 168, 76, 0.4); transform: translateY(-1px); }
        .ov-stat.focused { border-color: var(--gold); background: var(--bg-grad); }
        .ov-stat-label {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 10.5px; letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-muted); font-weight: 700;
        }
        .ov-stat-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-sub); }
        .ov-stat.green .ov-stat-dot { background: var(--green); }
        .ov-stat.gold .ov-stat-dot { background: var(--gold); }
        .ov-stat-val {
          margin: 8px 0 6px;
          font-size: 28px; font-weight: 700;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }
        .ov-stat-val.green { color: var(--green); }
        .ov-stat-val.gold { color: var(--gold); }
        .ov-stat-sub { font-size: 12px; color: var(--text-muted); }
        .ov-stat-cta { margin-top: 10px; font-size: 11px; color: var(--text-sub); letter-spacing: 0.04em; }
        .ov-stat.focused .ov-stat-cta { color: var(--gold); }

        .ov-legend { display: inline-flex; gap: 18px; }
        .ov-legend-item {
          font-size: 11.5px; color: var(--text-muted);
          display: inline-flex; align-items: center; gap: 7px;
          font-weight: 600;
        }
        .ov-legend-swatch { width: 10px; height: 10px; border-radius: 50%; }
        .ov-legend-swatch.gold { background: var(--gold); }
        .ov-legend-swatch.green { background: var(--green); }

        .ov-chart-wrap { position: relative; padding: 4px 0 0; }
        .ov-chart { width: 100%; height: 260px; display: block; }
        .ov-xaxis {
          display: flex; justify-content: space-between;
          padding: 2px 6px 0 52px;
          font-size: 10.5px; color: var(--text-sub);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .ov-tip {
          position: absolute; top: 4px;
          transform: translateX(-50%);
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 12px;
          box-shadow: var(--shadow-card);
          font-size: 12px; color: var(--text);
          pointer-events: none; min-width: 160px;
        }
        .ov-tip-title {
          font-size: 10.5px; color: var(--text-muted);
          letter-spacing: 0.12em; text-transform: uppercase;
          font-weight: 700; margin-bottom: 6px;
        }
        .ov-tip-row {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: var(--text-muted); margin-top: 3px;
        }
        .ov-tip-row b { margin-left: auto; color: var(--text); font-variant-numeric: tabular-nums; }
        .ov-tip-dot { width: 8px; height: 8px; border-radius: 50%; }
        .ov-tip-dot.gold { background: var(--gold); }
        .ov-tip-dot.green { background: var(--green); }

        /* Per-account breakdown table */
        .ov-empty {
          padding: 24px;
          text-align: center;
          background: var(--bg-deep);
          border: 1px dashed var(--border-soft);
          border-radius: 12px;
          color: var(--text-muted);
          display: flex; flex-direction: column; gap: 12px; align-items: center;
        }
        .ov-empty p { margin: 0; font-size: 13px; }

        .ov-breakdown { display: flex; flex-direction: column; gap: 8px; }
        .ov-breakdown-head {
          display: grid;
          grid-template-columns: minmax(200px, 2fr) 1fr 1fr 100px 100px;
          gap: 12px;
          padding: 0 14px 6px;
          font-size: 10.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-sub);
          font-weight: 700;
        }
        .ov-breakdown-row {
          display: grid;
          grid-template-columns: minmax(200px, 2fr) 1fr 1fr 100px 100px;
          gap: 12px;
          align-items: center;
          padding: 12px 14px;
          background: var(--bg-deep);
          border: 1px solid var(--border-soft);
          border-radius: 10px;
          text-align: left;
          font-family: inherit;
          color: var(--text);
          cursor: pointer;
          transition: border-color 120ms ease, background 120ms ease, transform 120ms ease;
        }
        .ov-breakdown-row:hover { border-color: rgba(201, 168, 76, 0.4); transform: translateY(-1px); }
        .ov-breakdown-row.focused { border-color: var(--gold); background: var(--bg-grad); }
        .ov-breakdown-acc { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .ov-breakdown-mark {
          width: 32px; height: 32px; border-radius: 8px;
          background: var(--bg);
          border: 1px solid var(--gold);
          color: var(--gold);
          display: inline-flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px;
          flex-shrink: 0;
        }
        .ov-breakdown-handle { margin: 0; font-size: 13.5px; font-weight: 700; color: var(--text); }
        .ov-breakdown-share { margin: 2px 0 0; font-size: 11px; color: var(--text-muted); }
        .ov-breakdown-cell {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text);
          font-variant-numeric: tabular-nums;
        }
        .ov-breakdown-cell.gold { color: var(--gold); }
        .ov-breakdown-cell.green { color: var(--green); }

        @media (max-width: 900px) {
          .ov-head h1 { font-size: 24px; }
          .ov-stat-grid { grid-template-columns: 1fr; }
          .ov-stat-val { font-size: 24px; }
          .ov-connect-cta { margin-left: 0; }
          .ov-breakdown-head { display: none; }
          .ov-breakdown-row {
            grid-template-columns: 1fr 1fr;
            grid-auto-rows: auto;
          }
          .ov-breakdown-acc { grid-column: 1 / -1; }
        }
      `}</style>
    </div>
  );
}
