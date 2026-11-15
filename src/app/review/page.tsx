"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpenCheck, RotateCcw, Trash2 } from "lucide-react";

type ReviewItem = { id:string; questionId:string; subjectId:string; subjectName:string; prompt:string; explanation:string; source:string };

export default function ReviewPage() {
  const router = useRouter();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    fetch("/api/review").then(async (response) => ({ status:response.status, ok:response.ok, body:await response.json() })).then(({status,ok,body}) => {
      if (!active) return;
      if (status === 401) { router.replace("/login?next=%2Freview"); return; }
      if (!ok) { setError(body.error ?? "오답노트를 불러오지 못했습니다."); setLoading(false); return; }
      setItems(body.items); setLoading(false);
    }).catch(() => { if (active) { setError("오답노트를 불러오지 못했습니다."); setLoading(false); } });
    return () => { active = false; };
  }, [router]);
  async function remove(questionId:string) {
    const response = await fetch(`/api/review?questionId=${encodeURIComponent(questionId)}`, { method:"DELETE" });
    if (response.ok) setItems((current) => current.filter((item) => item.questionId !== questionId));
  }
  async function retry(questionId:string) {
    setError("");
    const response = await fetch("/api/review/session", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({questionId}) });
    const body = await response.json();
    if (!response.ok) { setError(body.error ?? "재풀이를 시작하지 못했습니다."); return; }
    router.push(`/exam/${body.sessionId}`);
  }
  return <main className="page-container"><header className="page-header editorial"><div><p>REVIEW</p><h1>틀린 문제만<br/>다시 봅니다.</h1><span>다시 맞히면 복습 완료 상태로 자동 변경됩니다.</span></div></header>{error&&<p className="form-error">{error}</p>}{loading ? <div className="empty-state"><p>오답노트를 불러오고 있습니다.</p></div> : items.length === 0 ? <div className="empty-state"><BookOpenCheck size={34}/><p className="overline">ALL CLEAR</p><h2>지금은 복습할 문제가 없어요.</h2><span>시험을 제출하면 틀린 문항과 미응답 문항이 자동으로 모입니다.</span><Link className="primary-button compact" href="/subjects">문제 풀러 가기</Link></div> : <div className="review-list">{items.map((item,index) => <article className="review-item" key={item.id}><span className="review-index">{String(index+1).padStart(2,"0")}</span><div><span className="wrong-label">{item.subjectName} · WRONG</span><h3>{item.prompt}</h3><p>{item.explanation}</p><div className="toolbar"><button className="text-button" onClick={() => retry(item.questionId)}><RotateCcw size={15}/> 다시 풀기</button><button className="icon-text-button" onClick={() => remove(item.questionId)} aria-label="오답노트에서 삭제"><Trash2 size={15}/></button></div></div></article>)}</div>}</main>;
}
