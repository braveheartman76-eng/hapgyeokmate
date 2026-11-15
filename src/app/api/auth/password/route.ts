import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { passwordChangeInput } from "@/lib/account-input";
import { getSession } from "@/lib/auth";

export async function PUT(request:Request) {
  const session=await getSession(); if(!session) return NextResponse.json({error:"로그인이 필요합니다."},{status:401});
  const parsed=passwordChangeInput.safeParse(await request.json()); if(!parsed.success) return NextResponse.json({error:parsed.error.issues[0]?.message??"입력값을 확인해 주세요."},{status:400});
  const [user]=await getDb().select({passwordHash:users.passwordHash}).from(users).where(eq(users.id,session.userId)).limit(1);
  if(!user||!await compare(parsed.data.currentPassword,user.passwordHash)) return NextResponse.json({error:"현재 비밀번호가 올바르지 않습니다."},{status:400});
  if(await compare(parsed.data.newPassword,user.passwordHash)) return NextResponse.json({error:"새 비밀번호는 현재 비밀번호와 달라야 합니다."},{status:400});
  await getDb().update(users).set({passwordHash:await hash(parsed.data.newPassword,12)}).where(eq(users.id,session.userId));
  return NextResponse.json({ok:true});
}
