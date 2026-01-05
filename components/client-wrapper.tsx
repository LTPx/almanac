"use client";

import { usePathname } from "next/navigation";
import { TutorialProvider } from "@/components/tutorial/tutorial-provider";
import { useSession } from "@/lib/auth-client";
import { useLanguagePreference } from "@/hooks/useLanguagePreference";

export default function ClientWrapper({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isNft = pathname.startsWith("/nft");
  const isFullWidth =
    pathname === "/home" ||
    pathname === "/white-paper" ||
    pathname === "/terms";

  // Obtener la sesión del usuario y actualizar preferencia de idioma si es necesario
  const { data: session } = useSession();
  useLanguagePreference(session?.user || null);

  return (
    <TutorialProvider>
      <div
        className={
          isAdmin || isNft || isFullWidth
            ? "w-full min-h-screen"
            : "relative w-full max-w-[650px] min-h-screen"
        }
      >
        <main className="min-h-screen">{children}</main>
      </div>
    </TutorialProvider>
  );
}
