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
  const [timeRemaining, setTimeRemaining] = useState(10);

  useEffect(() => {
    const test = document.createElement("script");
    test.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    test.async = true;
    test.onerror = () => setIsAdBlocked(true);
    document.body.appendChild(test);
  }, []);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch(`/api/curriculums/${curriculumId}/ads`);
        if (response.ok) {
          const data = await response.json();
          setCustomAds(data);

          if (data.length === 0) {
            onClose();
          }
        }
      } catch (error) {
        console.error("Error fetching ads:", error);
        onClose();
      } finally {
        setLoadingAds(false);
      }
    };

    fetchAds();
  }, [curriculumId, onClose]);

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

  // Timer countdown effect
  useEffect(() => {
    if (!showingGoogleAd && customAds.length > 0 && isVisible) {
      setTimeRemaining(10);

      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto-avanzar al siguiente anuncio cuando llegue a 0
            handleSkip();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentAdIndex, showingGoogleAd, customAds.length, isVisible]);

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
      setCurrentAdIndex(currentAdIndex + 1);
      setHasRegisteredView(false);
    } else if (!showingGoogleAd) {
      setShowingGoogleAd(true);
    } else {
      setIsVisible(false);
      onClose();
    }
  };

  if (!isVisible || loadingAds) return null;

  const currentAd = customAds[currentAdIndex];

  if (!currentAd && !showingGoogleAd && customAds.length === 0) {
    setShowingGoogleAd(true);
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90">
      {showingGoogleAd ? (
        <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full mx-4">
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
        <div className="relative w-full h-full max-w-4xl flex items-center justify-center p-4">
          <div className="relative inline-block max-w-full max-h-full">
            <button
              onClick={handleSkip}
              className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 transition-all shadow-lg"
              aria-label="Saltar anuncio"
            >
              <X className="w-5 h-5" />
            </button>

            {timeRemaining > 0 && (
              <div className="absolute bottom-2 right-2 z-10 bg-black/70 text-white rounded-full px-3 py-1.5 text-sm font-semibold shadow-lg">
                {timeRemaining} {timeRemaining === 1 ? "segundo" : "segundos"}
              </div>
            )}

            <div
              className="cursor-pointer"
              onClick={() => handleAdClick(currentAd)}
            >
              <img
                src={currentAd.imageUrl}
                alt={currentAd.title}
                className="max-w-full max-h-[calc(100vh-8rem)] object-contain rounded-lg"
              />
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {customAds.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentAdIndex ? "w-6 bg-white" : "w-2 bg-white/40"
                }`}
              />
            ))}

            <div className="h-2 w-2 rounded-full bg-white/40" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
