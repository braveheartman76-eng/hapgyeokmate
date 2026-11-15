import { describe, expect, it } from "vitest";
import { scoreAnswers } from "./scoring";

describe("server scoring rules", () => {
  it("calculates 80 points for 16 correct answers out of 20", () => {
    const answers = Array.from({length:20}, (_,index) => ({ selectedIndex:index < 16 ? 1 : 0, correctIndex:1 }));
    expect(scoreAnswers(answers)).toEqual({ correct:16, unanswered:0, score:80 });
  });
  it("separates four unanswered questions and treats them as incorrect", () => {
    const answers = Array.from({length:20}, (_,index) => ({ selectedIndex:index < 16 ? 1 : null, correctIndex:1 }));
    expect(scoreAnswers(answers)).toEqual({ correct:16, unanswered:4, score:80 });
  });
});
