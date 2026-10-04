"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function OrderTrackRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      router.replace(`/track/${id}`);
    }
  }, [id, router]);

  return (
    <div className="min-h-screen grid place-items-center bg-background text-muted-foreground text-sm">
      Loading Aroma order tracking...
    </div>
  );
}
