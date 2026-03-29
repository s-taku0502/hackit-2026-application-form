"use client";

import React, { useEffect, useState } from "react";
import useSettings from "../hooks/useSettings";

export default function DeadlineBanner() {
    const settings = useSettings();
    const [now, setNow] = useState<Date>(new Date());

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    function parseSettingDate(s: any, key: string): Date | null {
        if (!s) return null;
        const v = s[key];
        if (!v) return null;
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    }

    function renderDeadlineCountdown(target: Date, label: string) {
        const diff = Math.max(0, target.getTime() - now.getTime());
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        return (
            <div className="p-4 bg-sky-50 border border-sky-200 rounded text-center mb-4">
                <a className="text-sm text-slate-700 whitespace-pre-line">{label}</a>
                <a className="mt-2 text-xl font-mono">{`${days}日 ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}</a>
                <p className="mt-2 text-sm text-slate-600">締切日時: {target.toLocaleString("ja-JP", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
        );
    }

    const eventEnd = parseSettingDate(settings, "eventApplicationEnd");
    const teamEnd = parseSettingDate(settings, "teamRegistrationEnd");
    const submissionDeadline = parseSettingDate(settings, "submissionDeadline");

    // Display priority:
    // 1) before eventEnd -> countdown to eventEnd
    // 2) between eventEnd and teamEnd -> countdown to teamEnd
    // 3) between teamEnd and submissionDeadline -> countdown to submissionDeadline
    // Fallbacks: if any anchor is missing, show the next available future deadline.
    const showEventEnd = eventEnd && now < eventEnd;
    const showTeamEnd =
        teamEnd && ((eventEnd && now >= eventEnd && now < teamEnd) || (!eventEnd && now < teamEnd));
    const showSubmission =
        submissionDeadline &&
        ((teamEnd && now >= teamEnd && now < submissionDeadline) || (!teamEnd && now < submissionDeadline));

    return (
        <div>
            {showEventEnd && renderDeadlineCountdown(eventEnd!, `参加募集中。\n締切までの残り時間：`)}
            {showTeamEnd && renderDeadlineCountdown(teamEnd!, `チーム登録期間中。\n締切までの残り時間：`)}
            {showSubmission && renderDeadlineCountdown(submissionDeadline!, `プロダクト登録期間中。\n締切までの残り時間：`)}
        </div>
    );
}
