import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const res = NextResponse.next();

    // Security headers
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "no-referrer");
    res.headers.set("Permissions-Policy", "geolocation=()",);
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

    // Basic Content Security Policy — tweak for your asset hosts
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "connect-src 'self'",
        "font-src 'self' data:",
    ].join("; ");
    res.headers.set("Content-Security-Policy", csp);

    return res;
}

export const config = {
    matcher: "/:path*",
};
