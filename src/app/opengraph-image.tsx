import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = `${site.name} — architecture and interior design studio, New Delhi`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Typographic share card, generated at build time — no stock imagery. */
export default function OpengraphImage() {
  const lines = [200, 400, 600, 800, 1000];
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0f0f0e",
        color: "#eeeae3",
        padding: "56px 64px",
        position: "relative",
        fontFamily: "sans-serif",
      }}
    >
      {lines.map((x) => (
        <div
          key={x}
          style={{ position: "absolute", left: x, top: 0, bottom: 0, width: 1, background: "rgba(238,234,227,0.08)" }}
        />
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, letterSpacing: 4, opacity: 0.7 }}>
        <span>{site.descriptor.toUpperCase()}</span>
        <span>
          {site.coordinates.lat} {site.coordinates.lng}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 132,
          fontWeight: 600,
          lineHeight: 0.86,
          letterSpacing: -4,
        }}
      >
        <span>RIDDHI</span>
        <span style={{ paddingLeft: 180 }}>SIDDHI</span>
        <span>DESIGNERS</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(238,234,227,0.3)",
          paddingTop: 20,
          fontSize: 20,
          letterSpacing: 4,
        }}
      >
        <span>NEW DELHI / INDIA</span>
        <span style={{ color: "#c06a4e" }}>SPACE / FORM / LIGHT</span>
      </div>
    </div>,
    size,
  );
}
