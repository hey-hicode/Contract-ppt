import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contract Detail",
  description: "Detailed view of a contract analysis.",
};

export default function ContractDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
