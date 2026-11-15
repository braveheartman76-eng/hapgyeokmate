"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronRight, RotateCcw, X } from "lucide-react";
import { saveAttempt } from "@/lib/progress";

type SafeQuestion = { id: string; subjectId: string; unit: string; prompt: string; choices: string[]; source: string; difficulty: string };
type Result = { correct: boolean; correctIndex: number; explanation: string };

export function QuizSession({ subjectName, initialQuestions }: { subjectName: string; initialQuestions: SafeQuestion[] }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const question = initialQuestions[index];
  const progress = useMemo(() => ((index + (result ? 1 : 0)) / Math.max(initialQuestions.length, 1)) * 100, [index, result, initialQuestions.length]);
  if (!question) return <main className="page-container"><div className="empty-state"><h1>등록된 문제가 없습니다</h1><p>다른 단원을 선택하거나 관리자에게 문의해 주세요.</p><Link className="primary-button" href="/subjects">과목으로 돌아가기</Link></div></main>;

  async function grade() {
    if (selected === null) return;
    setLoading(true);
    try {
      const response = await fetch("/api/grade", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: question.id, selectedIndex: selected }) });
      if (!response.ok) throw new Error("채점 요청에 실패했습니다.");
      const nextResult = await response.json() as Result;
      setResult(nextResult);
      saveAttempt({ questionId: question.id, subjectId: question.subjectId, prompt: question.prompt, selectedIndex: selected, correctIndex: nextResult.correctIndex, correct: nextResult.correct, explanation: nextResult.explanation, answeredAt: new Date().toISOString() });
    } finally { setLoading(false); }
  }
  function next() { setIndex(index === initialQuestions.length - 1 ? 0 : index + 1); setSelected(null); setResult(null); }

  return <main className="quiz-page"><header className="quiz-header"><Link href={`/subjects/${question.subjectId}`} aria-label="단원 선택으로 돌아가기"><ArrowLeft /></Link><div><b>{subjectName}</b><span>{question.unit}</span></div><span className="question-count">{index + 1}/{initialQuestions.length}</span></header><div className="progress-track"><i style={{ width: `${progress}%` }} /></div>
    <section className="question-card"><div className="question-meta"><span>{question.difficulty}</span><span>{question.source}</span></div><p className="eyebrow">QUESTION {String(index + 1).padStart(2, "0")}</p><h1>{question.prompt}</h1><div className="choices">{question.choices.map((choice, choiceIndex) => { const chosen = selected === choiceIndex; const isCorrect = result?.correctIndex === choiceIndex; const isWrong = result && chosen && !result.correct; return <button key={choice} disabled={!!result} onClick={() => setSelected(choiceIndex)} className={`${chosen ? "selected" : ""} ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}><span>{choiceIndex + 1}</span><b>{choice}</b>{isCorrect && <Check size={19} />}{isWrong && <X size={19} />}</button>; })}</div></section>
    {result && <section className={`explanation-card ${result.correct ? "is-correct" : "is-wrong"}`}><div className="result-title">{result.correct ? <Check /> : <X />}<strong>{result.correct ? "정답이에요!" : "아쉬워요, 다시 확인해 볼까요?"}</strong></div><p>{result.explanation}</p></section>}
    <div className="quiz-action">{!result ? <button className="primary-button" disabled={selected === null || loading} onClick={grade}>{loading ? "채점 중..." : "정답 확인"}</button> : <button className="primary-button" onClick={next}>{index === initialQuestions.length - 1 ? <><RotateCcw size={18} /> 다시 풀기</> : <>다음 문제 <ChevronRight size={18} /></>}</button>}</div>
  </main>;
}
