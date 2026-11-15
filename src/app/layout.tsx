import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

export const metadata: Metadata = { title: { default: "합격메이트", template: "%s | 합격메이트" }, description: "매일의 공부를 합격으로 연결하는 시험문제 풀이 서비스", manifest: "/manifest.webmanifest", appleWebApp: { capable: true, statusBarStyle: "default", title: "합격메이트" }, icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" } };
export const viewport: Viewport = { themeColor: "#6d4aff", width: "device-width", initialScale: 1, viewportFit: "cover" };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="ko"><body><ServiceWorkerRegister /><div className="app-shell">{children}<Suspense fallback={<div className="bottom-nav" aria-hidden="true" />}><BottomNav /></Suspense></div></body></html>; }
