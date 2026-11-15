import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, Layers3 } from "lucide-react";
import { getQuestions, getSubject } from "@/lib/data";
export const instant = false;

export default async function SubjectPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = await params; const subject = getSubject(subjectId); if (!subject) notFound();
  return <main className="page-container"><header className="page-header"><div><Link className="back-link" href="/subjects"><ArrowLeft size={15}/> 과목 선택</Link><h1>{subject.name}</h1><p>{subject.description}</p></div></header><div>{subject.units.map((unit, index) => { const count = getQuestions(subject.id, unit).length; return <Link key={unit} href={count ? `/practice/${subject.id}?unit=${encodeURIComponent(unit)}` : "#"} className="list-card" style={{ display:"flex", alignItems:"center", gap:15, opacity:count ? 1 : .5 }}><span className="subject-icon" style={{ background:`${subject.color}18`, color:subject.color }}><Layers3 /></span><div style={{ flex:1 }}><span className="pill">UNIT {index + 1}</span><strong style={{ display:"block", marginTop:7 }}>{unit}</strong><p className="muted" style={{ margin:"3px 0 0" }}>{count ? `${count}문제` : "문제 준비 중"}</p></div><ChevronRight size={19}/></Link>; })}</div><Link className="primary-button" style={{ marginTop:20 }} href={`/practice/${subject.id}`}>전체 범위 문제 풀기</Link></main>;
}
