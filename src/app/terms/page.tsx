"use client";

import React from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Clock, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/checkout">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="size-4 mr-2" /> Back to Checkout
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Terms & Conditions</h1>
            <p className="text-sm text-muted-foreground">Aroma Cafe & Restaurant Terms of Service & Cancellation Policy</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-foreground/90 leading-relaxed mt-6">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="size-4 text-primary" /> 1. Order Confirmation & Dispatch
            </h2>
            <p>
              By placing an order on Aroma Cafe & Restaurant, you confirm that your contact number and delivery address provided are accurate. Orders are verified and dispatched immediately upon restaurant confirmation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Clock className="size-4 text-primary" /> 2. Cancellation & Refund Policy
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li>
                <strong className="text-foreground">Before Food Preparation:</strong> You may cancel your order free of charge within 2 minutes of placing it or before the kitchen begins preparation.
              </li>
              <li>
                <strong className="text-foreground">After Kitchen Preparation:</strong> Once kitchen preparation has commenced or a delivery rider has been assigned, cancellation will incur a 100% cancellation fee to cover food waste and rider dispatch costs.
              </li>
              <li>
                <strong className="text-foreground">Damaged or Incorrect Items:</strong> If items received are damaged or incorrect, contact us immediately via WhatsApp or phone with order details for instant resolution or replacement.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground">3. Delivery SLA & Tracking</h2>
            <p>
              Estimated delivery times are calculated based on traffic conditions and distance from Aroma HQ. Riders will attempt contact via phone upon arrival at your drop location. Please ensure availability to receive your order promptly.
            </p>
          </section>

          <section className="space-y-2 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              For further queries or support regarding your orders, reach out to us at <strong>hello@aromacafe.in</strong> or phone <strong>+91 80195 51015</strong>.
            </p>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
