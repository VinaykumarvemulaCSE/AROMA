"use client";

import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  return <div className="animate-page-enter w-full flex-1 flex flex-col">{children}</div>;
}
