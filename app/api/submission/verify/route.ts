import { NextResponse } from "next/server";

// Simple in-memory rate limiter (per-process). Protects the verify endpoint from abuse.
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 20; // max requests per window per IP
const rateMap: Map<string, number[]> = new Map();

function getIp(req: Request) {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
    try {
        const ip = getIp(req);
        const now = Date.now();
        const arr = rateMap.get(ip) || [];
        const windowed = arr.filter((t) => t > now - RATE_LIMIT_WINDOW_MS);
        if (windowed.length >= RATE_LIMIT_MAX) {
            return NextResponse.json({ ok: false }, { status: 429 });
        }
        windowed.push(now);
        rateMap.set(ip, windowed);

        const body = await req.json();
        const keyword = typeof body?.keyword === "string" ? body.keyword.slice(0, 256) : "";
        const expected = process.env.PAGE_KEYWORD || "";
        const ok = expected !== "" && keyword === expected;
        return NextResponse.json({ ok });
    } catch (err) {
        return NextResponse.json({ ok: false }, { status: 400 });
    }
}
