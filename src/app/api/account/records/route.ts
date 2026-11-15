import { NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { examSessions, reviewItems, subjectsTable } from "@/db/schema";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error:"로그인이 필요합니다." }, { status:401 });
  const db = getDb();
  const [history,pendingRows] = await Promise.all([db.select({ id:examSessions.id, subjectId:examSessions.subjectId, subjectName:subjectsTable.name, score:examSessions.score, totalQuestions:examSessions.totalQuestions, startedAt:examSessions.startedAt, submittedAt:examSessions.submittedAt }).from(examSessions).innerJoin(subjectsTable,eq(examSessions.subjectId,subjectsTable.id)).where(and(eq(examSessions.userId,user.userId),eq(examSessions.status,"submitted"))).orderBy(desc(examSessions.submittedAt)).limit(20),db.select({ count:sql<number>`count(*)` }).from(reviewItems).where(and(eq(reviewItems.userId,user.userId),eq(reviewItems.status,"pending")))]);
  const pending = pendingRows[0]?.count ?? 0;
  const solved = history.reduce((sum,item) => sum+item.totalQuestions,0);
  const weightedScore = history.reduce((sum,item) => sum+(item.score ?? 0)*item.totalQuestions,0);
  return NextResponse.json({ stats:{ sessions:history.length, solved, accuracy:solved ? Math.round(weightedScore/solved) : 0, pending:Number(pending) }, history });
}

