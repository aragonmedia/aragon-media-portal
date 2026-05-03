import { ImageResponse } from "next/og";

/**
 * Browser tab favicon — gold "AM" on black, 32×32.
 * Replaces /src/app/favicon.ico (which Next.js used as a fallback).
 * Edge runtime so this generates on the CDN, not on a server function.
 */
export const runtime = "edge";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F0F0F",
          color: "#C9A84C",
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "-0.06em",
          fontFamily: "system-ui, sans-serif",
          borderRadius: 6,
        }}
      >
        AM
      </div>
    ),
    { ...size }
  );
}
