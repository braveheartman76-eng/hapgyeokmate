import { describe, expect, it } from "vitest";
import { bulkQuestionInput } from "./bulk-question-input";

const valid = { subjectId:"criminal-procedure", unitName:"수사", prompt:"대량 등록 검증을 위한 문제입니다.", choices:["1번","2번","3번","4번"], correctAnswer:2, explanation:"정답은 2번 선택지입니다.", source:"검증", difficulty:"보통" as const, published:false };

describe("bulk question input", () => {
  it("accepts four and five choice questions", () => {
    expect(bulkQuestionInput.safeParse({ questions:[valid,{...valid,choices:[...valid.choices,"5번"],correctAnswer:5}] }).success).toBe(true);
  });
  it("rejects an answer outside the available choices", () => {
    expect(bulkQuestionInput.safeParse({ questions:[{...valid,correctAnswer:5}] }).success).toBe(false);
  });
});

