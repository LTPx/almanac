"use client";

import { usePathname } from "next/navigation";

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

  return (
    <div
      className={
        isAdmin || isNft || isFullWidth
          ? "w-full min-h-screen"
          : "relative w-full max-w-[650px] min-h-screen"
      }
    >
      <main className="min-h-screen">{children}</main>
    </div>
  );
}
