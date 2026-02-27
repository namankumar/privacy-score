import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

function getScoreColor(score: number): string {
  if (score >= 80) return "#34d399";
  if (score >= 60) return "#4ade80";
  if (score >= 40) return "#facc15";
  if (score >= 20) return "#fb923c";
  return "#f87171";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Moderate";
  if (score >= 20) return "Poor";
  return "Critical";
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const score = parseInt(searchParams.get("score") || "0");
  const address = searchParams.get("address") || "0x...";

  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const displayAddr =
    address.length > 12
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#71717a",
            marginBottom: 20,
            letterSpacing: "0.1em",
          }}
        >
          PRIVACY SCORE
        </div>

        {/* Score circle */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: `6px solid ${color}`,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: color,
              lineHeight: 1,
            }}
          >
            {score}
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#71717a",
              marginTop: 4,
            }}
          >
            / 100
          </div>
        </div>

        {/* Label */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: color,
            marginBottom: 12,
          }}
        >
          {label}
        </div>

        {/* Address */}
        <div
          style={{
            fontSize: 18,
            color: "#52525b",
            fontFamily: "monospace",
          }}
        >
          {displayAddr}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
