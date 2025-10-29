"use client";

// import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState } from "react";
import MenuItem from "@/components/menu-item";

export default function SettingsProfile() {
  // const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      toast.success("Logged out successfully");
      window.location.href = "/sign-in";
    } catch (error) {
      setIsLoggingOut(false);
      toast.error("Failed to log out");
      console.error("Logout error:", error);
    }
  };

  const handlePreferences = () => console.log("Preferencias clicked");
  const handleProfile = () => console.log("Perfil clicked");
  const handleNotifications = () => console.log("Notificaciones clicked");
  const handlePrivacy = () => console.log("Ajustes de privacidad clicked");
  const handleFAQ = () => console.log("F.A.Q clicked");
  const handleSupport = () => console.log("Soporte clicked");

  return (
    <div className="min-h-screen text-white">
      <SettingsHeader />
      <div className="pb-8">
        <div className="mt-6">
          <SectionTitle title="Cuenta" />
          <div className="mx-4 overflow-hidden">
            <MenuItem title="Preferencias" onClick={handlePreferences} />
            <MenuItem title="Perfil" onClick={handleProfile} />
            <MenuItem title="Notificaciones" onClick={handleNotifications} />
            <MenuItem title="Ajustes de privacidad" onClick={handlePrivacy} />
          </div>
        </div>
        <div className="mt-8">
          <SectionTitle title="Ayuda" />
          <div className="mx-4 overflow-hidden">
            <MenuItem title="F.A.Q." onClick={handleFAQ} />
            <MenuItem title="Soporte" onClick={handleSupport} />
          </div>
        </div>
        <div className="flex justify-center mt-8 px-4">
          <Button
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-8 py-2 rounded-lg"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </Button>
        </div>
      </div>
    </div>
  );
}

const SettingsHeader = () => (
  <div className="flex items-center justify-between p-4 border-b border-gray-700">
    <h1 className="text-xl font-semibold text-white text-center flex-1">
      Configuración
    </h1>
    <Button
      variant="ghost"
      className="text-blue-400 hover:text-blue-300 hover:bg-transparent p-0 h-auto font-medium"
    >
      OK
    </Button>
  </div>
);

const SectionTitle = ({ title }: { title: string }) => (
  <div className="px-4 py-2">
    <h2 className="text-sm font-medium text-blue-400 uppercase tracking-wider">
      {title}
    </h2>
  </div>
);
