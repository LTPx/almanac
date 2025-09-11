"use client";

import { usePathname } from "next/navigation";
import FooterNav from "@/components/footer-nav";

export default function ClientWrapper({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div
      className={
        isAdmin
          ? "w-full min-h-screen"
          : "relative w-full max-w-[650px] min-h-screen"
      }
    >
      <main className="min-h-screen">{children}</main>
    </div>
  );
}
