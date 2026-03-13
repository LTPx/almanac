"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

type Plan = "individual" | "familiar";

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (plan: Plan) => void;
  hasUsedTrial: boolean;
  isLoading: boolean;
}

export default function SubscriptionModal({
  open,
  onClose,
  onConfirm,
  hasUsedTrial,
  isLoading
}: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan>("individual");
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="subscription-modal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 w-full h-full flex justify-center overflow-y-auto bg-background z-[250]"
        >
          <div className="relative w-full max-w-[650px] flex flex-col items-center px-6 pt-14 pb-8 bg-gradient-to-b from-[#1881F0] to-[#1F960D]">
            <button
              onClick={onClose}
              className="absolute top-4 left-4 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-white text-xl font-bold text-center mb-6 max-w-xs">
              {t("store", "subscriptionModalTitle")}
            </h2>

            <div className="w-full max-w-sm space-y-3">
              <button
                onClick={() => setSelectedPlan("individual")}
                className={`w-full rounded-2xl p-4 text-left transition-all ${
                  selectedPlan === "individual"
                    ? "bg-white ring-2 ring-purple-500"
                    : "bg-white/90"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mb-1">
                      {t("store", "planIndividualBadge")}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">
                      {t("store", "planIndividualName")}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t("store", "planIndividualDuration")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    {selectedPlan === "individual" && (
                      <CheckCircle2 className="w-5 h-5 text-purple-500 mb-1" />
                    )}
                    <p className="text-base font-bold text-gray-900">
                      {t("store", "planIndividualPrice")}{" "}
                      <span className="text-xs font-normal text-gray-500">
                        {t("store", "perMonth")}
                      </span>
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedPlan("familiar")}
                className={`w-full rounded-2xl p-4 text-left transition-all ${
                  selectedPlan === "familiar"
                    ? "bg-white ring-2 ring-purple-500"
                    : "bg-white/90"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mb-1">
                      {t("store", "planFamilialBadge")}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">
                      {t("store", "planFamilialName")}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t("store", "planFamilialDuration")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    {selectedPlan === "familiar" && (
                      <CheckCircle2 className="w-5 h-5 text-purple-500 mb-1" />
                    )}
                    <p className="text-base font-bold text-gray-900">
                      {t("store", "planFamilialPrice")}{" "}
                      <span className="text-xs font-normal text-gray-500">
                        {t("store", "perMonth")}
                      </span>
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <p className="text-white/80 text-sm text-center mt-5 mb-6">
              {t("store", "subscriptionRecurring")}
            </p>

            <div className="w-full max-w-sm space-y-3">
              <Button
                onClick={() => onConfirm(selectedPlan)}
                disabled={isLoading}
                className="w-full bg-[#6C3AED] hover:bg-[#5B2FD1] text-white font-bold py-6 rounded-full text-base"
                size="lg"
              >
                {isLoading
                  ? t("store", "processing")
                  : hasUsedTrial
                    ? t("store", "activatePremiumCta")
                    : t("store", "startFreeTrial")}
              </Button>

              <button className="w-full text-center text-white font-semibold text-sm py-2">
                {t("store", "viewAllPlans")}
              </button>
            </div>

            <p className="text-white/60 text-[10px] text-center mt-4 max-w-xs">
              {t("store", "subscriptionFinePrint")}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
