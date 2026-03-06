"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Shield, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();

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
    if (consent) return JSON.parse(consent) as ConsentData;
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
      window.gtag("consent", "update", {
        analytics_storage: consent.analytics ? "granted" : "denied"
      });
      window.gtag("consent", "update", {
        ad_storage: consent.ads ? "granted" : "denied",
        ad_user_data: consent.ads ? "granted" : "denied",
        ad_personalization: consent.ads ? "granted" : "denied"
      });
    }

    window.location.reload();
  };

  const handleReset = () => {
    if (confirm(t("privacySettings", "resetConfirm"))) {
      localStorage.removeItem("cookie-consent");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen text-white pb-[60px]">
      <div className="sticky top-[0px] bg-[#171717] flex items-center gap-3 p-4 border-b border-gray-700">
        <button
          onClick={() => router.back()}
          className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold text-white flex-1">
          {t("privacySettings", "title")}
        </h1>
      </div>

      <div className="p-4 space-y-6">
        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <Shield className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
          <p className="text-sm text-gray-300">
            {t("privacySettings", "description")}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Cookie className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">
              {t("privacySettings", "cookiePreferences")}
            </h2>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">
                  {t("privacySettings", "necessaryCookies")}
                </h3>
                <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
                  {t("privacySettings", "alwaysActive")}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                {t("privacySettings", "necessaryDesc")}
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    {t("privacySettings", "analytics")}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {t("privacySettings", "analyticsDesc")}
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
                    {t("privacySettings", "personalizedAds")}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {t("privacySettings", "personalizedAdsDesc")}
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
            <strong className="text-gray-300">
              {t("privacySettings", "lastUpdated")}
            </strong>{" "}
            {consent.timestamp
              ? new Date(consent.timestamp).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : t("privacySettings", "notSaved")}
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold rounded-xl"
          >
            {t("privacySettings", "saveChanges")}
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 py-6 text-base font-semibold rounded-xl"
          >
            {t("privacySettings", "resetPreferences")}
          </Button>
        </div>
      </div>
    </div>
  );
}
