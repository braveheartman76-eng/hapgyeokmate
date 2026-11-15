import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { examSessions, sessionAnswers, sessionQuestions } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { saveAnswerInput } from "@/lib/exam-input";

export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){
  const user=await getSession(); if(!user)return NextResponse.json({error:"로그인이 필요합니다."},{status:401}); const parsed=saveAnswerInput.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"답안 정보를 확인해 주세요."},{status:400});const {id}=await params;const db=getDb();
  const exam=(await db.select({id:examSessions.id,status:examSessions.status,total:examSessions.totalQuestions}).from(examSessions).where(and(eq(examSessions.id,id),eq(examSessions.userId,user.userId))).limit(1))[0];if(!exam)return NextResponse.json({error:"시험 세션을 찾을 수 없습니다."},{status:404});if(exam.status!=="in_progress")return NextResponse.json({error:"이미 제출된 시험입니다."},{status:409});
  const question=(await db.select({id:sessionQuestions.id}).from(sessionQuestions).where(and(eq(sessionQuestions.id,parsed.data.sessionQuestionId),eq(sessionQuestions.sessionId,id))).limit(1))[0];if(!question)return NextResponse.json({error:"세션 문제를 찾을 수 없습니다."},{status:404});
  await db.transaction(async(tx)=>{await tx.insert(sessionAnswers).values({sessionId:id,sessionQuestionId:question.id,selectedIndex:parsed.data.selectedIndex}).onConflictDoUpdate({target:sessionAnswers.sessionQuestionId,set:{selectedIndex:parsed.data.selectedIndex,isCorrect:null,updatedAt:new Date()}});await tx.update(examSessions).set({currentIndex:Math.min(parsed.data.currentIndex,exam.total-1),updatedAt:new Date()}).where(eq(examSessions.id,id));});
  return NextResponse.json({ok:true});
}
