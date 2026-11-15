import { notFound } from "next/navigation";
import { QuizSession } from "@/components/quiz-session";
import { getQuestions, getSubject } from "@/lib/data";
export const instant = false;
export default async function PracticePage({ params, searchParams }: { params: Promise<{ subjectId: string }>; searchParams: Promise<{ unit?: string }> }) { const { subjectId } = await params; const { unit } = await searchParams; const subject = getSubject(subjectId); if (!subject) notFound(); const safeQuestions = getQuestions(subjectId, unit).map((question) => ({ id:question.id, subjectId:question.subjectId, unit:question.unit, prompt:question.prompt, choices:question.choices, source:question.source, difficulty:question.difficulty })); return <QuizSession subjectName={subject.name} initialQuestions={safeQuestions} />; }
