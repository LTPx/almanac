"use client";

import { Button } from "@/components/ui/button";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import MenuItem from "@/components/menu-item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";

export default function SettingsProfile() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);
  const { data: session } = useSession();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      toast.success(t("settings", "logoutSuccess"));
      window.location.href = "/sign-in";
    } catch (error) {
      setIsLoggingOut(false);
      toast.error(t("settings", "logoutError"));
      console.error("Logout error:", error);
    }
  };

  const handleLanguageChange = async (language: string) => {
    setIsUpdatingLanguage(true);
    try {
      const response = await fetch("/api/user/language-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ languagePreference: language })
      });

      if (!response.ok) {
        throw new Error("Failed to update language preference");
      }

      toast.success(t("settings", "languageUpdated"));
      // Recargar la página para aplicar cambios
      window.location.reload();
    } catch (error) {
      toast.error(t("settings", "languageUpdateError"));
      console.error("Language update error:", error);
    } finally {
      setIsUpdatingLanguage(false);
    }
  };

  const handlePreferences = () => console.log("Preferencias clicked");
  const handleProfile = () => router.push("/profile/settings/profile");
  const handleNotifications = () => console.log("Notificaciones clicked");
  const handlePrivacy = () => router.push("/profile/settings/privacy");
  const handleFAQ = () => console.log("F.A.Q clicked");
  const handleSupport = () => console.log("Soporte clicked");

  const currentLanguage = (session?.user as any)?.languagePreference || "en";

  return (
    <div className="min-h-screen text-white pb-[60px]">
      <SettingsHeader title={t("settings", "title")} />
      <div className="pb-8">
        <div className="mt-6">
          <SectionTitle title={t("settings", "languageSection")} />
          <div className="mx-4 px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">
                {t("settings", "selectLanguage")}
              </span>
              <Select
                value={currentLanguage}
                onValueChange={handleLanguageChange}
                disabled={isUpdatingLanguage}
              >
                <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="es" className="text-white">
                    Español
                  </SelectItem>
                  <SelectItem value="en" className="text-white">
                    English
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <SectionTitle title={t("settings", "account")} />
          <div className="mx-4 overflow-hidden">
            <MenuItem title={t("settings", "preferences")} onClick={handlePreferences} />
            <MenuItem title={t("settings", "profile")} onClick={handleProfile} />
            <MenuItem title={t("settings", "notifications")} onClick={handleNotifications} />
            <MenuItem title={t("settings", "privacy")} onClick={handlePrivacy} />
          </div>
        </div>
        <div className="mt-8">
          <SectionTitle title={t("settings", "help")} />
          <div className="mx-4 overflow-hidden">
            <MenuItem title={t("settings", "faq")} onClick={handleFAQ} />
            <MenuItem title={t("settings", "support")} onClick={handleSupport} />
          </div>
        </div>
        <div className="flex justify-center mt-8 px-4">
          <Button
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-8 py-2 rounded-lg"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? t("settings", "loggingOut") : t("settings", "logout")}
          </Button>
        </div>
      </div>
    </div>
  );
}

const SettingsHeader = ({ title }: { title: string }) => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-700">
      <h1 className="text-xl font-semibold text-white text-center flex-1">
        {title}
      </h1>
      <Button
        variant="ghost"
        className="text-blue-400 hover:text-blue-300 hover:bg-transparent p-0 h-auto font-medium"
        onClick={() => router.push("/profile")}
      >
        OK
      </Button>
    </div>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <div className="px-4 py-2">
    <h2 className="text-sm font-medium text-blue-400 uppercase tracking-wider">
      {title}
    </h2>
  </div>
);
