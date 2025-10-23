"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Zap, Heart, Loader2, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import PremiumCard from "@/components/premium-card";
import SpecialOfferCard from "@/components/offert-card";
import ZapCard from "@/components/zap-card";
import { useUser } from "@/context/UserContext";

// Tipos
interface UserStats {
  currentZaps: number;
  currentHearts: number;
  exchangeRate: string;
  canPurchase: number;
  zapCostForOne: number;
}

export default function Store() {
  const router = useRouter();
  const user = useUser();
  const [zapTokens, setZapTokens] = useState(120);
  const [hearts, setHearts] = useState(3);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [heartQuantity, setHeartQuantity] = useState(1);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Aquí deberías obtener el userId de tu sistema de autenticación
  const userId = user?.id || "";

  // Cargar información del usuario al montar el componente
  useEffect(() => {
    loadUserStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserStats = async () => {
    try {
      const response = await fetch(`/api/hearts/purchase?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
        setZapTokens(data.currentZaps);
        setHearts(data.currentHearts);
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
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
        setZapTokens(data.data.zapTokens);
        setHearts(data.data.hearts);
        await loadUserStats();

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

  const totalZapCost = heartQuantity * 10;

  return (
    <div className="min-h-screen text-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <ArrowLeft
            onClick={() => router.back()}
            className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-200"
          />
          <h1 className="text-xl font-semibold">Tienda</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <span className="text-red-500 font-semibold">{hearts}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            <span className="text-purple-500 font-semibold">{zapTokens}</span>
          </div>
        </div>
      </div>

      {/* Mensaje de notificación */}
      {message && (
        <div
          className={`mx-4 mt-4 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-500/20 border border-green-500 text-green-400"
              : "bg-red-500/20 border border-red-500 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="p-4 space-y-6">
        <PremiumCard />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Ofertas especiales</h3>
          <SpecialOfferCard />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Zaps</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ZapCard
              amount={1000}
              price="€4.99"
              icon={<Zap className="w-12 h-12 text-purple-500" />}
            />
            <ZapCard
              amount={3000}
              price="€9.99"
              icon={
                <div className="flex">
                  <Zap className="w-10 h-10 text-purple-500 -mr-2" />
                  <Zap className="w-10 h-10 text-purple-500" />
                </div>
              }
            />
            <ZapCard
              amount={7500}
              price="€19.99"
              icon={
                <div className="grid grid-cols-2 gap-1">
                  <Zap className="w-8 h-8 text-purple-500" />
                  <Zap className="w-8 h-8 text-purple-500" />
                  <Zap className="w-8 h-8 text-purple-500" />
                  <Zap className="w-8 h-8 text-purple-500" />
                </div>
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Vidas</h3>
          <div className="bg-background rounded-2xl p-6 border border-gray-700">
            <div className="flex items-start gap-4">
              <div className="bg-red-500/20 p-3 rounded-xl">
                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold mb-2">Set de vidas</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Recarga tus vidas para tener más oportunidades de continuar en
                  tus pruebas.
                </p>

                {/* Selector de cantidad */}
                <div className="flex items-center gap-3 mb-4">
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
                      isPurchasing || !userStats || userStats.canPurchase < 1
                    }
                    className={`ml-auto px-6 py-2 rounded-lg font-semibold transition-all ${
                      isPurchasing || !userStats || userStats.canPurchase < 1
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
