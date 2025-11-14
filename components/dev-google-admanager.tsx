// components/dev-google-admanager.tsx
"use client";

import Script from "next/script";

export default function DevGoogleAdManager() {
  // const isDev = process.env.NODE_ENV === "development";

  // if (!isDev) return null;

  return (
    <>
      {/* Meta tag solo en dev */}
      <meta name="google-adsense-account" content="ca-pub-1890321786950620" />

      {/* Script principal */}
      <Script
        id="google-ad-manager-script"
        strategy="afterInteractive"
        src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
      />

      {/* Inicialización del banner */}
      <Script id="google-ad-manager-init" strategy="afterInteractive">
        {`
          window.googletag = window.googletag || { cmd: [] };
          googletag.cmd.push(function() {
            googletag.defineSlot('/1234567/example', [728, 90], 'div-gpt-ad-12345-0')
              .addService(googletag.pubads());
            googletag.enableServices();
          });
        `}
      </Script>

      {/* Banner visible solo en modo dev */}
      {/* 
      {isDev && (
        <div
          id="div-gpt-ad-12345-0"
          style={{
            width: "728px",
            height: "90px",
            margin: "20px auto",
            border: "1px dashed #aaa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <span>🧱 Anuncio de prueba (solo modo dev)</span>
        </div>
      )} */}
    </>
  );
}
