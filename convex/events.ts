import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
        const id = await ctx.db.insert("events", args);
        // No automatic judgements insertion for fixed-column judgements.
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
        const id = await ctx.db.insert("personal", args);
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
        // 仕様: teams テーブルを使わず、まず leaderStudentId で events を探して patch、
        // 見つからなければ teamName で events を探して patch します。teams/personal テーブルは更新しません。
        let patchedEventId: string | null = null;

        if (args.leaderStudentId) {
            const allEvents = await ctx.db.query("events").collect();
            const matched = allEvents.find((e) =>
                Array.isArray(e.members) && e.members.some((m) => m.studentId === args.leaderStudentId)
            );
            if (matched) {
                const patchData: Record<string, any> = {};
                if (args.teamName) patchData.teamName = args.teamName;
                if (args.productName) patchData.productName = args.productName;
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
            const allEvents = await ctx.db.query("events").collect();
            const matchedByTeam = allEvents.find((e) => e.teamName === args.teamName);
            if (matchedByTeam) {
                const patchData: Record<string, any> = {};
                if (args.leaderName) patchData.leaderName = args.leaderName;
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

        // patchedEventId を返す（teams テーブルは使わない設計）。
        return patchedEventId;
    },
});

export const listEvents = query({
    handler: async (ctx) => {
        return await ctx.db.query("events").collect();
    },
});

export const listTeams = query({
    handler: async (ctx) => {
        return await ctx.db.query("personal").collect();
    },
});

export const teamsWithDetails = query({
    handler: async (ctx) => {
        const teams = await ctx.db.query("personal").collect();
        const events = await ctx.db.query("events").collect();
        // Join teams with any event that matches on leaderEmail (best-effort link).
        return teams.map((team) => {
            const matchedEvent = events.find(
                (e) => e.leaderEmail && team.leaderEmail && e.leaderEmail === team.leaderEmail
            );
            return { ...team, event: matchedEvent || null };
        });
    },
});
