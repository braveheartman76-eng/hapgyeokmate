import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { questionsTable } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { questionInput } from "@/lib/question-input";
async function admin() { const session = await getSession(); return session?.role === "admin" ? session : null; }
export async function GET() { if (!await admin()) return NextResponse.json({ error:"관리자 권한이 필요합니다." }, { status:403 }); if (!process.env.DATABASE_URL) return NextResponse.json({ error:"데모 모드에서는 브라우저에 저장됩니다.", demo:true }, { status:503 }); return NextResponse.json({ questions:await getDb().select().from(questionsTable).orderBy(desc(questionsTable.updatedAt)) }); }
export async function POST(request:Request) { const session = await admin(); if (!session) return NextResponse.json({ error:"관리자 권한이 필요합니다." }, { status:403 }); const parsed = questionInput.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error:"입력값을 확인해 주세요.", details:parsed.error.flatten() }, { status:400 }); if (!process.env.DATABASE_URL) return NextResponse.json({ error:"DATABASE_URL이 필요합니다." }, { status:503 }); const [question] = await getDb().insert(questionsTable).values({ ...parsed.data, unitId:parsed.data.unitId ?? null, createdBy:session.userId }).returning(); return NextResponse.json({ question }, { status:201 }); }
