import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { questionsTable } from "@/db/schema";
import { questions } from "@/lib/data";
const requestSchema = z.object({ questionId: z.string().min(1), selectedIndex: z.number().int().min(0).max(9) });
const postgresUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function POST(request: Request) {
  try {
    const parsed = requestSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error:"잘못된 요청입니다." }, { status:400 });
    if (process.env.DATABASE_URL && postgresUuid.test(parsed.data.questionId)) {
      const [question] = await getDb().select({ correctIndex:questionsTable.correctIndex, explanation:questionsTable.explanation }).from(questionsTable).where(andPublished(parsed.data.questionId)).limit(1);
      if (!question) return NextResponse.json({ error:"문제를 찾을 수 없습니다." }, { status:404 });
      return NextResponse.json({ correct:parsed.data.selectedIndex === question.correctIndex, correctIndex:question.correctIndex, explanation:question.explanation });
    }
    const question = questions.find((item) => item.id === parsed.data.questionId); if (!question) return NextResponse.json({ error:"문제를 찾을 수 없습니다." }, { status:404 });
    return NextResponse.json({ correct:parsed.data.selectedIndex === question.correctIndex, correctIndex:question.correctIndex, explanation:question.explanation });
  } catch (error) {
    console.error("grade route failed", error);
    return NextResponse.json({ error:"채점 중 서버 오류가 발생했습니다." }, { status:500 });
  }
}
function andPublished(id:string) { return and(eq(questionsTable.id,id),eq(questionsTable.published,true)); }
