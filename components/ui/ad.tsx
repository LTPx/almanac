"use client";

import React from "react";
import { X, Zap } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface AdScreenProps {
  show: boolean;
  progress: number;
  message?: { type: "success" | "error"; text: string } | null;
  onClose: () => void;
}

export default function AdScreen({
  show,
  progress,
  message,
  onClose
}: AdScreenProps) {
  if (!show) return null;
  const { t } = useTranslation();

  return (
    <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          {t("store", "watchAdReward2")}
        </h3>
        {progress >= 100 && (
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Contenido del anuncio */}
      <div className="bg-gray-800 rounded-lg p-8 mb-4 flex items-center justify-center min-h-[200px]">
        {progress < 100 ? (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">{t("store", "waiting")}</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white fill-white" />
            </div>
            {message?.type === "success" && (
              <p className="text-green-400 font-semibold">{message.text}</p>
            )}
          </div>
        )}
      </div>

      {/* Barra de Progreso */}
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-purple-500 h-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <p className="text-center text-sm text-gray-400 mt-2">
        {progress < 100
          ? `${Math.round(progress)}% ${t("store", "completed")}`
          : t("store", "adCompleted")}
      </p>
    </div>
  );
}
