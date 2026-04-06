"use client";

import React, { useState, useEffect } from "react";
import useSettings from "../hooks/useSettings";
import Countdown from "../components/Countdown";
// import { useQuery, useMutation } from "convex/react";
// import { api } from "../../convex/_generated/api";

export default function TeamsCreatePage() {
    const { settings, phase } = useSettings();
    const [teamName, setTeamName] = useState("");
    const [productName, setProductName] = useState("");
    const [leaderFamilyName, setLeaderFamilyName] = useState("");
    const [leaderGivenName, setLeaderGivenName] = useState("");
    const [leaderStudentId, setLeaderStudentId] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [now, setNow] = useState<Date>(new Date());
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const appStart = settings?.eventApplicationStart ? new Date(settings.eventApplicationStart) : null;
    const teamEnd = settings?.teamRegistrationEnd ? new Date(settings.teamRegistrationEnd) : null;
    const isDevelopment = settings?.isDevelopment === true;

    // Only evaluate time-based conditions after client mount to avoid SSR/CSR mismatch
    const beforeStart = !isDevelopment && mounted && phase === "before";
    const afterTeamEnd = !isDevelopment && mounted && (phase === "submission" || phase === "after");

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

    // const events = useQuery(api.events.listEvents) || [];
    const [events, setEvents] = useState<any[]>([]);
    useEffect(() => {
        fetch("/api/submit")
            .then(res => res.json())
            .then(data => setEvents(data))
            .catch(err => console.error(err));
    }, []);
    const teams = Array.from(
        new Map(
            events.filter((e: any) => e.teamName && e.teamName.trim() !== "").map((e: any) => [e.teamName, e])
        ).values()
    );

    function computeEmail(id: string) {
        return id ? `${id}@st.kanazawa-it.ac.jp` : "";
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        try {
            const leaderEmail = computeEmail(leaderStudentId);
            const combinedName = `${leaderFamilyName.trim()}　${leaderGivenName.trim()}`.trim();
            // Map team registration to the events.submitEvent shape expected by Convex.
            await submitTeamMutation({
                teamName: teamName || "",
                productName: productName || undefined,
                leaderName: combinedName || "",
                leaderStudentId: leaderStudentId || "",
                leaderEmail: leaderEmail || "",
                submittedAt: new Date().toISOString(),
            });
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            setError("送信中にエラーが発生しました。");
        }
    }

    if (beforeStart && appStart) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <Countdown targetDate={appStart} title="チーム登録開始まで" message="チーム登録はまだ開始されていません。" />
            </div>
        );
    }
    if (afterTeamEnd) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <div className="p-8 bg-white rounded-xl shadow-sm border border-amber-100 text-center">
                    <h1 className="text-2xl font-bold text-amber-900 mb-4">チーム登録は終了しました</h1>
                    <p className="text-amber-700 mb-6">現在はプロダクト提出期間、またはすべての期間が終了しています。</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href="/" className="px-6 py-3 bg-amber-100 text-amber-900 rounded-lg font-bold hover:bg-amber-200 transition-colors">トップへ</a>
                        <a href="/submissions" className="px-6 py-3 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors">プロダクト提出へ</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-yellow-50 to-white">
            <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4 text-amber-900">チーム登録</h1>

            {isDevelopment && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm font-semibold text-center">
                    🔧 開発モード: 自動リダイレクトと期間制限が無視されています
                </div>
            )}

            {!isDevelopment && mounted && teamEnd && phase === "registration" && (
                <Countdown targetDate={teamEnd} title="チーム登録締切まで" />
            )}

            {submitted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded">チーム情報を登録しました。</div>
            ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                    <label className="block">
                        <span className="block font-medium">チーム名</span>
                        <input
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            className="mt-1 block w-full border rounded px-3 py-2"
                            required
                        />
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="block font-medium">リーダー姓</span>
                            <input
                                value={leaderFamilyName}
                                onChange={(e) => setLeaderFamilyName(e.target.value)}
                                className="mt-1 block w-full border rounded px-3 py-2"
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="block font-medium">リーダー名</span>
                            <input
                                value={leaderGivenName}
                                onChange={(e) => setLeaderGivenName(e.target.value)}
                                className="mt-1 block w-full border rounded px-3 py-2"
                                required
                            />
                        </label>
                    </div>

                    <p className="text-sm text-slate-500">送信時は姓と名を空白で結合して保存します： <strong>{`${leaderFamilyName}${leaderFamilyName || leaderGivenName ? '　' : ''}${leaderGivenName}`}</strong></p>

                    <label className="block">
                        <span className="block font-medium">リーダー学籍番号</span>
                        <input
                            value={leaderStudentId}
                            onChange={(e) => setLeaderStudentId(e.target.value)}
                            className="mt-1 block w-full border rounded px-3 py-2"
                            placeholder="例: 12345678"
                            required
                        />
                        <p className="text-sm text-slate-500 mt-1">メールは自動で <strong>{computeEmail(leaderStudentId)}</strong> に設定されます。</p>
                    </label>

                    {error && <div className="text-red-600">{error}</div>}

                    <div>
                        <button className="px-4 py-2 bg-amber-600 text-white rounded w-full sm:w-auto" type="submit">
                            登録
                        </button>
                    </div>
                </form>
            )}

            {/* Existing teams from DB (render placeholder on server to avoid hydration mismatch) */}
            <section className="mt-8">
                <h2 className="text-lg font-semibold mb-3">登録済みチーム（DB）</h2>
                {!mounted ? (
                    <div className="text-sm text-slate-500">読み込み中…</div>
                ) : teams.length === 0 ? (
                    <div className="text-sm text-slate-500">まだ登録されたチームはありません。</div>
                ) : (
                    <ul className="space-y-2">
                        {teams.map((t: any) => (
                            <li key={t._id} className="p-3 border rounded bg-white">
                                <div className="font-semibold">{t.teamName}</div>
                                <div className="text-sm text-slate-600">リーダー: {t.leaderName || "-"}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
            </div>
        </div>
    );
}
