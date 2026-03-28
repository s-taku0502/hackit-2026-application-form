"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function TeamsCreatePage() {
    const [teamName, setTeamName] = useState("");
    const [leaderFamilyName, setLeaderFamilyName] = useState("");
    const [leaderGivenName, setLeaderGivenName] = useState("");
    const [leaderStudentId, setLeaderStudentId] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const submitTeamMutation = useMutation(api.events.submitTeam);

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

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">チーム登録</h1>

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

                    <div className="grid grid-cols-2 gap-4">
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
                        <button className="px-4 py-2 bg-amber-600 text-white rounded" type="submit">
                            登録
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
