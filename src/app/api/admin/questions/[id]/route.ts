import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { questionsTable } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { questionInput } from "@/lib/question-input";
async function allowed() { return (await getSession())?.role === "admin"; }
export async function PUT(request:Request, { params }:{ params:Promise<{id:string}> }) { if (!await allowed()) return NextResponse.json({ error:"관리자 권한이 필요합니다." }, { status:403 }); if (!process.env.DATABASE_URL) return NextResponse.json({ error:"DATABASE_URL이 필요합니다." }, { status:503 }); const parsed = questionInput.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error:"입력값을 확인해 주세요." }, { status:400 }); const { id } = await params; const [question] = await getDb().update(questionsTable).set({ ...parsed.data, unitId:parsed.data.unitId ?? null, updatedAt:new Date() }).where(eq(questionsTable.id,id)).returning(); return question ? NextResponse.json({ question }) : NextResponse.json({ error:"문제를 찾을 수 없습니다." }, { status:404 }); }
export async function DELETE(_request:Request, { params }:{ params:Promise<{id:string}> }) { if (!await allowed()) return NextResponse.json({ error:"관리자 권한이 필요합니다." }, { status:403 }); if (!process.env.DATABASE_URL) return NextResponse.json({ error:"DATABASE_URL이 필요합니다." }, { status:503 }); const { id } = await params; const deleted = await getDb().delete(questionsTable).where(eq(questionsTable.id,id)).returning({ id:questionsTable.id }); return deleted.length ? NextResponse.json({ ok:true }) : NextResponse.json({ error:"문제를 찾을 수 없습니다." }, { status:404 }); }
