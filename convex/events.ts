import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper: require Convex auth for sensitive mutations when enabled via env
async function requireConvexAuth(ctx: any) {
    if (process.env.REQUIRE_AUTH !== "true") return;
    // If Convex Auth isn't configured, ctx.auth may be undefined — fail closed
    if (!ctx.auth || !ctx.auth.getUserIdentity) throw new Error("authentication not available");
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("authentication required");
    return user;
}

const YEAR = new Date().getFullYear().toString();
function T(name: string) {
    // Avoid identifiers starting with a digit. Use suffix form like `events2026`.
    return `${name}${YEAR}`;
}

export const submitEvent = mutation({
    args: {
        projectName: v.string(),
        productName: v.optional(v.string()),
        teamSize: v.number(),
        members: v.array(
            v.object({
                gradeClass: v.string(),
                studentId: v.string(),
                name: v.string(),
                    gender: v.optional(v.string()),
                furigana: v.optional(v.string()),
                // 各メンバーの任意の GitHub URL
                githubUrl: v.optional(v.string()),
                attendance: v.optional(
                    v.object({ day1: v.boolean(), day2: v.boolean(), day3: v.boolean() })
                ),
            })
        ),
        leaderIndex: v.number(),
        leaderName: v.string(),
        leaderEmail: v.string(),
        hasFirstYear: v.string(),
        teamDescription: v.string(),
        teamName: v.optional(v.string()),
        teamPassphrase: v.optional(v.string()),
        githubUrl: v.optional(v.string()),
        githubUrlBackup: v.optional(v.string()),
        publicSite: v.optional(v.string()),
        publicSiteBackup: v.optional(v.string()),
        attendance: v.optional(
            v.object({ day1: v.boolean(), day2: v.boolean(), day3: v.boolean() })
        ),
        agreements: v.object({
            agreeCancel: v.boolean(),
            agreePrivacy: v.boolean(),
            agreeShare: v.boolean(),
            agreeLottery: v.boolean(),
        }),
        allergy: v.object({ hasAllergy: v.string(), allergyDetail: v.string() }),
        submittedAt: v.string(),
    },
    handler: async (ctx, args) => {
        await requireConvexAuth(ctx);
        // Basic server-side validation / sanitization
        if (typeof args.projectName !== "string" || args.projectName.length === 0 || args.projectName.length > 200) {
            throw new Error("invalid projectName");
        }
        if (!Array.isArray(args.members) || args.members.length === 0 || args.members.length > 20) {
            throw new Error("invalid members");
        }
        if (typeof args.teamSize !== "number" || args.teamSize !== args.members.length) {
            throw new Error("teamSize must match members length");
        }

        // Email and URL basic checks
        const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailRe.test(args.leaderEmail)) throw new Error("invalid leaderEmail");

        function isValidUrl(u?: string | null) {
            if (!u) return true;
            try {
                const parsed = new URL(u);
                return parsed.protocol === "https:" || parsed.protocol === "http:";
            } catch (_e) {
                return false;
            }
        }

        if (!isValidUrl(args.githubUrl) || !isValidUrl(args.githubUrlBackup) || !isValidUrl(args.publicSite) || !isValidUrl(args.publicSiteBackup)) {
            throw new Error("invalid url");
        }

        // Validate member fields lengths and remove PII fields that shouldn't be stored plainly
        args.members = args.members.map((m: any) => {
            const out: any = { name: String(m.name).slice(0, 200) };
            if (m.furigana) out.furigana = String(m.furigana).slice(0, 200);
            if (m.gender) out.gender = String(m.gender).slice(0, 50);
            if (m.attendance) out.attendance = m.attendance;
            // Do not store raw studentId/gradeClass in public events listing
            if (m.studentId) out.studentId = String(m.studentId).slice(0, 64);
            if (m.gradeClass) out.gradeClass = String(m.gradeClass).slice(0, 64);
            if (m.githubUrl && isValidUrl(m.githubUrl)) out.githubUrl = m.githubUrl;
            return out;
        });

        // submittedAt sanity
        if (isNaN(Date.parse(args.submittedAt))) throw new Error("invalid submittedAt");

        const id = await ctx.db.insert(T("events"), args);
        return id;
    },
});

export const submitPersonal = mutation({
    args: {
        projectName: v.string(),
        productName: v.optional(v.string()),
        gradeClass: v.string(),
        studentId: v.string(),
        name: v.string(),
        furigana: v.optional(v.string()),
        gender: v.optional(v.string()),
        leaderName: v.optional(v.string()),
        leaderEmail: v.optional(v.string()),
        // ハッカソン経験の有無と詳細（個人参加）
        hasHackathonExperience: v.optional(v.string()),
        experienceDetail: v.optional(v.string()),
        // 使用技術（個人参加者が触ったことのある技術）
        technologies: v.optional(v.array(v.string())),
        agreements: v.object({
            agreeCancel: v.boolean(),
            agreePrivacy: v.boolean(),
            agreeShare: v.boolean(),
            agreeLottery: v.boolean(),
        }),
        allergy: v.object({ hasAllergy: v.string(), allergyDetail: v.string() }),
        submittedAt: v.string(),
    },
    handler: async (ctx, args) => {
        await requireConvexAuth(ctx);
        // Basic validation for personal submissions
        if (typeof args.projectName !== "string" || args.projectName.length > 200) throw new Error("invalid projectName");
        const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (args.leaderEmail && !emailRe.test(args.leaderEmail)) throw new Error("invalid leaderEmail");
        if (args.technologies && (!Array.isArray(args.technologies) || args.technologies.length > 50)) throw new Error("invalid technologies");
        if (isNaN(Date.parse(args.submittedAt))) throw new Error("invalid submittedAt");

        const sanitized: any = { ...args };
        if (sanitized.name) sanitized.name = String(sanitized.name).slice(0, 200);
        if (sanitized.furigana) sanitized.furigana = String(sanitized.furigana).slice(0, 200);

        const id = await ctx.db.insert(T("personal"), sanitized);
        return id;
    },
});

export const submitTeam = mutation({
    args: {
        teamName: v.string(),
        leaderName: v.optional(v.string()),
        leaderStudentId: v.optional(v.string()),
        leaderEmail: v.optional(v.string()),
        githubUrl: v.optional(v.string()),
        githubUrlBackup: v.optional(v.string()),
        publicSite: v.optional(v.string()),
        publicSiteBackup: v.optional(v.string()),
        // Allow older callers that pass full event-like payloads: make common event fields optional
        projectName: v.optional(v.string()),
        productName: v.optional(v.string()),
        teamSize: v.optional(v.number()),
        members: v.optional(
            v.array(
                v.object({
                    gradeClass: v.string(),
                    studentId: v.string(),
                    name: v.string(),
                    gender: v.optional(v.string()),
                    furigana: v.optional(v.string()),
                    githubUrl: v.optional(v.string()),
                    attendance: v.optional(
                        v.object({ day1: v.boolean(), day2: v.boolean(), day3: v.boolean() })
                    ),
                })
            )
        ),
        leaderIndex: v.optional(v.number()),
        hasFirstYear: v.optional(v.string()),
        teamDescription: v.optional(v.string()),
        teamPassphrase: v.optional(v.string()),
        attendance: v.optional(
            v.object({ day1: v.boolean(), day2: v.boolean(), day3: v.boolean() })
        ),
        agreements: v.optional(
            v.object({
                agreeCancel: v.boolean(),
                agreePrivacy: v.boolean(),
                agreeShare: v.boolean(),
                agreeLottery: v.boolean(),
            })
        ),
        allergy: v.optional(v.object({ hasAllergy: v.string(), allergyDetail: v.string() })),
        submittedAt: v.string(),
    },
    handler: async (ctx, args) => {
        await requireConvexAuth(ctx);
        // For safety, only allow server-side team patching when explicitly enabled
        if (process.env.ALLOW_TEAM_PATCH !== "true") {
            return null;
        }
        // 仕様: teams テーブルを使わず、まず leaderStudentId で events を探して patch、
        // 見つからなければ teamName で events を探して patch します。teams/personal テーブルは更新しません。
        // さらに注意: フロントエンドからチーム登録が行われた際に該当する events レコードが存在しない
        // 場合、環境変数 `ALLOW_TEAM_PATCH` が "true" のときのみ最小限のイベントを挿入して永続化します。
        let patchedEventId: string | null = null;

        if (args.leaderStudentId) {
            const allEvents = (await ctx.db.query(T("events")).collect()) as any[];
            const matched = allEvents.find((e: any) =>
                Array.isArray(e.members) && e.members.some((m: any) => m.studentId === args.leaderStudentId)
            );
            if (matched) {
                const patchData: Record<string, any> = {};
                if (args.teamName) patchData.teamName = args.teamName;
                if (args.productName) patchData.productName = args.productName;
                if (args.teamPassphrase) patchData.teamPassphrase = args.teamPassphrase;
                if (args.leaderName) patchData.leaderName = args.leaderName;
                if (args.leaderEmail) patchData.leaderEmail = args.leaderEmail;
                if (args.githubUrl) patchData.githubUrl = args.githubUrl;
                if (args.githubUrlBackup) patchData.githubUrlBackup = args.githubUrlBackup;
                if (args.publicSite) patchData.publicSite = args.publicSite;
                if (args.publicSiteBackup) patchData.publicSiteBackup = args.publicSiteBackup;
                if (Object.keys(patchData).length > 0) {
                    await ctx.db.patch(matched._id, patchData);
                    patchedEventId = matched._id;
                }
            }
        }

        if (!patchedEventId && args.teamName) {
            const allEvents = (await ctx.db.query(T("events")).collect()) as any[];
            const matchedByTeam = allEvents.find((e: any) => e.teamName === args.teamName);
            if (matchedByTeam) {
                const patchData: Record<string, any> = {};
                if (args.leaderName) patchData.leaderName = args.leaderName;
                if (args.teamPassphrase) patchData.teamPassphrase = args.teamPassphrase;
                if (args.leaderEmail) patchData.leaderEmail = args.leaderEmail;
                if (args.githubUrl) patchData.githubUrl = args.githubUrl;
                if (args.githubUrlBackup) patchData.githubUrlBackup = args.githubUrlBackup;
                if (args.publicSite) patchData.publicSite = args.publicSite;
                if (args.publicSiteBackup) patchData.publicSiteBackup = args.publicSiteBackup;
                if (Object.keys(patchData).length > 0) {
                    await ctx.db.patch(matchedByTeam._id, patchData);
                    patchedEventId = matchedByTeam._id;
                }
            }
        }

        // マッチしなかった場合、必要に応じて最小限のイベントを挿入して永続化する。
        if (!patchedEventId && process.env.ALLOW_TEAM_PATCH === "true") {
            const members = Array.isArray(args.members) && args.members.length > 0
                ? args.members
                : args.leaderStudentId
                ? [{ gradeClass: "", studentId: args.leaderStudentId, name: args.leaderName || "", gender: undefined }]
                : [];

            const minimalEvent: Record<string, any> = {
                teamName: args.teamName,
                productName: args.productName || null,
                teamPassphrase: args.teamPassphrase || null,
                leaderName: args.leaderName || null,
                leaderEmail: args.leaderEmail || null,
                githubUrl: args.githubUrl || null,
                githubUrlBackup: args.githubUrlBackup || null,
                publicSite: args.publicSite || null,
                publicSiteBackup: args.publicSiteBackup || null,
                members,
                submittedAt: args.submittedAt || new Date().toISOString(),
            };

            const insertedId = await ctx.db.insert(T("events"), minimalEvent as any);
            return insertedId;
        }

        // patchedEventId を返す（teams テーブルは使わない設計）。
        return patchedEventId;
    },
});

export const listEvents = query({
    handler: async (ctx) => {
        await requireConvexAuth(ctx);
        // Return a sanitized view to avoid leaking PII
        const raw = (await ctx.db.query(T("events")).collect()) as any[];
        return raw.map((e: any) => ({
            _id: e._id,
            projectName: e.projectName,
            productName: e.productName || null,
            teamName: e.teamName || null,
            teamSize: e.teamSize || null,
            // Expose only non-PII member info
            members: (Array.isArray(e.members ? e.members : []) ? e.members : []).map((m: any) => ({ name: m.name, gender: m.gender || null, githubUrl: m.githubUrl || null, attendance: m.attendance || null })),
            publicSite: e.publicSite || null,
            githubUrl: e.githubUrl || null,
            submittedAt: e.submittedAt || null,
        }));
    },
});

// Backwards-compatible public aliases expected by the frontend: `events:list`.
export const list = query({
    handler: async (ctx) => {
        await requireConvexAuth(ctx);
        const raw = (await ctx.db.query(T("events")).collect()) as any[];
        return raw.map((e: any) => ({
            _id: e._id,
            projectName: e.projectName,
            teamName: e.teamName || null,
            teamSize: e.teamSize || null,
        }));
    },
});

export const listTeams = query({
    handler: async (ctx) => {
        await requireConvexAuth(ctx);
        const raw = (await ctx.db.query(T("personal")).collect()) as any[];
        return raw.map((p: any) => ({
            _id: p._id,
            projectName: p.projectName,
            name: p.name,
            leaderName: p.leaderName || null,
            // Do not return leaderEmail or studentId in public listing
        }));
    },
});

export const teamsWithDetails = query({
    handler: async (ctx) => {
        await requireConvexAuth(ctx);
        const teams = (await ctx.db.query(T("personal")).collect()) as any[];
        const events = (await ctx.db.query(T("events")).collect()) as any[];
        // Join teams with any event that matches on leaderEmail (best-effort link), but mask PII
        return teams.map((team: any) => {
            const matchedEvent = events.find((e: any) => e.leaderEmail && team.leaderEmail && e.leaderEmail === team.leaderEmail);
            const maskedTeam = { _id: team._id, projectName: team.projectName, name: team.name, leaderName: team.leaderName || null };
            const maskedEvent = matchedEvent ? { _id: matchedEvent._id, projectName: matchedEvent.projectName, teamName: matchedEvent.teamName || null } : null;
            return { ...maskedTeam, event: maskedEvent };
        });
    },
});

// Public alias expected by the frontend: `events:listJudgements` -> returns judgements table.
export const listJudgements = query({
    handler: async (ctx) => {
        return (await ctx.db.query(T("judgements")).collect()) as any[];
    },
});

// Return the single settings document (or null) for the current year.
export const getSettings = query({
    handler: async (ctx) => {
        const all = (await ctx.db.query(T("settings")).collect()) as any[];
        return all.length > 0 ? all[0] : null;
    },
});

// Update attendance for a single member inside an event's `members` array.
export const updateMemberAttendance = mutation({
    args: {
        eventId: v.id(T("events")),
        memberStudentId: v.string(),
        attendance: v.object({ day1: v.boolean(), day2: v.boolean(), day3: v.boolean() }),
        // Optional: record a timestamp string for when attendance was marked
        timestamp: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireConvexAuth(ctx);
        const eventDoc = (await ctx.db.get(T("events"), args.eventId)) as any;
        if (!eventDoc) return null;

        const members = Array.isArray(eventDoc.members) ? eventDoc.members.slice() : [];
        let updated = false;
        for (let i = 0; i < members.length; i++) {
            const m: any = members[i];
            if (m.studentId === args.memberStudentId) {
                // Ensure attendance object exists and only accepted keys
                const attendance = { day1: !!args.attendance.day1, day2: !!args.attendance.day2, day3: !!args.attendance.day3 };
                m.attendance = { ...m.attendance, ...attendance };
                // Optionally set attendance timestamps per day
                if (args.timestamp) {
                    // validate timestamp
                    if (!isNaN(Date.parse(args.timestamp))) {
                        m.attendanceTimestamps = m.attendanceTimestamps || {};
                        if (attendance.day1) m.attendanceTimestamps.day1 = args.timestamp;
                        if (attendance.day2) m.attendanceTimestamps.day2 = args.timestamp;
                        if (attendance.day3) m.attendanceTimestamps.day3 = args.timestamp;
                    }
                }
                members[i] = m;
                updated = true;
                break;
            }
        }

        if (!updated) return null;

        await ctx.db.patch(args.eventId, { members });
        return args.eventId;
    },
});
