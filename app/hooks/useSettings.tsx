"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export type SettingsDoc = {
    enabled?: boolean;
    isDevelopment?: boolean;
    eventApplicationStart?: string | null;
    eventApplicationEnd?: string | null;
    teamRegistrationEnd?: string | null;
    submissionDeadline?: string | null;
} | null;

export type Phase = "before" | "application" | "registration" | "submission" | "after";

export default function useSettings() {
    const [data, setData] = useState<SettingsDoc | null>(null);
    const [phase, setPhase] = useState<Phase>("before");
    const router = useRouter();
    const pathname = usePathname();

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

    useEffect(() => {
        if (!data) return;

        const now = new Date();
        const start = data.eventApplicationStart ? new Date(data.eventApplicationStart) : null;
        const appEnd = data.eventApplicationEnd ? new Date(data.eventApplicationEnd) : null;
        const regEnd = data.teamRegistrationEnd ? new Date(data.teamRegistrationEnd) : null;
        const subEnd = data.submissionDeadline ? new Date(data.submissionDeadline) : null;

        let currentPhase: Phase = "before";

        if (subEnd && now > subEnd) {
            currentPhase = "after";
        } else if (regEnd && now > regEnd) {
            currentPhase = "submission";
        } else if (appEnd && now > appEnd) {
            currentPhase = "registration";
        } else if (start && now > start) {
            currentPhase = "application";
        } else {
            currentPhase = "before";
        }

        setPhase(currentPhase);

        // DEV_MODE=1 (isDevelopment=true) の場合はリダイレクトをスキップ
        if (data.isDevelopment) return;

        // フェーズに応じた自動リダイレクト
        if (currentPhase === "application" && pathname !== "/") {
            router.push("/");
        } else if (currentPhase === "registration" && pathname !== "/teams") {
            router.push("/teams");
        } else if (currentPhase === "submission" && pathname !== "/submissions") {
            router.push("/submissions");
        }
    }, [data, pathname, router]);

    return { settings: data, phase };
}
