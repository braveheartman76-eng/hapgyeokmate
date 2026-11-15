import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { examSessions, questionsTable, questionVersions, sessionQuestions } from "@/db/schema";
import { getSession } from "@/lib/auth";

const input = z.object({ questionId: z.string().uuid() });

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const parsed = input.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "문제를 지정해 주세요." }, { status: 400 });
  const db = getDb();
  const item = (await db.select({ questionId:questionsTable.id, subjectId:questionsTable.subjectId }).from(questionsTable).where(and(eq(questionsTable.id,parsed.data.questionId),eq(questionsTable.published,true))).limit(1))[0];
  if (!item) return NextResponse.json({ error: "복습할 문제를 찾을 수 없습니다." }, { status: 404 });
  const version = (await db.select({ id: questionVersions.id }).from(questionVersions).where(eq(questionVersions.questionId, item.questionId)).orderBy(desc(questionVersions.version)).limit(1))[0];
  if (!version) return NextResponse.json({ error: "문제 버전을 찾을 수 없습니다." }, { status: 409 });
  const sessionId = await db.transaction(async (tx) => {
    const [exam] = await tx.insert(examSessions).values({ userId: user.userId, subjectId: item.subjectId, totalQuestions: 1 }).returning({ id: examSessions.id });
    await tx.insert(sessionQuestions).values({ sessionId: exam.id, questionId: item.questionId, questionVersionId: version.id, position: 0 });
    return exam.id;
  });
  return NextResponse.json({ sessionId }, { status: 201 });
}
