"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

type Member = { gradeClass: string; studentId: string; name: string };

export default function EventForm() {
    const [projectName, setProjectName] = useState("");
    const [noAffiliation, setNoAffiliation] = useState(false);
    const prevProjectRef = useRef("");
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
    const [teamDescription, setTeamDescription] = useState("");
    const [submitResult, setSubmitResult] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitEventMutation = useMutation(api.events.submitEvent);

    function setMemberField(idx: number, field: keyof Member, value: string) {
        const next = members.slice();
        next[idx] = { ...next[idx], [field]: value };
        setMembers(next);
        // keep leaderName in sync when editing the leader's member name
        if (field === "name" && idx === leaderIndex) {
            setLeaderName(value);
        }
    }

    useEffect(() => {
        // when leaderIndex changes, try to populate leaderName from selected member
        const m = members[leaderIndex];
        if (m && m.name && !leaderName) {
            setLeaderName(m.name);
        }
    }, [leaderIndex]);

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
            members: members.slice(0, teamSize),
            leaderIndex: leaderIndex + 1,
            leaderName,
            leaderEmail,
            hasFirstYear,
            teamDescription,
            agreements: { agreeCancel, agreePrivacy, agreeShare, agreeLottery },
            allergy: { hasAllergy, allergyDetail },
            submittedAt: new Date().toISOString(),
        };

        setIsSubmitting(true);
        try {
            await submitEventMutation(collected);
            setSubmitResult("送信されました。ありがとうございます。");
        } catch (err) {
            console.error("submit error", err);
            setSubmitResult("送信中にエラーが発生しました。");
        } finally {
            setIsSubmitting(false);
        }
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
                            <label className="flex items-center text-amber-900">
                                <input
                                    type="checkbox"
                                    checked={leaderIndex === idx}
                                    onChange={() => {
                                        setLeaderIndex(idx);
                                        if (members[idx].name) setLeaderName(members[idx].name);
                                    }}
                                    className="w-5 h-5 mr-2 accent-amber-500"
                                />
                                <span>リーダーにチェック</span>
                            </label>
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
                            <span className="block text-amber-800 font-semibold mb-2">名前（姓名の間は空白なし）</span>
                            <input
                                className="w-full border-2 border-amber-300 rounded-lg p-3 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                                value={members[idx].name}
                                onChange={(e) => setMemberField(idx, "name", e.target.value)}
                                placeholder="例：石川太郎"
                            />
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
                <label className="block mb-4">
                    <span className="block text-amber-900 font-semibold mb-2">チームリーダーの名前 <span className="text-red-500">*</span></span>
                    <input
                        className="w-full border-2 border-amber-300 rounded-lg p-3 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                        value={leaderName}
                        onChange={(e) => setLeaderName(e.target.value)}
                        placeholder="チームリーダーの名前"
                    />
                </label>
                <label className="block mb-4">
                    <span className="block text-amber-900 font-semibold mb-2">チームリーダーのメールアドレス <span className="text-red-500">*</span></span>
                    <input
                        className="w-full border-2 border-amber-300 rounded-lg p-3 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                        value={leaderEmail}
                        onChange={(e) => setLeaderEmail(e.target.value)}
                        placeholder="leader@example.com"
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
            </section>

            {/* Participation Requirements Section */}
            <section className="mb-8 bg-white bg-opacity-60 rounded-lg p-6 border-2 border-amber-200">
                <h3 className="text-xl font-bold mb-4 text-amber-900 flex items-center">
                    <span className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">4</span>
                    参加条件
                </h3>
                <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-amber-900 font-semibold mb-3">チームメンバーに1年生を1人以上含んでいるか <span className="text-red-500">*</span></p>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="firstYear"
                                checked={hasFirstYear === "yes"}
                                onChange={() => setHasFirstYear("yes")}
                                className="w-4 h-4 accent-amber-500"
                            />
                            <span className="ml-2 text-amber-900">はい</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="firstYear"
                                checked={hasFirstYear === "no"}
                                onChange={() => setHasFirstYear("no")}
                                className="w-4 h-4 accent-amber-500"
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
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 ${isSubmitting ? "bg-amber-300 cursor-not-allowed" : "bg-amber-500 hover:bg-amber-600"} text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105 shadow-lg`}
                >
                    {isSubmitting ? "送信中…" : "申し込みを送信"}
                </button>
                <button
                    type="button"
                    className="flex-1 bg-white border-2 border-amber-400 text-amber-900 font-bold py-3 px-6 rounded-lg hover:bg-amber-50 transition duration-200"
                    onClick={() => {
                        // reset
                        setProjectName("");
                            setNoAffiliation(false);
                            prevProjectRef.current = "";
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
                        setTeamDescription("");
                        setSubmitResult(null);
                    }}
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
        </form>
    );
}
