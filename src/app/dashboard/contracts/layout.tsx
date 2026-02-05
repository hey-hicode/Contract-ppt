import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contracts",
  description: "Browse and manage your analyzed contracts.",
};

export default function ContractsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
