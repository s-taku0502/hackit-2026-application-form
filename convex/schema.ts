import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    events: defineTable({
        projectName: v.string(),
        teamSize: v.number(),
        members: v.array(
            v.object({
                gradeClass: v.string(),
                studentId: v.string(),
                name: v.string(),
                furigana: v.optional(v.string()),
                attendanceTimestamps: v.optional(
                    v.object({
                        day1: v.optional(v.string()),
                        day2: v.optional(v.string()),
                        day3: v.optional(v.string()),
                    })
                ),
                attendance: v.optional(
                    v.object({ day1: v.boolean(), day2: v.boolean(), day3: v.boolean() })
                ),
                gender: v.optional(v.string()),
            })
        ),
        teamDescription: v.string(),
        productName: v.optional(v.string()),
        teamName: v.optional(v.string()),
        githubUrl: v.optional(v.string()),
        githubUrlBackup: v.optional(v.string()),
        publicSite: v.optional(v.string()),
        publicSiteBackup: v.optional(v.string()),
        attendance: v.optional(
            v.object({ day1: v.boolean(), day2: v.boolean(), day3: v.boolean() })
        ),
        leaderIndex: v.number(),
        leaderName: v.string(),
        leaderEmail: v.string(),
        hasFirstYear: v.string(),
        agreements: v.object({
            agreeCancel: v.boolean(),
            agreePrivacy: v.boolean(),
            agreeShare: v.boolean(),
            agreeLottery: v.boolean(),
        }),
        allergy: v.object({ hasAllergy: v.string(), allergyDetail: v.string() }),
        submittedAt: v.string(),
    }),

    personal: defineTable({
        projectName: v.string(),
        productName: v.optional(v.string()),
        gradeClass: v.string(),
        studentId: v.string(),
        name: v.string(),
        furigana: v.optional(v.string()),
        gender: v.optional(v.string()),
        leaderName: v.optional(v.string()),
        leaderEmail: v.optional(v.string()),
        hasHackathonExperience: v.optional(v.string()),
        experienceDetail: v.optional(v.string()),
        technologies: v.optional(v.array(v.string())),
        agreements: v.object({
            agreeCancel: v.boolean(),
            agreePrivacy: v.boolean(),
            agreeShare: v.boolean(),
            agreeLottery: v.boolean(),
        }),
        allergy: v.object({ hasAllergy: v.string(), allergyDetail: v.string() }),
        submittedAt: v.string(),
    }),

    teams: defineTable({
        teamName: v.string(),
        leaderName: v.optional(v.string()),
        leaderStudentId: v.optional(v.string()),
        leaderEmail: v.optional(v.string()),
        githubUrl: v.optional(v.string()),
        githubUrlBackup: v.optional(v.string()),
        publicSite: v.optional(v.string()),
        publicSiteBackup: v.optional(v.string()),
        submittedAt: v.string(),
    }),
    judgements: defineTable({
        // Fixed columns for judging sheet
        judgeName: v.string(), // 審査員名
        judgeTeamName: v.optional(v.string()), // 審査チーム名（審査員の所属チームなど）
        productName: v.optional(v.string()), // 該当プロダクト名
        criterion1: v.optional(v.union(v.number(), v.null())), // 評価基準1
        criterion2: v.optional(v.union(v.number(), v.null())), // 評価基準2
        criterion3: v.optional(v.union(v.number(), v.null())), // 評価基準3
        note: v.optional(v.string()), // メモ
        comments: v.optional(v.string()), // 評価コメント
        createdAt: v.string(),
    }),
    feedback: defineTable({
        teamName: v.string(),
        productName: v.string(),
        judgeName: v.optional(v.string()),
        score: v.optional(v.number()),
        comments: v.string(),
        submittedAt: v.string(),
    }),
});
