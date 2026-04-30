"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

type StatKey = "gmv" | "comm" | "orders" | "videos";
type Account = "all" | "main" | "beauty" | "pets";

const ACCOUNT_LABELS: Record<Account, string> = {
  all: "All accounts",
  main: "@kevinaragon_main",
  beauty: "@kevinaragon_beauty",
  pets: "@kevinaragon_pets",
};

// Mock 28-day series, mirroring the 07_gmv_connected.html shape
function genSeries(seed: number, len: number, base: number, variance: number) {
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < len; i++) {
    const r = Math.sin(seed * (i + 1)) * variance + Math.cos((seed + i) * 0.7) * variance * 0.5;
    v = Math.max(0, base + r + i * (base / 60));
    out.push(Math.round(v));
  }
  return out;
}

const SERIES: Record<Account, { gmv: number[]; comm: number[]; orders: number[]; videos: number[] }> = {
  all: {
    gmv: genSeries(2.1, 28, 1200, 380),
    comm: genSeries(2.2, 28, 960, 280),
    orders: genSeries(2.3, 28, 18, 8),
    videos: genSeries(2.4, 28, 4, 2),
  },
  main: {
    gmv: genSeries(3.1, 28, 720, 220),
    comm: genSeries(3.2, 28, 576, 170),
    orders: genSeries(3.3, 28, 11, 5),
    videos: genSeries(3.4, 28, 2, 1),
  },
  beauty: {
    gmv: genSeries(4.1, 28, 360, 140),
    comm: genSeries(4.2, 28, 288, 110),
    orders: genSeries(4.3, 28, 5, 3),
    videos: genSeries(4.4, 28, 1.4, 0.8),
  },
  pets: {
    gmv: genSeries(5.1, 28, 120, 60),
    comm: genSeries(5.2, 28, 96, 45),
    orders: genSeries(5.3, 28, 2, 1.5),
    videos: genSeries(5.4, 28, 0.6, 0.4),
  },
};

const STAT_LABEL: Record<StatKey, string> = {
  gmv: "Total GMV",
  comm: "Creator Commission",
  orders: "Orders Sold",
  videos: "Total Videos Posted",
};
const STAT_TONE: Record<StatKey, string> = {
  gmv: "green",
  comm: "green",
  orders: "",
  videos: "gold",
};

export default function GmvPreviewClient() {
  const [account, setAccount] = useState<Account>("all");
  const [statFocus, setStatFocus] = useState<StatKey>("gmv");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const series = SERIES[account];
  const totals = useMemo(() => ({
    gmv: series.gmv.reduce((s, v) => s + v, 0),
    comm: series.comm.reduce((s, v) => s + v, 0),
    orders: series.orders.reduce((s, v) => s + v, 0),
    videos: series.videos.reduce((s, v) => s + v, 0),
  }), [series]);

  // Build SVG line paths for the focused stat + commission overlay if showing GMV
  const W = 500, H = 174;
  const focusData = series[statFocus];
  const max = Math.max(...focusData) * 1.1;
  const dx = W / (focusData.length - 1);
  const overlay: number[] | null = statFocus === "gmv" ? series.comm : null;

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());
    const idx = Math.round(local.x / dx);
    const clamped = Math.max(0, Math.min(focusData.length - 1, idx));
    setHoverIdx(clamped);
  }
  function handleLeave() { setHoverIdx(null); }

  // Helper for hover indicator coordinates
  const hoverX = hoverIdx != null ? hoverIdx * dx : 0;
  const hoverYFocus = hoverIdx != null ? H - (focusData[hoverIdx] / max) * H : 0;
  const hoverYOverlay = hoverIdx != null && overlay ? H - (overlay[hoverIdx] / max) * H : 0;

  // Date label for tooltip
  const today = new Date();
  function dateLabel(idx: number): string {
    const d = new Date(today);
    d.setDate(d.getDate() - (focusData.length - 1 - idx));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  function fmtVal(v: number, key: StatKey): string {
    if (key === "videos") return `${Math.round(v)}`;
    if (key === "orders") return `${Math.round(v).toLocaleString()}`;
    return `$${Math.round(v).toLocaleString()}`;
  }

  const focusPath = pathFromSeries(focusData, W, H, max);
  const focusFill = areaFromSeries(focusData, W, H, max);
  const overlayPath = overlay ? pathFromSeries(overlay, W, H, max) : null;
  const overlayFill = overlay ? areaFromSeries(overlay, W, H, max) : null;

  const focusColor = statFocus === "gmv" ? "#C9A84C" : statFocus === "comm" ? "#3DCF82" : statFocus === "orders" ? "#3DCF82" : "#C9A84C";

  return (
    <main className="dash-content">
      <header className="dash-page-head">
        <div>
          <p className="dash-eyebrow">TikTok · Preview Mode</p>
          <h1>TikTok Account &amp; Revenue</h1>
          <p className="dash-page-sub">This is what this tab will look like once your TikTok Partner Center connection is wired. Mock data shown.</p>
        </div>
        <Link href="/dashboard/tiktok-account" className="dash-cta ghost">← Back to live view</Link>
      </header>

      <div className="dash-card">
        <div className="dash-card-head">
          <h2>Connection status</h2>
          <span className="tiktok-badge"><span className="tiktok-badge-dot" />TikTok Connected</span>
        </div>
        <div className="account-select-row">
          <label className="account-select-label">View</label>
          <select className="account-select" value={account} onChange={(e) => setAccount(e.target.value as Account)}>
            <option value="all">All accounts (combined)</option>
            <option value="main">@kevinaragon_main</option>
            <option value="beauty">@kevinaragon_beauty</option>
            <option value="pets">@kevinaragon_pets</option>
          </select>
        </div>
      </div>

      {/* Stat cards — 2×2 grid, click to switch chart focus */}
      <div className="dash-card" style={{ marginTop: 16 }}>
        <div className="dash-card-head">
          <h2>Last 28 days</h2>
          <span className="dash-meta">Click any card to focus the chart</span>
        </div>
        <div className="gmv-stat-grid">
          {(["gmv", "comm", "orders", "videos"] as StatKey[]).map((key) => {
            const v = totals[key];
            const display = key === "videos" ? `${Math.round(v)}` : key === "orders" ? `${Math.round(v).toLocaleString()}` : `$${Math.round(v).toLocaleString()}`;
            return (
              <button
                key={key}
                type="button"
                className={`gmv-stat-card${statFocus === key ? " active" : ""}${STAT_TONE[key] === "green" ? " ac-green" : STAT_TONE[key] === "gold" ? " ac-gold" : ""}`}
                onClick={() => setStatFocus(key)}
              >
                <div className="gmv-stat-dot" />
                <div className="gmv-stat-label">{STAT_LABEL[key]}</div>
                <div className={`gmv-stat-val ${STAT_TONE[key]}`}>{display}</div>
                <div className="gmv-stat-sub up">{key === "gmv" ? "↑ 18% vs prior period" : key === "comm" ? "Your earnings" : key === "orders" ? `↑ ${Math.round(v / 28)} per day` : "Across all accounts"}</div>
                <div className="gmv-stat-hint">view chart →</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="dash-card" style={{ marginTop: 16 }}>
        <div className="dash-card-head chart-head-row">
          <div>
            <h2>{ACCOUNT_LABELS[account]} · Last 28 days · {STAT_LABEL[statFocus]}</h2>
            <span className="dash-meta">{statFocus === "gmv" ? "GMV (gold) and creator commission (green) over time" : "Daily totals"}</span>
          </div>
          <div className="chart-legend">
            <div className="leg"><div className="leg-dot" style={{ background: focusColor }} />{STAT_LABEL[statFocus]}</div>
            {overlay && (<div className="leg"><div className="leg-dot" style={{ background: "#3DCF82" }} />Commission</div>)}
          </div>
        </div>

        <div className="chart-wrapper">
          <div className="chart-y-axis">
            <span>${Math.round(max).toLocaleString()}</span>
            <span>${Math.round(max * 0.75).toLocaleString()}</span>
            <span>${Math.round(max * 0.5).toLocaleString()}</span>
            <span>${Math.round(max * 0.25).toLocaleString()}</span>
            <span>$0</span>
          </div>
          <div className="chart-plot">
            <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ overflow: "visible", cursor: "crosshair" }} onMouseMove={handleMove} onMouseLeave={handleLeave}>
              <defs>
                <linearGradient id="gFocus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={focusColor} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={focusColor} stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="gOverlay" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3DCF82" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3DCF82" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {/* gridlines */}
              <line x1="0" y1="0"   x2={W} y2="0"   stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="0" y1={H/4} x2={W} y2={H/4} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="0" y1={H/2} x2={W} y2={H/2} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="0" y1={H*3/4} x2={W} y2={H*3/4} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="0" y1={H} x2={W} y2={H} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              {/* fill */}
              <path d={focusFill} fill="url(#gFocus)" />
              {overlayFill && <path d={overlayFill} fill="url(#gOverlay)" />}
              {/* lines */}
              <path d={focusPath} fill="none" stroke={focusColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {overlayPath && <path d={overlayPath} fill="none" stroke="#3DCF82" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
              {hoverIdx != null && (
                <>
                  <line x1={hoverX} y1="0" x2={hoverX} y2={H} stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="3,3" />
                  <circle cx={hoverX} cy={hoverYFocus} r="5" fill={focusColor} stroke="#0F0F0F" strokeWidth="2" />
                  {overlay && (<circle cx={hoverX} cy={hoverYOverlay} r="4" fill="#3DCF82" stroke="#0F0F0F" strokeWidth="2" />)}
                </>
              )}
            </svg>
            {hoverIdx != null && (
              <div className="chart-tooltip" style={{ left: `${(hoverX / W) * 100}%` }}>
                <div className="chart-tooltip-date">{dateLabel(hoverIdx)}</div>
                <div className="chart-tooltip-row">
                  <span className="chart-tooltip-dot" style={{ background: focusColor }} />
                  <span className="chart-tooltip-label">{STAT_LABEL[statFocus]}</span>
                  <span className="chart-tooltip-val" style={{ color: focusColor }}>{fmtVal(focusData[hoverIdx], statFocus)}</span>
                </div>
                {overlay && (
                  <div className="chart-tooltip-row">
                    <span className="chart-tooltip-dot" style={{ background: "#3DCF82" }} />
                    <span className="chart-tooltip-label">Commission</span>
                    <span className="chart-tooltip-val" style={{ color: "#3DCF82" }}>{fmtVal(overlay[hoverIdx], "comm")}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="chart-x-axis">
          <span>28d ago</span>
          <span>21d</span>
          <span>14d</span>
          <span>7d</span>
          <span>Today</span>
        </div>
      </div>
    </main>
  );
}

function pathFromSeries(data: number[], W: number, H: number, max: number): string {
  const dx = W / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = i * dx;
    const y = H - (v / max) * H;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return pts.join(" ");
}

function areaFromSeries(data: number[], W: number, H: number, max: number): string {
  const dx = W / (data.length - 1);
  const top = data.map((v, i) => {
    const x = i * dx;
    const y = H - (v / max) * H;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return `${top} L${W},${H} L0,${H} Z`;
}
