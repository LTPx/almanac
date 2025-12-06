"use client";

import { useEffect, useState } from "react";
import AdBanner from "./adBanner";

interface Ad {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  targetUrl: string;
  position: number;
}

export default function InterstitialAd({
  onClose,
  time,
  unitId
}: {
  onClose: () => void;
  time: number;
  unitId: number;
}) {
  const [isAdBlocked, setIsAdBlocked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [countdown, setCountdown] = useState(time);

  // Estados para ads personalizados
  const [customAds, setCustomAds] = useState<Ad[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [hasRegisteredView, setHasRegisteredView] = useState(false);
  const [showingGoogleAd, setShowingGoogleAd] = useState(false);

  // Detectar bloqueador de anuncios
  useEffect(() => {
    const test = document.createElement("script");
    test.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    test.async = true;
    test.onerror = () => setIsAdBlocked(true);
    document.body.appendChild(test);
  }, []);

  // Obtener ads personalizados de la unidad
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch(`/api/units/${unitId}/ads`);
        if (response.ok) {
          const data = await response.json();
          setCustomAds(data);
        }
      } catch (error) {
        console.error("Error fetching ads:", error);
      } finally {
        setLoadingAds(false);
      }
    };

    fetchAds();
  }, [unitId]);

  // Registrar vista del ad personalizado
  useEffect(() => {
    if (
      customAds.length > 0 &&
      !hasRegisteredView &&
      isVisible &&
      !showingGoogleAd
    ) {
      const registerView = async () => {
        try {
          await fetch(`/api/ads/${customAds[currentAdIndex].id}/view`, {
            method: "POST"
          });
          setHasRegisteredView(true);
        } catch (error) {
          console.error("Error registering view:", error);
        }
      };

      registerView();
    }
  }, [
    customAds,
    currentAdIndex,
    hasRegisteredView,
    isVisible,
    showingGoogleAd
  ]);

  // Countdown timer
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

  const handleAdClick = async (ad: Ad) => {
    try {
      await fetch(`/api/ads/${ad.id}/click`, {
        method: "POST"
      });
      window.open(ad.targetUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error registering click:", error);
    }
  };

  const handleNextAd = () => {
    if (currentAdIndex < customAds.length - 1) {
      setCurrentAdIndex(currentAdIndex + 1);
      setHasRegisteredView(false);
    } else {
      setShowingGoogleAd(true);
    }
  };

  if (!isVisible) return null;

  const currentAd = customAds[currentAdIndex];
  const hasCustomAds = customAds.length > 0;

  return (
    <div className="absolute inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white text-black rounded-2xl shadow-xl p-6 max-w-2xl w-full">
        {loadingAds ? (
          <div className="text-center p-8">
            <p className="text-gray-500">Cargando...</p>
          </div>
        ) : !showingGoogleAd && hasCustomAds ? (
          // Mostrar ad personalizado
          <div className="space-y-4">
            <div
              className="cursor-pointer"
              onClick={() => handleAdClick(currentAd)}
            >
              <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden">
                <img
                  src={currentAd.imageUrl}
                  alt={currentAd.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-lg mb-1">
                  {currentAd.title}
                </h3>
                {currentAd.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {currentAd.description}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">Anuncio</span>
                  <span className="text-xs font-medium text-blue-600 hover:underline">
                    Más información →
                  </span>
                </div>
              </div>
            </div>

            {/* Indicadores de ads */}
            <div className="flex justify-center gap-2">
              {customAds.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentAdIndex
                      ? "w-6 bg-blue-600"
                      : "w-2 bg-gray-300"
                  }`}
                  onClick={() => {
                    setCurrentAdIndex(index);
                    setHasRegisteredView(false);
                  }}
                />
              ))}
              {/* Indicador para Google AdSense */}
              <button
                className="h-2 w-2 rounded-full bg-gray-300"
                onClick={() => setShowingGoogleAd(true)}
              />
            </div>

            {/* Botón para siguiente ad o ir a Google Ad */}
            <div className="flex gap-2">
              {currentAdIndex < customAds.length - 1 ? (
                <button
                  onClick={handleNextAd}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  Siguiente anuncio →
                </button>
              ) : (
                <button
                  onClick={handleNextAd}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  Ver más anuncios →
                </button>
              )}
            </div>
          </div>
        ) : (
          // Mostrar Google AdSense (cuando no hay ads personalizados o ya los vimos todos)
          <div className="text-center">
            {!isAdBlocked ? (
              <>
                <AdBanner
                  dataAdSlot={"3213001635"}
                  dataAdFormat={"auto"}
                  dataFullWidthResponsive={true}
                />
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
          </div>
        )}

        {/* Botón para comenzar test */}
        <button
          disabled={!isButtonEnabled}
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className={`w-full mt-6 px-4 py-3 rounded-lg text-white font-medium transition
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
