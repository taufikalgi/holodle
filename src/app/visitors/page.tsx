import type { Metadata } from "next";
import VisitorsPageContent from "@/components/visitors/VisitorsPageContent";

export const metadata: Metadata = {
  title: "Visitors — Holodle",
  description:
    "Aggregate Holodle gameplay activity for the last 7 or 30 days. No analytics cookies or third-party scripts.",
};

export default function VisitorsPage() {
  return <VisitorsPageContent />;
}
