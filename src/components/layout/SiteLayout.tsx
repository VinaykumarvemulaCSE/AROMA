import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";
import { PageTransition } from "./PageTransition";
import { FlashSaleBanner } from "@/components/ui/FlashSaleBanner";

const FloatingCart = dynamic(
  () => import("./FloatingCart").then((mod) => mod.FloatingCart),
  { ssr: false },
);

const PwaInstallPrompt = dynamic(
  () => import("@/components/pwa/PwaInstallPrompt").then((mod) => mod.PwaInstallPrompt),
  { ssr: false },
);

const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((mod) => mod.Toaster),
  { ssr: false },
);

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <FlashSaleBanner />
      <Header />
      <main className="flex-1 flex flex-col">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <BottomNav />
      <FloatingCart />
      <PwaInstallPrompt />
      <Toaster position="top-center" />
    </div>
  );
}
