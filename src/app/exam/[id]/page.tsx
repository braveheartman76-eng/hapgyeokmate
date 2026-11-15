import { ExamRunner } from "@/components/exam-runner";
export const instant=false;
export default async function ExamPage({params}:{params:Promise<{id:string}>}){return <ExamRunner sessionId={(await params).id}/>;}
