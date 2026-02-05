import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contract Glossary",
  description: "Definitions for common contract terms.",
};

export default function GlossaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
