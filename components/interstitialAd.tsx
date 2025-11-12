// components/ads/InterstitialAd.tsx
"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function InterstitialAd({ onClose }: { onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  // const isDev = process.env.NODE_ENV === "development";
  const isDev = false;

  // Cierra automáticamente después de unos segundos (opcional)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white text-black rounded-2xl shadow-xl p-6 max-w-md w-full text-center">
        {isDev && (
          <>
            <Script
              id="google-ad-manager-script"
              strategy="afterInteractive"
              src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
            />
            <Script id="google-ad-manager-init" strategy="afterInteractive">
              {`
                window.googletag = window.googletag || { cmd: [] };
                googletag.cmd.push(function() {
                  googletag.defineSlot('/1234567/interstitial', [300, 250], 'div-gpt-ad-12345-interstitial')
                    .addService(googletag.pubads());
                  googletag.enableServices();
                });
              `}
            </Script>
          </>
        )}

        <div
          id="div-gpt-ad-12345-interstitial"
          style={{
            width: 300,
            height: 250,
            margin: "0 auto",
            border: "1px dashed #aaa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {isDev ? (
            <span>🧱 Anuncio de prueba (modo dev)</span>
          ) : (
            <span>Cargando anuncio...</span>
          )}
        </div>

        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Comenzar test
        </button>
      </div>
    </div>
  );
}
