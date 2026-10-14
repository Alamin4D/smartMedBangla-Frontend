import type { Metadata } from "next";
import { PricingView } from "@/features/marketing/pricing-view";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return <PricingView />;
}
