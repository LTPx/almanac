"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function InterstitialAd({
  onClose,
  time
}: {
  onClose: () => void;
  time: number;
}) {
  const [isAdBlocked, setIsAdBlocked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [countdown, setCountdown] = useState(time);

  useEffect(() => {
    // Pequeña prueba: intenta cargar el script manualmente
    const test = document.createElement("script");
    test.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    test.async = true;
    test.onerror = () => setIsAdBlocked(true);
    document.body.appendChild(test);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsButtonEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
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
          disabled={!isButtonEnabled}
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className={`mt-4 px-4 py-2 rounded-lg text-white transition 
            ${
              isButtonEnabled
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          {isButtonEnabled ? "Comenzar test" : `Espera ${countdown}s...`}
        </button>
      </div>
    </div>
  );
}
