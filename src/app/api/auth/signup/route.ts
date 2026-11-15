import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { signupInput } from "@/lib/account-input";
import { setSession } from "@/lib/auth";

export async function POST(request:Request) {
  const parsed=signupInput.safeParse(await request.json());
  if(!parsed.success) return NextResponse.json({error:parsed.error.issues[0]?.message??"입력값을 확인해 주세요."},{status:400});
  const email=parsed.data.email.toLowerCase(); const db=getDb();
  if((await db.select({id:users.id}).from(users).where(eq(users.email,email)).limit(1))[0]) return NextResponse.json({error:"이미 가입된 이메일입니다."},{status:409});
  const [user]=await db.insert(users).values({email,name:parsed.data.name,passwordHash:await hash(parsed.data.password,12),role:"student"}).returning({id:users.id,email:users.email,name:users.name,role:users.role});
  await setSession({userId:user.id,email:user.email,name:user.name,role:user.role,expiresAt:Date.now()+1000*60*60*24*14});
  return NextResponse.json({user},{status:201});
}
