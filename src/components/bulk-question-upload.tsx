"use client";
import { ChangeEvent, useState } from "react";
import { FileUp } from "lucide-react";

export function BulkQuestionUpload() {
  const [fileName,setFileName] = useState("");
  const [questions,setQuestions] = useState<unknown[]>([]);
  const [message,setMessage] = useState("");
  const [error,setError] = useState("");
  const [saving,setSaving] = useState(false);
  async function selectFile(event:ChangeEvent<HTMLInputElement>) {
    setError(""); setMessage(""); setQuestions([]);
    const file=event.target.files?.[0]; if(!file)return;
    setFileName(file.name);
    try { const parsed=JSON.parse(await file.text()); const items=Array.isArray(parsed)?parsed:parsed.questions; if(!Array.isArray(items)||items.length===0)throw new Error(); setQuestions(items); }
    catch { setError("JSON 파일 형식을 확인해 주세요."); }
  }
  async function upload() {
    setSaving(true); setError(""); setMessage("");
    const response=await fetch("/api/admin/questions/bulk",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({questions})});
    const body=await response.json(); setSaving(false);
    if(!response.ok){setError(body.error??"대량 등록에 실패했습니다.");return;}
    setMessage(`${body.count}문제를 등록했습니다.`); setQuestions([]); setFileName("");
  }
  return <section className="list-card bulk-upload"><div><p className="overline">BULK UPLOAD</p><h2>문제 JSON 대량 등록</h2><p className="muted">과목 ID, 단원명, 문제, 4~5개 선택지, 정답 번호(1~5), 해설을 배열로 작성합니다. 전체 파일은 오류가 없을 때만 한 번에 저장됩니다.</p></div><label className="secondary-button file-button"><FileUp size={16}/> 파일 선택<input type="file" accept="application/json,.json" onChange={selectFile}/></label>{fileName&&<p className="muted">{fileName} · {questions.length}문제 확인</p>}{error&&<p className="form-error">{error}</p>}{message&&<p className="form-success">{message}</p>}<button className="primary-button compact" type="button" disabled={!questions.length||saving} onClick={upload}>{saving?"등록 중...":`${questions.length}문제 등록`}</button></section>;
}
