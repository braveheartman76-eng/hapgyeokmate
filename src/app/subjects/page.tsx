import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, BookOpen } from "lucide-react";
import { getPublishedCatalog } from "@/lib/catalog";
export const metadata = { title: "과목 선택" };
export const instant = false;
export default async function SubjectsPage() { await connection(); const subjects=await getPublishedCatalog(); return <main className="page-container"><header className="page-header editorial"><div><p>SUBJECTS</p><h1>공부할 과목을<br/>선택해 주세요.</h1><span>단원별 문제풀이와 학습 기록을 한곳에서 관리합니다.</span></div></header><div className="subject-list">{subjects.map((subject,index) => <Link href={`/subjects/${subject.id}`} className="subject-row" key={subject.id}><span className="subject-row-index">{String(index+1).padStart(2,"0")}</span><span className="subject-icon" style={{ color:subject.color }}><BookOpen /></span><div><strong>{subject.name}</strong><p>{subject.description}</p></div><ArrowRight size={18}/></Link>)}</div></main>; }
