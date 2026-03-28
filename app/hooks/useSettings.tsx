"use client";

import { useEffect, useState } from "react";

type SettingsResponse = { enabled: boolean } | null;

export default function useSettings() {
    const [settings, setSettings] = useState<SettingsResponse>(null);
    useEffect(() => {
        let mounted = true;
        fetch("/api/settings")
            .then((r) => r.json())
            .then((data) => {
                if (!mounted) return;
                setSettings(data);
            })
            .catch(() => {
                if (!mounted) return;
                setSettings({ enabled: false });
            });
        return () => {
            mounted = false;
        };
    }, []);
    return settings;
}
