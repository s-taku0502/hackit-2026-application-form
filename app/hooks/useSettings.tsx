"use client";

import { useEffect, useState } from "react";
// import { useQuery } from "convex/react";
// import { api } from "../../convex/_generated/api";

type SettingsDoc = {
    key?: string;
    submissionDeadline?: string | null;
    judgingDeadline?: string | null;
    registrationOpen?: boolean | null;
    updatedAt?: string;
} | null;

// Hook that prefers reading settings directly from Convex when available.
export default function useSettings() {
    const [data, setData] = useState<SettingsDoc | null>(null);

    useEffect(() => {
        let mounted = true;
        fetch("/api/settings")
            .then((r) => r.json())
            .then((d) => {
                if (!mounted) return;
                setData(d || null);
            })
            .catch(() => {
                if (!mounted) return;
                setData(null);
            });
        return () => {
            mounted = false;
        };
    }, []);

    return data;
}
