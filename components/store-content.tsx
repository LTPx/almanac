"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Zap, Heart, Loader2, Plus, Minus } from "lucide-react";
import PremiumCard from "@/components/premium-card";
import SpecialOfferCard from "@/components/offert-card";
import ZapCard from "@/components/zap-card";
import { useUser } from "@/context/UserContext";
import type {
  UserGamification,
  StoreContentProps,
  SubscriptionData
} from "@/lib/types";
import { ZAPS_PER_HEART_PURCHASE } from "@/lib/constants/gamification";

export default function StoreContent({
  onBack,
  showBackButton = true,
  onHeartsUpdate,
  title = "Tienda",
  backButtonVariant = "icon",
  testAttemptId
}: StoreContentProps) {
  const user = useUser();
  const [zapTokens, setZapTokens] = useState<number | null>(null);
  const [hearts, setHearts] = useState<number | null>(null);
  const [userStats, setUserStats] = useState<UserGamification | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [heartQuantity, setHeartQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>();

  const userId = user?.id || "";

  useEffect(() => {
    loadUserStats();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadUserStats();
      }
    };

    const handleFocus = () => {
      loadUserStats();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const loadUserStats = async () => {
    try {
      // const response = await fetch(`/api/hearts/purchase?userId=${userId}`);
      const response = await fetch(`/api/app/store?userId=${userId}`);
      if (response.ok) {
        const { gamification, subscription } = await response.json();
        setUserStats(gamification);
        setZapTokens(gamification.currentZaps);
        setHearts(gamification.currentHearts);
        setSubscription(subscription);
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncrement = () => {
    if (userStats && heartQuantity < userStats.canPurchase) {
      setHeartQuantity(heartQuantity + 1);
    }
  };

  const handleDecrement = () => {
    if (heartQuantity > 1) {
      setHeartQuantity(heartQuantity - 1);
    }
  };

  const purchaseHearts = async () => {
    if (!userStats || userStats.canPurchase < heartQuantity) {
      setMessage({
        type: "error",
        text: "No tienes suficientes Zaps"
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsPurchasing(true);
    setMessage(null);

    try {
      const response = await fetch("/api/hearts/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: userId,
          heartsToPurchase: heartQuantity
        })
      });

      const data = await response.json();

      if (response.ok) {
        const newHearts = data.data.hearts;
        setZapTokens(data.data.zapTokens);
        setHearts(newHearts);
        await loadUserStats();

        if (onHeartsUpdate) {
          onHeartsUpdate(newHearts);
        }

        setMessage({
          type: "success",
          text: `¡Compra exitosa! +${heartQuantity} ❤️`
        });

        setHeartQuantity(1);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Error al comprar vidas"
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error en la compra:", error);
      setMessage({
        type: "error",
        text: "Error de conexión. Intenta nuevamente."
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsPurchasing(false);
    }
  };
  const totalZapCost = heartQuantity * ZAPS_PER_HEART_PURCHASE;

  if (isLoading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-gray-400">Cargando tienda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <div
        className={`sticky z-10 bg-background flex items-center justify-between p-3 sm:p-4 border-b border-gray-800 ${
          backButtonVariant === "button" ? "top-0" : "top-[0px]"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {showBackButton && backButtonVariant === "icon" && (
            <ArrowLeft
              onClick={onBack}
              className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 cursor-pointer hover:text-gray-200 flex-shrink-0"
            />
          )}
          {showBackButton && backButtonVariant === "button" && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-white"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Volver al examen</span>
            </button>
          )}
          {!showBackButton && (
            <h1 className="text-lg sm:text-xl font-semibold truncate">
              {title}
            </h1>
          )}
          {showBackButton && backButtonVariant === "icon" && (
            <h1 className="text-lg sm:text-xl font-semibold truncate">
              {title}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-red-500" />
            <span className="text-sm sm:text-base text-red-500 font-semibold">
              {hearts ?? "-"}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
            <span className="text-sm sm:text-base text-purple-500 font-semibold">
              {zapTokens ?? "-"}
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 min-w-[280px] sm:min-w-[300px] max-w-md mx-4 p-3 sm:p-4 rounded-lg shadow-lg animate-in slide-in-from-top ${
            message.type === "success"
              ? "bg-green-500/90 border border-green-400 text-white backdrop-blur-sm"
              : "bg-red-500/90 border border-red-400 text-white backdrop-blur-sm"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                ✓
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                !
              </div>
            )}
            <span className="font-medium text-sm sm:text-base">
              {message.text}
            </span>
          </div>
        </div>
      )}

      <div className="p-3 pb-[60px] space-y-4 sm:space-y-6">
        <PremiumCard
          userId={userId}
          subscription={subscription}
          testAttemptId={testAttemptId}
        />
        {!subscription?.isPremium && (
          <>
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">
                Ofertas especiales
              </h3>
              <SpecialOfferCard
                userId={userId}
                onZapsUpdate={(newZaps) => {
                  setZapTokens(newZaps);
                  loadUserStats();
                }}
              />
            </div>
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Zaps</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <ZapCard
                  amount={1000}
                  price="€4.99"
                  icon={
                    <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500" />
                  }
                  priceId="price_1SU91cRLp1UNwcaHjg3WnhKv"
                  userId={userId}
                  testAttemptId={testAttemptId}
                />
                <ZapCard
                  amount={3000}
                  price="€9.99"
                  priceId="price_1SUFJWRLp1UNwcaHoFumkLr0"
                  userId={userId}
                  testAttemptId={testAttemptId}
                  icon={
                    <div className="flex">
                      <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500 -mr-2" />
                      <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500" />
                    </div>
                  }
                />
                <ZapCard
                  amount={7500}
                  price="€19.99"
                  priceId="price_1SU91cRLp1UNwcaHjg3WnhKv"
                  userId={userId}
                  testAttemptId={testAttemptId}
                  icon={
                    <div className="grid grid-cols-2 gap-1">
                      <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-purple-500" />
                      <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-purple-500" />
                      <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-purple-500" />
                      <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-purple-500" />
                    </div>
                  }
                />
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Vidas</h3>
              <div className="bg-background rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="bg-red-500/20 p-2.5 sm:p-3 rounded-xl flex-shrink-0">
                    <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-red-500 fill-red-500" />
                  </div>
                  <div className="flex-1 w-full">
                    <h4 className="text-base sm:text-lg font-semibold mb-2">
                      Set de vidas
                    </h4>
                    <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
                      Recarga tus vidas para tener más oportunidades de
                      continuar en tus pruebas.
                    </p>

                    <div className="sm:hidden space-y-3 mb-3">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={handleDecrement}
                          disabled={heartQuantity <= 1 || isPurchasing}
                          className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2 text-purple-500 font-semibold text-sm">
                          <span>
                            {totalZapCost} Zaps × {heartQuantity}
                          </span>
                          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        </div>

                        <button
                          onClick={handleIncrement}
                          disabled={
                            !userStats ||
                            heartQuantity >= userStats.canPurchase ||
                            isPurchasing
                          }
                          className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={purchaseHearts}
                        disabled={
                          isPurchasing ||
                          !userStats ||
                          userStats.canPurchase < 1
                        }
                        className={`w-full px-6 py-3 rounded-lg font-semibold transition-all text-sm ${
                          isPurchasing ||
                          !userStats ||
                          userStats.canPurchase < 1
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-purple-600 hover:bg-purple-700 text-white"
                        }`}
                      >
                        {isPurchasing ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Recargando...
                          </span>
                        ) : (
                          "Recargar"
                        )}
                      </button>
                    </div>

                    <div className="hidden sm:flex items-center gap-3 mb-4">
                      <button
                        onClick={handleDecrement}
                        disabled={heartQuantity <= 1 || isPurchasing}
                        className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-2 text-purple-500 font-semibold">
                        <span>
                          {totalZapCost} Zaps × {heartQuantity}
                        </span>
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      </div>

                      <button
                        onClick={handleIncrement}
                        disabled={
                          !userStats ||
                          heartQuantity >= userStats.canPurchase ||
                          isPurchasing
                        }
                        className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <button
                        onClick={purchaseHearts}
                        disabled={
                          isPurchasing ||
                          !userStats ||
                          userStats.canPurchase < 1
                        }
                        className={`ml-auto px-6 py-2 rounded-lg font-semibold transition-all ${
                          isPurchasing ||
                          !userStats ||
                          userStats.canPurchase < 1
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-purple-600 hover:bg-purple-700 text-white"
                        }`}
                      >
                        {isPurchasing ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Recargando...
                          </span>
                        ) : (
                          "Recargar"
                        )}
                      </button>
                    </div>

                    {userStats && (
                      <div className="text-xs sm:text-sm text-gray-400 space-y-1">
                        <p>
                          Tienes: {hearts ?? 0}/{userStats.maxHearts} vidas
                        </p>
                        <p>Puedes comprar: {userStats.canPurchase} vida(s)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
