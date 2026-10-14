import type { Metadata } from "next";
import { FeaturesView } from "@/features/marketing/features-view";

export const metadata: Metadata = { title: "Features" };

export default function FeaturesPage() {
  return <FeaturesView />;
}
