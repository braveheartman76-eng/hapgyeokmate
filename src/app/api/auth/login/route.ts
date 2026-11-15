import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { setSession } from "@/lib/auth";
const input = z.object({ email:z.string().email(), password:z.string().min(6) });
export async function POST(request:Request) { const parsed = input.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error:"이메일과 비밀번호를 확인해 주세요." }, { status:400 }); const email = parsed.data.email.toLowerCase(); let user:{id:string;email:string;name:string;role:"student"|"admin"}|undefined;
  if (!process.env.DATABASE_URL && process.env.NODE_ENV !== "production") { if ((email === "student@hapgyeokmate.com" || email === "admin@hapgyeokmate.com") && parsed.data.password === "demo1234") user = { id:email.startsWith("admin") ? "00000000-0000-0000-0000-000000000001" : "00000000-0000-0000-0000-000000000002", email, name:email.startsWith("admin") ? "관리자" : "합격메이트", role:email.startsWith("admin") ? "admin" : "student" }; }
  else { const rows = await getDb().select().from(users).where(eq(users.email,email)).limit(1); const found = rows[0]; if (found && await compare(parsed.data.password, found.passwordHash)) user = { id:found.id,email:found.email,name:found.name,role:found.role }; }
  if (!user) return NextResponse.json({ error:"로그인 정보가 올바르지 않습니다." }, { status:401 }); await setSession({ userId:user.id, email:user.email, name:user.name, role:user.role, expiresAt:Date.now()+1000*60*60*24*14 }); return NextResponse.json({ user }); }
