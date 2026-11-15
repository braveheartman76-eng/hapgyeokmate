import Link from "next/link";
import { ArrowRight, BookOpen, ChevronRight, CircleUserRound, Target } from "lucide-react";
import { subjects } from "@/lib/data";
import { ProgressSummary } from "@/components/progress-summary";

export default function Home() {
  return <main className="home-page"><header className="home-header"><div className="brand"><div className="brand-mark">H</div><div><strong>합격메이트</strong><span>HAPGYEOK MATE</span></div></div><Link href="/login" className="profile-link" aria-label="로그인"><CircleUserRound size={20}/><span>로그인</span></Link></header>
    <section className="home-hero"><span className="dot-pattern" aria-hidden="true"/><span className="glow glow-purple" aria-hidden="true"/><span className="glow glow-apricot" aria-hidden="true"/><div className="hero-copy"><p className="overline">DAILY STUDY</p><h1>오늘도 한 문제씩.<br/><em>합격에 가까워집니다.</em></h1><p>과목을 고르고 바로 시작하세요. 학습 기록은 자동으로 정리됩니다.</p></div><div className="daily-panel"><div className="daily-panel-head"><span><Target size={17}/> 오늘의 목표</span><b>0 / 20</b></div><div className="daily-progress"><i/></div><p>첫 문제를 풀면 오늘의 학습이 시작돼요.</p><Link href="/subjects" className="primary-button compact">오늘 학습 시작 <ArrowRight size={16}/></Link></div></section>
    <section className="section-block record-section"><div className="section-title"><div><span>MY RECORD</span><h2>학습 현황</h2></div><Link href="/review">오답 확인 <ChevronRight size={14}/></Link></div><ProgressSummary /></section>
    <section className="section-block"><div className="section-title"><div><span>SUBJECT</span><h2>과목별 학습</h2></div><Link href="/subjects">전체 보기 <ChevronRight size={14}/></Link></div><div className="subject-grid">{subjects.map((subject, index) => <Link key={subject.id} href={subject.available ? `/subjects/${subject.id}` : "#"} aria-disabled={!subject.available} className={`subject-card ${!subject.available ? "disabled" : ""}`}><span className="subject-index">0{index + 1}</span><span className="subject-icon" style={{ color: subject.color }}><BookOpen /></span><div><strong>{subject.name}</strong><p>{subject.available ? `${subject.units.length}개 단원` : "준비 중"}</p></div><ChevronRight className="subject-arrow" size={18}/></Link>)}</div></section>
    <section className="review-banner"><div><span>REVIEW</span><strong>틀린 문제는<br/>기억이 흐려지기 전에.</strong><p>오답만 모아 빠르게 다시 풀어보세요.</p></div><Link href="/review" aria-label="오답 복습하기"><ArrowRight size={21}/></Link></section>
  </main>;
}
