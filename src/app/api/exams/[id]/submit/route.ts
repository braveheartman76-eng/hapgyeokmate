import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { examSessions, questionVersions, reviewItems, sessionAnswers, sessionQuestions } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { scoreAnswers } from "@/lib/scoring";

export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}){
  const user=await getSession();if(!user)return NextResponse.json({error:"로그인이 필요합니다."},{status:401});const {id}=await params;const db=getDb();
  const result=await db.transaction(async(tx)=>{
    await tx.execute(sql`SELECT id FROM exam_sessions WHERE id=${id} FOR UPDATE`);
    const exam=(await tx.select().from(examSessions).where(and(eq(examSessions.id,id),eq(examSessions.userId,user.userId))).limit(1))[0];if(!exam)return {status:404,error:"시험 세션을 찾을 수 없습니다."};if(exam.status==="submitted")return {status:200,score:exam.score,alreadySubmitted:true};
    const rows=await tx.select({sessionQuestionId:sessionQuestions.id,questionId:sessionQuestions.questionId,selectedIndex:sessionAnswers.selectedIndex,correctIndex:questionVersions.correctIndex}).from(sessionQuestions).innerJoin(questionVersions,eq(sessionQuestions.questionVersionId,questionVersions.id)).leftJoin(sessionAnswers,eq(sessionAnswers.sessionQuestionId,sessionQuestions.id)).where(eq(sessionQuestions.sessionId,id));
    for(const row of rows){const isCorrect=row.selectedIndex!==null&&row.selectedIndex===row.correctIndex;if(row.selectedIndex!==null)await tx.update(sessionAnswers).set({isCorrect,updatedAt:new Date()}).where(eq(sessionAnswers.sessionQuestionId,row.sessionQuestionId));if(isCorrect){await tx.update(reviewItems).set({status:"completed",completedAt:new Date()}).where(and(eq(reviewItems.userId,user.userId),eq(reviewItems.questionId,row.questionId)));}else{await tx.insert(reviewItems).values({userId:user.userId,questionId:row.questionId,status:"pending",lastWrongAt:new Date(),completedAt:null}).onConflictDoUpdate({target:[reviewItems.userId,reviewItems.questionId],set:{status:"pending",lastWrongAt:new Date(),completedAt:null}});}}
    const result=scoreAnswers(rows,exam.totalQuestions);await tx.update(examSessions).set({status:"submitted",score:result.score,submittedAt:new Date(),updatedAt:new Date()}).where(eq(examSessions.id,id));return {status:200,score:result.score,correct:result.correct,total:exam.totalQuestions,unanswered:result.unanswered,alreadySubmitted:false};
  });
  if("error" in result)return NextResponse.json({error:result.error},{status:result.status});return NextResponse.json(result);
}
