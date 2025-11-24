"use client";

import { useState } from "react";
import { Settings, Cookie, X, Shield } from "lucide-react";

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

export default function CookieSettingsButton() {
  const [showModal, setShowModal] = useState(false);

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

  const handleSave = () => {
    const newConsent: ConsentData = {
      ...consent,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem("cookie-consent", JSON.stringify(newConsent));

    // Actualizar consentimiento de Google
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

    setShowModal(false);

    // Recargar página para aplicar cambios
    window.location.reload();
  };

  const handleReset = () => {
    if (
      confirm(
        "¿Estás seguro de que quieres eliminar todas tus preferencias de cookies?"
      )
    ) {
      localStorage.removeItem("cookie-consent");
      window.location.reload();
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setShowModal(true)}
        className="lenin-dev fixed bottom-4 right-4 z-40 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-all hover:scale-110"
        title="Configuración de cookies"
        aria-label="Configuración de cookies"
      >
        <Cookie className="w-5 h-5" />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Preferencias de Cookies
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  Gestiona tus preferencias de cookies. Los cambios se aplicarán
                  inmediatamente después de guardar.
                </p>
              </div>

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
                  Esenciales para el funcionamiento del sitio.
                </p>
              </div>

              {/* Google Analytics */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Google Analytics
                    </h3>
                    <p className="text-sm text-gray-600">
                      Análisis de uso del sitio web
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={consent.analytics}
                      onChange={(e) =>
                        setConsent({ ...consent, analytics: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Google Ads */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Publicidad Personalizada
                    </h3>
                    <p className="text-sm text-gray-600">
                      Anuncios relevantes según tus intereses
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={consent.ads}
                      onChange={(e) =>
                        setConsent({ ...consent, ads: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Info adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Última actualización:</strong>{" "}
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
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2.5 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 font-medium transition-colors"
              >
                Restablecer
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
