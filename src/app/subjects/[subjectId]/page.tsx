import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getQuestions, getSubject } from "@/lib/data";
import { StartExamButton } from "@/components/start-exam-button";
export const instant = false;

export default async function SubjectPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = await params; const subject = getSubject(subjectId); if (!subject) notFound();
  return <main className="page-container"><header className="subject-header"><Link className="back-link" href="/subjects"><ArrowLeft size={16}/> 과목 목록</Link><p>SUBJECT</p><h1>{subject.name}</h1><span>{subject.description}</span><div className="subject-rule" style={{ background:subject.color }}/></header><section className="exam-entry"><p className="overline">EXAM MODE</p><h2>20문제 실전 세트</h2><span>답안 자동저장 · 이어 풀기 · 최종 점수</span><StartExamButton subjectId={subject.id}/></section><section className="unit-section"><div className="section-title"><div><span>QUICK PRACTICE</span><h2>단원별 빠른 학습</h2></div></div><div className="unit-list">{subject.units.map((unit, index) => { const count = getQuestions(subject.id, unit).length; return <Link key={unit} href={count ? `/practice/${subject.id}?unit=${encodeURIComponent(unit)}` : "#"} className={`unit-row ${count ? "" : "disabled"}`}><span>0{index+1}</span><div><strong>{unit}</strong><p>{count ? `${count}문제 수록` : "문제 준비 중"}</p></div><ArrowRight size={18}/></Link>; })}</div></section><Link className="secondary-button quick-all" href={`/practice/${subject.id}`}>등록 문제 빠르게 풀기 <ArrowRight size={17}/></Link></main>;
}
