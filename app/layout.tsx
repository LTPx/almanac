import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner";
import ClientWrapper from "@/components/client-wrapper";
import AdSense from "@/components/adSense";

const notoSansKR = Noto_Sans_KR({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Almanac",
  description: "Learning App + NFTs blockchain",
  icons: {
    icon: "/almanac.svg"
  },
  other: {
    "google-adsense-account": "ca-pub-1890321786950620"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={notoSansKR.variable} suppressHydrationWarning>
      <head>
        <AdSense pId="1890321786950620" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <NextTopLoader showSpinner={false} height={6} color="#000000" />
        <Toaster richColors position="top-right" />
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
