"use client";

/**
 * Admin Overview line chart.
 *
 * Two series: Activation Revenue (gold) + AM Commissions (green).
 * Three range tabs: Last 7d / Last 28d / Lifetime.
 *
 * Server hands us the full lifetime daily series. Client picks the slice
 * that matches the active range. Lifetime > 28 days collapses into weekly
 * buckets so the line stays readable.
 *
 * Aesthetic mirrors the GMV preview chart in /dashboard/tiktok-account so
 * creator-side and admin-side charts read as one design language.
 */

import { useEffect, useMemo, useRef, useState } from "react";

type Day = { date: string; revenue: number; commissions: number };

const W = 760;
const H = 220;

function fmtUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function bucketWeekly(days: Day[]): Day[] {
  if (days.length === 0) return days;
  const out: Day[] = [];
  for (let i = 0; i < days.length; i += 7) {
    const slice = days.slice(i, i + 7);
    out.push({
      date: slice[slice.length - 1].date,
      revenue: slice.reduce((a, b) => a + b.revenue, 0),
      commissions: slice.reduce((a, b) => a + b.commissions, 0),
    });
  }
  return out;
}

export default function OverviewChart({ daily }: { daily: Day[] }) {
  const [range, setRange] = useState<"7d" | "28d" | "lifetime">("28d");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [wrapW, setWrapW] = useState(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Re-measure the wrapper width so tooltip positioning stays accurate on resize.
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setWrapW(e.contentRect.width);
      }
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const series = useMemo<Day[]>(() => {
    // Server now sends a 90-day-minimum window so even a brand-new portal
    // shows the full date strip. Slice straight off the tail per tab so
    // the count of days always equals the tab's promise.
    if (range === "7d") return daily.slice(-7);
    if (range === "28d") return daily.slice(-28);
    // Lifetime: if the underlying history is short, still show at least
    // the last 28 days so the chart doesn't collapse to 1 dot. Past 56
    // days bucket weekly so the line stays readable.
    if (daily.length <= 28) return daily.slice(-28);
    if (daily.length <= 56) return daily;
    return bucketWeekly(daily);
  }, [daily, range]);

  const totals = useMemo(
    () =>
      series.reduce(
        (a, b) => ({
          revenue: a.revenue + b.revenue,
          commissions: a.commissions + b.commissions,
        }),
        { revenue: 0, commissions: 0 }
      ),
    [series]
  );

  // Prior period of equal length (immediately before the active range)
  // so we can render a +/- % delta. Lifetime view doesn't have a prior
  // period, so we hide the chip in that case.
  const prior = useMemo(() => {
    if (range === "lifetime") return null;
    const span = range === "7d" ? 7 : 28;
    const start = Math.max(0, daily.length - span * 2);
    const end = Math.max(0, daily.length - span);
    const slice = daily.slice(start, end);
    return slice.reduce(
      (a, b) => ({
        revenue: a.revenue + b.revenue,
        commissions: a.commissions + b.commissions,
      }),
      { revenue: 0, commissions: 0 }
    );
  }, [daily, range]);

  function pct(current: number, before: number): { label: string; tone: "up" | "down" | "flat" } | null {
    if (!prior) return null;
    if (current === 0 && before === 0) return { label: "—", tone: "flat" };
    if (before === 0) return { label: "new", tone: "up" };
    const delta = ((current - before) / before) * 100;
    const rounded = Math.round(delta);
    if (rounded === 0) return { label: "0%", tone: "flat" };
    return {
      label: `${rounded > 0 ? "+" : ""}${rounded}%`,
      tone: rounded > 0 ? "up" : "down",
    };
  }
  const revPct = pct(totals.revenue, prior?.revenue ?? 0);
  const commPct = pct(totals.commissions, prior?.commissions ?? 0);

  const max = Math.max(
    100, // 1 dollar floor so flat zeros sit at the bottom, not centered
    ...series.flatMap((d) => [d.revenue, d.commissions])
  );

  function pointsFor(getter: (d: Day) => number): { x: number; y: number }[] {
    if (series.length === 0) return [];
    if (series.length === 1) {
      return [{ x: W / 2, y: H - (getter(series[0]) / max) * H }];
    }
    return series.map((d, i) => ({
      x: (i / (series.length - 1)) * W,
      y: H - (getter(d) / max) * H,
    }));
  }

  // Catmull-Rom-style smoothing: each segment uses two control points so
  // the line passes THROUGH every data point but the corners are round.
  // Tension < 1 = smoother (we use 0.4 for a gentle but readable curve).
  function pathFor(pts: { x: number; y: number }[]): string {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    const TENSION = 0.4;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;
      const c1x = p1.x + ((p2.x - p0.x) / 6) * TENSION * 2;
      const c1y = p1.y + ((p2.y - p0.y) / 6) * TENSION * 2;
      const c2x = p2.x - ((p3.x - p1.x) / 6) * TENSION * 2;
      const c2y = p2.y - ((p3.y - p1.y) / 6) * TENSION * 2;
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }

  function fillFor(pts: { x: number; y: number }[]): string {
    if (pts.length === 0) return "";
    const top = pathFor(pts);
    return `${top} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;
  }

  const revPts = pointsFor((d) => d.revenue);
  const commPts = pointsFor((d) => d.commissions);

  function onMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current || series.length === 0) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return;
    const local = pt.matrixTransform(ctm.inverse());
    const idx = Math.max(
      0,
      Math.min(
        series.length - 1,
        Math.round((local.x / W) * (series.length - 1))
      )
    );
    setHoverIdx(idx);
  }

  const hoverDay = hoverIdx !== null ? series[hoverIdx] : null;
  const hoverX = hoverIdx !== null && revPts[hoverIdx] ? revPts[hoverIdx].x : 0;
  const hoverYRev =
    hoverIdx !== null && revPts[hoverIdx] ? revPts[hoverIdx].y : 0;
  const hoverYComm =
    hoverIdx !== null && commPts[hoverIdx] ? commPts[hoverIdx].y : 0;

  // Project the SVG-space x-coordinate into CSS px space inside the wrap.
  // The SVG sits in a 60px left rail (y-axis labels). Width = (wrapW - 60).
  const tooltipPxLeft = (() => {
    if (wrapW === 0 || hoverIdx === null) return 0;
    const svgPxW = Math.max(1, wrapW - 60);
    return 60 + (hoverX / W) * svgPxW;
  })();
  const tooltipYPx = (() => {
    if (hoverIdx === null) return 0;
    // Anchor above the higher of the two dots, plus a small gap
    const minY = Math.min(hoverYRev, hoverYComm);
    return (minY / H) * 240; // svg height in CSS px (matches .ovr-chart-svg height)
  })();

  // Only suppress the chart entirely when there's literally no series at
  // all (newest install). Once there's any history, both lines render so
  // the trend reads cleanly even when one side is zero on a given day.
  const empty = series.length === 0;

  return (
    <div className="ovr-chart-card">
      <div className="ovr-chart-head">
        <div>
          <div className="ovr-chart-eyebrow">Revenue &amp; AM Commissions</div>
          <div className="ovr-chart-totals">
            <span className="ovr-chart-total ovr-chart-rev">
              <span className="ovr-chart-dot" /> Revenue {fmtUsd(totals.revenue)}
              {revPct && (
                <span className={`ovr-chart-trend ovr-chart-trend-${revPct.tone}`}>
                  {revPct.label}
                </span>
              )}
            </span>
            <span className="ovr-chart-total ovr-chart-comm">
              <span className="ovr-chart-dot" /> Commissions {fmtUsd(totals.commissions)}
              {commPct && (
                <span className={`ovr-chart-trend ovr-chart-trend-${commPct.tone}`}>
                  {commPct.label}
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="ovr-chart-tabs" role="tablist">
          {(["7d", "28d", "lifetime"] as const).map((r) => (
            <button
              key={r}
              type="button"
              className={`ovr-chart-tab${range === r ? " is-active" : ""}`}
              onClick={() => {
                setRange(r);
                setHoverIdx(null);
              }}
            >
              {r === "7d" ? "Last 7d" : r === "28d" ? "Last 28d" : "Lifetime"}
            </button>
          ))}
        </div>
      </div>

      <div className="ovr-chart-svg-wrap" ref={wrapRef}>
        {empty ? (
          <div className="ovr-chart-empty">
            No paid revenue or commissions yet in this range. Numbers populate
            once Square purchases or paid withdrawals land.
          </div>
        ) : (
          <>
          {/* Y-axis $ ticks at quartiles */}
          <div className="ovr-chart-yaxis">
            <span>{fmtUsd(max)}</span>
            <span>{fmtUsd(Math.round(max * 0.75))}</span>
            <span>{fmtUsd(Math.round(max * 0.5))}</span>
            <span>{fmtUsd(Math.round(max * 0.25))}</span>
            <span>$0</span>
          </div>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            onMouseMove={onMouseMove}
            onMouseLeave={() => setHoverIdx(null)}
            className="ovr-chart-svg"
          >
            <defs>
              <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(201,168,76,0.32)" />
                <stop offset="100%" stopColor="rgba(201,168,76,0)" />
              </linearGradient>
              <linearGradient id="gComm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(31,139,83,0.30)" />
                <stop offset="100%" stopColor="rgba(31,139,83,0)" />
              </linearGradient>
            </defs>

            {/* gridlines */}
            <line x1="0" y1="0"     x2={W} y2="0"     stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <line x1="0" y1={H/4}   x2={W} y2={H/4}   stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <line x1="0" y1={H/2}   x2={W} y2={H/2}   stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <line x1="0" y1={H*3/4} x2={W} y2={H*3/4} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <line x1="0" y1={H}     x2={W} y2={H}     stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

            {/* fills */}
            {revPts.length > 1 && <path d={fillFor(revPts)} fill="url(#gRev)" />}
            {commPts.length > 1 && <path d={fillFor(commPts)} fill="url(#gComm)" />}

            {/* lines */}
            {revPts.length > 0 && (
              <path
                d={pathFor(revPts)}
                fill="none"
                stroke="#C9A84C"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {commPts.length > 0 && (
              <path
                d={pathFor(commPts)}
                fill="none"
                stroke="#1F8B53"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* hover */}
            {hoverIdx !== null && (
              <>
                <line
                  x1={hoverX}
                  y1="0"
                  x2={hoverX}
                  y2={H}
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <circle cx={hoverX} cy={hoverYRev} r="5" fill="#C9A84C" stroke="#0F0F0F" strokeWidth="2" />
                <circle cx={hoverX} cy={hoverYComm} r="4" fill="#1F8B53" stroke="#0F0F0F" strokeWidth="2" />
              </>
            )}
          </svg>
          {/* X-axis date ticks — actual day-level dates ("Apr 4", "Apr 7"…)
              spaced to ~7 markers so the strip stays readable on every range. */}
          <div className="ovr-chart-xaxis">
            {(() => {
              if (series.length === 0) return null;
              const targetTicks = 7;
              const tickIdxs: number[] = [];
              if (series.length <= targetTicks) {
                for (let i = 0; i < series.length; i++) tickIdxs.push(i);
              } else {
                for (let i = 0; i < targetTicks; i++) {
                  tickIdxs.push(Math.round((i / (targetTicks - 1)) * (series.length - 1)));
                }
              }
              return tickIdxs.map((i) => {
                const d = new Date(series[i].date + "T00:00:00Z");
                return (
                  <span key={i}>
                    {d.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                );
              });
            })()}
          </div>
          </>
        )}

        {hoverDay && !empty && wrapW > 0 && (() => {
          // Clamp left so the card never spills off the chart edges.
          const cardW = 200;
          const margin = 8;
          let left = tooltipPxLeft - cardW / 2;
          left = Math.max(margin, Math.min(wrapW - cardW - margin, left));
          // Position vertically above the higher dot, fall back to top if too high
          const top = Math.max(8, tooltipYPx - 90);
          const dateLabel = new Date(hoverDay.date + "T00:00:00Z").toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric" }
          );
          return (
            <div
              className="ovr-chart-tooltip-floating"
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${cardW}px`,
              }}
            >
              <div className="ovr-chart-tooltip-date">
                {dateLabel.toUpperCase()}
              </div>
              <div className="ovr-chart-tooltip-row">
                <span className="ovr-chart-tooltip-label">
                  <span className="ovr-chart-dot ovr-chart-dot-rev" /> Revenue
                </span>
                <span className="ovr-chart-tooltip-value ovr-chart-rev">
                  {fmtUsd(hoverDay.revenue)}
                </span>
              </div>
              <div className="ovr-chart-tooltip-row">
                <span className="ovr-chart-tooltip-label">
                  <span className="ovr-chart-dot ovr-chart-dot-comm" /> Commission
                </span>
                <span className="ovr-chart-tooltip-value ovr-chart-comm">
                  {fmtUsd(hoverDay.commissions)}
                </span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
