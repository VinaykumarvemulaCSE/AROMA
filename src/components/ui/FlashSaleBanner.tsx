"use client";

import { useEffect, useState } from "react";
import { Flame, Clock, Copy, Check, X } from "lucide-react";
import { useSettings } from "@/lib/store/settings";
import { haptic } from "@/lib/haptics";
import { toast } from "sonner";

export function FlashSaleBanner() {
  const settings = useSettings((s) => s.settings);
  const fetchSettings = useSettings((s) => s.fetchSettings);

  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 2,
    minutes: 45,
    seconds: 10,
  });

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    const isDismissedSession = sessionStorage.getItem("aroma_flash_deal_dismissed");
    if (isDismissedSession === "true") {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endHour = settings?.flashSaleEndHour ?? 23;
      const target = new Date();
      target.setHours(endHour, 59, 59, 999);

      let diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        // Roll to next 4 hours cycle
        diff = 4 * 3600 * 1000 - (now.getTime() % (4 * 3600 * 1000));
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [settings]);

  if (dismissed || settings?.flashSaleEnabled === false) {
    return null;
  }

  const badge = settings?.flashSaleBadge || "FLASH DEAL";
  const text = settings?.flashSaleText || "Flat 20% OFF on all Starters & Shakes";
  const code = settings?.flashSaleCode || "AROMA20";

  const handleCopy = () => {
    haptic("light");
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Coupon code ${code} copied to clipboard!`, {
      description: "Apply it in your cart for instant discount.",
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDismiss = () => {
    haptic("light");
    setDismissed(true);
    sessionStorage.setItem("aroma_flash_deal_dismissed", "true");
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="relative z-40 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 text-white text-xs py-2 px-3 sm:px-6 shadow-md transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Badge + Text */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-full font-extrabold tracking-wider text-[10px] uppercase shrink-0 border border-white/20">
            <Flame className="size-3 text-amber-300 animate-pulse" />
            {badge}
          </span>
          <p className="font-medium truncate text-white/95 text-xs sm:text-sm">
            {text}
          </p>
        </div>

        {/* Right: Code Pill + Countdown Timer + Close */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto sm:ml-0">
          {/* Coupon Code Pill */}
          {code && (
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 bg-white text-stone-900 font-mono font-bold px-2.5 py-1 rounded-lg text-xs hover:bg-white/90 active:scale-95 transition-all shadow-xs"
              title="Click to copy coupon code"
            >
              <span>{code}</span>
              {copied ? (
                <Check className="size-3 text-emerald-600" />
              ) : (
                <Copy className="size-3 text-stone-500" />
              )}
            </button>
          )}

          {/* Countdown Clock */}
          <div className="inline-flex items-center gap-1 font-mono font-bold bg-black/25 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs text-amber-200 border border-white/15 shrink-0">
            <Clock className="size-3 text-amber-300 shrink-0" />
            <span>
              {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
            </span>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Dismiss banner"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
