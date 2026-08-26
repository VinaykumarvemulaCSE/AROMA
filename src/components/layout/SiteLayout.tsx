import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";
import { FloatingCart } from "./FloatingCart";
import { PageTransition } from "./PageTransition";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import { FlashSaleBanner } from "@/components/ui/FlashSaleBanner";
import { Toaster } from "@/components/ui/sonner";

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
