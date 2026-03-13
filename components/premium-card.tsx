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
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t, lang } = useTranslation();
  const dateLocale = lang === "en" ? "en-US" : "es-ES";

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
      title: t("store", "benefitLivesTitle"),
      description: t("store", "benefitLivesDesc")
    },
    {
      icon: <Infinity className="w-6 h-6 text-purple-400" />,
      title: t("store", "benefitZapsTitle"),
      description: t("store", "benefitZapsDesc")
    },
    {
      icon: <Shield className="w-6 h-6 text-green-400" />,
      title: t("store", "benefitNoAdsTitle"),
      description: t("store", "benefitNoAdsDesc")
    },
    {
      icon: <Award className="w-6 h-6 text-amber-400" />,
      title: t("store", "benefitNftsTitle"),
      description: t("store", "benefitNftsDesc")
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-blue-400" />,
      title: t("store", "benefitProgressTitle"),
      description: t("store", "benefitProgressDesc")
    }
  ];

  const handleCancelSubscription = async () => {
    if (!confirm(t("store", "cancelConfirm"))) {
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
        throw new Error(data.error || t("store", "cancelError"));
      }

      alert(data.message || t("store", "cancelSuccess"));
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || t("store", "cancelError"));
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
        throw new Error(data.error || t("store", "reactivateError"));
      }

      alert(data.message || t("store", "reactivateSuccess"));
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || t("store", "reactivateError"));
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
                    {t("store", "freeTrial")}
                    <CheckCircle2 className="w-5 h-5" />
                  </h3>
                  <p className="text-sm text-white/80">
                    {t("store", "allPremiumBenefits")}
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
                    {subscription.daysLeft === 1
                      ? t("store", "day")
                      : t("store", "days")}{" "}
                    {t("store", "trialDaysLeft")}
                  </p>
                  {subscription.subscriptionTrialEnd && (
                    <p className="text-xs text-white/70">
                      {t("store", "endsOn")}{" "}
                      {new Date(
                        subscription.subscriptionTrialEnd
                      ).toLocaleDateString(dateLocale, {
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
                  <p className="text-xs font-medium">
                    {t("store", "unlimitedLives")}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                  <p className="text-xs font-medium">{t("store", "noAds")}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between transition-colors relative z-10"
            >
              <span className="text-sm font-medium">
                {t("store", "viewAllBenefits")}
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
                    ? t("store", "trialPeriod")
                    : t("store", "premiumActive")}
                  <CheckCircle2 className="w-5 h-5" />
                </h3>
                <p className="text-sm text-white/80">
                  {subscription.platform === "STRIPE" &&
                    t("store", "stripeSubscription")}
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
                    {subscription.daysLeft === 1
                      ? t("store", "day")
                      : t("store", "days")}{" "}
                    {t("store", "trialDaysLeft")}
                  </p>
                  <p className="text-xs text-white/70">
                    {t("store", "endsOn")}{" "}
                    {new Date(
                      subscription.subscriptionTrialEnd!
                    ).toLocaleDateString(dateLocale, {
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
                    {t("store", "renewalIn")} {subscription.daysLeft}{" "}
                    {subscription.daysLeft === 1
                      ? t("store", "day")
                      : t("store", "days")}
                  </p>
                  <p className="text-xs text-white/70">
                    {t("store", "nextPayment")}{" "}
                    {new Date(
                      subscription.subscriptionCurrentPeriodEnd
                    ).toLocaleDateString(dateLocale, {
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
                <p className="text-xs font-medium">
                  {t("store", "unlimitedLives")}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                <p className="text-xs font-medium">{t("store", "noAds")}</p>
              </div>
            </div>
          </div>

          {subscription.willCancelAtPeriodEnd && (
            <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-3 mb-4 flex items-center gap-2">
              <X className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {t("store", "scheduledCancellation")}
                </p>
                <p className="text-xs text-white/70">
                  {t("store", "subscriptionEndsOn")}{" "}
                  {new Date(
                    subscription.subscriptionCurrentPeriodEnd
                  ).toLocaleDateString(dateLocale)}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between transition-colors mb-2 relative z-10"
          >
            <span className="text-sm font-medium">
              {t("store", "viewAllBenefits")}
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
                    {t("store", "processing")}
                  </>
                ) : (
                  t("store", "cancelSubscription")
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
                    {t("store", "processing")}
                  </>
                ) : (
                  t("store", "reactivateSubscription")
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
              <h2 className="text-2xl font-bold leading-tight whitespace-pre-line">
                {t("store", "premiumCardTitle")}
              </h2>
              <p className="text-blue-100 text-sm whitespace-pre-line">
                {t("store", "premiumCardBenefit")}
              </p>
              <div className="space-y-2">
                <Button
                  onClick={openModal}
                  disabled={isLoading}
                  className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-3 rounded-full w-full sm:w-auto"
                  size="lg"
                >
                  {hasUsedTrial
                    ? t("store", "activatePremium")
                    : t("store", "freeTrialOneWeek")}
                </Button>
                <p className="text-xs text-white/80">
                  {hasUsedTrial
                    ? t("store", "premiumPrice")
                    : t("store", "premiumPromoPrice")}
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
