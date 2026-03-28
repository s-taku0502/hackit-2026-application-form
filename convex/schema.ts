import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const YEAR = new Date().getFullYear().toString();

export default defineSchema({
    // Tables append the YEAR value to avoid identifiers starting with a digit (e.g. "events2026").
    ["events" + YEAR]: defineTable({
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

    ["personal" + YEAR]: defineTable({
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
    ["teams" + YEAR]: defineTable({
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
    // 審査員一覧（名前のみ）
    ["judgements" + YEAR]: defineTable({
        judgeName: v.string(),
        createdAt: v.string(),
    }),

    // 審査結果（各審査の詳細を格納）
    ["feedback" + YEAR]: defineTable({
        judgeName: v.string(), // 審査員名
        judgeTeamName: v.optional(v.string()), // 審査対象チーム名
        productName: v.optional(v.string()), // 該当プロダクト名
        criterion1: v.optional(v.union(v.number(), v.null())),
        criterion2: v.optional(v.union(v.number(), v.null())),
        criterion3: v.optional(v.union(v.number(), v.null())),
        note: v.optional(v.string()),
        comments: v.optional(v.string()),
        createdAt: v.string(),
    }),
    // 管理用設定テーブル（単一ドキュメントでグローバル設定を保持）
    ["settings" + YEAR]: defineTable({
        key: v.string(), // 例: "global"
        submissionDeadline: v.optional(v.string()), // ISO日時文字列
        judgingDeadline: v.optional(v.string()), // ISO日時文字列
        registrationOpen: v.optional(v.boolean()),
        // 参加者関連
        eventApplicationStart: v.optional(v.string()),
        eventApplicationEnd: v.optional(v.string()),
        teamRegistrationEnd: v.optional(v.string()),
        // 審査関連
        judgingStart: v.optional(v.string()),
        judgingEnd: v.optional(v.string()),
        updatedAt: v.string(),
    }),
});
