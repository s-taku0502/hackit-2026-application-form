import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const keyword = typeof body?.keyword === "string" ? body.keyword : "";
        const expected = process.env.PAGE_KEYWORD || "";
        const ok = expected !== "" && keyword === expected;
        return NextResponse.json({ ok });
    } catch (err) {
        return NextResponse.json({ ok: false }, { status: 400 });
    }
}
