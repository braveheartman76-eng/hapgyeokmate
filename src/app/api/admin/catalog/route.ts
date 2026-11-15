import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { subjectsTable, units } from "@/db/schema";
import { getSession } from "@/lib/auth";

const subjectInput=z.object({kind:z.literal("subject"),id:z.string().regex(/^[a-z0-9-]+$/).min(2).max(60),name:z.string().min(1).max(40),description:z.string().max(160).default(""),color:z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6d4aff"),published:z.boolean().default(false)});
const unitInput=z.object({kind:z.literal("unit"),subjectId:z.string().min(1),name:z.string().min(1).max(60),published:z.boolean().default(false)});
const createInput=z.discriminatedUnion("kind",[subjectInput,unitInput]);
const visibilityInput=z.discriminatedUnion("kind",[z.object({kind:z.literal("subject"),id:z.string().min(1),published:z.boolean()}),z.object({kind:z.literal("unit"),id:z.string().uuid(),published:z.boolean()})]);
async function isAdmin(){return(await getSession())?.role==="admin";}

export async function GET(){
  if(!await isAdmin())return NextResponse.json({error:"관리자 권한이 필요합니다."},{status:403});
  const db=getDb();
  const [subjectRows,unitRows]=await Promise.all([db.select().from(subjectsTable).orderBy(asc(subjectsTable.displayOrder)),db.select().from(units).orderBy(asc(units.displayOrder))]);
  return NextResponse.json({subjects:subjectRows.map((subject)=>({...subject,units:unitRows.filter((unit)=>unit.subjectId===subject.id)}))});
}

export async function POST(request:Request){
  if(!await isAdmin())return NextResponse.json({error:"관리자 권한이 필요합니다."},{status:403});
  const parsed=createInput.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"입력값을 확인해 주세요."},{status:400});
  const db=getDb();
  try{
    if(parsed.data.kind==="subject"){
      const [subject]=await db.insert(subjectsTable).values({id:parsed.data.id,name:parsed.data.name,description:parsed.data.description,color:parsed.data.color,published:parsed.data.published}).returning();
      return NextResponse.json({subject},{status:201});
    }
    const [unit]=await db.insert(units).values({subjectId:parsed.data.subjectId,name:parsed.data.name,published:parsed.data.published}).returning();
    return NextResponse.json({unit},{status:201});
  }catch{return NextResponse.json({error:"같은 ID나 이름이 이미 있거나 과목을 찾을 수 없습니다."},{status:409});}
}

export async function PATCH(request:Request){
  if(!await isAdmin())return NextResponse.json({error:"관리자 권한이 필요합니다."},{status:403});
  const parsed=visibilityInput.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"입력값을 확인해 주세요."},{status:400});
  if(parsed.data.kind==="subject")await getDb().update(subjectsTable).set({published:parsed.data.published}).where(eq(subjectsTable.id,parsed.data.id));
  else await getDb().update(units).set({published:parsed.data.published}).where(eq(units.id,parsed.data.id));
  return NextResponse.json({ok:true});
}
