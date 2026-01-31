import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "$ISNAD — The Trust Layer for AI Agents",
  description: "A Proof-of-Stake Audit Protocol for the Agent Internet. Auditors stake tokens to vouch for code safety. Malicious code burns stakes; clean code earns yield.",
  keywords: ["AI agents", "trust", "security", "audit", "blockchain", "crypto"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
