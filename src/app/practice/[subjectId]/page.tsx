import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { QuizSession } from "@/components/quiz-session";
import { getDb } from "@/db";
import { questionsTable, units } from "@/db/schema";
import { getQuestions, getSubject } from "@/lib/data";
export const instant = false;
export default async function PracticePage({ params, searchParams }: { params: Promise<{ subjectId: string }>; searchParams: Promise<{ unit?: string }> }) {
  const { subjectId } = await params; const { unit } = await searchParams; const subject = getSubject(subjectId); if (!subject) notFound();
  let safeQuestions:Array<{id:string;subjectId:string;unit:string;prompt:string;choices:string[];source:string;difficulty:string}> = getQuestions(subjectId, unit).map((question) => ({ id:question.id, subjectId:question.subjectId, unit:question.unit, prompt:question.prompt, choices:question.choices, source:question.source, difficulty:question.difficulty }));
  if (process.env.DATABASE_URL) {
    const rows = await getDb().select({ id:questionsTable.id, subjectId:questionsTable.subjectId, unit:units.name, prompt:questionsTable.prompt, choices:questionsTable.choices, source:questionsTable.source, difficulty:questionsTable.difficulty }).from(questionsTable).leftJoin(units, eq(questionsTable.unitId, units.id)).where(and(eq(questionsTable.subjectId,subjectId),eq(questionsTable.published,true),unit ? eq(units.name,unit) : undefined));
    safeQuestions = rows.map((question) => ({ ...question, unit:question.unit ?? "기타" }));
  }
  return <QuizSession subjectName={subject.name} initialQuestions={safeQuestions} />;
}
