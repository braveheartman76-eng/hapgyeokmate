import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { questionsTable, subjectsTable, units } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { bulkQuestionInput } from "@/lib/bulk-question-input";

export async function POST(request:Request) {
  const session = await getSession();
  if (session?.role !== "admin") return NextResponse.json({ error:"관리자 권한이 필요합니다." }, { status:403 });
  const parsed = bulkQuestionInput.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error:"대량 등록 파일의 형식을 확인해 주세요.", details:parsed.error.flatten() }, { status:400 });
  const db = getDb();
  const count = await db.transaction(async (tx) => {
    const subjectIds = [...new Set(parsed.data.questions.map((item) => item.subjectId))];
    const [knownSubjects,knownUnits] = await Promise.all([tx.select({ id:subjectsTable.id }).from(subjectsTable),tx.select({ id:units.id, subjectId:units.subjectId, name:units.name }).from(units)]);
    const knownSubjectIds = new Set(knownSubjects.map((item) => item.id));
    const unitIds = new Map(knownUnits.map((item) => [`${item.subjectId}\u0000${item.name}`,item.id]));
    const missingSubject = subjectIds.find((id) => !knownSubjectIds.has(id));
    if (missingSubject) throw new Error(`등록되지 않은 과목입니다: ${missingSubject}`);
    const resolved = [];
    for (const item of parsed.data.questions) {
      const unitId=unitIds.get(`${item.subjectId}\u0000${item.unitName}`);
      if (!unitId) throw new Error(`등록되지 않은 단원입니다: ${item.subjectId} / ${item.unitName}`);
      resolved.push({ subjectId:item.subjectId, unitId, prompt:item.prompt, choices:item.choices, correctIndex:item.correctAnswer-1, explanation:item.explanation, source:item.source, difficulty:item.difficulty, published:item.published, createdBy:session.userId });
    }
    await tx.insert(questionsTable).values(resolved);
    return resolved.length;
  }).catch((error:unknown) => ({ error:error instanceof Error ? error.message : "대량 등록에 실패했습니다." }));
  if (typeof count !== "number") return NextResponse.json(count, { status:409 });
  return NextResponse.json({ ok:true, count }, { status:201 });
}

