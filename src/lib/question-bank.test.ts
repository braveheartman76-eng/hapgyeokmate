import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type BankQuestion={externalId:string;sourceNumber:number;unit:string;prompt:string;choices:string[];correctIndex:number;explanation:string;published:boolean};
const bank=JSON.parse(readFileSync(path.join(process.cwd(),"data","criminal-procedure-5years.json"),"utf8")) as {sourceMissingNumbers:number[];questions:BankQuestion[]};

describe("criminal-procedure five-year question bank",()=>{
  it("contains the 630 source questions and records the missing source number",()=>{
    expect(bank.questions).toHaveLength(630);
    expect(bank.sourceMissingNumbers).toEqual([582]);
    expect(new Set(bank.questions.map((question)=>question.sourceNumber)).size).toBe(630);
  });
  it("keeps complete choices, answers, explanations and publication state",()=>{
    for(const question of bank.questions){
      expect([4,5]).toContain(question.choices.length);
      expect(question.correctIndex).toBeGreaterThanOrEqual(0);
      expect(question.correctIndex).toBeLessThan(question.choices.length);
      expect(question.prompt.length).toBeGreaterThan(0);
      expect(question.explanation.length).toBeGreaterThan(0);
      expect(question.published).toBe(true);
    }
  });
  it("uses stable import identifiers and usable unit names",()=>{
    expect(new Set(bank.questions.map((question)=>question.externalId)).size).toBe(630);
    expect(bank.questions.some((question)=>/^[①-⑤ㄱ-ㅎ]/.test(question.unit))).toBe(false);
  });
});
