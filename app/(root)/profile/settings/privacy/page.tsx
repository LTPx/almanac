"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Shield, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ConsentData {
  necessary: boolean;
  analytics: boolean;
  ads: boolean;
  timestamp: string;
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export default function PrivacySettings() {
  const router = useRouter();

  const getCurrentConsent = (): ConsentData => {
    if (typeof window === "undefined") {
      return {
        necessary: true,
        analytics: false,
        ads: false,
        timestamp: new Date().toISOString()
      };
    }

    const consent = localStorage.getItem("cookie-consent");
    if (consent) {
      return JSON.parse(consent) as ConsentData;
    }
    return {
      necessary: true,
      analytics: false,
      ads: false,
      timestamp: new Date().toISOString()
    };
  };

  const [consent, setConsent] = useState<ConsentData>(getCurrentConsent());

  useEffect(() => {
    setConsent(getCurrentConsent());
  }, []);

  const handleSave = () => {
    const newConsent: ConsentData = {
      ...consent,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem("cookie-consent", JSON.stringify(newConsent));

    if (typeof window.gtag !== "undefined") {
      if (consent.analytics) {
        window.gtag("consent", "update", {
          analytics_storage: "granted"
        });
      } else {
        window.gtag("consent", "update", {
          analytics_storage: "denied"
        });
      }

      if (consent.ads) {
        window.gtag("consent", "update", {
          ad_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted"
        });
      } else {
        window.gtag("consent", "update", {
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied"
        });
      }
    }

    window.location.reload();
  };

  const handleReset = () => {
    if (
      confirm(
        "¿Estás seguro de que quieres restablecer todas tus preferencias de privacidad?"
      )
    ) {
      localStorage.removeItem("cookie-consent");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen text-white pb-[60px]">
      <div className="sticky top-[60px] bg-[#171717] flex items-center gap-3 p-4 border-b border-gray-700">
        <button
          onClick={() => router.back()}
          className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold text-white flex-1">
          Ajustes de Privacidad
        </h1>
      </div>

      <div className="p-4 space-y-6">
        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <Shield className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
          <p className="text-sm text-gray-300">
            Controla cómo se recopilan y utilizan tus datos. Los cambios se
            aplicarán inmediatamente después de guardar.
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Cookie className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Preferencias de Cookies</h2>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">Cookies Necesarias</h3>
                <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
                  Siempre activas
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Esenciales para el funcionamiento del sitio. No se pueden
                desactivar.
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    Google Analytics
                  </h3>
                  <p className="text-sm text-gray-400">
                    Nos ayuda a entender cómo usas la aplicación para mejorar tu
                    experiencia.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={consent.analytics}
                    onChange={(e) =>
                      setConsent({ ...consent, analytics: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    Publicidad Personalizada
                  </h3>
                  <p className="text-sm text-gray-400">
                    Muestra anuncios relevantes según tus intereses y uso de la
                    app.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={consent.ads}
                    onChange={(e) =>
                      setConsent({ ...consent, ads: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">
            <strong className="text-gray-300">Última actualización:</strong>{" "}
            {consent.timestamp
              ? new Date(consent.timestamp).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : "No guardado"}
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold rounded-xl"
          >
            Guardar cambios
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 py-6 text-base font-semibold rounded-xl"
          >
            Restablecer preferencias
          </Button>
        </div>
      </div>
    </div>
  );
}
