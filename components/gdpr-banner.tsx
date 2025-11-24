"use client";

import { useState, useEffect } from "react";
import { X, Shield, Cookie } from "lucide-react";

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

export default function GDPRBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    } else {
      initializeTracking(JSON.parse(consent) as ConsentData);
    }
  }, []);

  const initializeTracking = (consent: ConsentData) => {
    if (typeof window.gtag !== "undefined") {
      if (consent.analytics) {
        window.gtag("consent", "update", {
          analytics_storage: "granted"
        });
      }

      if (consent.ads) {
        window.gtag("consent", "update", {
          ad_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted"
        });
      }
    }
  };

  const handleAcceptAll = () => {
    const consent: ConsentData = {
      necessary: true,
      analytics: true,
      ads: true,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem("cookie-consent", JSON.stringify(consent));
    initializeTracking(consent);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const consent: ConsentData = {
      necessary: true,
      analytics: false,
      ads: false,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem("cookie-consent", JSON.stringify(consent));

    // Denegar consentimiento
    if (typeof window.gtag !== "undefined") {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied"
      });
    }

    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    const analyticsCheckbox = document.getElementById(
      "analytics"
    ) as HTMLInputElement;
    const adsCheckbox = document.getElementById("ads") as HTMLInputElement;

    const analytics = analyticsCheckbox?.checked ?? false;
    const ads = adsCheckbox?.checked ?? false;

    const consent: ConsentData = {
      necessary: true,
      analytics,
      ads,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem("cookie-consent", JSON.stringify(consent));
    initializeTracking(consent);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl pointer-events-auto border border-gray-200">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Cookie className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Configuración de Cookies
            </h2>
          </div>
          <button
            onClick={handleRejectAll}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showDetails ? (
            <>
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-gray-600 text-sm">
                  Utilizamos cookies y tecnologías similares para mejorar tu
                  experiencia, analizar el tráfico y personalizar contenido.
                  Puedes elegir qué cookies aceptar haciendo clic en
                  "Personalizar".
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900">
                  <strong>Tu privacidad importa:</strong> Cumplimos con el GDPR
                  y respetamos tus derechos. Puedes cambiar tus preferencias en
                  cualquier momento.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {/* Cookies Necesarias */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    Cookies Necesarias
                  </h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Siempre activas
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Esenciales para el funcionamiento del sitio. No se pueden
                  desactivar.
                </p>
              </div>

              {/* Google Analytics */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        Google Analytics
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Nos ayuda a entender cómo usas nuestro sitio para
                      mejorarlo. Recopila datos anónimos sobre tu navegación.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      id="analytics"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Google Ads */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        Publicidad Personalizada
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Muestra anuncios relevantes basados en tus intereses.
                      Ayuda a mantener nuestro contenido gratuito.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      id="ads"
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Más información en nuestra{" "}
                <a
                  href="/politica-privacidad"
                  className="text-blue-600 hover:underline"
                >
                  Política de Privacidad
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 bg-gray-50">
          {!showDetails ? (
            <>
              <button
                onClick={() => setShowDetails(true)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
              >
                Personalizar
              </button>
              <button
                onClick={handleRejectAll}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
              >
                Rechazar Todo
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Aceptar Todo
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
              >
                Volver
              </button>
              <button
                onClick={handleSavePreferences}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Guardar Preferencias
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
