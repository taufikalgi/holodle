import type { Metadata } from "next";
import VisitorsPageContent from "@/components/visitors/VisitorsPageContent";

export const metadata: Metadata = {
  title: "Visitors — Holodle Admin",
  description: "Admin-only aggregate Holodle gameplay activity.",
  robots: { index: false, follow: false },
};

export default function VisitorsPage() {
  return <VisitorsPageContent />;
}
