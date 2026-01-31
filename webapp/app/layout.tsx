import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CookieConsentProvider } from "@/components/providers/CookieConsentProvider";
import { CookieConsentBanner } from "@/components/cookies/CookieConsentBanner";
import { Toaster } from "sonner";

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <CookieConsentProvider>
            {children}
            <CookieConsentBanner />
            <Toaster position="top-right" richColors />
          </CookieConsentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
