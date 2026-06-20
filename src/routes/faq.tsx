import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [
    { title: "FAQ — Aroma Cafe" },
    { name: "description", content: "Answers to common questions about ordering, reservations, delivery and more." },
  ] }),
  component: FAQ,
});

const faqs = [
  { q: "How do I place an order?", a: "Browse our menu, add items to cart, and check out. We'll redirect you to WhatsApp to confirm and arrange payment." },
  { q: "How do I make a reservation?", a: "Use the Reserve a Table page — pick a date, time and party size. You'll get an instant confirmation." },
  { q: "Do you deliver across Nalgonda?", a: "Yes, we deliver within a 5 km radius. Delivery fee is ₹40, free above ₹499. Typical time 30–40 mins." },
  { q: "What payment methods do you accept?", a: "UPI, cards and cash. For online orders, we currently confirm and accept payment via WhatsApp QR." },
  { q: "Can you cater for events?", a: "Absolutely. WhatsApp or call us with your date, headcount and preferences." },
  { q: "What's your cancellation policy?", a: "Reservations: free up to 24 hours before. Orders: free until the kitchen starts preparing." },
  { q: "Do you have vegan options?", a: "Yes — look for the Vegan badge on the menu, or filter by dietary preference." },
];

function FAQ() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
        <h1 className="text-4xl font-display font-bold">Frequently asked questions</h1>
        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`q${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </SiteLayout>
  );
}
