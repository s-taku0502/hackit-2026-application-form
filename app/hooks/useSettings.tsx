"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type SettingsDoc = {
    key?: string;
    submissionDeadline?: string | null;
    judgingDeadline?: string | null;
    registrationOpen?: boolean | null;
    updatedAt?: string;
} | null;

// Hook that prefers reading settings directly from Convex when available.
export default function useSettings() {
    // Try Convex query (will be populated after `npx convex dev` regenerates bindings).
    const convexResult = useQuery((api as any).events?.getSettings as any) as SettingsDoc | undefined;
    const [fallback, setFallback] = useState<SettingsDoc | null>(null);

    useEffect(() => {
        let mounted = true;
        // If Convex query isn't available/ready, fall back to the HTTP route.
        if (!convexResult) {
            fetch("/api/settings")
                .then((r) => r.json())
                .then((data) => {
                    if (!mounted) return;
                    setFallback(data || null);
                })
                .catch(() => {
                    if (!mounted) return;
                    setFallback(null);
                });
        }
        return () => {
            mounted = false;
        };
    }, [convexResult]);

    // Prefer convexResult when present, else fallback from HTTP route.
    return convexResult !== undefined ? convexResult : fallback;
}
