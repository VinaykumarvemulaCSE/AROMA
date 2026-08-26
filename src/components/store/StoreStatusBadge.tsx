"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/lib/store/settings";

type StoreStatus = {
  isOpen: boolean;
  statusText: string;
  subText: string;
  dotColor: string;
  badgeBg: string;
  badgeBorder: string;
};

export function StoreStatusBadge({ className = "" }: { className?: string }) {
  const settings = useSettings((s) => s.settings);
  const fetchSettings = useSettings((s) => s.fetchSettings);

  const [status, setStatus] = useState<StoreStatus>({
    isOpen: true,
    statusText: "Accepting Orders",
    subText: "Avg prep: 20-25 min",
    dotColor: "bg-emerald-500",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
  });

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    const evaluateStatus = () => {
      // Manual Admin Override
      const override = settings?.storeStatusOverride;
      const customNotice = settings?.storeNotice?.trim();

      if (override === "closed") {
        setStatus({
          isOpen: false,
          statusText: "Kitchen Closed",
          subText: customNotice || "Closed for Maintenance / Holiday",
          dotColor: "bg-rose-500",
          badgeBg: "bg-rose-500/10",
          badgeBorder: "border-rose-500/30 text-rose-700 dark:text-rose-400",
        });
        return;
      }

      if (override === "busy") {
        setStatus({
          isOpen: true,
          statusText: "Peak Rush Hour",
          subText: customNotice || "High demand · Avg prep: 40-50 min",
          dotColor: "bg-amber-500",
          badgeBg: "bg-amber-500/10",
          badgeBorder: "border-amber-500/30 text-amber-700 dark:text-amber-400",
        });
        return;
      }

      if (override === "open") {
        setStatus({
          isOpen: true,
          statusText: "Accepting Orders",
          subText: customNotice || "Avg prep: 20-25 min",
          dotColor: "bg-emerald-500",
          badgeBg: "bg-emerald-500/10",
          badgeBorder: "border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
        });
        return;
      }

      // Automatic Time-based evaluation (default: 8am - 11pm)
      const now = new Date();
      const hour = now.getHours();
      const minutes = now.getMinutes();
      const currentDec = hour + minutes / 60;

      if (currentDec < 8.0 || currentDec >= 23.0) {
        setStatus({
          isOpen: false,
          statusText: "Kitchen Closed",
          subText: customNotice || "Opens at 8:00 AM",
          dotColor: "bg-rose-500",
          badgeBg: "bg-rose-500/10",
          badgeBorder: "border-rose-500/30 text-rose-700 dark:text-rose-400",
        });
        return;
      }

      // Peak lunch: 12:30 - 14:30 | Peak dinner: 19:30 - 21:30
      const isPeakLunch = currentDec >= 12.5 && currentDec <= 14.5;
      const isPeakDinner = currentDec >= 19.5 && currentDec <= 21.5;

      if (isPeakLunch || isPeakDinner) {
        setStatus({
          isOpen: true,
          statusText: "Peak Rush Hour",
          subText: customNotice || "Avg prep: 35-45 min",
          dotColor: "bg-amber-500",
          badgeBg: "bg-amber-500/10",
          badgeBorder: "border-amber-500/30 text-amber-700 dark:text-amber-400",
        });
      } else {
        setStatus({
          isOpen: true,
          statusText: "Accepting Orders",
          subText: customNotice || "Avg prep: 20-25 min",
          dotColor: "bg-emerald-500",
          badgeBg: "bg-emerald-500/10",
          badgeBorder: "border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
        });
      }
    };

    evaluateStatus();
    const interval = setInterval(evaluateStatus, 60000);
    return () => clearInterval(interval);
  }, [settings]);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium backdrop-blur-sm shadow-xs ${status.badgeBg} ${status.badgeBorder} ${className}`}
    >
      <span className="relative flex size-2">
        {status.isOpen && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.dotColor}`}
          />
        )}
        <span className={`relative inline-flex rounded-full size-2 ${status.dotColor}`} />
      </span>
      <span className="font-semibold">{status.statusText}</span>
      <span className="opacity-50">·</span>
      <span className="opacity-90">{status.subText}</span>
    </div>
  );
}
