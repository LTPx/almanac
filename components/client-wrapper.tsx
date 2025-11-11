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

  return (
    <div
      className={
        isAdmin || isNft
          ? "w-full min-h-screen"
          : "relative w-full max-w-[650px] min-h-screen"
      }
    >
      <main className="min-h-screen">{children}</main>
    </div>
  );
}
