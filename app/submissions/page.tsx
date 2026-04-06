"use client";

import React, { useState, useEffect } from "react";
import useSettings from "../hooks/useSettings";
import Countdown from "../components/Countdown";
// import { useQuery, useMutation } from "convex/react";
// import { api } from "../../convex/_generated/api";

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

    // const submitTeamMutation = useMutation(api.events.submitTeam);
    const submitTeamMutation = async (data: any) => {
        const res = await fetch("/api/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "team_update", data }),
        });
        if (!res.ok) throw new Error("Failed to update team");
        return res.json();
    };

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

    // const events = useQuery(api.events.listEvents) || [];
    const [events, setEvents] = useState<any[]>([]);
    useEffect(() => {
        fetch("/api/submit")
            .then(res => res.json())
            .then(data => setEvents(data))
            .catch(err => console.error(err));
    }, []);
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
    const { settings, phase } = useSettings();
    const [now, setNow] = useState<Date>(new Date());
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const appStart = settings?.eventApplicationStart ? new Date(settings.eventApplicationStart) : null;
    const submissionDeadline = settings?.submissionDeadline ? new Date(settings.submissionDeadline) : null;
    const isDevelopment = settings?.isDevelopment === true;

    const beforeStart = !isDevelopment && mounted && (phase === "before" || phase === "application" || phase === "registration");
    const afterSubmissionEnd = !isDevelopment && mounted && phase === "after";

    useEffect(() => {
        // legacy fallback: if /api/settings returned { enabled: false } in dev, bypass gate
        if (settings && settings.enabled === false) {
            setAuthorized(true);
        }
    }, [settings]);

    if (beforeStart && submissionDeadline) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <Countdown targetDate={submissionDeadline} title="プロダクト提出開始まで" message="プロダクト提出はまだ開始されていません。" />
            </div>
        );
    }
    if (afterSubmissionEnd) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <div className="p-8 bg-white rounded-xl shadow-sm border border-amber-100 text-center">
                    <h1 className="text-2xl font-bold text-amber-900 mb-4">プロダクト提出は終了しました</h1>
                    <p className="text-amber-700 mb-6">すべての受付期間が終了しました。たくさんのご参加ありがとうございました。</p>
                    <div className="flex justify-center">
                        <a href="/" className="px-6 py-3 bg-amber-100 text-amber-900 rounded-lg font-bold hover:bg-amber-200 transition-colors">トップへ</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-yellow-50 to-white">
            <div className="max-w-3xl mx-auto p-6 relative">
            <h1 className="text-2xl font-bold mb-4 text-amber-900">プロダクト情報登録フォーム</h1>

            {isDevelopment && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm font-semibold text-center">
                    🔧 開発モード: 自動リダイレクトと期間制限が無視されています
                </div>
            )}

            {!isDevelopment && mounted && submissionDeadline && phase === "submission" && (
                <Countdown targetDate={submissionDeadline} title="プロダクト提出締切まで" />
            )}

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
        </div>
    );
}
