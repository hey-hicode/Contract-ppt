import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analysis Result",
  description: "Review your AI contract analysis.",
};

export default function AnalyzeResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
