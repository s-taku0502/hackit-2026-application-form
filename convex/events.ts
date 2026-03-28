import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submitEvent = mutation({
    args: {
        projectName: v.string(),
        teamSize: v.number(),
        members: v.array(
            v.object({
                gradeClass: v.string(),
                studentId: v.string(),
                name: v.string(),
                    gender: v.optional(v.string()),
                furigana: v.optional(v.string()),
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
        submittedAt: v.string(),
    },
    handler: async (ctx, args) => {
        // Upsert by `teamName`: 上書きする場合は既存ドキュメントを更新、なければ挿入。
        // 仕様変更: 新規 `teams` ドキュメントは作成しない。既存の `teams` が見つかれば上書き、
        // 見つからなければ `events` テーブルの既存レコードの `teamName` を上書きする。
        const allTeams = await ctx.db.query("teams").collect();
        const existing = allTeams.find((t) => t.teamName === args.teamName);
        let teamId: string | null = null;
        if (existing) {
            await ctx.db.patch(existing._id, args);
            teamId = existing._id;
        }

        // leaderStudentId があれば、events 側で該当メンバーを探して teamName 等を上書きする。
        let patchedEventId: string | null = null;
        if (args.leaderStudentId) {
            const allEvents = await ctx.db.query("events").collect();
            const matched = allEvents.find((e) =>
                Array.isArray(e.members) && e.members.some((m) => m.studentId === args.leaderStudentId)
            );
            if (matched) {
                const patchData: Record<string, any> = {};
                if (args.teamName) patchData.teamName = args.teamName;
                if (args.leaderName) patchData.leaderName = args.leaderName;
                if (args.leaderEmail) patchData.leaderEmail = args.leaderEmail;
                if (Object.keys(patchData).length > 0) {
                    await ctx.db.patch(matched._id, patchData);
                    patchedEventId = matched._id;
                }
            }
        }

        // 既存 teams を更新した場合はその id、そうでなければ patched event の id を返す。
        return teamId ?? patchedEventId;
    },
});

export const listEvents = query({
    handler: async (ctx) => {
        return await ctx.db.query("events").collect();
    },
});

export const listTeams = query({
    handler: async (ctx) => {
        return await ctx.db.query("teams").collect();
    },
});

export const teamsWithDetails = query({
    handler: async (ctx) => {
        const teams = await ctx.db.query("teams").collect();
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
