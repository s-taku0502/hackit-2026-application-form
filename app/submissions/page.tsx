"use client";

import React, { useState, useEffect } from "react";
import useSettings from "../hooks/useSettings";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function TeamsPage() {
    const [teamName, setTeamName] = useState("");
    const [mounted, setMounted] = useState(false);
    const [leaderName, setLeaderName] = useState("");
    const [productName, setProductName] = useState("");
    const [teamPassphrase, setTeamPassphrase] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [githubUrlBackup, setGithubUrlBackup] = useState("");
    const [publicSite, setPublicSite] = useState("");
    const [publicSiteBackup, setPublicSiteBackup] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const [authorized, setAuthorized] = useState(false);
    const [keywordInput, setKeywordInput] = useState("");
    const [authError, setAuthError] = useState("");
    const [authLoading, setAuthLoading] = useState(false);

    const submitTeamMutation = useMutation(api.events.submitTeam);

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        // teams テーブルを上書きする（submitTeam はアップサート実装）
        submitTeamMutation({
            productName: productName || undefined,
            teamName,
            teamPassphrase: teamPassphrase || undefined,
            leaderName: leaderName || undefined,
            githubUrl: githubUrl || undefined,
            githubUrlBackup: githubUrlBackup || undefined,
            publicSite: publicSite || undefined,
            publicSiteBackup: publicSiteBackup || undefined,
            submittedAt: new Date().toISOString(),
        })
            .then(() => setSubmitted(true))
            .catch((err) => console.error(err));
    }

    const events = useQuery(api.events.listEvents) || [];
    // events から teamName があるものを抽出して重複を排除した配列を作る
    const teams = Array.from(
        new Map(
            events
                .filter((e: any) => e.teamName && e.teamName.trim() !== "")
                .map((e: any) => [e.teamName, e])
        ).values()
    );

    const selectedTeam = teams.find((t: any) => t.teamName === teamName);
    const leaderMatches = !!(
        selectedTeam &&
        selectedTeam.leaderName &&
        selectedTeam.leaderName === leaderName
    );

    async function verifyKeyword(e?: React.FormEvent) {
        if (e) e.preventDefault();
        setAuthError("");
        setAuthLoading(true);
        try {
            const res = await fetch("/api/teams/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ keyword: keywordInput }),
            });
            const data = await res.json();
            if (data?.ok) setAuthorized(true);
            else setAuthError("キーワードが正しくありません。");
        } catch (err) {
            setAuthError("認証中にエラーが発生しました。");
        } finally {
            setAuthLoading(false);
        }
    }

    useEffect(() => {
        // ページ読み込み時は特に処理なし（オーバーレイで入力を促す）
        setMounted(true);
    }, []);

    // Load app settings and, if settings are disabled (development), bypass keyword gate.
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

    const appStart = parseSettingDate(settings, "eventApplicationStart");
    const appEnd = parseSettingDate(settings, "eventApplicationEnd");
    const submissionDeadline = parseSettingDate(settings, "submissionDeadline");
    const beforeStart = appStart && now < appStart;
    const afterSubmissionEnd = submissionDeadline && now > submissionDeadline;

    useEffect(() => {
        // legacy fallback: if /api/settings returned { enabled: false } in dev, bypass gate
        if (settings && (settings as any).enabled === false) {
            setAuthorized(true);
        }
    }, [settings]);

    function renderCountdown(target: Date) {
        const diff = Math.max(0, target.getTime() - now.getTime());
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        return (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded text-center">
                <p className="text-lg font-semibold">プロダクト情報登録はまだ開始されていません。</p>
                <p className="mt-2">開始までの残り時間：</p>
                <div className="mt-3 text-2xl font-mono">{`${days}日 ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}</div>
            </div>
        );
    }

    function renderDeadlineCountdown(target: Date, label: string) {
        const diff = Math.max(0, target.getTime() - now.getTime());
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        return (
            <div className="p-4 bg-sky-50 border border-sky-200 rounded text-center mb-4">
                <p className="text-sm text-slate-700">{label}</p>
                <div className="mt-2 text-xl font-mono">{`${days}日 ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}</div>
            </div>
        );
    }

    if (beforeStart && appStart) {
        return <div className="max-w-3xl mx-auto p-6">{renderCountdown(appStart)}</div>;
    }
    if (afterSubmissionEnd && submissionDeadline) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <div className="p-6 bg-red-50 border border-red-200 rounded">
                    <h1 className="text-2xl font-bold mb-4">プロダクト登録は終了しました</h1>
                    <p>申し込みは終了しました。不明点があれば下記問い合わせ先へお問い合わせください。</p>
                    <p className="mt-2 text-sm">問い合わせ: <a href="https://x.com/HacKit_KIT" className="underline">@HacKit_KIT</a></p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 relative">
            <h1 className="text-2xl font-bold mb-4">プロダクト情報登録フォーム</h1>

            {submissionDeadline && now < submissionDeadline && renderDeadlineCountdown(submissionDeadline, "プロダクト登録の締切までの残り時間：")}

            {!authorized && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-50">
                    <form onSubmit={verifyKeyword} className="w-full max-w-sm p-6 bg-white rounded shadow">
                        <h2 className="text-lg font-semibold mb-4">アクセスにキーワードが必要です</h2>
                        <label className="block mb-3">
                            <span className="block text-sm">キーワード</span>
                            <input
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                className="mt-1 block w-full border rounded px-3 py-2"
                                required
                            />
                        </label>
                        {authError && <div className="text-red-600 mb-2">{authError}</div>}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-amber-600 text-white rounded"
                                disabled={authLoading}
                            >
                                {authLoading ? "確認中..." : "確認"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {submitted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-center">
                    送信ありがとうございます。 <br />
                    登録内容を保存しました。
                </div>
            ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                    <label className="block">
                        <span className="block font-medium">チーム名（既存から選択）</span>
                        <select
                            className="mt-1 block w-full border rounded px-3 py-2"
                            value={teamName}
                            onChange={(e) => {
                                const sel = teams.find((t: any) => t.teamName === e.target.value);
                                setTeamName(e.target.value);
                                if (sel) {
                                    // Do not auto-fill leaderName when a team is selected.
                                    setProductName(sel.productName || "");
                                    setTeamPassphrase(sel.teamPassphrase || "");
                                    setGithubUrl(sel.githubUrl || "");
                                    setGithubUrlBackup(sel.githubUrlBackup || "");
                                    setPublicSite(sel.publicSite || "");
                                    setPublicSiteBackup(sel.publicSiteBackup || "");
                                }
                            }}
                            disabled={!authorized}
                            required
                        >
                            <option value="">-- チームを選択 --</option>
                                {teams.map((t: any) => (
                                    <option key={t._id} value={t.teamName}>
                                        {t.teamName}
                                    </option>
                                ))}
                        </select>
                    </label>

                    <label className="block">
                        <span className="block font-medium">プロダクト名</span>
                        <input
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="mt-1 block w-full border rounded px-3 py-2"
                            required
                            disabled={!authorized}
                        />
                    </label>

                    <label className="block">
                        <span className="block font-medium">チーム合言葉</span>
                        <input
                            value={teamPassphrase}
                            onChange={(e) => setTeamPassphrase(e.target.value)}
                            className="mt-1 block w-full border rounded px-3 py-2"
                            placeholder="チームの合言葉を入力"
                            disabled={!authorized}
                        />
                    </label>

                    <label className="block">
                        <span className="block font-medium">リーダー氏名（既存から選択）</span>
                        <select
                            className="mt-1 block w-full border rounded px-3 py-2"
                            value={leaderName}
                            onChange={(e) => setLeaderName(e.target.value)}
                            required
                            disabled={!authorized}
                        >
                            <option value="">-- リーダーを選択 --</option>
                            {Array.from(
                                new Map(
                                    events
                                        .map((ev: any) => ev.leaderName)
                                        .filter((n: any) => n && String(n).trim() !== "")
                                        .map((n: any) => [n, n])
                                ).values()
                            ).map((name: any) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </label>

                    {leaderMatches ? (
                        <>
                            <label className="block">
                                <span className="block font-medium">GitHub URL</span>
                                <input
                                    value={githubUrl}
                                    onChange={(e) => setGithubUrl(e.target.value)}
                                    className="mt-1 block w-full border rounded px-3 py-2"
                                    placeholder="https://github.com/your-org/your-repo"
                                    disabled={!authorized}
                                />
                            </label>

                            <label className="block">
                                <span className="block font-medium">GitHub URL (予備)</span>
                                <input
                                    value={githubUrlBackup}
                                    onChange={(e) => setGithubUrlBackup(e.target.value)}
                                    className="mt-1 block w-full border rounded px-3 py-2"
                                    placeholder="https://github.com/backup/your-repo"
                                    disabled={!authorized}
                                />
                            </label>

                            <label className="block">
                                <span className="block font-medium">公開サイト等</span>
                                <input
                                    value={publicSite}
                                    onChange={(e) => setPublicSite(e.target.value)}
                                    className="mt-1 block w-full border rounded px-3 py-2"
                                    placeholder="https://example.com"
                                    disabled={!authorized}
                                />
                            </label>

                            <label className="block">
                                <span className="block font-medium">公開サイト等 (予備)</span>
                                <input
                                    value={publicSiteBackup}
                                    onChange={(e) => setPublicSiteBackup(e.target.value)}
                                    className="mt-1 block w-full border rounded px-3 py-2"
                                    placeholder="https://backup.example.com"
                                    disabled={!authorized}
                                />
                            </label>

                            <div>
                                <button className="px-4 py-2 bg-amber-600 text-white rounded" type="submit" disabled={!authorized}>
                                    送信
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="p-3 text-sm text-slate-600">チーム名とリーダー氏名が一致した場合に、追加項目が表示されます。</div>
                    )}
                </form>
            )}
        </div>
    );
}
