import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { questionsTable, reviewItems, subjectsTable } from "@/db/schema";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const requestedStatus = new URL(request.url).searchParams.get("status");
  const status = requestedStatus === "completed" ? "completed" : "pending";
  const items = await getDb()
    .select({ id: reviewItems.id, questionId: reviewItems.questionId, status: reviewItems.status, lastWrongAt: reviewItems.lastWrongAt, completedAt: reviewItems.completedAt, subjectId: questionsTable.subjectId, subjectName: subjectsTable.name, prompt: questionsTable.prompt, explanation: questionsTable.explanation, source: questionsTable.source })
    .from(reviewItems)
    .innerJoin(questionsTable, eq(reviewItems.questionId, questionsTable.id))
    .innerJoin(subjectsTable, eq(questionsTable.subjectId, subjectsTable.id))
    .where(and(eq(reviewItems.userId, user.userId), eq(reviewItems.status, status)))
    .orderBy(desc(reviewItems.lastWrongAt));
  return NextResponse.json({ items });
}

export async function DELETE(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const questionId = new URL(request.url).searchParams.get("questionId");
  if (!questionId) return NextResponse.json({ error: "문제를 지정해 주세요." }, { status: 400 });
  await getDb().delete(reviewItems).where(and(eq(reviewItems.userId, user.userId), eq(reviewItems.questionId, questionId)));
  return NextResponse.json({ ok: true });
}
