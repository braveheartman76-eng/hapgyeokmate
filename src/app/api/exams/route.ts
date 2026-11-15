import { NextResponse } from "next/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { examSessions, questionsTable, questionVersions, sessionQuestions } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { createExamInput } from "@/lib/exam-input";

export async function POST(request:Request){
  const user=await getSession(); if(!user)return NextResponse.json({error:"로그인이 필요합니다."},{status:401});
  const parsed=createExamInput.safeParse(await request.json()); if(!parsed.success)return NextResponse.json({error:"시험 설정을 확인해 주세요."},{status:400});
  const db=getDb(); const existing=(await db.select({id:examSessions.id}).from(examSessions).where(and(eq(examSessions.userId,user.userId),eq(examSessions.subjectId,parsed.data.subjectId),eq(examSessions.status,"in_progress"))).orderBy(desc(examSessions.updatedAt)).limit(1))[0];
  if(existing)return NextResponse.json({sessionId:existing.id,resumed:true});
  const result=await db.transaction(async(tx)=>{
    const selected=await tx.select({id:questionsTable.id}).from(questionsTable).where(and(eq(questionsTable.subjectId,parsed.data.subjectId),eq(questionsTable.published,true))).orderBy(sql`random()`).limit(parsed.data.count);
    if(selected.length<parsed.data.count)return {error:`공개 문제가 ${parsed.data.count}개 필요합니다. 현재 ${selected.length}개입니다.`};
    const ids=selected.map((question)=>question.id); const versions=await tx.select({id:questionVersions.id,questionId:questionVersions.questionId,version:questionVersions.version}).from(questionVersions).where(inArray(questionVersions.questionId,ids)).orderBy(desc(questionVersions.version));
    const latest=new Map<string,string>(); for(const version of versions)if(!latest.has(version.questionId))latest.set(version.questionId,version.id);
    if(latest.size!==selected.length)return {error:"문제 버전을 준비하지 못했습니다."};
    const [exam]=await tx.insert(examSessions).values({userId:user.userId,subjectId:parsed.data.subjectId,totalQuestions:selected.length}).returning({id:examSessions.id});
    await tx.insert(sessionQuestions).values(selected.map((question,position)=>({sessionId:exam.id,questionId:question.id,questionVersionId:latest.get(question.id)!,position})));
    return {sessionId:exam.id,resumed:false};
  });
  if("error" in result)return NextResponse.json({error:result.error},{status:409});
  return NextResponse.json(result,{status:201});
}
