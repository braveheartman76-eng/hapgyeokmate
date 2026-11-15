"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, BookOpenCheck, RotateCcw, Trash2 } from "lucide-react";

type ReviewItem={id:string;questionId:string;subjectId:string;subjectName:string;prompt:string;explanation:string;source:string};
type Mode="wrong"|"bookmarks";

export default function ReviewPage() {
  const router=useRouter();
  const [mode,setMode]=useState<Mode>("wrong");
  const [items,setItems]=useState<ReviewItem[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  useEffect(()=>{let active=true;fetch(mode==="wrong"?"/api/review":"/api/bookmarks").then(async(response)=>({status:response.status,ok:response.ok,body:await response.json()})).then(({status,ok,body})=>{if(!active)return;if(status===401){router.replace("/login?next=%2Freview");return;}if(!ok){setError(body.error??"학습 목록을 불러오지 못했습니다.");setLoading(false);return;}setItems(body.items);setLoading(false);}).catch(()=>{if(active){setError("학습 목록을 불러오지 못했습니다.");setLoading(false);}});return()=>{active=false;};},[mode,router]);
  async function remove(questionId:string) {
    const url=mode==="wrong"?`/api/review?questionId=${encodeURIComponent(questionId)}`:`/api/bookmarks?questionId=${encodeURIComponent(questionId)}`;
    const response=await fetch(url,{method:"DELETE"});
    if(response.ok)setItems((current)=>current.filter((item)=>item.questionId!==questionId));
  }
  async function retry(questionId:string) {
    setError("");
    const response=await fetch("/api/review/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({questionId})});
    const body=await response.json();
    if(!response.ok){setError(body.error??"재풀이를 시작하지 못했습니다.");return;}
    router.push(`/exam/${body.sessionId}`);
  }
  const emptyCopy=mode==="wrong"?{title:"지금은 복습할 문제가 없어요.",description:"시험을 제출하면 틀린 문항과 미응답 문항이 자동으로 모입니다."}:{title:"저장한 문제가 없어요.",description:"문제풀이 화면의 북마크 버튼으로 다시 볼 문제를 저장하세요."};
  function changeMode(next:Mode){if(next===mode)return;setLoading(true);setError("");setItems([]);setMode(next);}
  return <main className="page-container"><header className="page-header editorial"><div><p>REVIEW</p><h1>필요한 문제만<br/>다시 봅니다.</h1><span>오답과 북마크를 나누어 빠르게 재풀이할 수 있습니다.</span></div></header><div className="review-tabs" role="tablist"><button className={mode==="wrong"?"active":""} onClick={()=>changeMode("wrong")}>오답노트</button><button className={mode==="bookmarks"?"active":""} onClick={()=>changeMode("bookmarks")}><Bookmark size={15}/> 북마크</button></div>{error&&<p className="form-error">{error}</p>}{loading?<div className="empty-state"><p>학습 목록을 불러오고 있습니다.</p></div>:items.length===0?<div className="empty-state"><BookOpenCheck size={34}/><p className="overline">ALL CLEAR</p><h2>{emptyCopy.title}</h2><span>{emptyCopy.description}</span><Link className="primary-button compact" href="/subjects">문제 풀러 가기</Link></div>:<div className="review-list">{items.map((item,index)=><article className="review-item" key={item.id}><span className="review-index">{String(index+1).padStart(2,"0")}</span><div><span className="wrong-label">{item.subjectName} · {mode==="wrong"?"WRONG":"BOOKMARK"}</span><h3>{item.prompt}</h3><p>{item.explanation}</p><div className="toolbar"><button className="text-button" onClick={()=>retry(item.questionId)}><RotateCcw size={15}/> 다시 풀기</button><button className="icon-text-button" onClick={()=>remove(item.questionId)} aria-label="목록에서 삭제"><Trash2 size={15}/></button></div></div></article>)}</div>}</main>;
}
