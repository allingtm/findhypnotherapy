import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Find Hypnotherapy",
  description: "Find qualified hypnotherapists in the UK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
