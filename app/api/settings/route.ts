import { NextResponse } from "next/server";

export async function GET() {
    try {
        const enabled = process.env.NODE_ENV === "production";
        // In production we mark settings as enabled. For local development we keep it disabled.
        return NextResponse.json({ enabled });
    } catch (err) {
        return NextResponse.json({ enabled: false }, { status: 500 });
    }
}
