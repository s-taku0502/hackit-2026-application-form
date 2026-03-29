"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import useSettings from "../hooks/useSettings";

type Member = { gradeClass: string; studentId: string; familyName: string; givenName: string; furiganaFamily?: string; furiganaGiven?: string; gender?: string; githubUrl?: string };

export default function EventForm() {
    const [projectName, setProjectName] = useState("");
    const [noAffiliation, setNoAffiliation] = useState(false);
    const prevProjectRef = useRef("");
    const [teamSize, setTeamSize] = useState<number>(3);
    const emptyMember = { gradeClass: "", studentId: "", familyName: "", givenName: "", furiganaFamily: "", furiganaGiven: "", gender: "", githubUrl: "https://github.com/" };
    const [members, setMembers] = useState<Member[]>([
        { ...emptyMember },
        { ...emptyMember },
        { ...emptyMember },
        { ...emptyMember },
        { ...emptyMember },
    ]);
    // store last auto-generated furigana to avoid overwriting user edits
    const autoFuriFamilyRef = useRef<string[]>(Array(5).fill(""));
    const autoFuriGivenRef = useRef<string[]>(Array(5).fill(""));
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
    const [hasHackathonExperience, setHasHackathonExperience] = useState<string>("no");
    const [experienceDetail, setExperienceDetail] = useState("");
    const [technologiesInput, setTechnologiesInput] = useState("");
    const [teamDescription, setTeamDescription] = useState("");
    const [submitResult, setSubmitResult] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const submitEventMutation = useMutation(api.events.submitEvent);
    const submitPersonalMutation = useMutation(api.events.submitPersonal);
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
    const beforeStart = appStart && now < appStart;
    const afterEnd = appEnd && now > appEnd;

    function renderCountdown(target: Date) {
        const diff = Math.max(0, target.getTime() - now.getTime());
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        return (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded text-center">
                <p className="text-lg font-semibold">申し込みはまだ開始されていません。</p>
                <p className="mt-2">開始までの残り時間：</p>
                <div className="mt-3 text-2xl font-mono">{`${days}日 ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}</div>
            </div>
        );
    }

    function setMemberField(idx: number, field: keyof Member, value: string) {
        const next = members.slice();
        next[idx] = { ...next[idx], [field]: value };

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

        // Auto-generate furigana (Katakana) when user types name in kana.
        // Only set if the furigana field is empty or equals previous auto-generated value
        if (field === "familyName" || field === "givenName") {
            const fam = field === "familyName" ? value : next[idx].familyName;
            const giv = field === "givenName" ? value : next[idx].givenName;

            function toKatakana(s: string) {
                // convert hiragana range to katakana by codepoint offset
                return s.replace(/[\u3041-\u3096]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60));
            }

            // detect if input contains hiragana or katakana (we only auto-convert when kana is present)
            const famHasKana = /[\u3041-\u309F\u30A0-\u30FF]/.test(fam || "");
            const givHasKana = /[\u3041-\u309F\u30A0-\u30FF]/.test(giv || "");

            if (famHasKana) {
                const auto = toKatakana(fam.trim());
                const cur = next[idx].furiganaFamily || "";
                const prevAuto = autoFuriFamilyRef.current[idx] || "";
                if (!cur || cur === prevAuto) {
                    next[idx] = { ...next[idx], furiganaFamily: auto };
                    autoFuriFamilyRef.current[idx] = auto;
                }
            }
            if (givHasKana) {
                const auto = toKatakana(giv.trim());
                const cur = next[idx].furiganaGiven || "";
                const prevAuto = autoFuriGivenRef.current[idx] || "";
                if (!cur || cur === prevAuto) {
                    next[idx] = { ...next[idx], furiganaGiven: auto };
                    autoFuriGivenRef.current[idx] = auto;
                }
            }
        }

        setMembers(next);
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
        // require all members' info when team has 3 or more members
        const requiredMembers = teamSize === 1 ? 1 : teamSize;
            for (let i = 0; i < requiredMembers; i++) {
            const m = members[i];
            if (!m.gradeClass.trim()) return ` ${i + 1}人目の学年・学科・クラスを入力してください。`;
            if (!/^\d{7}$/.test((m.studentId || "").trim())) return ` ${i + 1}人目の学籍番号は半角数字7桁で入力してください。`;
            if (!m.familyName.trim() || !m.givenName.trim()) return ` ${i + 1}人目の姓と名を入力してください。`;
            // gender は任意項目なので必須にしない（必要ならここで検証を追加）
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
                    gender: m.gender || undefined,
                    furigana: (m.furiganaFamily || m.furiganaGiven) ? `${(m.furiganaFamily||"" ).trim()}　${(m.furiganaGiven||"").trim()}` : undefined,
                    githubUrl: m.githubUrl || undefined,
            })),
            // for individual participation, derive leader info from the sole member
            leaderIndex: teamSize === 1 ? 0 : leaderIndex + 1,
            leaderName: teamSize === 1 ? `${members[0]?.familyName || ""}　${members[0]?.givenName || ""}`.trim() : leaderName,
            leaderEmail: teamSize === 1 ? (members[0]?.studentId ? `c${members[0].studentId}@st.kanazawa-it.ac.jp` : "") : leaderEmail,
            hasFirstYear,
            teamDescription: teamSize === 1 ? "" : teamDescription,
            agreements: { agreeCancel, agreePrivacy, agreeShare, agreeLottery },
            allergy: { hasAllergy, allergyDetail },
            submittedAt: new Date().toISOString(),
        };

        setIsSubmitting(true);
        try {
            if (teamSize === 1) {
                const m = collected.members[0];
                const personalPayload = {
                    projectName: collected.projectName,
                    gradeClass: m.gradeClass,
                    studentId: m.studentId,
                    name: m.name,
                    furigana: m.furigana,
                    gender: m.gender,
                    leaderName: collected.leaderName,
                    leaderEmail: collected.leaderEmail,
                            hasHackathonExperience: hasHackathonExperience,
                            experienceDetail: experienceDetail,
                            technologies: technologiesInput
                                ? technologiesInput.split(/[,\n]+/).map((t) => t.trim()).filter(Boolean)
                                : undefined,
                    agreements: collected.agreements,
                    allergy: collected.allergy,
                    submittedAt: collected.submittedAt,
                };
                await submitPersonalMutation(personalPayload);
            } else {
                await submitEventMutation(collected);
            }
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
                gender: m.gender || undefined,
                furigana: (m.furiganaFamily || m.furiganaGiven) ? `${(m.furiganaFamily||"").trim()}　${(m.furiganaGiven||"").trim()}` : undefined,
                githubUrl: m.githubUrl || undefined,
            })),
            leaderIndex: teamSize === 1 ? 0 : leaderIndex + 1,
            leaderName: teamSize === 1 ? `${members[0]?.familyName || ""}　${members[0]?.givenName || ""}`.trim() : leaderName,
            leaderEmail: teamSize === 1 ? (members[0]?.studentId ? `c${members[0].studentId}@st.kanazawa-it.ac.jp` : "") : leaderEmail,
            hasFirstYear,
            teamDescription: teamSize === 1 ? "" : teamDescription,
            agreements: { agreeCancel, agreePrivacy, agreeShare, agreeLottery },
            allergy: { hasAllergy, allergyDetail },
            submittedAt: new Date().toISOString(),
        };

        setIsSubmitting(true);
        try {
            if (teamSize === 1) {
                const m = collected.members[0];
                const personalPayload = {
                    projectName: collected.projectName,
                    gradeClass: m.gradeClass,
                    studentId: m.studentId,
                    name: m.name,
                    furigana: m.furigana,
                    gender: m.gender,
                    leaderName: collected.leaderName,
                    leaderEmail: collected.leaderEmail,
                            hasHackathonExperience: hasHackathonExperience,
                            experienceDetail: experienceDetail,
                    agreements: collected.agreements,
                    allergy: collected.allergy,
                    submittedAt: collected.submittedAt,
                };
                await submitPersonalMutation(personalPayload);
            } else {
                await submitEventMutation(collected);
            }
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
        setHasHackathonExperience("no");
        setExperienceDetail("");
        setTechnologiesInput("");
        if (!opts.keepSubmit) setSubmitResult(null);
    }

    // If settings contain explicit application window, enforce it.
    if (beforeStart && appStart) {
        return <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">{renderCountdown(appStart)}</div>;
    }
    if (afterEnd && appEnd) {
        return (
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 p-6">
                <div className="p-6 bg-red-50 border border-red-200 rounded">
                    <h2 className="text-lg font-semibold">申し込みは終了しました。</h2>
                    <p className="mt-2">不明点があれば下記問い合わせ先へお問い合わせください。</p>
                    <p className="mt-2 text-sm">問い合わせ: <a href="https://x.com/HacKit_KIT" className="underline">@HacKit_KIT</a></p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="mb-8 text-center">
                {settings && (settings as any).enabled === false && (
                    <div className="mb-2 text-sm text-amber-700">開発環境: 運営設定は無効です</div>
                )}
                <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-amber-900">HacKit 2026</h2>
                <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-amber-800">イベント申し込みフォーム</h3>
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
                    <p className="text-sm text-amber-700 mt-2">混合チームの場合、それぞれが個別に申し込んでください。</p>
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
                                onChange={(e) => setMemberField(idx, "studentId", e.target.value.replace(/\D/g, "").slice(0, 7))}
                                placeholder="例：1234567"
                                inputMode="numeric"
                                pattern="\d{7}"
                                maxLength={7}
                            />
                        </label>
                        <label className="block">
                            <span className="block text-amber-800 font-semibold mb-2">氏名（姓 / 名）</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                            <label className="block mt-3">
                                <span className="block text-amber-800 font-semibold mb-2">GitHub URL（任意）</span>
                                <input
                                    className="w-full border-2 border-amber-300 rounded-lg p-3 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                                    value={members[idx].githubUrl || ""}
                                    onChange={(e) => setMemberField(idx, "githubUrl", e.target.value)}
                                    placeholder="例：https://github.com/username"
                                />
                            </label>
                            <div className="mt-3">
                                <span className="block text-amber-800 font-semibold mb-2">性別（任意）</span>
                                <div className="flex items-center gap-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 mr-2 accent-amber-500"
                                            checked={members[idx].gender === "male"}
                                            onChange={() => setMemberField(idx, "gender", members[idx].gender === "male" ? "" : "male")}
                                        />
                                        <span>男性</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 mr-2 accent-amber-500"
                                            checked={members[idx].gender === "female"}
                                            onChange={() => setMemberField(idx, "gender", members[idx].gender === "female" ? "" : "female")}
                                        />
                                        <span>女性</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 mr-2 accent-amber-500"
                                            checked={members[idx].gender === "other"}
                                            onChange={() => setMemberField(idx, "gender", members[idx].gender === "other" ? "" : "other")}
                                        />
                                        <span>無回答・その他</span>
                                    </label>
                                </div>
                            </div>
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
                    <>
                        <p className="mb-4 text-amber-800">個人参加の場合は以下の項目を入力してください。</p>
                        <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-amber-900 font-semibold mb-2">ハッカソン経験の有無</p>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="hackExp"
                                        checked={hasHackathonExperience === "yes"}
                                        onChange={() => setHasHackathonExperience("yes")}
                                        className="w-4 h-4 accent-amber-500"
                                    />
                                    <span className="ml-2 text-amber-900">あり</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="hackExp"
                                        checked={hasHackathonExperience === "no"}
                                        onChange={() => setHasHackathonExperience("no")}
                                        className="w-4 h-4 accent-amber-500"
                                    />
                                    <span className="ml-2 text-amber-900">なし</span>
                                </label>
                            </div>
                            {hasHackathonExperience === "yes" && (
                                <label className="block mt-3">
                                    <span className="block text-amber-900 font-semibold mb-2">ご経験の内容（自由記述）</span>
                                    <textarea
                                        className="w-full border-2 border-amber-300 rounded-lg p-3 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 min-h-20"
                                        value={experienceDetail}
                                        onChange={(e) => setExperienceDetail(e.target.value)}
                                        placeholder="過去のハッカソン参加経験、担当した役割、成果などをご記入ください。"
                                    />
                                </label>
                            )}
                            <label className="block mt-3">
                                <span className="block text-amber-900 font-semibold mb-2">触ったことのある技術（カンマ区切りで複数可）</span>
                                <textarea
                                    className="w-full border-2 border-amber-300 rounded-lg p-3 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 min-h-20"
                                    value={technologiesInput}
                                    onChange={(e) => setTechnologiesInput(e.target.value)}
                                    placeholder="例：React, Node.js, Python, Firebase"
                                />
                            </label>
                        </div>
                    </>
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
                        <span className="ml-3 text-amber-900">申し込み後のキャンセルはできません。</span>
                    </label>
                    <label className="flex items-start cursor-pointer p-3 hover:bg-amber-100 rounded-lg transition">
                        <input
                            type="checkbox"
                            checked={agreePrivacy}
                            onChange={(e) => setAgreePrivacy(e.target.checked)}
                            className="w-5 h-5 mt-1 accent-amber-500 flex-shrink-0"
                        />
                        <span className="ml-3 text-amber-900">会場や活動の様子を撮影し、広報用のSNS等に掲載する場合があります。また、Zoomで録音・録画を行うことがあります。</span>
                    </label>
                    <label className="flex items-start cursor-pointer p-3 hover:bg-amber-100 rounded-lg transition">
                        <input
                            type="checkbox"
                            checked={agreeShare}
                            onChange={(e) => setAgreeShare(e.target.checked)}
                            className="w-5 h-5 mt-1 accent-amber-500 flex-shrink-0"
                        />
                        <span className="ml-3 text-amber-900">スポンサー企業に氏名およびメールアドレス等の連絡先情報を共有する場合があります。</span>
                    </label>
                    <label className="flex items-start cursor-pointer p-3 hover:bg-amber-100 rounded-lg transition">
                        <input
                            type="checkbox"
                            checked={agreeLottery}
                            onChange={(e) => setAgreeLottery(e.target.checked)}
                            className="w-5 h-5 mt-1 accent-amber-500 flex-shrink-0"
                        />
                        <span className="ml-3 text-amber-900">応募者が多数の場合、参加者を抽選で決定することがあります。</span>
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
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                    type="button"
                    onClick={openPreview}
                    className="w-full sm:flex-1 bg-white border-2 border-amber-400 text-amber-900 font-bold py-3 px-6 rounded-lg hover:bg-amber-50 transition duration-200"
                >
                    入力内容をプレビュー
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full sm:flex-1 ${isSubmitting ? "bg-amber-300 cursor-not-allowed" : "bg-amber-500 hover:bg-amber-600"} text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105 shadow-lg`}
                >
                    {isSubmitting ? "送信中…" : "申し込みを送信"}
                </button>
                <button
                    type="button"
                    className="w-full sm:flex-1 bg-white border-2 border-amber-400 text-amber-900 font-bold py-3 px-6 rounded-lg hover:bg-amber-50 transition duration-200"
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
                                                <li key={i}>{`${i + 1}人目 — ${m.gradeClass || '—'} / ${m.studentId || '—'} / ${(m.familyName || '—')}　${(m.givenName || '—')} / ${(m.furiganaFamily || m.furiganaGiven) ? `${(m.furiganaFamily||'').trim()}　${(m.furiganaGiven||'').trim()}` : '—'} / ${m.githubUrl || '—'}`}</li>
                                            ))}
                                </ul>
                            </div>
                            <p><strong>リーダー名:</strong> {teamSize === 1 ? ((members[0]?.familyName || members[0]?.givenName) ? `${members[0]?.familyName || ''}　${members[0]?.givenName || ''}`.trim() : '—') : (leaderName || '—')}</p>
                            <p><strong>リーダーメール:</strong> {teamSize === 1 ? (members[0]?.studentId ? `c${members[0].studentId}@st.kanazawa-it.ac.jp` : '—') : (leaderEmail || '—')}</p>
                            <p><strong>1年生含む:</strong> {hasFirstYear === 'yes' ? 'はい' : 'いいえ'}</p>
                            {teamSize === 1 && (
                                <>
                                    <p><strong>ハッカソン経験:</strong> {hasHackathonExperience === 'yes' ? 'あり' : 'なし'}</p>
                                    {hasHackathonExperience === 'yes' && <p><strong>経験詳細:</strong> {experienceDetail || '—'}</p>}
                                    <p><strong>触ったことのある技術:</strong> {technologiesInput ? technologiesInput.split(/[,\n]+/).map(t=>t.trim()).filter(Boolean).join(', ') : '—'}</p>
                                </>
                            )}
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
