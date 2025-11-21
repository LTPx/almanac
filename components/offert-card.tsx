"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Play, Loader2 } from "lucide-react";
import AdScreen from "./ui/ad";

interface AdInfo {
  currentZaps: number;
  zapReward: number;
  adDuration: number;
  canWatchAd: boolean;
  nextAvailableAt: string | null;
  cooldownMinutes: number;
  timeUntilNextAd: number;
}

interface SpecialOfferCardProps {
  userId?: string;
  onZapsUpdate?: (newZaps: number) => void;
}

export default function SpecialOfferCard({
  userId,
  onZapsUpdate
}: SpecialOfferCardProps) {
  const [adInfo, setAdInfo] = useState<AdInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // useCallback para loadAdInfo
  const loadAdInfo = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/ads/watch?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAdInfo(data);
      }
    } catch (error) {
      console.error("Error cargando información del anuncio:", error);
    }
  }, [userId]);

  // Cargar información del anuncio
  useEffect(() => {
    if (userId) {
      loadAdInfo();
    }
  }, [userId, loadAdInfo]);

  // Countdown para próximo anuncio disponible
  useEffect(() => {
    if (adInfo && !adInfo.canWatchAd && adInfo.timeUntilNextAd > 0) {
      setCountdown(adInfo.timeUntilNextAd);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            loadAdInfo(); // Recargar cuando esté disponible
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [adInfo, loadAdInfo]);

  const startAd = async () => {
    if (!userId || !adInfo?.canWatchAd) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/ads/watch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          action: "start"
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowAdModal(true);
        simulateAd(data.duration, data.adSessionId);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Error al iniciar anuncio"
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error iniciando anuncio:", error);
      setMessage({
        type: "error",
        text: "Error de conexión. Intenta nuevamente."
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAd = (duration: number, adSessionId?: string) => {
    setAdProgress(0);
    let hasCompleted = false;
    const interval = setInterval(() => {
      setAdProgress((prev) => {
        const newProgress = prev + 100 / duration;
        if (newProgress >= 100 && !hasCompleted) {
          hasCompleted = true;
          clearInterval(interval);
          completeAd(adSessionId);
          return 100;
        }
        return newProgress;
      });
    }, 1000);
  };

  const completeAd = async (adSessionId?: string) => {
    if (!userId || !adSessionId) return;

    try {
      const response = await fetch("/api/ads/watch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          action: "complete",
          adSessionId
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: `¡Has ganado ${data.data.earnedZaps} Zaps! 🎉`
        });

        // Notificar al componente padre
        if (onZapsUpdate) {
          onZapsUpdate(data.data.zapTokens);
        }

        // Recargar información
        await loadAdInfo();

        setTimeout(() => {
          setMessage(null);
          setShowAdModal(false);
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Error al completar anuncio"
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error completando anuncio:", error);
      setMessage({
        type: "error",
        text: "Error de conexión."
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const closeAdModal = () => {
    if (adProgress >= 100) {
      setShowAdModal(false);
      setAdProgress(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Card className="bg-background border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-purple-500" />
              <div>
                <h4 className="font-semibold text-white">Zaps gratis</h4>
                <p className="text-sm text-gray-400">
                  {adInfo?.canWatchAd
                    ? `Mira un anuncio y gana hasta ${adInfo.zapReward} zaps`
                    : countdown > 0
                      ? `Disponible en ${formatTime(countdown)}`
                      : "Mira un anuncio y gana hasta 20 zaps"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={startAd}
              disabled={isLoading || !adInfo?.canWatchAd}
              className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  OBTENER
                </>
              )}
            </Button>
          </div>

          {/* Mensaje de notificación */}
          {message && !showAdModal && (
            <div
              className={`mt-3 p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-500/20 border border-green-500 text-green-400"
                  : "bg-red-500/20 border border-red-500 text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Anuncio */}
      {showAdModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <AdScreen
            show={showAdModal}
            progress={adProgress}
            onClose={closeAdModal}
          />
        </div>
      )}
    </>
  );
}
