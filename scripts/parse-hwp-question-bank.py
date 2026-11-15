from __future__ import annotations
import argparse,json,re
from pathlib import Path
from lxml import etree

MARKERS=["①","②","③","④","⑤"]
def paragraphs(cell):
    values=[]
    for paragraph in cell.xpath(".//Paragraph"):
        text="".join(paragraph.itertext()).replace("\r","").strip()
        if text: values.append(text)
    return values
def value_after(lines,label):
    for index,line in enumerate(lines[:-1]):
        if label in line:return lines[index+1]
    return ""
def parse_question(table):
    cells=table.xpath("./TableBody/TableRow/TableCell") or table.xpath(".//TableCell")
    if len(cells)!=2:return None
    left=paragraphs(cells[0])
    if not left or not re.fullmatch(r"\d+\.",left[0]):return None
    number=int(left[0][:-1])
    if number==0:return None
    try:divider=left.index("| 문제해설 |")
    except ValueError as error:raise ValueError(f"{number}번: 문제해설 구분선을 찾지 못했습니다.") from error
    before=[]
    for line in left[1:divider]:
        if line[:1] in MARKERS and sum(line.count(marker) for marker in MARKERS)>1:
            before.extend(part.strip() for part in re.split(r"(?=[①②③④])",line) if part.strip())
        else:before.append(line)
    candidates=[]
    for choice_count in (4,5):
        expected=MARKERS[:choice_count]
        for index in range(len(before)-choice_count+1):
            if [line[:1] for line in before[index:index+choice_count]]==expected:candidates.append((choice_count,index))
    if not candidates:raise ValueError(f"{number}번: 선택지 묶음을 찾지 못했습니다.")
    choice_count,choice_start=max(candidates,key=lambda value:(value[0],value[1]));expected=MARKERS[:choice_count]
    choices=[re.sub(rf"^{marker}\s*","",before[choice_start+index]).strip() for index,marker in enumerate(expected)]
    prompt="\n".join(before[:choice_start]).strip();answer_text=left[-1].strip()
    if answer_text not in MARKERS:raise ValueError(f"{number}번: 정답 표기가 올바르지 않습니다: {answer_text!r}")
    right=paragraphs(cells[1]);exam=value_after(right,"출제연원");unit=value_after(right,"출제영역") or "기타 기출";trailing=before[choice_start+choice_count:]
    if re.match(r"^[①-⑤ㄱ-ㅎ]",unit):unit="기타 기출"
    return {"externalId":f"criminal-procedure-5y-{number:04d}","sourceNumber":number,"subjectId":"criminal-procedure","unit":unit,"prompt":prompt,"choices":choices,"correctIndex":MARKERS.index(answer_text),"explanation":"\n".join(trailing+left[divider+1:-1]).strip(),"source":f"형사소송법 5개년 기출 · {exam} · 원문 {number}번","difficulty":"보통","published":True}
def main():
    parser=argparse.ArgumentParser();parser.add_argument("xml",type=Path);parser.add_argument("output",type=Path);args=parser.parse_args();root=etree.parse(str(args.xml));questions=[question for table in root.xpath("//TableControl") if (question:=parse_question(table))];numbers=[question["sourceNumber"] for question in questions]
    if len(questions)!=630 or len(numbers)!=len(set(numbers)):raise ValueError(f"Expected 630 unique questions, found {len(questions)}")
    if [number for number in range(1,632) if number not in numbers]!=[582]:raise ValueError("Source-number audit no longer matches missing number 582")
    invalid=[question["sourceNumber"] for question in questions if len(question["choices"]) not in (4,5) or not question["prompt"] or not question["explanation"]]
    if invalid:raise ValueError(f"Invalid question records: {invalid}")
    args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps({"title":"이윤탁 형사소송법 기출 5개년 2027년판","sourceMissingNumbers":[582],"questions":questions},ensure_ascii=False,indent=2),encoding="utf-8");print(json.dumps({"questions":len(questions),"first":numbers[0],"last":numbers[-1],"missing":[582],"units":len({question['unit'] for question in questions})},ensure_ascii=False))
if __name__=="__main__":main()
