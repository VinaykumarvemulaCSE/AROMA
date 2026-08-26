"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { haptic } from "@/lib/haptics";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone PWA mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem("aroma-pwa-dismissed");
    if (dismissed) return;

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIos(isIosDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // If on iOS and not dismissed, show prompt after a short delay
    if (isIosDevice && !dismissed) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    haptic("medium");
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    haptic("light");
    setShowPrompt(false);
    sessionStorage.setItem("aroma-pwa-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-card/95 backdrop-blur-md border border-primary/20 shadow-xl rounded-2xl p-4 text-card-foreground">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Smartphone className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Install Aroma Cafe App</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isIos
                  ? "Tap Share (⎙) and 'Add to Home Screen' for instant 1-tap access."
                  : "Install on your home screen for quick ordering."}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground p-1"
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>

        {!isIos && deferredPrompt && (
          <div className="mt-3 flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-xs h-8">
              Later
            </Button>
            <Button size="sm" onClick={handleInstall} className="text-xs h-8">
              <Download className="size-3.5 mr-1" /> Install Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
