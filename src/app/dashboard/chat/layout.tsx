import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contract Chat",
  description: "Chat with AI about your contracts.",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
