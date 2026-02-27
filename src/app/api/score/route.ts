import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { fetchAllData } from "@/lib/data";
import { computeCompositeScore } from "@/lib/scoring/composite";
import { generateExplanation } from "@/lib/ai/explain";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. 20 scans per day." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { address } = body;

    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const trimmed = address.trim();

    // Validate: must be a valid Ethereum address or ENS name
    if (!isAddress(trimmed) && !trimmed.endsWith(".eth") && !trimmed.includes(".")) {
      return NextResponse.json(
        { error: "Invalid Ethereum address or ENS name" },
        { status: 400 }
      );
    }

    // Fetch data
    const data = await fetchAllData(trimmed);

    // Score
    const scoringResult = computeCompositeScore(data);

    // Generate AI explanation
    const explanation = await generateExplanation(scoringResult);

    return NextResponse.json({
      ...scoringResult,
      explanation,
    });
  } catch (error) {
    console.error("Score API error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
