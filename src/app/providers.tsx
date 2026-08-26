"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, FirestoreSync } from "@/lib/auth/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // Use useState to ensure the QueryClient is only created once per component instance
  // when using Server Components, preventing cache from being shared across requests
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
