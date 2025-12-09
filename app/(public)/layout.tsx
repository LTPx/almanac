"use client";

import HeaderHome from "@/components/header-home";
import { usePathname } from "next/navigation";

export default function PublicLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const showHeaderRoutes = ["/home", "/white-paper", "/terms"];
  const shouldShowHeader = showHeaderRoutes.includes(pathname);

  return (
    <main>
      {shouldShowHeader && <HeaderHome />}
      <div>{children}</div>
    </main>
  );
}
