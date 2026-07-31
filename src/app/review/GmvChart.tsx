"use client";

/**
 * Inline SVG area chart for daily GMV. No chart library — keeps the
 * bundle lean and renders identically on every device.
 */

import { useMemo } from "react";

type Point = { date: string; gmv_amount: number };

export default function GmvChart({ daily }: { daily: Point[] }) {
  const w = 940;
  const h = 220;
  const padL = 8, padR = 8, padT = 12, padB = 24;

  const { areaPath, linePath, ticks, maxV } = useMemo(() => {
    const values = daily.map((d) => d.gmv_amount);
    const max = Math.max(1, ...values);
    const cw = w - padL - padR;
    const ch = h - padT - padB;
    const step = daily.length > 1 ? cw / (daily.length - 1) : 0;

    const pts = daily.map((d, i) => {
      const x = padL + i * step;
      const y = padT + ch - (d.gmv_amount / max) * ch;
      return [x, y] as const;
    });

    const line = pts.map(([x, y], i) => (i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : `L${x.toFixed(1)},${y.toFixed(1)}`)).join(" ");
    const area = line + ` L${(padL + (daily.length - 1) * step).toFixed(1)},${(padT + ch).toFixed(1)} L${padL.toFixed(1)},${(padT + ch).toFixed(1)} Z`;

    // 4 evenly spaced x-axis date ticks
    const tickIdx = [0, Math.floor(daily.length / 3), Math.floor((2 * daily.length) / 3), daily.length - 1];
    const tk = tickIdx.map((i) => ({
      x: padL + i * step,
      label: daily[i]?.date?.slice(5) ?? "",
    }));

    return { areaPath: area, linePath: line, ticks: tk, maxV: max };
  }, [daily]);

  const grid = [0, 0.25, 0.5, 0.75, 1].map((f) => padT + (h - padT - padB) * (1 - f));

  return (
    <div className="gmv-chart">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label="Daily GMV over 90 days">
        <defs>
          <linearGradient id="gmvFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
          </linearGradient>
        </defs>
        {grid.map((y, i) => (
          <line key={i} x1={padL} x2={w - padR} y1={y} y2={y} stroke="#1F1F1F" strokeWidth="1" />
        ))}
        <path d={areaPath} fill="url(#gmvFill)" />
        <path d={linePath} fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {ticks.map((t, i) => (
          <text key={i} x={t.x} y={h - 6} fill="#6B6660" fontSize="10.5" textAnchor="middle" fontFamily="Inter Tight, sans-serif">
            {t.label}
          </text>
        ))}
      </svg>
      <p className="gmv-max">Peak day: ${maxV.toLocaleString()}</p>
      <style jsx>{`
        .gmv-chart { width: 100%; }
        svg { width: 100%; height: auto; display: block; }
        .gmv-max {
          margin: 6px 0 0;
          font-size: 11.5px;
          color: #6B6660;
          text-align: right;
        }
      `}</style>
    </div>
  );
}
