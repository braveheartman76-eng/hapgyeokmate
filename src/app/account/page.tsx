"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";

type User={id:string;email:string;name:string;role:"student"|"admin"};
type Records={stats:{sessions:number;solved:number;accuracy:number;pending:number};history:Array<{id:string;subjectName:string;score:number|null;totalQuestions:number;submittedAt:string}>};

export default function AccountPage() {
  const router=useRouter();
  const [user,setUser]=useState<User|null|undefined>(undefined);
  const [records,setRecords]=useState<Records|null>(null);
  const [currentPassword,setCurrentPassword]=useState("");
  const [newPassword,setNewPassword]=useState("");
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  useEffect(()=>{Promise.all([fetch("/api/auth/session"),fetch("/api/account/records")]).then(async([sessionResponse,recordsResponse])=>({session:await sessionResponse.json(),recordsOk:recordsResponse.ok,records:await recordsResponse.json()})).then((body)=>{setUser(body.session.user??null);if(body.recordsOk)setRecords(body.records);});},[]);
  async function logout(){await fetch("/api/auth/logout",{method:"POST"});router.push("/");router.refresh();}
  async function changePassword(event:FormEvent){event.preventDefault();setMessage("");setError("");const response=await fetch("/api/auth/password",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({currentPassword,newPassword})});const body=await response.json();if(!response.ok){setError(body.error??"변경하지 못했습니다.");return;}setCurrentPassword("");setNewPassword("");setMessage("비밀번호가 변경되었습니다.");}
  if(user===undefined)return <main className="page-container"><div className="empty-state"><p>계정을 확인하고 있습니다.</p></div></main>;
  if(!user)return <main className="page-container"><header className="page-header editorial"><div><p>ACCOUNT</p><h1>로그인이<br/>필요합니다.</h1><span>계정별로 학습 기록과 복습 상태를 관리합니다.</span></div></header><div className="account-actions"><Link className="primary-button" href="/login">로그인</Link><Link className="secondary-button" href="/signup">회원가입</Link></div></main>;
  return <main className="page-container"><header className="page-header editorial"><div><p>ACCOUNT</p><h1>{user.name}님</h1><span>{user.email}</span></div></header><section className="account-card"><div><ShieldCheck/><span>계정 권한</span><strong>{user.role==="admin"?"관리자":"일반 회원"}</strong></div>{user.role==="admin"&&<Link className="secondary-button" href="/admin">관리자 문제은행</Link>}<button className="text-button" onClick={logout}><LogOut size={16}/> 로그아웃</button></section>{records&&<section className="account-history"><div className="stats-grid"><div><span>응시</span><strong>{records.stats.sessions}<small>회</small></strong></div><div><span>누적 문제</span><strong>{records.stats.solved}<small>문제</small></strong></div><div><span>정답률</span><strong>{records.stats.accuracy}<small>%</small></strong></div></div><div className="section-title"><div><span>HISTORY</span><h2>최근 학습 기록</h2></div><Link href="/review">복습 {records.stats.pending}문제</Link></div>{records.history.length===0?<div className="empty-state compact"><p>아직 제출한 시험이 없습니다.</p></div>:<div className="history-list">{records.history.map((item)=><Link href={`/exam/${item.id}`} key={item.id}><div><b>{item.subjectName}</b><span>{new Date(item.submittedAt).toLocaleDateString("ko-KR")} · {item.totalQuestions}문제</span></div><strong>{item.score}점</strong></Link>)}</div>}</section>}<form className="list-card form-grid password-form" onSubmit={changePassword}><div><p className="overline">SECURITY</p><h2>비밀번호 변경</h2></div><div className="field"><label htmlFor="current-password">현재 비밀번호</label><input id="current-password" type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} autoComplete="current-password" required/></div><div className="field"><label htmlFor="new-password">새 비밀번호</label><input id="new-password" type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} autoComplete="new-password" required minLength={10}/><span className="field-help">영문과 숫자를 포함해 10자 이상</span></div>{error&&<p className="form-error">{error}</p>}{message&&<p className="form-success">{message}</p>}<button className="primary-button">비밀번호 변경</button></form></main>;
}
