"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenCheck, House, NotebookTabs, Settings } from "lucide-react";
const items = [{ href: "/", label: "홈", icon: House }, { href: "/subjects", label: "과목", icon: BookOpenCheck }, { href: "/review", label: "오답노트", icon: NotebookTabs }, { href: "/admin", label: "관리", icon: Settings }];
export function BottomNav() { const path = usePathname(); return <nav className="bottom-nav" aria-label="주요 메뉴">{items.map(({ href, label, icon: Icon }) => { const active = href === "/" ? path === "/" : path.startsWith(href); return <Link key={href} href={href} className={active ? "active" : ""}><Icon size={21} strokeWidth={active ? 2.5 : 2} /><span>{label}</span></Link>; })}</nav>; }
