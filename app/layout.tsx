import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner";
import ClientWrapper from "@/components/client-wrapper";
// import CookieSettingsButton from "@/components/cookie-settings-button";
import GDPRBanner from "@/components/gdpr-banner";
import Script from "next/script";

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
        <Script id="google-consent-mode" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            // Por defecto: DENEGAR todo hasta que el usuario acepte
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied',
              'wait_for_update': 500
            });
            
            gtag('js', new Date());
          `}
        </Script>

        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1890321786950620"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <Script id="google-ads-config" strategy="afterInteractive">
          {`
            gtag('config', 'ca-pub-1890321786950620');
          `}
        </Script>
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <NextTopLoader showSpinner={false} height={6} color="#000000" />
        <Toaster richColors position="top-right" />
        <GDPRBanner />
        {/* <CookieSettingsButton /> */}
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
