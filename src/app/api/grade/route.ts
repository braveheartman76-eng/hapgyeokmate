import { NextResponse } from "next/server";
import { z } from "zod";
import { questions } from "@/lib/data";
const requestSchema = z.object({ questionId: z.string().min(1), selectedIndex: z.number().int().min(0).max(9) });
export async function POST(request: Request) { const parsed = requestSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error:"잘못된 요청입니다." }, { status:400 }); const question = questions.find((item) => item.id === parsed.data.questionId); if (!question) return NextResponse.json({ error:"문제를 찾을 수 없습니다." }, { status:404 }); return NextResponse.json({ correct:parsed.data.selectedIndex === question.correctIndex, correctIndex:question.correctIndex, explanation:question.explanation }); }
