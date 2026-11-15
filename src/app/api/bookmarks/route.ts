import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { bookmarks, questionsTable, subjectsTable } from "@/db/schema";
import { getSession } from "@/lib/auth";

const input = z.object({ questionId:z.string().uuid() });

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error:"로그인이 필요합니다." }, { status:401 });
  const items = await getDb().select({ id:bookmarks.id, questionId:bookmarks.questionId, subjectId:questionsTable.subjectId, subjectName:subjectsTable.name, prompt:questionsTable.prompt, explanation:questionsTable.explanation, source:questionsTable.source, createdAt:bookmarks.createdAt }).from(bookmarks).innerJoin(questionsTable,eq(bookmarks.questionId,questionsTable.id)).innerJoin(subjectsTable,eq(questionsTable.subjectId,subjectsTable.id)).where(eq(bookmarks.userId,user.userId)).orderBy(desc(bookmarks.createdAt));
  return NextResponse.json({ items, questionIds:items.map((item) => item.questionId) });
}

export async function POST(request:Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error:"로그인이 필요합니다." }, { status:401 });
  const parsed = input.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error:"문제를 지정해 주세요." }, { status:400 });
  const db = getDb();
  const question = (await db.select({ id:questionsTable.id }).from(questionsTable).where(and(eq(questionsTable.id,parsed.data.questionId),eq(questionsTable.published,true))).limit(1))[0];
  if (!question) return NextResponse.json({ error:"공개 문제를 찾을 수 없습니다." }, { status:404 });
  await db.insert(bookmarks).values({ userId:user.userId, questionId:question.id }).onConflictDoNothing();
  return NextResponse.json({ ok:true }, { status:201 });
}

export async function DELETE(request:Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error:"로그인이 필요합니다." }, { status:401 });
  const parsed = input.safeParse({ questionId:new URL(request.url).searchParams.get("questionId") });
  if (!parsed.success) return NextResponse.json({ error:"문제를 지정해 주세요." }, { status:400 });
  await getDb().delete(bookmarks).where(and(eq(bookmarks.userId,user.userId),eq(bookmarks.questionId,parsed.data.questionId)));
  return NextResponse.json({ ok:true });
}

