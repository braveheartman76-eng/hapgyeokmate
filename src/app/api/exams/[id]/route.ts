import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { examSessions, questionVersions, sessionAnswers, sessionQuestions } from "@/db/schema";
import { getSession } from "@/lib/auth";

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const user=await getSession(); if(!user)return NextResponse.json({error:"로그인이 필요합니다."},{status:401}); const {id}=await params; const db=getDb();
  const exam=(await db.select().from(examSessions).where(and(eq(examSessions.id,id),eq(examSessions.userId,user.userId))).limit(1))[0]; if(!exam)return NextResponse.json({error:"시험 세션을 찾을 수 없습니다."},{status:404});
  const rows=await db.select({sessionQuestionId:sessionQuestions.id,questionId:sessionQuestions.questionId,position:sessionQuestions.position,prompt:questionVersions.prompt,choices:questionVersions.choices,source:questionVersions.source,difficulty:questionVersions.difficulty,selectedIndex:sessionAnswers.selectedIndex,correctIndex:questionVersions.correctIndex,explanation:questionVersions.explanation,isCorrect:sessionAnswers.isCorrect}).from(sessionQuestions).innerJoin(questionVersions,eq(sessionQuestions.questionVersionId,questionVersions.id)).leftJoin(sessionAnswers,eq(sessionAnswers.sessionQuestionId,sessionQuestions.id)).where(eq(sessionQuestions.sessionId,id)).orderBy(asc(sessionQuestions.position));
  const questions=rows.map((row)=>exam.status==="submitted"?row:{sessionQuestionId:row.sessionQuestionId,questionId:row.questionId,position:row.position,prompt:row.prompt,choices:row.choices,source:row.source,difficulty:row.difficulty,selectedIndex:row.selectedIndex});
  return NextResponse.json({exam,questions});
}
