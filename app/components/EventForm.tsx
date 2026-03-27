"use client";

import React, { useState } from "react";

type Member = { gradeClass: string; studentId: string; name: string };

export default function EventForm() {
    const [projectName, setProjectName] = useState("");
    const [teamSize, setTeamSize] = useState<number>(3);
    const emptyMember = { gradeClass: "", studentId: "", name: "" };
    const [members, setMembers] = useState<Member[]>([
        { ...emptyMember },
        { ...emptyMember },
        { ...emptyMember },
        { ...emptyMember },
        { ...emptyMember },
    ]);
    const [leaderIndex, setLeaderIndex] = useState<number>(0);
    const [leaderName, setLeaderName] = useState("");
    const [leaderEmail, setLeaderEmail] = useState("");
    const [hasFirstYear, setHasFirstYear] = useState<string>("yes");
    const [agreeCancel, setAgreeCancel] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [agreeShare, setAgreeShare] = useState(false);
    const [agreeLottery, setAgreeLottery] = useState(false);
    const [hasAllergy, setHasAllergy] = useState<string>("no");
    const [allergyDetail, setAllergyDetail] = useState("");
    const [submitResult, setSubmitResult] = useState<string | null>(null);

    function setMemberField(idx: number, field: keyof Member, value: string) {
        const next = members.slice();
        next[idx] = { ...next[idx], [field]: value };
        setMembers(next);
    }

    function validate() {
        if (!projectName.trim()) return "所属プロジェクト名を入力してください。";
        if (![3, 4, 5].includes(teamSize)) return "チーム人数を選んでください。";
        for (let i = 0; i < 3; i++) {
            const m = members[i];
            if (!m.gradeClass.trim()) return ` ${i + 1}人目の学年・学科・クラスを入力してください。`;
            if (!m.studentId.trim()) return ` ${i + 1}人目の学籍番号を入力してください。`;
            if (!m.name.trim()) return ` ${i + 1}人目の名前を入力してください。`;
            if (m.name.includes(" ")) return `${i + 1}人目の名前は姓名の間に空白を入れないでください。`;
        }
        if (!leaderName.trim()) return "チームリーダーの名前を入力してください。";
        if (!leaderEmail.match(/^\S+@\S+\.\S+$/)) return "有効なメールアドレスを入力してください。";
        if (hasAllergy === "yes" && !allergyDetail.trim()) return "アレルギーの詳細を入力してください。";
        if (!agreeCancel || !agreePrivacy || !agreeShare || !agreeLottery)
            return "すべての同意事項にチェックしてください。";
        return null;
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const err = validate();
        if (err) {
            setSubmitResult(err);
            return;
        }

        // collect only needed members according to teamSize
        const collected = {
            projectName,
            teamSize,
            members: members.slice(0, teamSize),
            leaderIndex: leaderIndex + 1,
            leaderName,
            leaderEmail,
            hasFirstYear,
            agreements: { agreeCancel, agreePrivacy, agreeShare, agreeLottery },
            allergy: { hasAllergy, allergyDetail },
            submittedAt: new Date().toISOString(),
        };

        console.log("EventForm submit:", collected);
        setSubmitResult("送信されました（開発モード） — コンソールに出力しました。");
    }

    return (
        <form onSubmit={onSubmit} className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-semibold mb-4">イベント申し込みフォーム</h2>

            <section className="mb-6">
                <h3 className="font-medium">■ 基本情報</h3>
                <label className="block mt-2">
                    所属プロジェクト名
                    <input
                        className="mt-1 w-full border rounded p-2"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="例：データサイエンスプロジェクト"
                    />
                </label>
                <label className="block mt-2">
                    チーム人数
                    <select
                        className="mt-1 w-32 border rounded p-2"
                        value={teamSize}
                        onChange={(e) => setTeamSize(Number(e.target.value))}
                    >
                        <option value={3}>3人</option>
                        <option value={4}>4人</option>
                        <option value={5}>5人</option>
                    </select>
                </label>
            </section>

            <section className="mb-6">
                <h3 className="font-medium">■ チームメンバー情報</h3>
                {Array.from({ length: teamSize }).map((_, idx) => (
                    <div key={idx} className="border p-3 mt-3 rounded">
                        <h4 className="font-semibold">▼{idx + 1}人目（必須）</h4>
                        <label className="block mt-2">
                            学年・学科・クラス
                            <input
                                className="mt-1 w-full border rounded p-2"
                                value={members[idx].gradeClass}
                                onChange={(e) => setMemberField(idx, "gradeClass", e.target.value)}
                                placeholder="例：3EP1"
                            />
                        </label>
                        <label className="block mt-2">
                            学籍番号
                            <input
                                className="mt-1 w-full border rounded p-2"
                                value={members[idx].studentId}
                                onChange={(e) => setMemberField(idx, "studentId", e.target.value)}
                                placeholder="例：1234567"
                            />
                        </label>
                        <label className="block mt-2">
                            名前（姓名の間は空白なし）
                            <input
                                className="mt-1 w-full border rounded p-2"
                                value={members[idx].name}
                                onChange={(e) => setMemberField(idx, "name", e.target.value)}
                                placeholder="例：石川太郎"
                            />
                        </label>
                    </div>
                ))}
            </section>

            <section className="mb-6">
                <h3 className="font-medium">■ チーム情報</h3>
                <label className="block mt-2">
                    チームリーダーの名前
                    <input
                        className="mt-1 w-full border rounded p-2"
                        value={leaderName}
                        onChange={(e) => setLeaderName(e.target.value)}
                        placeholder="チームリーダーの名前"
                    />
                </label>
                <label className="block mt-2">
                    チームリーダーのメールアドレス
                    <input
                        className="mt-1 w-full border rounded p-2"
                        value={leaderEmail}
                        onChange={(e) => setLeaderEmail(e.target.value)}
                        placeholder="leader@example.com"
                    />
                </label>
                <label className="block mt-2">
                    リーダーは誰ですか？
                    <select
                        className="mt-1 w-48 border rounded p-2"
                        value={leaderIndex}
                        onChange={(e) => setLeaderIndex(Number(e.target.value))}
                    >
                        {Array.from({ length: teamSize }).map((_, i) => (
                            <option key={i} value={i}>
                                {i + 1}人目
                            </option>
                        ))}
                    </select>
                </label>
            </section>

            <section className="mb-6">
                <h3 className="font-medium">■ 参加条件</h3>
                <div className="mt-2">
                    チームメンバーに1年生を1人以上含んでいるか（必須）
                    <div className="mt-1">
                        <label className="mr-4">
                            <input
                                type="radio"
                                name="firstYear"
                                checked={hasFirstYear === "yes"}
                                onChange={() => setHasFirstYear("yes")}
                            />
                            はい
                        </label>
                    </div>
                </div>
            </section>

            <section className="mb-6">
                <h3 className="font-medium">■ 同意事項（必須）</h3>
                <label className="block mt-2">
                    <input type="checkbox" checked={agreeCancel} onChange={(e) => setAgreeCancel(e.target.checked)} />
                    一度申し込みをした場合、キャンセルすることはできない
                </label>
                <label className="block mt-2">
                    <input type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} />
                    撮影した写真を広報用SNSに掲載する可能性があります。またZoomにて録音・録画する可能性があります。
                </label>
                <label className="block mt-2">
                    <input type="checkbox" checked={agreeShare} onChange={(e) => setAgreeShare(e.target.checked)} />
                    スポンサー企業様に名前とメールアドレスを共有する場合があります。
                </label>
                <label className="block mt-2">
                    <input type="checkbox" checked={agreeLottery} onChange={(e) => setAgreeLottery(e.target.checked)} />
                    申し込みチームが多数の場合、抽選となることに同意します。
                </label>
            </section>

            <section className="mb-6">
                <h3 className="font-medium">■ アレルギー情報</h3>
                <div className="mt-2">
                    食物アレルギーの有無
                    <label className="ml-3">
                        <input type="radio" name="allergy" checked={hasAllergy === "yes"} onChange={() => setHasAllergy("yes")} /> はい
                    </label>
                    <label className="ml-3">
                        <input type="radio" name="allergy" checked={hasAllergy === "no"} onChange={() => setHasAllergy("no")} /> いいえ
                    </label>
                </div>
                {hasAllergy === "yes" && (
                    <label className="block mt-2">
                        アレルギーのある方の名前と対象の食物（例：山田太郎（そば））
                        <textarea className="mt-1 w-full border rounded p-2" value={allergyDetail} onChange={(e) => setAllergyDetail(e.target.value)} />
                    </label>
                )}
            </section>

            <div className="flex items-center gap-3">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">送信</button>
                <button
                    type="button"
                    className="px-3 py-2 border rounded"
                    onClick={() => {
                        // reset
                        setProjectName("");
                        setTeamSize(3);
                        setMembers([emptyMember, emptyMember, emptyMember, emptyMember, emptyMember]);
                        setLeaderIndex(0);
                        setLeaderName("");
                        setLeaderEmail("");
                        setHasFirstYear("yes");
                        setAgreeCancel(false);
                        setAgreePrivacy(false);
                        setAgreeShare(false);
                        setAgreeLottery(false);
                        setHasAllergy("no");
                        setAllergyDetail("");
                        setSubmitResult(null);
                    }}
                >
                    リセット
                </button>
            </div>

            {submitResult && <p className="mt-4 text-red-600">{submitResult}</p>}
        </form>
    );
}
