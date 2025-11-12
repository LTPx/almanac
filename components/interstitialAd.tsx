"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function InterstitialAd({ onClose }: { onClose: () => void }) {
  const [isAdBlocked, setIsAdBlocked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Pequeña prueba: intenta cargar el script manualmente
    const test = document.createElement("script");
    test.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    test.async = true;
    test.onerror = () => setIsAdBlocked(true);
    document.body.appendChild(test);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white text-black rounded-2xl shadow-xl p-6 max-w-md w-full text-center">
        {!isAdBlocked ? (
          <>
            {/* Carga del script principal */}
            <Script
              id="adsense-loader"
              async
              strategy="afterInteractive"
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1890321786950620"
              crossOrigin="anonymous"
              onError={() => setIsAdBlocked(true)}
            />
            {/* Bloque del anuncio */}
            <ins
              className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client="ca-pub-1890321786950620"
              data-ad-slot="3213001635"
              data-ad-format="auto"
              data-full-width-responsive="true"
              data-adtest={
                process.env.NODE_ENV === "development" ? "on" : undefined
              }
            />
            <Script id="adsbygoogle-init" strategy="afterInteractive">
              {`(adsbygoogle = window.adsbygoogle || []).push({});`}
            </Script>
          </>
        ) : (
          <div className="p-4">
            <p className="text-gray-700 font-semibold">
              🔒 Parece que tienes un bloqueador de anuncios activado.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              No pasa nada — puedes continuar el test normalmente.
            </p>
          </div>
        )}

        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Comenzar test
        </button>
      </div>
    </div>
  );
}
