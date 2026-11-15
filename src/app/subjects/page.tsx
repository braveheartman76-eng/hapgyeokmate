import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { subjects } from "@/lib/data";
export const metadata = { title: "과목 선택" };
export default function SubjectsPage() { return <main className="page-container"><header className="page-header editorial"><div><p>SUBJECTS</p><h1>공부할 과목을<br/>선택해 주세요.</h1><span>단원별 문제풀이와 학습 기록을 한곳에서 관리합니다.</span></div></header><div className="subject-list">{subjects.map((subject,index) => <Link href={subject.available ? `/subjects/${subject.id}` : "#"} aria-disabled={!subject.available} className={`subject-row ${!subject.available ? "disabled" : ""}`} key={subject.id}><span className="subject-row-index">0{index+1}</span><span className="subject-icon" style={{ color:subject.color }}><BookOpen /></span><div><strong>{subject.name}</strong><p>{subject.description}</p></div>{subject.available ? <ArrowRight size={18}/> : <span className="status-text">준비 중</span>}</Link>)}</div></main>; }
