import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analyze Contract",
  description: "Upload and analyze a contract with AI.",
};

export default function AnalyzeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
