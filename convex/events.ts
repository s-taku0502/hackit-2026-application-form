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
        const allTeams = await ctx.db.query("teams").collect();
        const existing = allTeams.find((t) => t.teamName === args.teamName);
        if (existing) {
            await ctx.db.patch(existing._id, args);
            return existing._id;
        }
        const id = await ctx.db.insert("teams", args);
        return id;
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
