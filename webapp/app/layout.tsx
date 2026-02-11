import type { Metadata } from "next";
import { Overpass, Overpass_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const overpass = Overpass({
  subsets: ["latin"],
  variable: "--font-overpass",
  display: "swap",
});

const overpassMono = Overpass_Mono({
  subsets: ["latin"],
  variable: "--font-overpass-mono",
  display: "swap",
});
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
    <html lang="en-GB" className={`${overpass.variable} ${overpassMono.variable}`} suppressHydrationWarning>
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
