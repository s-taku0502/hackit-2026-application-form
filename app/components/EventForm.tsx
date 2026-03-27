"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

type Member = { gradeClass: string; studentId: string; familyName: string; givenName: string; furiganaFamily?: string; furiganaGiven?: string };

export default function EventForm() {
    const [projectName, setProjectName] = useState("");
    const [noAffiliation, setNoAffiliation] = useState(false);
    const prevProjectRef = useRef("");
    const [teamSize, setTeamSize] = useState<number>(3);
    const emptyMember = { gradeClass: "", studentId: "", familyName: "", givenName: "", furiganaFamily: "", furiganaGiven: "" };
    const [members, setMembers] = useState<Member[]>([
        { ...emptyMember },
        { ...emptyMember },
        { ...emptyMember },
        { ...emptyMember },
        { ...emptyMember },
    ]);
    const [leaderIndex, setLeaderIndex] = useState<number>(-1);
    const [leaderName, setLeaderName] = useState("");
    const [leaderEmail, setLeaderEmail] = useState("");
    const [hasFirstYear, setHasFirstYear] = useState<string>("yes");
    const [agreeCancel, setAgreeCancel] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [agreeShare, setAgreeShare] = useState(false);
    const [agreeLottery, setAgreeLottery] = useState(false);
    const [hasAllergy, setHasAllergy] = useState<string>("no");
    const [allergyDetail, setAllergyDetail] = useState("");
    const [teamDescription, setTeamDescription] = useState("");
    const [submitResult, setSubmitResult] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const submitEventMutation = useMutation(api.events.submitEvent);

    function setMemberField(idx: number, field: keyof Member, value: string) {
        const next = members.slice();
        next[idx] = { ...next[idx], [field]: value };
        setMembers(next);
        // keep leaderName in sync when editing the leader's member name
        if ((field === "familyName" || field === "givenName") && idx === leaderIndex) {
            const fam = field === "familyName" ? value : next[idx].familyName;
            const giv = field === "givenName" ? value : next[idx].givenName;
            setLeaderName(`${fam}　${giv}`.trim());
        }
        // keep leaderEmail in sync when editing the leader's studentId
        if (field === "studentId" && idx === leaderIndex) {
            const id = value.trim();
            if (id) setLeaderEmail(`c${id}@st.kanazawa-it.ac.jp`);
            else setLeaderEmail("");
        }
    }

    useEffect(() => {
        // when leaderIndex or members change, try to populate leaderName and leaderEmail from selected member
        if (leaderIndex < 0) return;
        const m = members[leaderIndex];
        if (m) {
            if (m.familyName && m.givenName && !leaderName) {
                setLeaderName(`${m.familyName}　${m.givenName}`);
            }
            if (m.studentId && !leaderEmail) {
                setLeaderEmail(`c${m.studentId}@st.kanazawa-it.ac.jp`);
            }
        }
    }, [leaderIndex, members]);

    useEffect(() => {
        // auto-detect presence of first-year members (gradeClass starting with '1')
        const included = members.slice(0, teamSize);
        const found = included.some((m) => m.gradeClass.trim().startsWith("1"));
        setHasFirstYear(found ? "yes" : "no");
    }, [members, teamSize]);

    useEffect(() => {
        // when team size changes, clear leader selection so all checkboxes default to false
        setLeaderIndex(-1);
        setLeaderName("");
        setLeaderEmail("");
    }, [teamSize]);

    function validate() {
        if (!projectName.trim()) return "所属プロジェクト名を入力してください。";
        if (![1, 3, 4, 5].includes(teamSize)) return "チーム人数を選んでください。";
        const requiredMembers = teamSize === 1 ? 1 : 3;
        for (let i = 0; i < requiredMembers; i++) {
            const m = members[i];
            if (!m.gradeClass.trim()) return ` ${i + 1}人目の学年・学科・クラスを入力してください。`;
            if (!m.studentId.trim()) return ` ${i + 1}人目の学籍番号を入力してください。`;
            if (!m.familyName.trim() || !m.givenName.trim()) return ` ${i + 1}人目の姓と名を入力してください。`;
            // if any furigana part provided, require both surname and given-name furigana
            const hasFuriFamily = (m.furiganaFamily || "").trim() !== "";
            const hasFuriGiven = (m.furiganaGiven || "").trim() !== "";
            if (hasFuriFamily !== hasFuriGiven) return ` ${i + 1}人目のフリガナは姓と名の両方を入力してください。`;
        }

        // determine effective leader name/email (support individual/open participation)
        const memberLeaderName = leaderIndex >= 0 ? (members[leaderIndex]?.familyName && members[leaderIndex]?.givenName ? `${members[leaderIndex].familyName}　${members[leaderIndex].givenName}` : "") : "";
        const team0Name = teamSize === 1 && members[0]?.familyName && members[0]?.givenName ? `${members[0].familyName}　${members[0].givenName}` : "";
        const effectiveLeaderName = leaderName.trim() || memberLeaderName || team0Name || "";
        const effectiveLeaderEmail = leaderEmail || (leaderIndex >= 0 && members[leaderIndex]?.studentId ? `c${members[leaderIndex].studentId}@st.kanazawa-it.ac.jp` : (teamSize === 1 && members[0]?.studentId ? `c${members[0].studentId}@st.kanazawa-it.ac.jp` : ""));
        if (!effectiveLeaderName) return "チームリーダーの名前を入力してください。";
        if (!effectiveLeaderEmail.match(/^\S+@\S+\.\S+$/)) return "有効なメールアドレスを入力してください。";
        if (hasAllergy === "yes" && !allergyDetail.trim()) return "アレルギーの詳細を入力してください。";
        if (!agreeCancel || !agreePrivacy || !agreeShare || !agreeLottery)
            return "すべての同意事項にチェックしてください。";
        return null;
    }

    async function onSubmit(e: React.FormEvent) {
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
            members: members.slice(0, teamSize).map((m) => ({
                gradeClass: m.gradeClass,
                studentId: m.studentId,
                name: `${m.familyName}　${m.givenName}`,
                furigana: (m.furiganaFamily || m.furiganaGiven) ? `${(m.furiganaFamily||"").trim()}　${(m.furiganaGiven||"").trim()}` : undefined,
            })),
            // for individual participation, send empty leader/team info
            leaderIndex: teamSize === 1 ? 0 : leaderIndex + 1,
            leaderName: teamSize === 1 ? "" : leaderName,
            leaderEmail: teamSize === 1 ? "" : leaderEmail,
            hasFirstYear,
            teamDescription: teamSize === 1 ? "" : teamDescription,
            agreements: { agreeCancel, agreePrivacy, agreeShare, agreeLottery },
            allergy: { hasAllergy, allergyDetail },
            submittedAt: new Date().toISOString(),
        };

        setIsSubmitting(true);
        try {
            await submitEventMutation(collected);
            setSubmitResult("送信されました。ありがとうございます。");
            setShowPreview(false);
            resetForm({ keepSubmit: true });
        } catch (err) {
            console.error("submit error", err);
            setSubmitResult("送信中にエラーが発生しました。");
        } finally {
            setIsSubmitting(false);
        }
    }

    function openPreview() {
        const err = validate();
        if (err) {
            setSubmitResult(err);
            return;
        }
        setShowPreview(true);
    }

    async function handleConfirmSubmit() {
        const err = validate();
        if (err) {
            setSubmitResult(err);
            setShowPreview(false);
            return;
        }

        const collected = {
            projectName,
            teamSize,
            members: members.slice(0, teamSize).map((m) => ({
                gradeClass: m.gradeClass,
                studentId: m.studentId,
                name: `${m.familyName}　${m.givenName}`,
                furigana: (m.furiganaFamily || m.furiganaGiven) ? `${(m.furiganaFamily||"").trim()}　${(m.furiganaGiven||"").trim()}` : undefined,
            })),
            leaderIndex: teamSize === 1 ? 0 : leaderIndex + 1,
            leaderName: teamSize === 1 ? "" : leaderName,
            leaderEmail: teamSize === 1 ? "" : leaderEmail,
            hasFirstYear,
            teamDescription: teamSize === 1 ? "" : teamDescription,
            agreements: { agreeCancel, agreePrivacy, agreeShare, agreeLottery },
            allergy: { hasAllergy, allergyDetail },
            submittedAt: new Date().toISOString(),
        };

        setIsSubmitting(true);
        try {
            await submitEventMutation(collected);
            setSubmitResult("送信されました。ありがとうございます。");
            setShowPreview(false);
            resetForm({ keepSubmit: true });
        } catch (err) {
            console.error("submit error", err);
            setSubmitResult("送信中にエラーが発生しました。");
        } finally {
            setIsSubmitting(false);
        }
    }

    function resetForm(opts: { keepSubmit?: boolean } = {}) {
        setProjectName("");
        setNoAffiliation(false);
        prevProjectRef.current = "";
        setTeamSize(3);
        setMembers([emptyMember, emptyMember, emptyMember, emptyMember, emptyMember]);
        setLeaderIndex(-1);
        setLeaderName("");
        setLeaderEmail("");
        setHasFirstYear("yes");
        setAgreeCancel(false);
        setAgreePrivacy(false);
        setAgreeShare(false);
        setAgreeLottery(false);
        setHasAllergy("no");
        setAllergyDetail("");
        setTeamDescription("");
        if (!opts.keepSubmit) setSubmitResult(null);
    }

    return (
        <form onSubmit={onSubmit} className="w-full">
            {/* Header Section */}
            <div className="mb-8 text-center">
                <h2 className="text-4xl font-bold mb-2 text-amber-900">HacKit 2026</h2>
                <h3 className="text-2xl font-semibold mb-4 text-amber-800">イベント申し込みフォーム</h3>
                <p className="text-amber-700 font-medium">繋がる、創る、超えていく。</p>
            </div>

            {/* Basic Information Section */}
            <section className="mb-8 bg-white bg-opacity-60 rounded-lg p-6 border-2 border-amber-200">
                <h3 className="text-xl font-bold mb-4 text-amber-900 flex items-center">
                    <span className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">1</span>
                    基本情報
                </h3>
                <label className="block mb-4">
                    <span className="block text-amber-900 font-semibold mb-2">所属プロジェクト名 <span className="text-red-500">*</span></span>
                    <input
                        className="w-full border-2 border-amber-300 rounded-lg p-3 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        disabled={noAffiliation}
                        placeholder="例：データサイエンスプロジェクト"
                    />
                    <label className="inline-flex items-center mt-2 text-amber-900">
                        <input
                            type="checkbox"
                            checked={noAffiliation}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                if (checked) {
                                    prevProjectRef.current = projectName;
                                    setProjectName("無所属");
                                    setNoAffiliation(true);
                                } else {
                                    setProjectName(prevProjectRef.current || "");
                                    prevProjectRef.current = "";
                                    setNoAffiliation(false);
                                }
                            }}
                            className="w-4 h-4 mr-2 accent-amber-500"
                        />
                        <span>無所属</span>
                    </label>
                </label>
                <label className="block">
                    <span className="block text-amber-900 font-semibold mb-2">チーム人数 <span className="text-red-500">*</span></span>
                    <select
                        className="border-2 border-amber-300 rounded-lg p-3 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                        value={teamSize}
                        onChange={(e) => setTeamSize(Number(e.target.value))}
                    >
                        <option value={1}>個人（オープン参加）</option>
                        <option value={3}>3人</option>
                        <option value={4}>4人</option>
                        <option value={5}>5人</option>
                    </select>
                </label>
            </section>

            {/* Team Members Section */}
            <section className="mb-8 bg-white bg-opacity-60 rounded-lg p-6 border-2 border-amber-200">
                <h3 className="text-xl font-bold mb-4 text-amber-900 flex items-center">
                    <span className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">2</span>
                    チームメンバー情報
                </h3>
                {Array.from({ length: teamSize }).map((_, idx) => (
                    <div key={idx} className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-amber-900">▼ {idx + 1}人目 <span className="text-red-500">*</span></h4>
                            {teamSize !== 1 && (
                                <label className="flex items-center text-amber-900">
                                    <input
                                        type="checkbox"
                                        checked={leaderIndex === idx}
                                                onChange={() => {
                                                    if (leaderIndex === idx) {
                                                        // uncheck
                                                        setLeaderIndex(-1);
                                                        setLeaderName("");
                                                        setLeaderEmail("");
                                                    } else {
                                                        setLeaderIndex(idx);
                                                        // combine family/given into leader name
                                                        const fam = members[idx].familyName || "";
                                                        const giv = members[idx].givenName || "";
                                                        if (fam || giv) setLeaderName(`${fam}　${giv}`.trim());
                                                        const sid = members[idx].studentId?.trim();
                                                        if (sid) setLeaderEmail(`c${sid}@st.kanazawa-it.ac.jp`);
                                                        else setLeaderEmail("");
                                                    }
                                                }}
                                        className="w-5 h-5 mr-2 accent-amber-500"
                                    />
                                    <span>リーダーにチェック</span>
                                </label>
                            )}
                        </div>
                        <label className="block mb-3">
                            <span className="block text-amber-800 font-semibold mb-2">学年・学科・クラス</span>
                            <input
                                className="w-full border-2 border-amber-300 rounded-lg p-3 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                                value={members[idx].gradeClass}
                                onChange={(e) => setMemberField(idx, "gradeClass", e.target.value)}
                                placeholder="例：3EP1"
                            />
                        </label>
                        <label className="block mb-3">
                            <span className="block text-amber-800 font-semibold mb-2">学籍番号</span>
                            <input
                                className="w-full border-2 border-amber-300 rounded-lg p-3 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                                value={members[idx].studentId}
                                onChange={(e) => setMemberField(idx, "studentId", e.target.value)}
                                placeholder="例：1234567"
                            />
                        </label>
                        <label className="block">
                            <span className="block text-amber-800 font-semibold mb-2">氏名（姓 / 名）</span>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 border-2 border-amber-300 rounded-lg p-3 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                                    value={members[idx].familyName}
                                    onChange={(e) => setMemberField(idx, "familyName", e.target.value)}
                                    placeholder="姓 例：石川"
                                />
                                <input
                                    className="flex-1 border-2 border-amber-300 rounded-lg p-3 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                                    value={members[idx].givenName}
                                    onChange={(e) => setMemberField(idx, "givenName", e.target.value)}
                                    placeholder="名 例：太郎"
                                />
                            </div>
                            <label className="block mt-3">
                                <span className="block text-amber-800 font-semibold mb-2">フリガナ（姓 / 名）</span>
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 border-2 border-amber-300 rounded-lg p-3 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                                        value={members[idx].furiganaFamily || ""}
                                        onChange={(e) => setMemberField(idx, "furiganaFamily", e.target.value)}
                                        placeholder="姓 例：イシカワ"
                                    />
                                    <input
                                        className="flex-1 border-2 border-amber-300 rounded-lg p-3 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                                        value={members[idx].furiganaGiven || ""}
                                        onChange={(e) => setMemberField(idx, "furiganaGiven", e.target.value)}
                                        placeholder="名 例：タロウ"
                                    />
                                </div>
                            </label>
                        </label>
                    </div>
                ))}
            </section>

            {/* Team Information Section */}
            <section className="mb-8 bg-white bg-opacity-60 rounded-lg p-6 border-2 border-amber-200">
                <h3 className="text-xl font-bold mb-4 text-amber-900 flex items-center">
                    <span className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">3</span>
                    チーム情報
                </h3>
                {teamSize === 1 ? (
                    <p className="mb-4 text-amber-800">個人参加の場合は内容が表示されません</p>
                ) : (
                    <>
                        <label className="block mb-4">
                            <span className="block text-amber-900 font-semibold mb-2">チームリーダーの名前 <span className="text-red-500">*</span></span>
                            <input
                                className="w-full border-2 border-amber-300 rounded-lg p-3 bg-gray-100 text-gray-700 opacity-90 cursor-not-allowed"
                                value={leaderName}
                                onChange={(e) => setLeaderName(e.target.value)}
                                placeholder="チームリーダーの名前"
                                disabled
                            />
                        </label>
                        <label className="block mb-4">
                            <span className="block text-amber-900 font-semibold mb-2">チームリーダーのメールアドレス <span className="text-red-500">*</span></span>
                            <input
                                className="w-full border-2 border-amber-300 rounded-lg p-3 bg-gray-100 text-gray-700 opacity-90 cursor-not-allowed"
                                value={leaderEmail}
                                onChange={(e) => setLeaderEmail(e.target.value)}
                                placeholder="leader@example.com"
                                disabled
                            />
                        </label>
                        <p className="mb-4 text-amber-800">チームメンバー一覧で、該当メンバーに「リーダーにチェック」を付けてください。</p>
                        <label className="block">
                            <span className="block text-amber-900 font-semibold mb-2">チームの説明・アイデア概要</span>
                            <textarea
                                className="w-full border-2 border-amber-300 rounded-lg p-3 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 min-h-24"
                                value={teamDescription}
                                onChange={(e) => setTeamDescription(e.target.value)}
                                placeholder="このハッカソンで実現したいアイデアや、チームの特徴を教えてください。"
                            />
                        </label>
                    </>
                )}
            </section>

            {/* Participation Requirements Section */}
            <section className="mb-8 bg-white bg-opacity-60 rounded-lg p-6 border-2 border-amber-200">
                <h3 className="text-xl font-bold mb-4 text-amber-900 flex items-center">
                    <span className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">4</span>
                    参加条件
                </h3>
                <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-amber-900 font-semibold mb-3">
                        チームメンバーに1年生を1人以上含んでいるか
                        {teamSize !== 1 && <span className="text-red-500">*</span>}
                    </p>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center cursor-not-allowed">
                            <input
                                type="radio"
                                name="firstYear"
                                checked={hasFirstYear === "yes"}
                                disabled
                                className="w-4 h-4 bg-gray-100 text-gray-700 cursor-not-allowed"
                            />
                            <span className="ml-2 text-amber-900">はい</span>
                        </label>
                        <label className="flex items-center cursor-not-allowed">
                            <input
                                type="radio"
                                name="firstYear"
                                checked={hasFirstYear === "no"}
                                disabled
                                className="w-4 h-4 bg-gray-100 text-gray-700 cursor-not-allowed"
                            />
                            <span className="ml-2 text-amber-900">いいえ</span>
                        </label>
                    </div>
                </div>
            </section>

            {/* Agreements Section */}
            <section className="mb-8 bg-white bg-opacity-60 rounded-lg p-6 border-2 border-amber-200">
                <h3 className="text-xl font-bold mb-4 text-amber-900 flex items-center">
                    <span className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">5</span>
                    同意事項
                </h3>
                <p className="text-amber-900 font-semibold mb-4">以下の項目すべてにチェックしてください <span className="text-red-500">*</span></p>
                <div className="space-y-3">
                    <label className="flex items-start cursor-pointer p-3 hover:bg-amber-100 rounded-lg transition">
                        <input
                            type="checkbox"
                            checked={agreeCancel}
                            onChange={(e) => setAgreeCancel(e.target.checked)}
                            className="w-5 h-5 mt-1 accent-amber-500 flex-shrink-0"
                        />
                        <span className="ml-3 text-amber-900">一度申し込みをした場合、キャンセルすることはできない</span>
                    </label>
                    <label className="flex items-start cursor-pointer p-3 hover:bg-amber-100 rounded-lg transition">
                        <input
                            type="checkbox"
                            checked={agreePrivacy}
                            onChange={(e) => setAgreePrivacy(e.target.checked)}
                            className="w-5 h-5 mt-1 accent-amber-500 flex-shrink-0"
                        />
                        <span className="ml-3 text-amber-900">撮影した写真を広報用SNSに掲載する可能性があります。またZoomにて録音・録画する可能性があります。</span>
                    </label>
                    <label className="flex items-start cursor-pointer p-3 hover:bg-amber-100 rounded-lg transition">
                        <input
                            type="checkbox"
                            checked={agreeShare}
                            onChange={(e) => setAgreeShare(e.target.checked)}
                            className="w-5 h-5 mt-1 accent-amber-500 flex-shrink-0"
                        />
                        <span className="ml-3 text-amber-900">スポンサー企業様に名前とメールアドレスを共有する場合があります。</span>
                    </label>
                    <label className="flex items-start cursor-pointer p-3 hover:bg-amber-100 rounded-lg transition">
                        <input
                            type="checkbox"
                            checked={agreeLottery}
                            onChange={(e) => setAgreeLottery(e.target.checked)}
                            className="w-5 h-5 mt-1 accent-amber-500 flex-shrink-0"
                        />
                        <span className="ml-3 text-amber-900">申し込みチームが多数の場合、抽選となることに同意します。</span>
                    </label>
                </div>
            </section>

            {/* Allergy Information Section */}
            <section className="mb-8 bg-white bg-opacity-60 rounded-lg p-6 border-2 border-amber-200">
                <h3 className="text-xl font-bold mb-4 text-amber-900 flex items-center">
                    <span className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">6</span>
                    アレルギー情報
                </h3>
                <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-amber-900 font-semibold mb-3">食物アレルギーの有無</p>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="allergy"
                                checked={hasAllergy === "yes"}
                                onChange={() => setHasAllergy("yes")}
                                className="w-4 h-4 accent-amber-500"
                            />
                            <span className="ml-2 text-amber-900">はい</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="allergy"
                                checked={hasAllergy === "no"}
                                onChange={() => setHasAllergy("no")}
                                className="w-4 h-4 accent-amber-500"
                            />
                            <span className="ml-2 text-amber-900">いいえ</span>
                        </label>
                    </div>
                </div>
                {hasAllergy === "yes" && (
                    <label className="block">
                        <span className="block text-amber-900 font-semibold mb-2">アレルギーのある方の名前と対象の食物</span>
                        <textarea
                            className="w-full border-2 border-amber-300 rounded-lg p-3 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 min-h-20"
                            value={allergyDetail}
                            onChange={(e) => setAllergyDetail(e.target.value)}
                            placeholder="例：山田太郎（そば）、田中花子（卵）"
                        />
                    </label>
                )}
            </section>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
                <button
                    type="button"
                    onClick={openPreview}
                    className="flex-1 bg-white border-2 border-amber-400 text-amber-900 font-bold py-3 px-6 rounded-lg hover:bg-amber-50 transition duration-200"
                >
                    入力内容をプレビュー
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 ${isSubmitting ? "bg-amber-300 cursor-not-allowed" : "bg-amber-500 hover:bg-amber-600"} text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105 shadow-lg`}
                >
                    {isSubmitting ? "送信中…" : "申し込みを送信"}
                </button>
                <button
                    type="button"
                    className="flex-1 bg-white border-2 border-amber-400 text-amber-900 font-bold py-3 px-6 rounded-lg hover:bg-amber-50 transition duration-200"
                    onClick={() => resetForm()}
                >
                    リセット
                </button>
            </div>

            {/* Result Message */}
            {submitResult && (
                <div className={`p-4 rounded-lg text-center font-semibold ${
                    submitResult.includes("送信されました")
                        ? "bg-green-100 text-green-800 border-2 border-green-400"
                        : "bg-red-100 text-red-800 border-2 border-red-400"
                }`}>
                    {submitResult}
                </div>
            )}

            {showPreview && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg w-11/12 max-w-2xl">
                        <h3 className="text-xl font-bold mb-4 text-amber-900">入力内容を確認</h3>
                        <div className="space-y-2 text-amber-900 text-sm">
                            <p><strong>所属プロジェクト名:</strong> {projectName || '—'}</p>
                            <p><strong>チーム人数:</strong> {teamSize}</p>
                            <div>
                                <strong>メンバー:</strong>
                                <ul className="list-disc pl-6">
                                            {members.slice(0, teamSize).map((m, i) => (
                                                <li key={i}>{`${i + 1}人目 — ${m.gradeClass || '—'} / ${m.studentId || '—'} / ${(m.familyName || '—')}　${(m.givenName || '—')} / ${(m.furiganaFamily || m.furiganaGiven) ? `${(m.furiganaFamily||'').trim()}　${(m.furiganaGiven||'').trim()}` : '—'}`}</li>
                                            ))}
                                </ul>
                            </div>
                            <p><strong>リーダー名:</strong> {teamSize === 1 ? '（個人参加のため空）' : (leaderName || '—')}</p>
                            <p><strong>リーダーメール:</strong> {teamSize === 1 ? '（個人参加のため空）' : (leaderEmail || '—')}</p>
                            <p><strong>1年生含む:</strong> {hasFirstYear === 'yes' ? 'はい' : 'いいえ'}</p>
                            <p><strong>チーム説明:</strong> {teamSize === 1 ? '（個人参加のため表示なし）' : (teamDescription || '—')}</p>
                            <p><strong>アレルギー:</strong> {hasAllergy === 'yes' ? allergyDetail || '詳細なし' : 'なし'}</p>
                            <div>
                                <strong>同意事項:</strong>
                                <ul className="list-disc pl-6">
                                    <li>{agreeCancel ? 'キャンセル不可に同意' : 'キャンセル不可に同意していない'}</li>
                                    <li>{agreePrivacy ? '広報/録画に同意' : '広報/録画に同意していない'}</li>
                                    <li>{agreeShare ? 'スポンサー共有に同意' : 'スポンサー共有に同意していない'}</li>
                                    <li>{agreeLottery ? '抽選に同意' : '抽選に同意していない'}</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowPreview(false)} className="bg-white border-2 border-amber-400 text-amber-900 font-bold py-2 px-4 rounded-lg hover:bg-amber-50">編集する</button>
                            <button onClick={handleConfirmSubmit} className="bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600">送信する</button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
