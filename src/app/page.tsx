import Link from "next/link";
import { ArrowRight, Bell, BookOpen, Flame, Sparkles } from "lucide-react";
import { subjects } from "@/lib/data";
import { ProgressSummary } from "@/components/progress-summary";

export default function Home() {
  return <main className="home-page"><header className="home-header"><div className="brand"><div className="brand-mark">합</div><div><span>합격을 만드는 공부 습관</span><strong>합격메이트</strong></div></div><Link href="/login" className="icon-button" aria-label="로그인"><Bell size={21} /></Link></header>
    <section className="hero-card"><div className="hero-copy"><span className="streak"><Flame size={15} fill="currentColor" /> 오늘도 1일째</span><h1>작은 문제 하나가<br/><em>합격의 시작</em>이에요.</h1><p>오늘의 학습을 바로 시작해 보세요.</p><Link href="/subjects" className="white-button">문제 풀러 가기 <ArrowRight size={17} /></Link></div><div className="hero-orb"><Sparkles size={32} /><span>PASS</span></div></section>
    <section className="section-block"><div className="section-title"><div><span>나의 학습</span><h2>오늘의 기록</h2></div><Link href="/review">자세히</Link></div><ProgressSummary /></section>
    <section className="section-block"><div className="section-title"><div><span>과목 선택</span><h2>무엇을 공부할까요?</h2></div><Link href="/subjects">전체 보기</Link></div><div className="subject-grid">{subjects.map((subject, index) => <Link key={subject.id} href={subject.available ? `/subjects/${subject.id}` : "#"} aria-disabled={!subject.available} className={`subject-card ${!subject.available ? "disabled" : ""}`}><span className="subject-icon" style={{ background: `${subject.color}18`, color: subject.color }}><BookOpen /></span><div><strong>{subject.name}</strong><p>{subject.available ? `${subject.units.length}개 단원` : "준비 중"}</p></div><span className="subject-number">0{index + 1}</span></Link>)}</div></section>
    <section className="tip-card"><span>합격 TIP</span><strong>틀린 문제는 24시간 안에<br/>다시 풀면 기억에 더 오래 남아요.</strong><Link href="/review">오답 복습하기 <ArrowRight size={16}/></Link></section>
  </main>;
}
