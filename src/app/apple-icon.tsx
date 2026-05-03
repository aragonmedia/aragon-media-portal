import { ImageResponse } from "next/og";

/**
 * iOS home-screen icon — gold "AM" on black, 180×180 (Apple spec).
 * Renders when a creator pins the portal to their home screen.
 */
export const runtime = "edge";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 96,
          fontWeight: 800,
          letterSpacing: "-0.06em",
          fontFamily: "system-ui, sans-serif",
          borderRadius: 36,
        }}
      >
        AM
      </div>
    ),
    { ...size }
  );
}
