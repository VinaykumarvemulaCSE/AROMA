"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import dynamic from "next/dynamic";
import { useState } from "react";

const AuthProvider = dynamic(
  () => import("@/lib/auth/AuthProvider").then((m) => m.AuthProvider),
  { ssr: false },
);

const FirestoreSync = dynamic(
  () => import("@/lib/auth/AuthProvider").then((m) => m.FirestoreSync),
  { ssr: false },
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <FirestoreSync />
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
