import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubscriptionData } from "@/lib/types";
import {
  Plus,
  Loader2,
  Crown,
  CheckCircle2,
  Clock,
  Sparkles,
  X
} from "lucide-react";

export default function PremiumCard({
  userId,
  subscription
}: {
  userId: string;
  subscription?: SubscriptionData | null;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/payments/stripe/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear suscripción");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Ocurrió un error al procesar tu suscripción");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "¿Estás seguro que deseas cancelar tu suscripción al final del período actual?"
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      // TODO: Implementar endpoint de cancelación
      alert("Funcionalidad de cancelación próximamente");
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al cancelar suscripción");
    } finally {
      setIsLoading(false);
    }
  };

  // Si tiene suscripción premium (activa o en trial)
  if (subscription?.isPremium) {
    return (
      <Card className="bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 border-none text-white overflow-hidden relative">
        {/* Efecto de brillo */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>

        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 rounded-full p-2 backdrop-blur-sm">
                <Crown
                  className="w-6 h-6 text-white"
                  color="#fbbf24"
                  fill="#fbbf24"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {subscription.isTrialing
                    ? "Período de Prueba"
                    : "Premium Activo"}
                  <CheckCircle2 className="w-5 h-5" />
                </h3>
                <p className="text-sm text-white/80">
                  {subscription.platform === "STRIPE" && "Suscripción Stripe"}
                </p>
              </div>
            </div>
          </div>

          {/* Información de la suscripción */}
          <div className="space-y-3 mb-4">
            {subscription.isTrialing && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2">
                <Clock className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {subscription.daysLeft}{" "}
                    {subscription.daysLeft === 1 ? "día" : "días"} restantes de
                    prueba
                  </p>
                  <p className="text-xs text-white/70">
                    Termina el{" "}
                    {new Date(
                      subscription.subscriptionTrialEnd!
                    ).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long"
                    })}
                  </p>
                </div>
              </div>
            )}

            {!subscription.isTrialing && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Renovación en {subscription.daysLeft}{" "}
                    {subscription.daysLeft === 1 ? "día" : "días"}
                  </p>
                  <p className="text-xs text-white/70">
                    Próximo pago:{" "}
                    {new Date(
                      subscription.subscriptionCurrentPeriodEnd
                    ).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Beneficios activos */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                <p className="text-xs font-medium">Vidas ilimitadas</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                <p className="text-xs font-medium">Sin anuncios</p>
              </div>
            </div>
          </div>

          {/* Estado de cancelación */}
          {subscription.willCancelAtPeriodEnd && (
            <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-3 mb-4 flex items-center gap-2">
              <X className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Cancelación programada</p>
                <p className="text-xs text-white/70">
                  Tu suscripción finalizará el{" "}
                  {new Date(
                    subscription.subscriptionCurrentPeriodEnd
                  ).toLocaleDateString("es-ES")}
                </p>
              </div>
            </div>
          )}

          {/* Botón de gestión */}
          {!subscription.willCancelAtPeriodEnd && (
            <Button
              onClick={handleCancelSubscription}
              disabled={isLoading}
              variant="outline"
              className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Gestionar suscripción
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-b from-[#1881F0] to-[#1F960D] border-none text-white overflow-hidden relative">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold leading-tight">
              Funciones
              <br />
              para acelerar tu
              <br />
              aprendizaje
            </h2>
            <p className="text-blue-100 text-sm">
              Disfruta de vidas ilimitadas
              <br />y dile adiós a los anuncios
            </p>
            <div className="space-y-2">
              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-3 rounded-full w-full sm:w-auto"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "PRUEBA 1 SEMANA GRATIS"
                )}
              </Button>
              <p className="text-xs text-white/80">
                Luego $1/mes. Cancela cuando quieras.
              </p>
            </div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <Plus className="w-8 h-8 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
