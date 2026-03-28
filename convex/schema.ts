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
                    gender: v.optional(v.string()),
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
            })
        ),
        teamDescription: v.string(),
        teamName: v.optional(v.string()),
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
});
