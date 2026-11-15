import { z } from "zod";

export const bulkQuestionItem = z.object({
  subjectId: z.string().min(1),
  unitName: z.string().min(1),
  prompt: z.string().min(5),
  choices: z.array(z.string().min(1)).min(4).max(5),
  correctAnswer: z.number().int().min(1).max(5),
  explanation: z.string().min(5),
  source: z.string().default(""),
  difficulty: z.enum(["기본", "보통", "심화"]).default("보통"),
  published: z.boolean().default(false),
}).superRefine((value, context) => {
  if (value.correctAnswer > value.choices.length) {
    context.addIssue({ code: "custom", path: ["correctAnswer"], message: "정답 번호가 선택지 수보다 큽니다." });
  }
});

export const bulkQuestionInput = z.object({
  questions: z.array(bulkQuestionItem).min(1).max(1000),
});

