import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubscriptionData } from "@/lib/types";
import SubscriptionModal from "@/components/subscription-modal";
import { useSubscriptionModal } from "@/hooks/useSubscriptionModal";
import {
  Plus,
  Loader2,
  Crown,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  Shield,
  Infinity,
  Award,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BenefitItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function PremiumCard({
  userId,
  subscription,
  testAttemptId
}: {
  userId: string;
  subscription?: SubscriptionData | null;
  testAttemptId?: number;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const {
    showModal,
    isLoading: isSubscribing,
    openModal,
    closeModal,
    handleSubscribe
  } = useSubscriptionModal(userId, testAttemptId);

  const premiumBenefits: BenefitItem[] = [
    {
      icon: <Infinity className="w-6 h-6 text-cyan-400" />,
      title: "Vidas Ilimitadas",
      description:
        "Nunca te quedes sin oportunidades para practicar. Aprende a tu ritmo sin preocuparte por perder vidas en los exámenes."
    },
    {
      icon: <Infinity className="w-6 h-6 text-purple-400" />,
      title: "Zaps Ilimitados",
      description:
        "Acceso completo a todos los recursos de aprendizaje sin restricciones. Usa tus Zaps libremente para mejorar tu experiencia."
    },
    {
      icon: <Shield className="w-6 h-6 text-green-400" />,
      title: "Sin Anuncios",
      description:
        "Enfócate 100% en tu aprendizaje sin interrupciones. Una experiencia limpia y fluida para maximizar tu concentración."
    },
    {
      icon: <Award className="w-6 h-6 text-amber-400" />,
      title: "NFTs Certificados Sin Límites",
      description:
        "Mintea certificados NFT de cada currículum completado sin restricciones. Construye tu colección de logros blockchain ilimitadamente."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-blue-400" />,
      title: "Progreso Acelerado",
      description:
        "Sin preocuparte por las vidas, avanza más rápido. Practica intensivamente y completa currículums a tu propio ritmo."
    }
  ];

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "¿Estás seguro que deseas cancelar tu suscripción? Mantendrás el acceso hasta el final del período actual."
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/payments/stripe/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cancelar suscripción");
      }

      alert(data.message || "Suscripción cancelada exitosamente");
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Error al cancelar suscripción");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        "/api/payments/stripe/subscription/reactivate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ userId })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al reactivar suscripción");
      }

      alert(data.message || "Suscripción reactivada exitosamente");
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Error al reactivar suscripción");
    } finally {
      setIsLoading(false);
    }
  };

  const isInternalTrial =
    subscription?.isTrialing && !subscription?.subscription?.platform;

  const hasUsedTrial =
    subscription?.subscriptionTrialEnd !== null ||
    ["CANCELED", "EXPIRED", "PAST_DUE", "UNPAID", "PAUSED"].includes(
      subscription?.subscriptionStatus || ""
    );

  if (subscription?.isPremium) {
    if (isInternalTrial) {
      return (
        <Card className="bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 border-none text-white overflow-hidden relative">
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
                    Prueba Gratuita
                    <CheckCircle2 className="w-5 h-5" />
                  </h3>
                  <p className="text-sm text-white/80">
                    Disfruta de todos los beneficios premium
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2">
                <Clock className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {subscription.daysLeft}{" "}
                    {subscription.daysLeft === 1 ? "día" : "días"} restantes de
                    prueba
                  </p>
                  {subscription.subscriptionTrialEnd && (
                    <p className="text-xs text-white/70">
                      Termina el{" "}
                      {new Date(
                        subscription.subscriptionTrialEnd
                      ).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long"
                      })}
                    </p>
                  )}
                </div>
              </div>

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

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between transition-colors relative z-10"
            >
              <span className="text-sm font-medium">
                Ver todos los beneficios
              </span>
              {showDetails ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden relative z-10"
                >
                  <div className="mt-4 space-y-3 premium-benefits-scroll">
                    {premiumBenefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white/10 backdrop-blur-sm rounded-lg p-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {benefit.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-1">
                              {benefit.title}
                            </h4>
                            <p className="text-xs text-white/80 leading-relaxed">
                              {benefit.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 border-none text-white overflow-hidden relative">
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

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between transition-colors mb-2 relative z-10"
          >
            <span className="text-sm font-medium">
              Ver todos tus beneficios
            </span>
            {showDetails ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mb-4 relative z-5"
              >
                <div className="mt-2 space-y-3 premium-benefits-scroll">
                  {premiumBenefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {benefit.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1">
                            {benefit.title}
                          </h4>
                          <p className="text-xs text-white/80 leading-relaxed">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            {!subscription.willCancelAtPeriodEnd ? (
              <Button
                onClick={handleCancelSubscription}
                disabled={isLoading}
                variant="outline"
                className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Cancelar suscripción"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleReactivateSubscription}
                disabled={isLoading}
                className="w-full bg-white text-cyan-700 hover:bg-white/90 font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Reactivar suscripción"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
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
                  onClick={openModal}
                  disabled={isLoading}
                  className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-3 rounded-full w-full sm:w-auto"
                  size="lg"
                >
                  {hasUsedTrial ? "ACTIVA PREMIUM" : "PRUEBA 1 SEMANA GRATIS"}
                </Button>
                <p className="text-xs text-white/80">
                  {hasUsedTrial
                    ? "7,99€/mes. Cancela cuando quieras."
                    : "Luego $1/mes. Cancela cuando quieras."}
                </p>
              </div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
              <Plus className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <SubscriptionModal
        open={showModal}
        onClose={closeModal}
        onConfirm={handleSubscribe}
        hasUsedTrial={hasUsedTrial}
        isLoading={isSubscribing}
      />
    </>
  );
}
