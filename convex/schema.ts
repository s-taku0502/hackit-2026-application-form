import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    events: defineTable({
        projectName: v.string(),
        teamSize: v.number(),
        members: v.array(
            v.object({ gradeClass: v.string(), studentId: v.string(), name: v.string() })
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
});
