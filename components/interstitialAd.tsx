"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
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
  curriculumId
}: {
  onClose: () => void;
  curriculumId: string;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [customAds, setCustomAds] = useState<Ad[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [hasRegisteredView, setHasRegisteredView] = useState(false);
  const [showingGoogleAd, setShowingGoogleAd] = useState(false);
  const [isAdBlocked, setIsAdBlocked] = useState(false);

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
        const response = await fetch(`/api/curriculums/${curriculumId}/ads`);
        if (response.ok) {
          const data = await response.json();
          setCustomAds(data);

          // Si no hay ads, cerrar inmediatamente
          if (data.length === 0) {
            onClose();
          }
        }
      } catch (error) {
        console.error("Error fetching ads:", error);
        onClose(); // Cerrar si hay error
      } finally {
        setLoadingAds(false);
      }
    };

    fetchAds();
  }, [curriculumId, onClose]);

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
  }, [customAds, currentAdIndex, hasRegisteredView, isVisible, showingGoogleAd]);

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

  const handleSkip = () => {
    if (!showingGoogleAd && currentAdIndex < customAds.length - 1) {
      // Ir al siguiente ad personalizado
      setCurrentAdIndex(currentAdIndex + 1);
      setHasRegisteredView(false);
    } else if (!showingGoogleAd) {
      // Terminamos los ads personalizados, mostrar Google Ad
      setShowingGoogleAd(true);
    } else {
      // Ya vimos Google Ad, mostrar el test
      setIsVisible(false);
      onClose();
    }
  };

  if (!isVisible || loadingAds) return null;

  const currentAd = customAds[currentAdIndex];

  // Si no hay ads personalizados, mostrar Google Ad directamente
  if (!currentAd && !showingGoogleAd && customAds.length === 0) {
    setShowingGoogleAd(true);
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90">
      {showingGoogleAd ? (
        // Mostrar Google AdSense
        <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full mx-4">
          {/* Botón X para saltar */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full p-2 transition-all"
            aria-label="Continuar al test"
          >
            <X className="w-5 h-5" />
          </button>

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
        </div>
      ) : currentAd ? (
        // Mostrar ads personalizados
        <div className="relative w-full h-full max-w-4xl max-h-[90vh] flex items-center justify-center p-4">
          {/* Botón X para saltar */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all backdrop-blur-sm"
            aria-label="Saltar anuncio"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Imagen del anuncio */}
          <div
            className="cursor-pointer w-full h-full flex items-center justify-center"
            onClick={() => handleAdClick(currentAd)}
          >
            <img
              src={currentAd.imageUrl}
              alt={currentAd.title}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* Contador de ads */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {customAds.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentAdIndex ? "w-6 bg-white" : "w-2 bg-white/40"
                }`}
              />
            ))}
            {/* Indicador para Google Ad */}
            <div className="h-2 w-2 rounded-full bg-white/40" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
