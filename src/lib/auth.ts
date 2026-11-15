import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
export type Session = { userId:string; email:string; name:string; role:"student"|"admin"; expiresAt:number };
const COOKIE = "hapgyeokmate_session";
function secret() { if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET; if (process.env.NODE_ENV !== "production") return "development-only-secret-change-me"; throw new Error("AUTH_SECRET is not configured"); }
function sign(value:string) { return createHmac("sha256", secret()).update(value).digest("base64url"); }
export function encodeSession(session:Session) { const payload = Buffer.from(JSON.stringify(session)).toString("base64url"); return `${payload}.${sign(payload)}`; }
export function decodeSession(token?:string): Session | null { if (!token) return null; const [payload, signature] = token.split("."); if (!payload || !signature) return null; const expected = sign(payload); const a = Buffer.from(signature); const b = Buffer.from(expected); if (a.length !== b.length || !timingSafeEqual(a,b)) return null; const session = JSON.parse(Buffer.from(payload,"base64url").toString()) as Session; return session.expiresAt > Date.now() ? session : null; }
export async function getSession() { return decodeSession((await cookies()).get(COOKIE)?.value); }
export async function setSession(session:Session) { (await cookies()).set(COOKIE, encodeSession(session), { httpOnly:true, secure:process.env.NODE_ENV === "production", sameSite:"lax", path:"/", maxAge:60*60*24*14 }); }
export async function clearSession() { (await cookies()).delete(COOKIE); }
